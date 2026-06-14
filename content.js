/* =====================================================================
 *
 *   ✏️   E D I T   Y O U R   W E B S I T E   H E R E
 *
 *   This is the ONLY file you ever need to touch.
 *   It holds all the words, prices and photos on your site.
 *
 *   THREE RULES:
 *     1. Only change the words INSIDE the "quotes".
 *     2. Never delete a  "  ,  {  }  [  or  ]
 *     3. Keep a copy of this file before you edit (your safety net).
 *
 *   Full step-by-step help: open HELPER-GUIDE.md
 *
 * ===================================================================== */

window.SITE = {

  /* ---- STUDIO NAME ---- shown top-left and in the footer */
  studioName: "Antara",
  studioFull: "Antara — Yoga & Stillness",

  /* ---- BOOKINGS ----
     WhatsApp number with country code, no +, no spaces.
     India example: "919812345678" */
  whatsapp: "919999999999",
  email: "hello@antara.studio",
  instagram: "antara.studio",          /* without the @ */
  address: "Block A, Greater Kailash II, New Delhi",
  addressLine2: "Also at Cantt Road, Meerut",   /* leave "" to hide */

  /* ---- UPI PAYMENTS ----
     Your UPI ID (VPA) and the name money should show up under.
     Students can pay straight from the site. Leave upiId as "" to hide. */
  upiId: "yourname@okhdfcbank",
  upiName: "Antara Yoga",

  /* ---- FLOATING WHATSAPP "JOIN" BUTTON (bottom corner) ---- */
  joinButton: {
    show: true,
    label: "Join us",
  },

  /* ---- HERO (the large opening screen) ---- */
  hero: {
    kicker: "Yoga · Breath · Stillness",
    headline: "Come home to your breath",
    subtext: "An intimate studio for unhurried practice. Small classes, considered teaching, and the quiet luxury of being truly looked after.",
    button: "Begin your practice",
    image: "assets/hero.jpg",          /* replace with your own photo later */
  },

  /* ---- PHILOSOPHY (three quiet pillars under the hero) ---- */
  philosophy: {
    intro: "We are not a gym. We are a small, considered space for people who want depth over noise. Come as you are.",
    pillars: [
      { title: "Breath", line: "Every practice begins and ends with the breath. The rest follows." },
      { title: "Movement", line: "Strong, slow, intentional. Movement that listens to your body, not the mirror." },
      { title: "Stillness", line: "The hardest and most rewarding part. We make room for it." },
    ],
  },

  /* ---- CLASSES ---- add or remove a { } block to change how many */
  classes: [
    { name: "Hatha",      desc: "Slow and foundational. Alignment, breath and patience. Ideal if you are beginning." },
    { name: "Vinyasa",    desc: "A graceful flow linked to breath. Builds heat, strength and ease." },
    { name: "Yin",        desc: "Long, quiet holds that release what the week leaves behind." },
    { name: "Pranayama",  desc: "Breathwork and meditation. The inner practice, taught with care." },
  ],

  /* ---- WEEKLY SCHEDULE ---- */
  schedule: [
    { day: "Monday",    slots: "7:00 AM  Hatha   ·   6:30 PM  Vinyasa" },
    { day: "Tuesday",   slots: "7:00 AM  Vinyasa   ·   6:30 PM  Yin" },
    { day: "Wednesday", slots: "7:00 AM  Hatha   ·   6:30 PM  Pranayama" },
    { day: "Thursday",  slots: "7:00 AM  Vinyasa   ·   6:30 PM  Yin" },
    { day: "Friday",    slots: "7:00 AM  Hatha   ·   6:30 PM  Restorative Yin" },
    { day: "Saturday",  slots: "8:00 AM  Vinyasa   ·   9:30 AM  Beginners" },
    { day: "Sunday",    slots: "By appointment · private sessions" },
  ],

  /* ---- THE TEACHER ---- */
  instructor: {
    name: "Tara",
    role: "Founder & Lead Teacher",
    bio: "Trained across Hatha and Vinyasa traditions with over 500 hours of certification and a decade of personal practice. I founded Antara to offer the kind of space I always longed for: unhurried, intimate, and entirely focused on the person on the mat. I teach small groups so no one is ever just a face in the room.",
    photo: "assets/teacher.jpg",
  },

  /* ---- GALLERY ---- studio and practice photos */
  gallery: [
    "assets/gallery-1.jpg",
    "assets/gallery-2.jpg",
    "assets/gallery-3.jpg",
    "assets/gallery-4.jpg",
  ],

  /* ---- TESTIMONIALS ---- */
  testimonials: [
    { quote: "The most refined yoga experience in Delhi. Small classes mean real attention, and the space itself is a sanctuary.", name: "Naina K., Greater Kailash" },
    { quote: "I have practised in studios across London and Mumbai. Antara is in a class of its own. Unhurried and deeply personal.", name: "Vikram S., Defence Colony" },
    { quote: "I drive in from Meerut twice a week and it is worth every minute. Tara teaches with rare attention.", name: "Ritika A., Meerut" },
  ],

  /* ---- MEMBERSHIP ---- set "featured: true" on the one to highlight */
  currency: "₹",
  pricing: [
    { name: "Drop-in",   price: "1,200", period: "single class",  featured: false, features: ["One class, any style", "No commitment", "A gentle way to begin"] },
    { name: "Monthly",   price: "8,500", period: "per month",     featured: true,  features: ["Unlimited group classes", "All styles included", "Mat and props provided", "Priority booking"] },
    { name: "Private",   price: "3,500", period: "per session",   featured: false, features: ["One-to-one with Tara", "Tailored entirely to you", "At the studio or your home"] },
  ],

  /* ---- FAQ ---- */
  faq: [
    { q: "I have never practised before. Is that alright?", a: "More than alright. Most of our students began with us. Start with any Hatha or Beginners class and we will guide you gently." },
    { q: "What should I bring?", a: "Only comfortable clothing and water. Mats and props are provided, though you are welcome to bring your own." },
    { q: "How do I book?", a: "Tap any booking button to message us on WhatsApp. We will confirm your place and answer anything you wish to ask." },
    { q: "Do you teach in Meerut as well?", a: "Yes. We hold select sessions in Meerut each week. Message us for the current Meerut timetable." },
  ],

  /* ---- GOOGLE MAP ---- paste a Maps "embed" link, or leave "" to hide */
  mapEmbed: "",
};
