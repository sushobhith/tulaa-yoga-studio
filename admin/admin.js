/* =========================================================
   Antara — admin editor.
   Loads content.json, lets the owner edit everything and
   toggle panels on/off, then POSTs to /api/publish which
   commits the changes to GitHub (the site redeploys itself).
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  let data = null;                 // the content object being edited
  let password = "";               // kept in memory + sessionStorage
  const uploads = new Map();       // path -> dataURL for newly chosen images

  /* ---------------- LOGIN ---------------- */
  const loginForm = $("#loginForm");
  const loginMsg = $("#loginMsg");
  const loginBtn = $("#loginBtn");

  const savedPw = sessionStorage.getItem("antara_pw");
  if (savedPw) { password = savedPw; tryEnter(true); }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    password = $("#pw").value;
    tryEnter(false);
  });

  async function tryEnter(silent) {
    loginMsg.textContent = silent ? "" : "Checking…";
    loginMsg.className = "msg";
    loginBtn.disabled = true;
    try {
      const r = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, verify: true }),
      });
      if (r.status === 401) {
        sessionStorage.removeItem("antara_pw");
        if (!silent) { loginMsg.textContent = "Wrong password."; loginMsg.className = "msg err"; }
        loginBtn.disabled = false;
        return;
      }
      if (!r.ok) throw new Error("Server not ready");
      sessionStorage.setItem("antara_pw", password);
      await loadContent();
      $("#login").hidden = true;
      $("#editor").hidden = false;
    } catch (err) {
      loginMsg.textContent = "Could not reach the server. Try again.";
      loginMsg.className = "msg err";
    } finally {
      loginBtn.disabled = false;
    }
  }

  async function loadContent() {
    const res = await fetch("/content.json", { cache: "no-store" });
    data = await res.json();
    if (!data.visibility) data.visibility = {};
    buildEditor();
  }

  /* ---------------- FIELD HELPERS ---------------- */
  // text / textarea bound to obj[key]
  function textField(label, obj, key, opts = {}) {
    const f = el("div", "field");
    f.appendChild(el("label", null, label));
    if (opts.help) f.appendChild(el("p", "help", opts.help));
    const input = opts.area ? el("textarea") : el("input");
    if (!opts.area) input.type = "text";
    input.value = obj[key] != null ? obj[key] : "";
    if (opts.placeholder) input.placeholder = opts.placeholder;
    input.addEventListener("input", () => { obj[key] = input.value; });
    f.appendChild(input);
    return f;
  }

  // on/off switch bound to obj[key] (boolean)
  function toggleRow(label, sub, obj, key) {
    const row = el("div", "toggle");
    const txt = el("div");
    txt.appendChild(el("div", "t-label", label));
    if (sub) txt.appendChild(el("div", "t-sub", sub));
    const sw = el("label", "switch");
    const cb = el("input");
    cb.type = "checkbox";
    cb.checked = obj[key] !== false; // default on unless explicitly false
    cb.addEventListener("change", () => { obj[key] = cb.checked; });
    sw.appendChild(cb);
    sw.appendChild(el("span", "track"));
    sw.appendChild(el("span", "knob"));
    row.appendChild(txt);
    row.appendChild(sw);
    return row;
  }

  // image field: obj[key] holds a path string; choosing a file downscales + queues an upload
  function imageField(label, obj, key, help) {
    const f = el("div", "field");
    f.appendChild(el("label", null, label));
    if (help) f.appendChild(el("p", "help", help));
    f.appendChild(el("p", "help", IMG_RULES));
    const errEl = el("p", "img-err");
    errEl.style.display = "none";
    const box = el("div", "imgfield");
    const thumb = el("img", "thumb");
    setThumb(thumb, obj[key]);
    const labelBtn = el("label", "filebtn", "Choose a photo");
    const file = el("input");
    file.type = "file";
    file.accept = "image/jpeg,image/png,image/webp";
    file.addEventListener("change", async () => {
      const fobj = file.files[0];
      if (!fobj) return;
      errEl.style.display = "none"; errEl.textContent = "";
      try {
        const { path, dataUrl } = await processImage(fobj);
        uploads.set(path, dataUrl);
        obj[key] = path;
        thumb.src = dataUrl;
        thumb.classList.remove("empty");
      } catch (e) {
        errEl.textContent = e.message;
        errEl.style.display = "block";
      } finally {
        file.value = ""; // allow re-picking the same file after a fix
      }
    });
    labelBtn.appendChild(file);
    box.appendChild(thumb);
    box.appendChild(labelBtn);
    f.appendChild(box);
    f.appendChild(errEl);
    return f;
  }

  function setThumb(img, pathOrUrl) {
    if (pathOrUrl && uploads.has(pathOrUrl)) {
      img.src = uploads.get(pathOrUrl);
      img.classList.remove("empty");
    } else if (pathOrUrl) {
      // path relative to site root
      img.src = "/" + pathOrUrl.replace(/^\/+/, "");
      img.classList.remove("empty");
      img.onerror = () => { img.removeAttribute("src"); img.classList.add("empty"); img.alt = "No photo yet"; };
    } else {
      img.classList.add("empty");
      img.alt = "No photo yet";
    }
  }

  // a repeater over an array; renderItem(item, index) returns the body for one card
  function repeater(arr, addLabel, blankFactory, renderItem) {
    const wrap = el("div");
    function draw() {
      wrap.innerHTML = "";
      arr.forEach((item, i) => {
        const card = el("div", "item");
        const head = el("div", "item-head");
        head.appendChild(el("span", "item-no", `#${i + 1}`));
        const ctrl = el("div", "item-ctrl");
        const up = el("button", "iconbtn", "↑"); up.title = "Move up"; up.disabled = i === 0;
        const dn = el("button", "iconbtn", "↓"); dn.title = "Move down"; dn.disabled = i === arr.length - 1;
        const del = el("button", "iconbtn del", "✕"); del.title = "Remove";
        up.addEventListener("click", () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; draw(); });
        dn.addEventListener("click", () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; draw(); });
        del.addEventListener("click", () => { arr.splice(i, 1); draw(); });
        ctrl.append(up, dn, del);
        head.appendChild(ctrl);
        card.appendChild(head);
        card.appendChild(renderItem(item, i));
        wrap.appendChild(card);
      });
      const add = el("button", "addbtn", "+ " + addLabel);
      add.addEventListener("click", () => { arr.push(blankFactory()); draw(); });
      wrap.appendChild(add);
    }
    draw();
    return wrap;
  }

  // editable list of plain strings (e.g. plan features)
  function stringList(label, arr) {
    const f = el("div", "field");
    f.appendChild(el("label", null, label));
    const wrap = el("div");
    function draw() {
      wrap.innerHTML = "";
      arr.forEach((val, i) => {
        const row = el("div", "strrow");
        const input = el("input"); input.type = "text"; input.value = val;
        input.addEventListener("input", () => { arr[i] = input.value; });
        const del = el("button", "iconbtn del", "✕");
        del.addEventListener("click", () => { arr.splice(i, 1); draw(); });
        row.append(input, del);
        wrap.appendChild(row);
      });
      const add = el("button", "addbtn", "+ Add line");
      add.addEventListener("click", () => { arr.push(""); draw(); });
      wrap.appendChild(add);
    }
    draw();
    f.appendChild(wrap);
    return f;
  }

  /* ---------------- IMAGE PROCESSING (validate + downscale in the browser) ---------------- */
  // Plain-English rules shown under every photo picker.
  const IMG_RULES =
    "Photos only: JPG, PNG or WebP. iPhone “HEIC” photos usually fail — open the photo, " +
    "tap Share and save or send it as JPEG, then upload that. Large photos are shrunk for " +
    "you automatically; use a sharp photo at least 1200px wide for the best result.";
  const MAX_RAW_BYTES = 25 * 1024 * 1024; // 25 MB raw before downscaling

  function processImage(file) {
    return new Promise((resolve, reject) => {
      const name = file.name || "photo";
      const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(name);
      if (isHeic) {
        return reject(new Error("iPhone “HEIC” photos are not supported. On your phone, open the photo, tap Share, and save or send it as JPEG. Then upload that file."));
      }
      if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
        return reject(new Error("That file is not a supported photo. Please choose a JPG, PNG or WebP image."));
      }
      if (file.size > MAX_RAW_BYTES) {
        return reject(new Error("That photo is very large (over 25 MB). Please use a smaller one."));
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 500 || img.height < 350) {
            return reject(new Error(`That photo is too small (${img.width}×${img.height}px) and will look blurry. Please use one at least 1200px wide.`));
          }
          const MAX = 1600;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            const s = Math.min(MAX / width, MAX / height);
            width = Math.round(width * s);
            height = Math.round(height * s);
          }
          const canvas = el("canvas");
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
          const safe = name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "photo";
          const path = `assets/uploads/${safe}-${Date.now()}.jpg`;
          resolve({ path, dataUrl });
        };
        img.onerror = () => reject(new Error("That image could not be opened. It may be damaged or an unsupported type. Please try a different JPG or PNG photo."));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("That file could not be read. Please try again."));
      reader.readAsDataURL(file);
    });
  }

  /* ---------------- GROUP BUILDER ---------------- */
  function group(title, hint, build) {
    const det = el("details", "group");
    const sum = el("summary");
    const left = el("div");
    left.appendChild(el("span", "group-title", title));
    if (hint) left.appendChild(el("div", "group-hint", hint));
    sum.appendChild(left);
    sum.appendChild(el("span", "chev", "▾"));
    det.appendChild(sum);
    const body = el("div", "group-body");
    build(body);
    det.appendChild(body);
    return det;
  }

  /* ---------------- BUILD EDITOR ---------------- */
  function buildEditor() {
    const sheet = $("#sheet");
    sheet.innerHTML = "";

    // 1. Panels on/off
    sheet.appendChild(group("Show or hide panels", "Turn whole sections of the page on or off", (b) => {
      const V = data.visibility;
      const panels = [
        ["philosophy", "Our way / philosophy"],
        ["classes", "Classes"],
        ["gallery", "Photo gallery"],
        ["schedule", "Weekly schedule"],
        ["about", "About the teacher"],
        ["testimonials", "Testimonials"],
        ["pricing", "Membership & pricing"],
        ["faq", "FAQ"],
        ["upi", "UPI payment buttons (needs a UPI ID below)"],
        ["map", "Map (needs a map link below)"],
      ];
      panels.forEach(([k, label]) => b.appendChild(toggleRow(label, null, V, k)));
    }));

    // 1b. Theme (colour palette)
    sheet.appendChild(group("Theme (colours)", "Pick a colour palette for the whole site", (b) => {
      const THEMES = window.THEMES || {};
      if (!data.theme || !THEMES[data.theme]) data.theme = "sage";
      const grid = el("div", "theme-grid");
      function draw() {
        grid.innerHTML = "";
        Object.entries(THEMES).forEach(([key, t]) => {
          const card = el("div", "theme-card" + (data.theme === key ? " sel" : ""));
          const sw = el("div", "swatches");
          (t.swatch || []).forEach((c) => { const s = el("span", "sw"); s.style.background = c; sw.appendChild(s); });
          card.appendChild(sw);
          card.appendChild(el("div", "theme-name", t.label || key));
          card.addEventListener("click", () => { data.theme = key; draw(); });
          grid.appendChild(card);
        });
      }
      draw();
      b.appendChild(grid);
      b.appendChild(el("p", "help", "The colours change across the whole site when you Publish. Use “View site” to see them."));
    }));

    // 2. Basics
    sheet.appendChild(group("Studio name", "Shown top-left and in the footer", (b) => {
      b.appendChild(textField("Short name", data, "studioName"));
      b.appendChild(textField("Full name (browser tab title)", data, "studioFull"));
    }));

    // 3. Contact & booking
    sheet.appendChild(group("Contact & booking", "WhatsApp, email, Instagram, address", (b) => {
      b.appendChild(textField("WhatsApp number", data, "whatsapp", { help: "Country code, no +, no spaces. India example: 919812345678" }));
      b.appendChild(textField("Email", data, "email"));
      b.appendChild(textField("Instagram handle", data, "instagram", { help: "Without the @" }));
      b.appendChild(textField("Address", data, "address"));
      b.appendChild(textField("Second address line", data, "addressLine2", { help: "Leave blank to hide" }));
    }));

    // 4. Payments
    sheet.appendChild(group("UPI payments", "Let students pay from the site. Leave the UPI ID blank to hide all pay buttons.", (b) => {
      b.appendChild(textField("UPI ID (VPA)", data, "upiId", { placeholder: "yourname@okhdfcbank" }));
      b.appendChild(textField("Name money shows up under", data, "upiName"));
    }));

    // 5. Floating button
    sheet.appendChild(group("Floating “Join” button", "The little WhatsApp button in the corner", (b) => {
      if (!data.joinButton) data.joinButton = { show: true, label: "Join us" };
      b.appendChild(toggleRow("Show the floating button", null, data.joinButton, "show"));
      b.appendChild(textField("Button label", data.joinButton, "label"));
    }));

    // 6. Hero
    sheet.appendChild(group("Hero (opening screen)", "The big first thing visitors see", (b) => {
      const h = data.hero;
      b.appendChild(textField("Small line above the title", h, "kicker"));
      b.appendChild(textField("Headline", h, "headline"));
      b.appendChild(textField("Subtext", h, "subtext", { area: true }));
      b.appendChild(textField("Button text", h, "button"));
      b.appendChild(imageField("Background photo", h, "image", "A wide, landscape photo works best here (it fills the screen)."));
    }));

    // 7. Philosophy
    sheet.appendChild(group("Our way (philosophy)", "Intro line + three short pillars", (b) => {
      const p = data.philosophy;
      b.appendChild(textField("Intro line", p, "intro", { area: true }));
      const pillarLabel = el("div", "field");
      pillarLabel.appendChild(el("label", null, "Pillars"));
      b.appendChild(pillarLabel);
      b.appendChild(repeater(p.pillars, "Add pillar",
        () => ({ title: "", line: "" }),
        (item) => {
          const wrap = el("div");
          wrap.appendChild(textField("Title", item, "title"));
          wrap.appendChild(textField("One line", item, "line"));
          return wrap;
        }));
    }));

    // 8. Classes
    sheet.appendChild(group("Classes", "What you teach", (b) => {
      b.appendChild(repeater(data.classes, "Add class",
        () => ({ name: "", desc: "" }),
        (item) => {
          const wrap = el("div");
          wrap.appendChild(textField("Class name", item, "name"));
          wrap.appendChild(textField("Description", item, "desc", { area: true }));
          return wrap;
        }));
    }));

    // 9. Schedule
    sheet.appendChild(group("Weekly schedule", "One row per day", (b) => {
      b.appendChild(repeater(data.schedule, "Add day",
        () => ({ day: "", slots: "" }),
        (item) => {
          const wrap = el("div");
          wrap.appendChild(textField("Day", item, "day"));
          wrap.appendChild(textField("Times / classes", item, "slots"));
          return wrap;
        }));
    }));

    // 10. About / teacher
    sheet.appendChild(group("About the teacher", null, (b) => {
      const t = data.instructor;
      b.appendChild(textField("Name", t, "name"));
      b.appendChild(textField("Role", t, "role"));
      b.appendChild(textField("Bio", t, "bio", { area: true }));
      b.appendChild(imageField("Photo", t, "photo", "An upright, portrait photo works best here."));
    }));

    // 11. Gallery
    sheet.appendChild(group("Photo gallery", "Studio and practice photos", (b) => {
      const grid = el("div", "gallery-grid");
      function drawGallery() {
        grid.innerHTML = "";
        data.gallery.forEach((src, i) => {
          const cell = el("div", "gallery-cell");
          const thumb = el("img", "thumb");
          setThumb(thumb, src);
          const del = el("button", "iconbtn del", "✕");
          del.addEventListener("click", () => { data.gallery.splice(i, 1); drawGallery(); });
          cell.append(thumb, del);
          grid.appendChild(cell);
        });
      }
      drawGallery();
      b.appendChild(grid);
      b.appendChild(el("p", "help", IMG_RULES));
      const galErr = el("p", "img-err"); galErr.style.display = "none";
      const addLbl = el("label", "filebtn", "+ Add photo");
      const file = el("input"); file.type = "file"; file.accept = "image/jpeg,image/png,image/webp";
      file.addEventListener("change", async () => {
        const fobj = file.files[0];
        if (!fobj) return;
        galErr.style.display = "none"; galErr.textContent = "";
        try {
          const { path, dataUrl } = await processImage(fobj);
          uploads.set(path, dataUrl);
          data.gallery.push(path);
          drawGallery();
        } catch (e) {
          galErr.textContent = e.message;
          galErr.style.display = "block";
        } finally {
          file.value = "";
        }
      });
      addLbl.appendChild(file);
      const wrap = el("div", "field"); wrap.appendChild(addLbl);
      b.appendChild(wrap);
      b.appendChild(galErr);
    }));

    // 12. Testimonials
    sheet.appendChild(group("Testimonials", "What students say", (b) => {
      b.appendChild(repeater(data.testimonials, "Add testimonial",
        () => ({ quote: "", name: "" }),
        (item) => {
          const wrap = el("div");
          wrap.appendChild(textField("Quote", item, "quote", { area: true }));
          wrap.appendChild(textField("Who said it", item, "name"));
          return wrap;
        }));
    }));

    // 13. Pricing
    sheet.appendChild(group("Membership & pricing", "Set one plan as featured to highlight it", (b) => {
      b.appendChild(textField("Currency symbol", data, "currency", { help: "e.g. ₹" }));
      b.appendChild(repeater(data.pricing, "Add plan",
        () => ({ name: "", price: "", period: "", featured: false, features: [] }),
        (item) => {
          const wrap = el("div");
          wrap.appendChild(textField("Plan name", item, "name"));
          wrap.appendChild(textField("Price", item, "price", { help: "Numbers only, e.g. 8,500" }));
          wrap.appendChild(textField("Period", item, "period", { placeholder: "per month" }));
          wrap.appendChild(toggleRow("Highlight this plan", null, item, "featured"));
          if (!Array.isArray(item.features)) item.features = [];
          wrap.appendChild(stringList("What's included", item.features));
          return wrap;
        }));
    }));

    // 14. FAQ
    sheet.appendChild(group("FAQ", "Common questions", (b) => {
      b.appendChild(repeater(data.faq, "Add question",
        () => ({ q: "", a: "" }),
        (item) => {
          const wrap = el("div");
          wrap.appendChild(textField("Question", item, "q"));
          wrap.appendChild(textField("Answer", item, "a", { area: true }));
          return wrap;
        }));
    }));

    // 15. Map
    sheet.appendChild(group("Map", "Paste a Google Maps embed link, then turn the Map panel on above", (b) => {
      b.appendChild(textField("Map embed link", data, "mapEmbed", { help: "Google Maps → Share → Embed a map → copy the src link", area: true }));
    }));
  }

  /* ---------------- PUBLISH ---------------- */
  function setStatus(text, kind) {
    const s = $("#status");
    s.textContent = text || "";
    s.className = "bar-status" + (text ? " show" : "") + (kind ? " " + kind : "");
  }

  async function publish() {
    const btns = [$("#publishBtn"), $("#publishBtn2")];
    btns.forEach((b) => (b.disabled = true));
    setStatus("Publishing…");
    try {
      const payload = {
        password,
        content: data,
        uploads: Array.from(uploads.entries()).map(([path, dataUrl]) => ({ path, data: dataUrl })),
      };
      const r = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await r.json().catch(() => ({}));
      if (r.status === 401) {
        setStatus("Your password was rejected. Please reload and log in again.", "err");
        return;
      }
      if (!r.ok) throw new Error(out.error || "Publish failed");
      uploads.clear();
      setStatus("Published. Your site will update in about 30 seconds.", "ok");
    } catch (err) {
      setStatus("Could not publish: " + err.message, "err");
    } finally {
      btns.forEach((b) => (b.disabled = false));
    }
  }

  $("#publishBtn").addEventListener("click", publish);
  $("#publishBtn2").addEventListener("click", publish);
})();
