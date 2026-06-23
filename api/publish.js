/* =========================================================
   /api/publish  —  saves the site.
   Verifies the admin password, then commits content.json
   (and any newly uploaded images) back to the GitHub repo
   in a single commit. Vercel auto-deploys the new commit,
   so the live site updates within ~30 seconds.

   Required Vercel environment variables:
     ADMIN_PASSWORD   the password your friend types at /admin
     GITHUB_TOKEN     fine-grained PAT, Contents: Read & Write,
                      scoped to this repo only
   Optional (sensible defaults baked in):
     GITHUB_OWNER     default: sushobhith
     GITHUB_REPO      default: tulaa-yoga-studio
     GITHUB_BRANCH    default: main
   ========================================================= */

const OWNER = process.env.GITHUB_OWNER || "sushobhith";
const REPO = process.env.GITHUB_REPO || "tulaa-yoga-studio";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const API = "https://api.github.com";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB per image, generous after client downscaling

function gh(path, token, options = {}) {
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "tulaa-yoga-admin",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function ghJson(path, token, options) {
  const r = await gh(path, token, options);
  const text = await r.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!r.ok) {
    const msg = body && body.message ? body.message : `GitHub ${r.status}`;
    throw new Error(`${msg} (${path})`);
  }
  return body;
}

// strip a "data:image/...;base64," prefix if present
function toBase64(data) {
  if (typeof data !== "string") return null;
  const comma = data.indexOf(",");
  return data.startsWith("data:") && comma !== -1 ? data.slice(comma + 1) : data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!token || !adminPassword) {
    return res.status(500).json({ error: "Server is not configured. Missing GITHUB_TOKEN or ADMIN_PASSWORD." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid request body." }); }
  }
  body = body || {};

  const { password, content, uploads } = body;

  // constant-ish time check; fine for a low-stakes single-password gate
  if (typeof password !== "string" || password !== adminPassword) {
    return res.status(401).json({ error: "Wrong password." });
  }
  // login screen calls this to check the password before showing the editor
  if (body.verify === true) {
    return res.status(200).json({ ok: true, verified: true });
  }
  if (!content || typeof content !== "object") {
    return res.status(400).json({ error: "Missing content." });
  }

  // validate uploads
  const safeUploads = [];
  if (Array.isArray(uploads)) {
    for (const u of uploads) {
      if (!u || typeof u.path !== "string") continue;
      const path = u.path.replace(/^\/+/, "");
      if (!path.startsWith("assets/") || path.includes("..")) {
        return res.status(400).json({ error: `Unsafe image path: ${u.path}` });
      }
      const b64 = toBase64(u.data);
      if (!b64) return res.status(400).json({ error: `Bad image data for ${path}` });
      const approxBytes = Math.floor((b64.length * 3) / 4);
      if (approxBytes > MAX_UPLOAD_BYTES) {
        return res.status(413).json({ error: `Image too large: ${path}` });
      }
      safeUploads.push({ path, b64 });
    }
  }

  try {
    // 1. current branch head
    const ref = await ghJson(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`, token);
    const latestCommitSha = ref.object.sha;
    const latestCommit = await ghJson(`/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`, token);
    const baseTreeSha = latestCommit.tree.sha;

    // 2. blobs for images
    const tree = [];
    for (const u of safeUploads) {
      const blob = await ghJson(`/repos/${OWNER}/${REPO}/git/blobs`, token, {
        method: "POST",
        body: JSON.stringify({ content: u.b64, encoding: "base64" }),
      });
      tree.push({ path: u.path, mode: "100644", type: "blob", sha: blob.sha });
    }

    // 3. content.json blob
    const contentStr = JSON.stringify(content, null, 2) + "\n";
    const contentBlob = await ghJson(`/repos/${OWNER}/${REPO}/git/blobs`, token, {
      method: "POST",
      body: JSON.stringify({ content: contentStr, encoding: "utf-8" }),
    });
    tree.push({ path: "content.json", mode: "100644", type: "blob", sha: contentBlob.sha });

    // 4. new tree
    const newTree = await ghJson(`/repos/${OWNER}/${REPO}/git/trees`, token, {
      method: "POST",
      body: JSON.stringify({ base_tree: baseTreeSha, tree }),
    });

    // 5. commit
    const imgNote = safeUploads.length ? ` (+${safeUploads.length} image${safeUploads.length > 1 ? "s" : ""})` : "";
    const commit = await ghJson(`/repos/${OWNER}/${REPO}/git/commits`, token, {
      method: "POST",
      body: JSON.stringify({
        message: `Site update via /admin${imgNote}`,
        tree: newTree.sha,
        parents: [latestCommitSha],
      }),
    });

    // 6. move the branch
    await ghJson(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, token, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });

    return res.status(200).json({ ok: true, commit: commit.sha });
  } catch (err) {
    return res.status(502).json({ error: `Could not publish: ${err.message}` });
  }
}
