# Curriculum Audit: Missing Subjects, Pitfalls & Best Practices

This document audits the current course content across Foundations (`src/data/foundations.ts`), the four architecture modules (`src/data/architectures/*.ts`), the Comparison Matrix (`src/pages/ComparePage.tsx`), the Decision Simulator (`src/data/simulatorScenarios.ts`), and the self-paced Practice Projects. It identifies important backend architecture topics, beginner pitfalls, and best practices that are currently missing or only mentioned in passing.

---

## Priority Overview

| Priority | Theme | Status | Why It Matters for Beginners |
| --- | --- | --- | --- |
| **P0 (High Impact)** | Caching, Rate Limiting & Backpressure, Hybrid/Evolutionary Architecture (Strangler Fig), Cross-Service Queries & Sagas, Queues vs. Event Logs, Denial-of-Wallet & Replay Safety | ✅ Implemented | Frequently encountered in real jobs and interviews; directly prevents the most expensive beginner outages. |
| **P1 (Important)** | Observability (Logs/Metrics/Traces & Health Checks), Security & Auth Across Architectures, Zero-Downtime DB Migrations, Fat vs. Thin Events & Claim Check Pattern | Planned | Bridges the gap between "it works locally" and running a real backend in production. |
| **P2 (Stretch / Next Level)** | Contract Testing, Cost Modeling Intuition, Vendor Lock-In & Local Emulation, GDPR/PII in Event Logs, "Evolve a System" Simulator Scenarios | Planned | Deepens architectural judgment once core mental models are solid. |

---

## 1. Cross-Cutting Missing Subjects (Foundations & All Modules)

These foundational backend topics currently have no dedicated lesson or only a brief one-line mention:

### 1.1 Caching & Read-Heavy Scaling *(P0)*
- **What’s missing:** Caching is referenced briefly in `microservices.ts` (an entitlement cache), but beginners never learn *what* caching layers exist (CDN/Edge, HTTP `Cache-Control`, Redis Cache-Aside) or *when* to use them.
- **Pitfalls to add:**
  - **Cache Stampede (Thundering Herd):** When a popular cached key expires and 500 concurrent requests hammer the database at once.
  - **Stale Data & Broken Invalidation:** Updating the database without expiring/updating the cache.
  - **Caching Private/User-Specific Data Publicly:** Accidentally serving User A’s response to User B via a shared CDN or wrong cache key.
- **Best practices to add:** Always set TTLs with slight random jitter, use cache-aside for read-heavy endpoints, and keep cache keys strictly scoped (e.g., `org:{orgId}:entitlement`).

### 1.2 Hybrid Architectures & Evolutionary Migration *(P0)*
- **What’s missing:** `ComparePage.tsx` mentions in one sentence that teams combine patterns, and `modularMonolith.ts` says you can "extract a module later," but beginners aren’t shown **how** systems actually evolve or combine patterns.
- **Subjects to add:**
  - **The Strangler Fig Pattern:** Incrementally routing one feature at a time out of a monolith into a new service/function instead of a risky "big bang rewrite."
  - **Common Real-World Hybrids:** e.g., Modular Monolith core + Serverless for PDF/webhook spikes + Event-Driven queues for emails/analytics.
- **Pitfall to add:** **The Big Bang Rewrite** — freezing feature work for 9 months to rewrite a working monolith into microservices from scratch.

### 1.3 Rate Limiting, Throttling & Backpressure *(P0)*
- **What’s missing:** Rate limiting is mentioned in passing in the API Gateway block, and backpressure is not covered at all.
- **Subjects to add:** Protecting APIs from noisy neighbors/scrapers (token bucket / sliding window), respecting downstream third-party rate limits, and handling **backpressure** when producers permanently outpace consumers (an unbounded queue eventually fills disk/memory or creates hours-long latency).

### 1.4 Observability & Production Health *(P1)*
- **What’s missing:** Correlation IDs are mentioned in Microservices and EDA, and billing alarms in Serverless, but there is no beginner introduction to **Observability**.
- **Subjects to add:**
  - **The 3 Pillars:** Structured JSON Logs (what happened), Metrics (rates, errors, p50/p95/p99 latency), and Distributed Traces (following one request across hops).
  - **Health Checks:** Liveness vs. Readiness probes and **Graceful Shutdown** (draining in-flight requests/queue jobs on `SIGTERM` instead of killing active work mid-flight).
