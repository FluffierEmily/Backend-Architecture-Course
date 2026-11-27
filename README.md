# Interactive Backend Architectures Course

A beginner-friendly, browser-based interactive course for developers who want to understand, compare, and choose between four core backend architectures — with **zero local Docker/server setup** and **no blank-editor coding exams**.

## What’s Inside

1. **Module 0 — Backend Foundations**
   - Plain-English introductions to API Gateways, Databases & Data Ownership, Message Queues & Event Brokers, Sync vs. Async, and Stateless Scaling.
   - Interactive **Traffic Spike Mini-Lab** comparing a direct synchronous server against queue-buffered async workers.
2. **4 Core Architecture Modules** *(each anchored in a distinct real-world company scenario)*
   - **Modular Monolith** (*PulseBoard* — B2B Team Project Management SaaS)
   - **Microservices** (*StreamFlix* — Global Video Streaming Platform)
   - **Serverless** (*SnapResize* — Spiky On-Demand Media & PDF Pipeline)
   - **Event-Driven Architecture (EDA)** (*SwiftRide* — Real-Time Ride-Hailing Dispatch)
3. **Interactive "Problematic vs. Refactored" Code Breakdowns (TypeScript / Node.js)**
   - Side-by-side syntax-highlighted snippets with clickable highlight regions and paired plain-English explainers showing *why beginner mistakes break* and *how the refactor fixes them*.
4. **Interactive Architecture Flow Diagrams**
   - Click any component node to inspect its role, and toggle **Normal Flow** vs. **Simulate Failure / Spike**.
5. **Side-by-Side Comparison Matrix & Architect’s Workbench Decision Simulator**
   - Compare all 4 architectures by your primary constraint and simulate **8 realistic company briefs** with *"6 Months Later..."* trade-off reports and 5-axis scorecards.
6. **Self-Paced Practice Projects Gallery (8 Take-Home Blueprints)**
   - 1 Starter + 1 Stretch project per architecture with suggested TypeScript stacks, folder layouts, checkable milestones (saved to `localStorage`), architectural rules, and a **Copy Brief (.md)** export.

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
