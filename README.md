# Dofi — Healthcare Donation Coordination Prototype

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

> **⚠️ Prototype Notice:** Dofi is an academic/hackathon prototype. It is **not** a certified clinical system, **not** HIPAA certified, and **not** approved for real medical decision-making. All AI outputs require qualified clinical review.

---

## 1. What is Dofi?

**Dofi** (formerly *DonorConnect 4Care* internally) is a healthcare donation coordination prototype that connects donors, recipients, and healthcare facilities across four donation categories: **Blood**, **Organ**, **Bone Marrow & Tissue**, and **Hair**.

It demonstrates a full-stack architecture combining real Firebase Authentication and Firestore data storage with Google Gemini AI-assisted analysis — built to prototype how modern web technologies could support donation coordination workflows. This is a technical demonstration, not a production medical system.

---

## 2. Problem It Solves

Finding and coordinating donation matches — especially for urgent or rare-type requests — is a fragmented, time-sensitive process. Dofi prototypes:

- A **unified request pipeline** so donors and recipients can coordinate across categories in one place
- **AI-assisted compatibility analysis** (cross-match, HLA, blood type) to help surface relevant information quickly — with the explicit understanding that outputs must be reviewed by qualified clinicians
- A **real-time dashboard** driven by Firestore so coordinators can monitor request status as it changes

---

## 3. Core Workflow

```
Donor / Recipient
       │
       ▼
 Firebase Auth (Google OAuth)
       │
       ▼
  Create Request ──────────────► Firestore
       │                         (donation_requests /
       │                          _registrations / users)
       ▼
 Donor Discovery
 (Firestore registered donors
  + mockData.ts demo donors)
       │
       ▼
 Gemini AI Analysis
 (via Express /api endpoints)
       │
       ▼
  Dashboard / Pipeline View
  (Pending → Verification →
   Matching → In Progress →
   Completed)
```

---

## 4. Key Features

- 🔐 **Firebase Google Authentication** — real OAuth identity, not a mock login
- 📋 **Donation Request Pipeline** — five-stage workflow: Pending → Verification → Matching → In Progress → Completed
- 🩸 **Four Donation Categories** — Blood, Organ, Bone Marrow & Tissue, Hair
- 🤖 **AI-Assisted Analysis (Decision-Support Prototype)** — Google Gemini Flash provides cross-match, HLA compatibility, blood type, and risk factor analysis via 10 Express API endpoints
- 🔄 **Deterministic Fallback Engine** — if Gemini is unavailable, a rule-based engine returns clearly-labelled demonstration output so the app remains functional
- 📊 **Real-Time Firestore Dashboard** — live stats driven by Firestore listeners
- 🏥 **External Reference Data** — NOTTO published statistics and e-RaktKosh status (official published data, not real-time API access; e-RaktKosh integration is pending MoHFW authorization)
- 🏷️ **Clear Demo Data Labelling** — all sample/mock data carries an `_isDemoData` field so it is never confused with real submissions

---

## 5. Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 19 + Vite | Single-page app, TypeScript strict mode |
| **Styling** | Tailwind CSS v4 | Utility-first, no custom CSS framework |
| **Backend** | Express.js (`server.ts`) | Serves Vite middleware in dev; provides `/api/*` routes |
| **Database** | Firebase Firestore | Collections: `donation_requests`, `_registrations`, `users` |
| **Auth** | Firebase Google OAuth | Real user identity; no password storage |
| **AI** | Google Gemini Flash (via Express) | Decision-support prototype; clinical review required |
| **Hosting** | `localhost:3000` (dev) / Vite build (prod) | No cloud deployment in current prototype |

```
Browser (React 19 + Tailwind v4)
        │  HTTP / Firestore SDK
        ▼
  Express server.ts (:3000)
   ├── Vite dev middleware  (serves React app)
   └── /api/* routes       (proxies Gemini AI calls)
        │
        ├── Firebase Firestore  (data)
        ├── Firebase Auth       (identity)
        └── Google Gemini API   (AI analysis)
```

---

## 6. Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| UI Framework | React | 19 |
| Language | TypeScript | 5.x |
| Build Tool | Vite | Latest |
| CSS | Tailwind CSS | v4 |
| Backend | Express.js | 4.x |
| Runtime | Node.js | 18+ |
| Database | Firebase Firestore | Firebase v9+ |
| Auth | Firebase Authentication | Firebase v9+ |
| AI | Google Gemini Flash Lite | via `@google/generative-ai` |
| Firebase Project | `dofi-healthcare-platform` | — |

