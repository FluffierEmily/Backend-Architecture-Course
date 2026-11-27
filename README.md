# Interactive Backend Architectures Course

A browser-based interactive course for understanding, comparing, and choosing between four core backend architectures — no local Docker setup or blank-editor exams required.

Live URL: https://backend-architecture-course.web.app/

## What’s Inside

- **Backend Foundations (Module 0):** 18 core concepts (APIs, databases, caching, queues, reliability, auth, deployments, and more), a 28-term glossary, and 3 interactive mini-labs.
- **4 Architecture Modules:** Real-world scenarios covering **Modular Monolith** (*PulseBoard*), **Microservices** (*StreamFlix*), **Serverless** (*SnapResize*), and **Event-Driven Architecture** (*SwiftRide*).
- **Code Breakdowns:** Side-by-side TypeScript/Node.js "Problematic vs. Refactored" comparisons with clickable highlights and a **Quiz Me First** mode.
- **Interactive Diagrams:** Clickable architecture diagrams with **Normal Flow** and **Simulate Failure / Spike** views.
- **Compare & Decision Tools:** Comparison matrix, Strangler Fig migration guide, QPS/egress calculator, 1-page ADR template, and a **13-scenario Decision Simulator**.
- **Practice Projects:** 9 self-paced TypeScript blueprints (Starter + Stretch per architecture, plus a Strangler Fig capstone) with saved milestones and Markdown export.

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
