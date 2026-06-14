# Antara — Your Website Guide

Everything you'll ever need to change lives in **one file: `content.js`**.
You never have to touch the design or the code. Promise.

---

## Golden rules (read once)

1. **Only edit `content.js`.** Nothing else.
2. **Only change the words inside the `"quotes"`.**
3. **Never delete a** `"` `,` `{` `}` `[` `]` — those hold everything together.
4. **Before editing, make a copy** of `content.js` and call it `content-backup.js`.
   If anything ever looks broken, delete your edited file and rename the backup back. Done.

---

## How to open and edit

1. Open the project folder.
2. Open `content.js` in any plain text editor:
   - **Mac:** right-click → Open With → **TextEdit**
   - **Windows:** right-click → Open With → **Notepad**
   - (Or the free app **VS Code**, which is nicer and warns you of mistakes.)
3. Find the thing you want to change, edit the words inside the quotes, **Save**.
4. Re-upload (see "Publishing changes" below). That's it.

---

## Common changes (copy these patterns)

**Change a class time** — find the `schedule` list:
```
{ day: "Monday", slots: "7:00 AM  Hatha   ·   6:30 PM  Vinyasa" },
```
Just change the text inside the `slots` quotes.

**Change a price** — find `pricing`:
```
{ name: "Monthly", price: "8,500", period: "per month", ... }
```
Change `"8,500"` to your new price.

**Change your WhatsApp number** — find near the top:
```
whatsapp: "919999999999",
```
Use country code, no `+`, no spaces. India = `91` then the 10-digit number.

**Change your UPI ID** (for payments):
```
upiId: "yourname@okhdfcbank",
upiName: "Antara Yoga",
```

**Add a new class** — copy one whole line in `classes`, paste it below, edit the words:
```
{ name: "Meditation", desc: "A gentle seated practice to close the week." },
```

**Remove something** — delete its whole `{ ... },` line. Keep the lines above and below intact.

---

## Changing photos

All photos live in the **`assets`** folder. To use your own:

1. Name your photo exactly like the one you're replacing — `hero.jpg`, `teacher.jpg`, `gallery-1.jpg`, etc.
2. Drag it into the `assets` folder, replacing the old one.
3. Re-upload. Done. (You don't even open `content.js` for this.)

Tip: use **landscape** photos for the hero and **portrait** (tall) photos for the teacher and gallery. Keep each under ~500 KB so the site stays fast (any free tool like *tinypng.com* shrinks them).

---

## Publishing changes (Netlify — free)

Your site is hosted free on Netlify. To publish an edit:

1. Go to **app.netlify.com** and sign in (your own account).
2. Open your site → the **Deploys** tab.
3. Drag your **whole project folder** onto the box that says *"Drag and drop your site folder here."*
4. Wait ~20 seconds. Your live site updates automatically. Same web address as before.

That's the entire workflow: **edit `content.js` → save → drag folder to Netlify.**

---

## The WhatsApp & UPI buttons

- Every **Book / Enquire** button and the floating **Join us** button open a WhatsApp chat to your number, with a friendly message pre-filled. You just reply.
- On the membership cards, **Pay via UPI** and the **Pay by UPI** box open the customer's GoPay / PhonePe / Paytm with the amount filled in, paying straight to your UPI ID.
- To switch either off or change the number/ID, edit `whatsapp`, `upiId`, or set `joinButton.show` to `false` in `content.js`.

---

## If something breaks

Don't panic. Replace your edited `content.js` with the `content-backup.js` copy you made, re-upload, and you're back to normal. Then try the edit again, changing only the words inside quotes.

That's everything. The site is yours.
