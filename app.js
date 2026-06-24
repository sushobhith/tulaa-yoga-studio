/* =========================================================
   Antara — renderer. You do not need to edit this file.
   It reads everything from content.json and builds the page.
   To change words, prices, photos or which panels show,
   use the editor at  /admin  (see HELPER-GUIDE.md).
   ========================================================= */
(async function () {
  let S;
  try {
    const res = await fetch("content.json", { cache: "no-store" });
    S = await res.json();
  } catch (e) {
    document.body.innerHTML =
      '<p style="font-family:sans-serif;padding:40px;text-align:center">Could not load the site content. Please refresh.</p>';
    return;
  }

  const $ = (id) => document.getElementById(id);
  const V = S.visibility || {};
  /* Hide a whole <section> when its toggle is off */
  const hide = (id) => { const el = $(id); if (el) el.style.display = "none"; };

  const wa = (msg) =>
    `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg || "Hello, I would like to book a yoga class.")}`;
  const amount = (s) => String(s).replace(/[^\d.]/g, "");
  const upi = (amt, note) =>
    `upi://pay?pa=${encodeURIComponent(S.upiId)}&pn=${encodeURIComponent(S.upiName || S.studioName)}` +
    (amt ? `&am=${amount(amt)}` : "") + `&cu=INR&tn=${encodeURIComponent(note || "Antara Yoga")}`;
  const hasUpi = S.upiId && S.upiId.trim() !== "";
  const showUpi = V.upi !== false && hasUpi; // toggle off OR no UPI id hides all pay buttons
  const img = (src, alt) =>
    `<img src="${src}" alt="${alt || ""}" loading="lazy" onerror="this.style.opacity=0">`;

  /* Page + meta */
  document.title = `${S.studioFull}`;
  $("navLogo").textContent = S.studioName;
  $("footLogo").textContent = S.studioName;

  /* Hero */
  const hero = $("hero");
  if (S.hero.image) {
    $("heroBg").innerHTML = img(S.hero.image, S.studioName);
  } else {
    hero.classList.add("noimg");
  }
  $("heroKicker").textContent = S.hero.kicker;
  $("heroHead").textContent = S.hero.headline;
  $("heroSub").textContent = S.hero.subtext;
  $("heroBtn").textContent = S.hero.button;
  $("heroBtn").href = wa();

  /* Philosophy */
  if (V.philosophy === false) {
    hide("philosophy");
  } else {
    $("philIntro").textContent = S.philosophy.intro;
    $("pillars").innerHTML = S.philosophy.pillars
      .map((p, i) => `
        <div class="pillar reveal">
          <div class="num">0${i + 1}</div>
          <h3>${p.title}</h3>
          <p>${p.line}</p>
        </div>`).join("");
  }

  /* Classes */
  if (V.classes === false) {
    hide("classes");
  } else {
    $("classGrid").innerHTML = S.classes
      .map((c) => `<div class="cell reveal"><h3>${c.name}</h3><p>${c.desc}</p></div>`).join("");
  }

  /* Gallery */
  if (V.gallery === false || !S.gallery || !S.gallery.length) {
    hide("gallery");
  } else {
    $("galleryGrid").innerHTML = S.gallery.map((src) => img(src, "Studio")).join("");
  }

  /* Schedule */
  if (V.schedule === false) {
    hide("schedule");
  } else {
    $("schedList").innerHTML = S.schedule
      .map((s) => `<div class="row"><span class="day">${s.day}</span><span class="slots">${s.slots}</span></div>`).join("");
  }

  /* About */
  if (V.about === false) {
    hide("about");
  } else {
    $("instPhoto").innerHTML = img(S.instructor.photo, S.instructor.name);
    $("instName").textContent = S.instructor.name;
    $("instRole").textContent = S.instructor.role;
    $("instBio").textContent = S.instructor.bio;
  }

  /* Testimonials */
  if (V.testimonials === false || !S.testimonials || !S.testimonials.length) {
    hide("testimonials");
  } else {
    $("quoteGrid").innerHTML = S.testimonials
      .map((t) => `<div class="quote reveal"><p>“${t.quote}”</p><div class="who">${t.name}</div></div>`).join("");
  }

  /* Pricing */
  if (V.pricing === false) {
    hide("pricing");
  } else {
    $("priceGrid").innerHTML = S.pricing
      .map((p) => `
        <div class="price ${p.featured ? "feat" : ""} reveal">
          <h3>${p.name}</h3>
          <div class="amt">${S.currency}${p.price}</div>
          <div class="per">${p.period}</div>
          <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
          <a class="btn ${p.featured ? "" : "btn-line"}" target="_blank" rel="noopener"
             href="${wa("Hello, I would like to enquire about the " + p.name + " membership.")}">Enquire</a>
          ${showUpi ? `<a class="btn-pay" href="${upi(p.price, S.studioName + " · " + p.name)}">Pay ${S.currency}${p.price} via UPI</a>` : ""}
        </div>`).join("");
  }

  /* FAQ */
  if (V.faq === false || !S.faq || !S.faq.length) {
    hide("faq");
  } else {
    $("faqList").innerHTML = S.faq
      .map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("");
  }

  /* CTA + contact */
  $("ctaBtn").textContent = "Book on WhatsApp";
  $("ctaBtn").href = wa();
  const addr2 = S.addressLine2 && S.addressLine2.trim() ? ` · ${S.addressLine2}` : "";
  $("contactRow").innerHTML =
    `<span>${S.address}${addr2}</span>
     <span><a href="mailto:${S.email}">${S.email}</a></span>
     <span><a href="https://instagram.com/${S.instagram}" target="_blank" rel="noopener">@${S.instagram}</a></span>
     <span><a href="${wa()}" target="_blank" rel="noopener">WhatsApp</a></span>`;
  $("footAddr").textContent = `${S.address}${addr2}`;

  /* UPI pay block */
  if (showUpi) {
    $("upiWrap").innerHTML =
      `<div class="upi">
         <p class="kicker" style="margin-bottom:14px">Pay by UPI</p>
         <p class="upi-id">${S.upiId}</p>
         <a class="btn btn-line" href="${upi("", S.studioName)}">Open in UPI app</a>
         <p class="upi-note">Opens GPay, PhonePe, Paytm or any UPI app on your phone. On a laptop, use the UPI ID above.</p>
       </div>`;
  }

  /* Map — shows only when toggled on AND an embed link is set */
  if (V.map !== false && S.mapEmbed && S.mapEmbed.trim() !== "") {
    $("mapWrap").innerHTML = `<div class="mapbox"><iframe src="${S.mapEmbed}" loading="lazy"></iframe></div>`;
  }

  /* Floating WhatsApp "join" button */
  if (S.joinButton && S.joinButton.show) {
    const fj = $("floatJoin");
    fj.href = wa("Hello, I would like to join Antara. Could you tell me more?");
    fj.className = "show";
    fj.innerHTML =
      `<svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.2-.4c-1-1.6-1.5-3.4-1.5-5.3C5 9.5 9.9 4.6 16 4.6S27 9.5 27 15.6 22.1 24.8 16 24.8zm6.1-7.7c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6-.1-.2-.8-1.9-1-2.6-.3-.7-.5-.6-.8-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.2 2.2.9 3 .9 4.1.8.7-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.3z"/></svg>
       <span>${S.joinButton.label || "Join us"}</span>`;
  }

  /* Mobile nav */
  const links = $("navLinks");
  $("navToggle").addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));

  /* Gentle reveal on scroll */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