- **Pitfall to add:** Relying on averages ("average latency is 80ms") while hiding terrible tail latency ("p99 is 4.2 seconds").

### 1.5 Security & Authentication Across Architectures *(P1)*
- **What’s missing:** No coverage of how auth and trust boundaries change across architectures.
- **Subjects to add:**
  - **Sessions vs. JWTs** (why stateless JWTs are popular in Microservices/Serverless, and the trade-off of token revocation).
  - **Edge Auth vs. Service-to-Service Auth:** Validating user tokens at the API Gateway vs. verifying internal caller identity (mTLS / signed internal tokens).
  - **Secrets Management & Webhook Verification:** Never hardcoding keys; validating HMAC signatures + timestamp replay checks on webhooks.

### 1.6 Zero-Downtime Database Migrations *(P1)*
- **What’s missing:** Every architecture uses databases, yet schema changes during live deployments aren’t covered.
- **Best practice to add:** **Expand-and-Contract Pattern** (1. Add new column nullable → 2. Dual-write & backfill → 3. Switch reads → 4. Drop old column in a later deploy) so rolling deployments never crash older running instances.
- **Pitfall to add:** Renaming or dropping a live column in a single deployment, immediately breaking every running server container before the new code finishes rolling out.

### 1.7 Testing Strategies by Architecture *(P2)*
- **What’s missing:** How testing changes as you move from one process to distributed systems.
- **Subjects to add:** Fast in-process integration tests (Modular Monolith) vs. **Contract Testing** / OpenAPI & Event Schema tests (Microservices & EDA) vs. why mocking every network call hides real serialization and timeout bugs.

---

## 2. Architecture-Specific Audit

### Module 1: Modular Monolith (`src/data/architectures/modularMonolith.ts`)

**Missing Subjects:**
- **In-Process Event Reliability Gap *(P0)*:** The refactored `completeTask.ts` example publishes `domainEvents.publish('task.completed', ...)` in memory. Beginners should be warned that **in-process events vanish if the server crashes or deploys mid-execution** — and shown when to upgrade to a persistent job queue (e.g., BullMQ / pg-boss / Outbox) for critical side effects.
- **Background Jobs vs. Request-Path Work *(P1)*:** Explaining how a monolith safely runs scheduled reports, email batches, or exports in a separate worker process sharing the same codebase.
- **Enforcing Boundaries in Practice *(P1)*:** Mentioning concrete tooling (`eslint-plugin-boundaries`, `dependency-cruiser`, TypeScript project references) with a short example of how CI blocks bad imports.

**Missing Pitfalls:**
- **Blocking the Single-Threaded Node.js Event Loop *(P0)*:** Running CPU-heavy JSON parsing, crypto, or image work in one module freezes *every* other module inside the same Node.js process.
- **Shared Mega-ORM Models *(P1)*:** Letting all modules share one giant `User` or `Organization` entity class with 40 columns and cascading relations, tightly coupling every domain.
- **Cross-Module Long Transactions & DB Locks *(P1)*:** Wrapping calls across 4 modules inside one long database transaction, causing lock contention and deadlocks.

**Missing Best Practices:**
- Keep cross-module public contracts returning **plain DTOs** (not raw ORM entities with lazy-loaded DB handles).
- Separate read/reporting queries (or route them to a read replica) so heavy analytics dashboards don’t slow down core transactional modules.

---

### Module 2: Microservices (`src/data/architectures/microservices.ts`)

**Missing Subjects:**
- **Distributed Transactions & The Saga Pattern *(P0)*:** The simulator notes that distributed transactions are hard, but the module never explains *how* microservices actually solve multi-service workflows (Choreography vs. Orchestration Sagas and **Compensating Actions** like refunding a charge if shipping reservation fails).
- **Cross-Service Data Queries / Aggregation *(P0)*:** Beginners always ask: *"If Users and Orders live in separate databases, how do I list Orders with User Names and filter by them?"* Needs coverage of **API Composition**, **BFF (Backend-for-Frontend)** — note that `home-bff/src/getHomeFeed.ts` already appears in the code example without ever defining what a BFF is! — and **CQRS / Local Read Replicas**.
- **Concrete Circuit Breaker & Bulkhead Pattern *(P1)*:** Circuit breakers are mentioned in a pitfall, but showing how Closed → Open → Half-Open states stop failing dependencies from exhausting connection pools would make it click immediately.
- **API Versioning & Backward Compatibility *(P1)*:** Additive-only JSON evolution, Tolerant Reader pattern, and deprecation timelines so services can deploy in any order.