---

## 7. How to Run Locally

### Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- A **Google account** (for Firebase Auth sign-in during testing)
- A **Google Gemini API key** (optional — AI features fall back to demo mode without it)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/mohammed-ayaan01/Dofi.git
cd Dofi

# 2. Install dependencies
npm install

# 3. Create the environment file
# Create a file named .env in the project root:
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# 4. Add Firebase config (see Section 8 below)
# Create firebase-applet-config.json in the project root

# 5. Start the development server
npm run dev
# → Starts Express + Vite middleware on http://localhost:3000
```

> **`npm run dev`** runs `tsx server.ts`, which starts Express with Vite as middleware. Both the React frontend and the Express API are served from the same port 3000.

---

## 8. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com) and open (or create) the project: **`dofi-healthcare-platform`**
2. **Enable Google Sign-In**: Authentication → Sign-in method → Google → Enable
3. **Authorized Domains**: Authentication → Settings → Authorized domains → ensure `localhost` is listed
4. **Create `firebase-applet-config.json`** in the project root with your project's web app config:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "dofi-healthcare-platform.firebaseapp.com",
  "projectId": "dofi-healthcare-platform",
  "storageBucket": "dofi-healthcare-platform.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

> You can find these values in Firebase Console → Project Settings → Your apps → Web app → SDK setup and configuration.

---

## 9. Gemini AI Setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it to your `.env` file:

```
GEMINI_API_KEY=your_key_here
```

**If `GEMINI_API_KEY` is missing or the Gemini call fails**, all AI features automatically fall back to a clearly-labelled **demonstration fallback** generated by the deterministic engine. The application remains fully functional — AI output cards will be marked as demo data.

---

## 10. Real vs. Demo Data

| Data | Type | Source | Label |
|------|------|--------|-------|
| Signed-in user identity | **Real** | Firebase Authentication | — |
| Donation requests submitted via form | **Real** | Firestore `donation_requests` | — |
| Donor registrations | **Real** | Firestore `_registrations` | — |
| User profiles | **Real** | Firestore `users` | — |
| Sample donors shown in Donor Discovery | **Demo** | `src/data/mockData.ts` | `_isDemoData: true` |
| Demonstration emergency ticker on Dashboard | **Demo** | `mockData.ts` | Labelled in UI |
| AI analysis when Gemini is unavailable | **Demo** | Deterministic fallback engine | Labelled in UI |
| NOTTO statistics | **Reference** | Official published NOTTO data | Not real-time |
| e-RaktKosh blood bank data | **Pending** | Integration pending MoHFW authorization | Not yet active |

---

## 11. Limitations

> [!IMPORTANT]
> Please read this section before evaluating or demoing the project.

- **Prototype only** — Dofi is built as a hackathon/academic prototype. It is not designed, tested, or approved for use in real medical workflows.
- **No HIPAA certification** — No privacy impact assessment, BAA, audit logging, or data minimisation controls required for HIPAA compliance have been implemented.
- **AI output is not a medical decision** — All Gemini AI outputs are decision-support suggestions. They require review by a qualified clinician before any action is taken.
- **No real-time government API access** — NOTTO statistics shown are official published data, not a live API feed. e-RaktKosh integration is pending Ministry of Health & Family Welfare (MoHFW) authorization and is not active.
- **No production security hardening** — API keys are stored in `.env` for local dev only. A production deployment would require server-side secret management, rate limiting, and proper security review.
- **No real donor matching** — Donor discovery uses sample data from `mockData.ts`. A production system would need verified donor registries and clinical matching protocols.

---

## 12. Demo Instructions

1. **Start the app**: `npm run dev` → open [http://localhost:3000](http://localhost:3000)
2. **Sign in**: Click *Sign in with Google* and authenticate with any Google account
3. **Create a request**: Click *Create Request* → fill in Blood / Emergency / any hospital → Submit
4. **Explore AI Hub**: Click *AI Hub* → select *Eligibility Triage Assistant* → *Run AI Analysis* to see Gemini output (or demo fallback)
5. **View pipeline**: Click *All Requests* to see the request you created moving through the five-stage pipeline

---

## 13. License

This project is licensed under the **Apache License 2.0**.  
See [LICENSE](./LICENSE) for the full text.

---

*Dofi — a prototype by [mohammed-ayaan01](https://github.com/mohammed-ayaan01)*
