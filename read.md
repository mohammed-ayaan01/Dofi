# 🏥 DonorConnect 4Care

> **Modern 4-in-1 Healthcare Donor & Recipient Assistance Platform uniting Blood, Organ, Bone Marrow & Tissue, and Hair donation matching with clinical verification, ethical governance, and AI-powered clinical intelligence.**

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-3.1%20Flash-4285f4?style=flat-square&logo=google)](https://ai.google.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Compliance](https://img.shields.io/badge/Compliance-NOTA%20%7C%20HIPAA%20%7C%20FDA-059669?style=flat-square)](https://optn.transplant.hrsa.gov/governance/national-organ-transplant-act/)

---

## 📋 Table of Contents

- [Overview & Mission](#-overview--mission)
- [4 Core Healthcare Donation Programs](#-4-core-healthcare-donation-programs)
- [Role-Based Access Control (RBAC) & Privacy Matrix](#-role-based-access-control-rbac--privacy-matrix)
- [Security & Authorization Guard (RegistrationsAuthWrapper)](#-security--authorization-guard-registrationsauthwrapper)
- [AI Clinical Intelligence Suite](#-ai-clinical-intelligence-suite)
- [Technology Architecture](#-technology-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Configuration](#-environment-configuration)
- [Available Scripts](#-available-scripts)
- [Clinical Ethics & Governance Standards](#-clinical-ethics--governance-standards)
- [License](#-license)

---

## 🌟 Overview & Mission

**DonorConnect 4Care** bridges critical healthcare donation gaps by integrating four vital donation streams into a unified, ethically governed clinical hub. Rather than fragmented databases, this platform provides real-time matching between healthcare facilities, altruistic donors, and vulnerable patients requiring urgent transfusions, transplants, stem cell grafts, or oncological prosthetics.

### Key Highlights
- **Real-Time STAT Emergency Dispatch**: Live tickers broadcast urgent hospital needs for immediate clinical response.
- **Strict Role-Based Access Control**: Tailored portals for Doctors, Recipients, Compliance Officers (Admins), and Donors.
- **Privacy by Design**: Sensitive personal contact numbers and emails are shielded from public access in accordance with **HIPAA** and **NOTA** regulations.
- **Google Gemini Medical AI**: 10+ clinical micro-services running on `@google/genai` assisting clinical staff with HLA crossmatching, donor eligibility screening, logistics optimization, and lab report interpretation.
- **Live Firebase Integration**: Real-time Firestore synchronization for users, verified pledges, and status transitions.

---

## 🩺 4 Core Healthcare Donation Programs

| Program | Clinical Scope | Eligibility & Specifications |
| :--- | :--- | :--- |
| 🩸 **Blood & Platelet Apheresis** | Whole blood, plateletpheresis, packed RBCs, and convalescent plasma | ABO/Rh typing, minimum hemoglobin thresholds, 56-day whole blood / 7-day platelet donation intervals. |
| 🫀 **Living & Deceased Organ Pledges** | Living kidney/liver lobe altruistic pledges, corneas, and deceased donor declarations | NOTA compliance, UNOS registry guidelines, strict non-commercial altruistic protocols with family consent. |
| 🦴 **Bone Marrow & Tissue Allografts** | Allogeneic hematopoietic stem cells, cord blood, and bone/tissue grafts | HLA-A, -B, -C, -DRB1, -DQB1 high-resolution typing, buccal swab kit registration, FACT/NMDP standards. |
| 💇 **Hair for Cranial Oncology Prosthetics** | Pediatric cancer wigs and alopecia totalis medical cranial prostheses | Minimum 8–14 inches untreated hair, secured in braided pony-tails, compliant with Certified Wig Guild guidelines. |

---

## 🛡️ Role-Based Access Control (RBAC) & Privacy Matrix

DonorConnect 4Care enforces a strict 4-tier persona clearance model across the entire application:

| Persona | Clearance Level | Visible Information | Available Actions |
| :--- | :--- | :--- | :--- |
| **👨‍⚕️ Doctors** | Clinical Staff | Relevant clinical donor & patient compatibility data, blood types, HLA notes, and Direct Clinical Hotline numbers (`(555) 019-XXXX`). | • Match with patient requisition<br>• Copy clinical specimen briefs<br>• Advance requisition status pipeline |
| **🩸 Recipients** | Patient / Family | Public compatibility specs, blood group, pledged category, and geographic proximity. **Private personal phone & email are masked.** | • **Request Donor via Care Team** (dispatches hospital-mediated matching request without exposing private data) |
| **👨‍💼 Admins** | Compliance & Governance | Broadest access tier with unmasked registration records, raw Firebase Auth UIDs, real phone numbers, and full audit logs. | • Toggle verification status<br>• Export complete JSON / CSV database<br>• Governance audit log inspection |
| **🔒 Other Users / Public** | Community Member | Aggregate availability metrics and anonymized pledge records (`Donor M.V. (Verified)`). | • Register altruistic donation pledge<br>• View educational resources & NOTA ethics<br>• Switch to authorized profile |

---

## 🔒 Security & Authorization Guard (`RegistrationsAuthWrapper`)

The Registrations Database is protected by a dedicated React authorization boundary component (`RegistrationsAuthWrapper.tsx`):

- **Access Enforcement**: Only verified **Doctors** (`currentUser.role === 'hospital'`, `registeredAppUser?.role === 'hospital_staff'`, or medical credentials) and **Admins** (`role === 'admin'`) can view the underlying database records.
- **HTTP 403 Forbidden Gate**: Unauthorized users (Recipients, Donors, unverified visitors) receive a secure **Access Denied** message explaining the regulatory restriction under HIPAA and NOTA.
- **Zero Bypass in Production**: Self-elevation buttons are barred from the denial view, ensuring strict boundary protection.

---

## 🤖 AI Clinical Intelligence Suite

DonorConnect 4Care leverages **Google Gemini 3.1 Flash** via `@google/genai` to deliver specialized clinical AI utilities:

1. **AI Clinical Cross-Match Predictor (`/api/ai/crossmatch`)**: Evaluates ABO/Rh serology, HLA loci mismatches, PRA antibody levels, and outputs a 0–100% compatibility score with clinical risk stratification.
2. **Pre-Donation Eligibility Screener (`/api/ai/screen-eligibility`)**: Automated 12-point clinical health questionnaire screening for travel risk, medication deferrals, and recent procedures.
3. **STAT Dispatch & Cold-Ischemia Routing Optimizer (`/api/ai/emergency-dispatch`)**: Computes optimal transport modalities (courier vs. rotary wing) considering cold ischemic time limits (e.g. 4–6 hrs for heart/lung, 24–36 hrs for kidneys).
4. **Clinical Lab Report & Serology Interpreter (`/api/ai/lab-interpreter`)**: Parses infectious disease serology panels (HIV, Hepatitis B/C, Syphilis, CMV, HTLV) for donor clearance.
5. **Patient Gratitude & Impact Letter Generator (`/api/ai/gratitude-letter`)**: Creates anonymized, touching gratitude letters for altruistic donors while maintaining identity confidentiality.
6. **BioMatch ML Prognostic Compatibility (`/api/ai/biomatch-ml-prognostic`)**: Predicts 1-year and 5-year graft survival probabilities and immune tolerance profiles.
7. **Medical Vision Document Analyzer (`/api/ai/vision-analyzer`)**: Multimodal examination of laboratory requisition slips, blood bank tags, and swab collection barcodes.
8. **Oncology & Cellular Therapy Matcher (`/api/ai/oncology-trial-matcher`)**: Matches pediatric and adult leukemia patients with allogeneic donor stem cell registries.
9. **Semantic Distance & Proximity Embeddings (`/api/ai/semantic-embeddings`)**: Intelligent geographic and medical-compatibility vector search.
10. **Google Maps Grounding for Cancer Centers (`/api/ai/maps-grounding-cancer-hospitals`)**: Discovers nearby accredited blood banks, apheresis clinics, and bone marrow collection centers.

---

## 🏗️ Technology Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion     │
│  • RBAC Context (AppContext)                                │
│  • Requisition Pipeline Visual Tracker (5 Stages)           │
│  • RegistrationsAuthWrapper Security Boundary               │
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTP Requests                │ Firebase SDK
               ▼                              ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│     Express Node.js Proxy    │  │     Firebase Cloud        │
│ • /api/ai/crossmatch         │  │ • Firebase Authentication │
│ • /api/ai/emergency-dispatch │  │   (Google Sign-In)        │
│ • /api/ai/screen-eligibility │  │ • Cloud Firestore         │
│ • @google/genai SDK Proxy    │  │   - /users                │
│                              │  │   - /donation_registrations│
└──────────────┬───────────────┘  └───────────────────────────┘
               │ User-Agent: aistudio-build
               ▼
┌──────────────────────────────┐
│       Google Gemini API      │
│ • gemini-3.1-flash-lite      │
│ • gemini-3.8-flash           │
└──────────────────────────────┘
```

---

## 📁 Project Directory Structure

```plaintext
├── .env.example                     # Environment template (GEMINI_API_KEY, APP_URL)
├── firebase-applet-config.json      # Firebase project credentials & configuration
├── firebase-blueprint.json          # Firestore collection definitions
├── firestore.rules                  # Security rules for users & donations
├── index.html                       # HTML entry point with meta tags & fonts
├── metadata.json                    # Application metadata & Gemini capabilities
├── package.json                     # Scripts and dependencies
├── server.ts                        # Full-stack Express server & Gemini AI routes
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler & Tailwind integration
└── src/
    ├── main.tsx                     # React client root mount
    ├── App.tsx                      # Top-level routing, tabs & modal orchestrator
    ├── context/
    │   └── AppContext.tsx           # Global state, Firestore listeners & role switching
    ├── lib/
    │   └── firebase.ts              # Firebase app initialization & TypeScript schemas
    ├── types/
    │   └── index.ts                 # Healthcare types (Blood, Organ, Marrow, Hair, Roles)
    ├── data/
    │   └── mockData.ts              # Comprehensive mock requisitions, donors & hospitals
    └── components/
        ├── common/
        │   ├── Navbar.tsx           # 3-Zone top navigation with dynamic RBAC badges
        │   ├── EmergencyTicker.tsx  # STAT urgent requirements marquee
        │   └── EthicsBanner.tsx     # National Organ Transplant Act legal notice
        ├── database/
        │   ├── RegistrationsAuthWrapper.tsx    # 403 Forbidden Doctor/Admin guard
        │   ├── RegistrationsDatabaseView.tsx   # Unmasked / masked directory & export
        │   └── index.ts                        # Barrel export
        ├── dashboard/
        │   └── DashboardView.tsx    # High-density metrics, recent activity & stories
        ├── discovery/
        │   ├── DonorFinder.tsx      # Multi-category filterable donor directory
        │   └── DonorDetailModal.tsx # Full donor profile & compatibility specs
        ├── requests/
        │   ├── RequestsHub.tsx      # Requisitions list with quick-status filters
        │   ├── RequestDetailModal.tsx # 5-Stage pipeline tracker (Pending -> Completed)
        │   └── CreateRequestModal.tsx # Patient requisition submission form
        ├── hospital/
        │   └── HospitalPortal.tsx   # Verified hospital inventory & trauma coordinator
        ├── ai/
        │   └── AIClinicalHub.tsx    # Interactive UI for Gemini AI clinical modules
        └── admin/
            └── AdminDashboard.tsx   # Ethics compliance oversight & audit reports
```

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**: Package manager

### 2. Clone Repository
```bash
git clone https://github.com/your-username/donorconnect-4care.git
cd donorconnect-4care
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Populate your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### 5. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## ⚙️ Environment Configuration

| Variable | Description | Required |
| :--- | :--- | :---: |
| `GEMINI_API_KEY` | API Key for Google Gemini (`@google/genai`). | **Yes** (for AI suite) |
| `PORT` | Local port for Express & Vite middleware (defaults to `3000`). | Optional |
| `APP_URL` | Base URL used for self-referential links and OAuth redirects. | Optional |

---

## 📜 Available Scripts

- `npm run dev`: Runs the full-stack dev server using `tsx server.ts` (Express + Vite middlewares on port 3000).
- `npm run build`: Builds the Vite production bundle and compiles `server.ts` into `server.js` using `esbuild`.
- `npm run start`: Starts the compiled production server (`node server.ts`).
- `npm run lint`: Validates TypeScript typings across the entire codebase (`tsc --noEmit`).
- `npm run clean`: Cleans the `dist` directory and build artifacts.

---

## ⚖️ Clinical Ethics & Governance Standards

DonorConnect 4Care is designed with strict adherence to biomedical legal statutes:

1. **National Organ Transplant Act (NOTA - 42 U.S.C. 274e)**: Strictly prohibits the sale, purchase, or valuable consideration for human organs, marrow, and tissue. All living and deceased donor connections are voluntary and altruistic.
2. **HIPAA Security & Privacy Rules (45 CFR § 164.514)**: Enforces Protected Health Information (PHI) de-identification. Public views mask telephone numbers, street addresses, and individual patient identifiers.
3. **FDA Title 21 CFR Part 1271 & 606**: Compliance guidelines for Human Cells, Tissues, and Cellular and Tissue-Based Products (HCT/Ps) and blood bank collection standards.
4. **WHO Guiding Principles on Human Cell, Tissue and Organ Transplantation**: Adherence to voluntary donation, traceability, and equitable clinical matching.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for patients, donors, and healthcare heroes worldwide.
</p>