**Missing Pitfalls:**
- **N+1 Network Calls (Chatty Microservices) *(P0)*:** Fetching 50 orders from `orders-svc`, then looping 50 times to call `GET /users/:id` over HTTP — turning a 10ms SQL join into 50 network round-trips!
- **Shared "Common" Business-Logic NPM Packages *(P1)*:** Publishing an internal `@company/core-logic` package used by 10 services; changing it forces all 10 services to rebuild and redeploy together.
- **Missing Deadline Propagation *(P2)*:** Service A has a 500ms timeout, calls Service B which waits 10 seconds on Service C — wasting work after the user already gave up.

**Missing Best Practices:**
- Batch lookup endpoints (`POST /users/batch`) or local read projections instead of per-item RPC loops.
- Treat every internal API contract like a public API (schema validation, backward compatibility, consumer-driven contract tests).

---

### Module 3: Serverless (`src/data/architectures/serverless.ts`)

**Missing Subjects:**
- **Workflow Orchestration & Long-Running Tasks *(P0)*:** What do you do when a workflow takes 45 minutes or needs human approval + multi-step retries? Introduce **Durable Workflows / State Machines** (AWS Step Functions, Inngest, Temporal, Cloudflare Workflows).
- **Cold Starts — Practical Causes & Mitigations *(P1)*:** Bundle size / tree-shaking, heavy ORM startup costs, VPC cold-start considerations, memory-to-CPU allocation tuning, and edge runtimes vs. Node.js Lambda.
- **Vendor Lock-In & Hexagonal Adapter Pattern *(P1)*:** Keeping core TypeScript domain logic in plain testable functions and isolating cloud-specific triggers (`APIGatewayEvent`, `SQSEvent`) in thin handler wrappers.
- **Local Development & Testing Reality *(P2)*:** Honest guidance on why emulating an entire cloud locally is painful, and favoring unit-tested domain logic + lightweight ephemeral cloud dev environments.

**Missing Pitfalls:**
- **Denial-of-Wallet Attacks *(P0)*:** An unprotected public endpoint gets hit by a traffic flood or infinite frontend retry loop — because serverless auto-scales, the app stays up while silently racking up a massive cloud bill.
- **Synchronous Function-to-Function Chaining (Lambda Calling Lambda) *(P0)*:** Function A invokes Function B and sits idle waiting for the response — paying double compute bills and coupling timeouts together.
- **Bloated Deployment Bundles *(P1)*:** Importing entire monolithic SDKs or heavy dependencies slows cold starts from ~120ms to 2+ seconds.
- **Ignoring Platform Quotas & Payload Caps *(P1)*:** Hitting API Gateway’s 29s timeout, 6MB–10MB request payload limits, or account-wide concurrency ceilings.

**Missing Best Practices:**
- Put **API Gateway throttling / WAF rate limits** and **account concurrency caps** on public functions to prevent runaway bills.
- Assign **per-function least-privilege IAM roles** (never share one broad admin role across every function).
- Use **presigned URLs** for large file uploads/downloads so big binaries bypass serverless payload limits entirely.

---

### Module 4: Event-Driven Architecture (`src/data/architectures/eventDriven.ts`)

**Missing Subjects:**
- **Message Queue vs. Pub/Sub Topic vs. Event Stream/Log *(P0)*:** Currently grouped under one "Event Broker (Kafka / RabbitMQ)" label. Beginners critically need the distinction:
  - *Queue (SQS / BullMQ):* One worker consumes & deletes each job.
  - *Pub/Sub (SNS / RabbitMQ Fanout):* Broadcasts to current subscribers; ephemeral once delivered.
  - *Event Log (Kafka / Kinesis):* Durable append-only log that retains events for days/years and supports **replaying history** to new consumers.
