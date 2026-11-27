# Interactive Backend Architectures Course

A beginner-friendly, browser-based interactive course for developers who want to understand, compare, and choose between four core backend architectures — with **zero local Docker/server setup** and **no blank-editor coding exams**.

Live URL: https://backend-architecture-course.web.app/

## What’s Inside

1. **Module 0 — Backend Foundations**
   - **18 plain-English building blocks** covering HTTP & API idempotency, API Gateways, Databases & Scaling (SQL vs. NoSQL, replication lag, sharding), Concurrency & Locking, Queues & Brokers, Real-Time Push (Polling/SSE/WebSockets), Stateless Scaling, Caching, Rate Limiting & Backpressure, Observability & Graceful Shutdown, Auth/Authorization/Webhooks, Zero-Downtime Migrations, Safe Deployments & Feature Flags, Multi-Tenancy, High Availability/SLOs/DR, and Testing Strategies — plus a **28-term pocket glossary**.
   - **3 Interactive Mini-Labs:** Traffic Spike (Sync vs. Queue), Circuit Breaker State Machine, and Compounding Availability Math & Outbox Crash Simulator.
2. **4 Core Architecture Modules** *(each anchored in a distinct real-world company scenario)*
   - **Modular Monolith** (*PulseBoard* — B2B Team Project Management SaaS)
   - **Microservices** (*StreamFlix* — Global Video Streaming Platform)
   - **Serverless** (*SnapResize* — Spiky On-Demand Media & PDF Pipeline)
   - **Event-Driven Architecture (EDA)** (*SwiftRide* — Real-Time Ride-Hailing Dispatch)
3. **Interactive "Problematic vs. Refactored" Code Breakdowns (TypeScript / Node.js)**
   - Side-by-side syntax-highlighted snippets with clickable highlight regions, active-recall **Quiz Me First** mode, and paired plain-English explainers showing *why beginner mistakes break* and *how the refactor fixes them*.
4. **Interactive Architecture Flow Diagrams**
   - Click any component node to inspect its role, and toggle **Normal Flow** vs. **Simulate Failure / Spike**.
5. **Side-by-Side Comparison Matrix, Sizing/ADR Kit & Decision Simulator**
   - Compare all 4 architectures by constraint, study Hybrids & the Strangler Fig (including safe database splitting), estimate QPS/egress with the Back-of-the-Envelope Calculator, copy a 1-page ADR template, and simulate **13 realistic company briefs** (including brownfield evolutions, multi-tenant SaaS, real-time WebSockets, and AI/LLM ingestion pipelines).
6. **Self-Paced Practice Projects Gallery (9 Take-Home Blueprints)**
   - 1 Starter + 1 Stretch project per architecture plus a **Hybrid / Strangler Fig Extraction Capstone**, each with suggested TypeScript stacks, folder layouts, checkable milestones including *"Break it on purpose"* drills (saved to `localStorage`), architectural rules, and a **Copy Brief (.md)** export.

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser. Progress and theme preference are saved automatically in `localStorage`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run strict TypeScript checks (`tsc --noEmit`) |
| `npm test -- --run` | Run automated unit, component, and content-integrity tests |
| `npm run deploy` | Build the production bundle and deploy live to Firebase Hosting |
| `npm run deploy:preview` | Build and deploy to a temporary Firebase Hosting preview channel |
| `npm run firebase:emulate` | Build and test locally with the Firebase Hosting emulator (`http://localhost:5000`) |

## Deploying to Firebase Hosting

This project is preconfigured for [Firebase Hosting](https://firebase.google.com/docs/hosting) via `firebase.json` (serves Vite's `dist/` output with SPA rewrites to `/index.html` and immutable caching for `/assets/**`) and `.firebaserc` (targets the `backend-architecture-course` project).

1. **Install and sign in to the Firebase CLI** (one-time setup):

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Configure local Firebase environment variables:**

   Copy `.env.example` to `.env.local` (ignored by Git) and fill in your web app config from the Firebase Console:

   ```bash
   cp .env.example .env.local
   ```

   Required keys:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` *(optional, for Analytics)*

3. **Test locally with the Firebase Hosting emulator (optional):**

   ```bash
   npm run firebase:emulate
   ```

   Serves the production build at `http://localhost:5000` with `firebase.json` rewrites and headers applied.

4. **Deploy to a preview channel or production:**

   ```bash
   # Temporary preview URL (expires in 7 days by default)
   npm run deploy:preview

   # Live production site (backend-architecture-course.web.app)
   npm run deploy
   ```

## Project Structure

```text
src/
├── components/        # CodeComparison, ArchitectureDiagram, DecisionSimulator, PracticeProjectCard, Layout
├── data/              # Foundations, 4 architecture modules, 8 simulator scenarios
├── hooks/             # useCourseProgress (localStorage), useTheme
├── pages/             # Home, Foundations, Module, Compare, Simulator, Projects
├── tests/             # Content integrity, component, and hook tests
└── types/             # Strongly typed course & simulator schemas
```
