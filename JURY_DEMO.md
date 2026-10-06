# Dofi — Jury Demonstration Guide

## 3–5 Minute Demo Flow

> [!NOTE]
> Dofi is a **healthcare donation coordination prototype**. Be honest with the jury: it uses real Firebase Auth and Firestore, but it is not a certified medical system. AI outputs are decision-support only.

---

## ✅ BEFORE THE DEMO

Check all of the following before approaching the judges:

- [ ] `npm run dev` is running — terminal shows no errors
- [ ] Browser is open at **http://localhost:3000** and the page loads
- [ ] `GEMINI_API_KEY` is present in `.env` *(if available — app works without it)*
- [ ] A **Google account** is ready to sign in (preferably already selected in the browser)
- [ ] Dashboard is visible (not stuck on a loading spinner)

---

## 🎬 DEMO STEPS

---

### Step 1 — OPEN APP `~10 seconds`

**Action:** Show the browser at `http://localhost:3000`.

**Say:**
> "This is Dofi — a donation coordination prototype connecting donors, recipients, and healthcare facilities using Firebase and Gemini AI. It covers four donation categories: Blood, Organ, Bone Marrow & Tissue, and Hair."

**Point to:** The top navigation bar and the landing/dashboard area.

---

### Step 2 — SIGN IN `~30 seconds`

**Action:** Click **Sign in with Google** and complete Google authentication.

**Say:**
> "Firebase Authentication — real Google OAuth, real user identity. No mock login."

**Point to:** The navbar after sign-in — the user's real name and profile photo appear.

---

### Step 3 — DASHBOARD `~30 seconds`

**Action:** Remain on the Dashboard.

**Say:**
> "These numbers in the stats grid come from Firestore in real time. Right now we have zero real requests because this is a fresh database."

**Point to:** The emergency ticker below the stats.

**Say:**
> "This ticker shows how an urgent emergency would be surfaced to a coordinator — it is clearly labelled as demonstration data."

---

### Step 4 — CREATE A REQUEST `~45 seconds`

**Action:** Click **Create Request**.

Fill in the form:
| Field | Value |
|-------|-------|
| Category | Blood |
| Urgency | Emergency |
| Patient Alias | Demo Patient |
| Hospital | Any hospital name |

Click **Submit**.

**Say:**
> "This request is now being written to Firestore — a real write to the real database."

---

### Step 5 — FIRESTORE CONFIRMATION `~20 seconds`

**Action:** Navigate back to (or observe) the Dashboard.

**Point to:** The *Active Requests* counter — it should now show **1**.

**Say:**
> "Real-time Firestore listener updated the dashboard immediately, without a page refresh. That's Firestore's real-time SDK at work."

---

### Step 6 — DONOR DISCOVERY `~30 seconds`

**Action:** Click **Find Donors** in the navbar.

**Say:**
> "Sample donors are shown here for demonstration — they come from `mockData.ts` and are clearly labelled as demo data. In a production system, this would pull from a verified donor registry."

**Action:** Click one donor card to open their detail modal.

**Say:**
> "Each donor profile shows blood type, availability, location, and donation history."

---

### Step 7 — AI ANALYSIS `~60 seconds`

**Action:** Click **AI Hub** in the navbar. Ensure **Cross-Match & HLA Copilot** is selected. Click **Run AI Analysis**.

*While the loader is running:*
> "We're calling Google Gemini Flash to analyze immunological compatibility between the open request and a donor — cross-matching blood type, HLA markers, and risk factors."

*When the result appears:*
> "This is AI-assisted decision support. It is not a medical approval. Any output here would require review by a qualified clinician before any action is taken."

*If Gemini is unavailable (no API key or quota exceeded):*
> "The API key isn't set, so Gemini isn't available right now. The system automatically falls back to a deterministic engine — you can see the result is clearly labelled as a demonstration fallback. The application stays fully functional."

---

### Step 8 — REQUEST PIPELINE `~20 seconds`

**Action:** Click **All Requests** in the navbar.

**Point to:** The request created in Step 4.

**Say:**
> "Every request moves through five pipeline stages."

**Point to or enumerate the stages:**
```
Pending → Verification → Matching → In Progress → Completed
```

> "A coordinator can advance a request through these stages. Status changes write back to Firestore in real time."

---

### Step 9 — WRAP UP `~30 seconds`

**Action:** Return to the **Dashboard**.

**Say:**
> "Firebase handles identity and data. Express handles backend services including the Gemini API proxy. Gemini provides AI-assisted analysis. Together they form a complete prototype architecture for healthcare donation coordination."

**Point to:** The external reference data panel (NOTTO stats / e-RaktKosh status).

**Say:**
> "These reference figures come from official NOTTO published statistics — they are not a live government API feed. e-RaktKosh integration is pending MoHFW authorization and is not yet active."

---

## ❓ WHAT TO SAY IF QUESTIONS ARISE

| Question | Honest Answer |
|----------|--------------|
| *"Is this a real hospital system?"* | "No — this is a prototype demonstrating the full technical architecture. It is not deployed in any clinical setting." |
| *"Is the AI output medically valid?"* | "No. The AI output is decision-support and would require review by a qualified clinician before any action is taken." |
| *"Is this HIPAA compliant?"* | "This is a prototype. A production system would require a proper compliance programme, BAA agreements, audit logging, and data minimisation controls — none of which are implemented here." |
| *"Is the data real?"* | "Firebase Auth and Firestore are real infrastructure. The signed-in user and submitted request are real. Sample donors and the emergency ticker are demonstration data, clearly labelled with an `_isDemoData` flag." |
| *"Does it connect to real blood banks?"* | "Not yet. e-RaktKosh integration is planned but pending MoHFW authorization. NOTTO data shown is official published statistics, not a real-time API." |

---

## 🛠️ TECH TALKING POINTS

Use these if a technical judge asks about the stack:

- **React 19 + TypeScript** — strict-mode frontend, fully typed
- **Firebase Authentication** — Google OAuth, real user identity management
- **Firebase Firestore** — real-time NoSQL database with live SDK listeners
- **Express.js backend** — `server.ts` serves both the Vite dev middleware and 10 `/api/*` AI endpoints from a single port (3000)
- **Google Gemini Flash Lite** — primary AI model for cross-match, HLA, blood type, and risk factor analysis
- **Deterministic fallback engine** — rule-based engine activates automatically when Gemini is unavailable; output is clearly labelled as demo data
- **Tailwind CSS v4** — utility-first styling, no component library dependency
- **Four donation categories** — Blood, Organ, Bone Marrow & Tissue, Hair, each with category-specific fields and workflows

---

*Good luck with the demo. Be confident, be honest about what the prototype is, and let the tech speak for itself.*