- **Delivery Semantics Explained *(P0)*:** Comparing *At-Most-Once*, *At-Least-Once*, and why *Effectively-Once* requires Producer Outbox + Idempotent Consumer working together.
- **Fat Events (Event-Carried State Transfer) vs. Thin Notification Events *(P1)*:** Sending full snapshot data in an event (zero callbacks, risk of stale fields/PII) vs. sending only `{ tripId }` (fresh data, risk of DDoS-ing the producer when 6 consumers immediately query back).
- **Choreography vs. Orchestration *(P1)*:** Explaining how to recognize when pure event choreography is becoming unmaintainable "event spaghetti" and when to introduce an explicit workflow orchestrator.
- **Event Replay & Backfilling Safely *(P1)*:** How to hydrate a brand-new consumer from past events without triggering side effects in existing consumers.

**Missing Pitfalls:**
- **Event Replay Side-Effect Disaster *(P0)*:** Replaying 100,000 historical `OrderPlaced` events onto a shared topic to rebuild an Analytics view — accidentally charging cards or emailing 100,000 customers again!
- **Storing Sensitive PII in Immutable Event Logs *(P1)*:** Putting raw emails, addresses, or payment details into long-retained Kafka topics creates severe GDPR/data-deletion compliance problems (solution: store PII in an encrypted reference store or crypto-shredding).
- **Passing Large Blobs Inside Messages *(P1)*:** Pushing 15MB PDFs or images directly through Kafka/RabbitMQ instead of using the **Claim Check Pattern** (upload to object storage, emit only the URI/key in the event).
- **Silent Consumer Lag & Poison Pill Stalls *(P1)*:** A consumer falling hours behind during peak traffic with no consumer-lag alerting, or a malformed message retrying infinitely and blocking its entire partition.

**Missing Best Practices:**
- Wrap every event in a **standard Event Envelope** (`eventId`, `eventType`, `schemaVersion`, `occurredAt`, `correlationId`, `source`, `data`).
- Use the **Claim Check Pattern** for large payloads and keep messages small and schema-validated (Zod / JSON Schema / Avro).
- Monitor **consumer lag** and **DLQ depth** with automated alerts — a Dead Letter Queue nobody watches is just a silent data graveyard.

---

## 3. Simulator, Comparison & Practice Project Gaps

1. **"Evolve an Existing System" Simulator Scenarios *(P1)*:** All 8 current scenarios in `simulatorScenarios.ts` are greenfield ("pick 1 of 4 from scratch"). Adding 2 brownfield scenarios (e.g., *"Your Modular Monolith’s PDF export module is crashing checkout during month-end — what’s your pragmatic next step?"*) would teach realistic incremental architecture instead of all-or-nothing choices.
2. **Concrete Cost-Order-of-Magnitude Examples *(P2)*:** Adding a quick "Cost Intuition" block to `ComparePage.tsx` (comparing rough monthly compute profiles for 10k vs. 10M requests/month across a single container, Serverless, and Managed Kafka/Microservices) helps beginners calibrate the "Cost Efficiency" ratings.
3. **Interactive "Spot the Pitfall" Pre-Reveal Mode *(P2)*:** In `CodeComparison.tsx`, adding an optional **"Quiz Me First"** toggle where learners click the risky lines in the Problematic code *before* revealing the Refactored side would deepen active recall while still keeping zero coding required.
4. **Practice Project Observability & Failure-Test Checklists *(P2)*:** Several Starter projects check happy paths well; adding one explicit *"Break it on purpose"* verification step to every project (e.g., *"Kill Postgres / stop a consumer / send a duplicate webhook and observe the logs"*) reinforces architectural resilience hands-on.

---

## 4. Recommended Top 5 Additions for the Next Iteration

If expanding the course incrementally, these 5 additions deliver the highest educational value for beginners:

1. **Add Caching, Rate Limiting & Observability (Logs/Metrics/Traces)** to **Module 0 (Foundations)**.
2. **Add a short "How Real Systems Evolve & Combine Patterns" guide** (Strangler Fig + Common Hybrids) on the **Compare** page, plus 2 brownfield scenarios in the **Decision Simulator**.
3. **Clarify Queues vs. Pub/Sub vs. Event Logs + Event Replay Safety & Claim Check Pattern** in **Module 4 (Event-Driven)**.
4. **Explain Sagas, Cross-Service Queries (BFF / Read Models), and N+1 Network Calls** in **Module 2 (Microservices)**.
5. **Add Denial-of-Wallet, Synchronous Function Chaining, and Durable Workflows** to **Module 3 (Serverless)**, plus an **In-Process Event Crash Caveat & Event-Loop Blocking** callout to **Module 1 (Modular Monolith)**.
