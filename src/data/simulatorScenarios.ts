import type { SimulatorScenario } from '../types/course';

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'sim-clinic-saas',
    title: 'Seed-Stage Veterinary Clinic SaaS',
    company: 'PawSchedule',
    brief:
      'A 3-person startup is launching an appointment booking, pet medical records, and invoicing platform for local clinics. Requirements change weekly after customer calls, and billing must stay strictly consistent with bookings.',
    constraints: {
      teamSize: '3 full-stack developers',
      trafficPattern: 'Steady weekday traffic (~15 req/sec)',
      budgetOps: 'Tight seed budget, no dedicated DevOps',
      latencyConsistency: 'Strong ACID consistency across bookings & invoices',
      timeToMarket: 'Launch MVP in 8 weeks',
    },
    bestFit: 'modular-monolith',
    outcomes: {
      'modular-monolith': {
        verdict: 'best-fit',
        headline: 'Bullseye! Fast weekly launches with zero distributed headaches.',
        sixMonthsLater:
          'PawSchedule launched on time in week 7. Clean internal folders (`appointments`, `records`, `billing`) made pivoting pricing rules trivial, and a single Postgres instance handled all ACID transactions effortlessly.',
        whatWorked: [
          'One repo, one CI pipeline, and instant local debugging kept velocity high.',
          'ACID transactions prevented double-booked appointments and invoice mismatches.',
          'Clean module facades make extracting a service later easy if needed.',
        ],
        whatHurt: [
          'Long-running monthly reminder emails needed a tiny background worker later on.',
        ],
        scores: { devSpeed: 5, opsSimplicity: 5, scaling: 4, costEfficiency: 5, faultIsolation: 3 },
      },
      microservices: {
        verdict: 'over-engineered',
        headline: 'Over-engineered: 3 devs drowned in infrastructure instead of features.',
        sixMonthsLater:
          'Splitting into 5 services meant 5 repos, Docker networking bugs, and distributed saga code just to cancel an appointment and refund an invoice. Launch slipped by 3 months.',
        whatWorked: [
          'Theoretical fault isolation between Billing and Appointments.',
        ],
        whatHurt: [
          'Tiny team spent 60% of its week on CI/CD, API contracts, and tracing.',
          'Keeping appointments and invoices consistent across separate DBs was painful.',
        ],
        scores: { devSpeed: 2, opsSimplicity: 1, scaling: 5, costEfficiency: 2, faultIsolation: 5 },
      },
      serverless: {
        verdict: 'viable',
        headline: 'Viable, though managing many functions for tightly linked CRUD added friction.',
        sixMonthsLater:
          'Hosting costs stayed tiny, but splitting tightly connected booking + invoice transactions across 25 separate functions and worrying about cold starts and DB pooling slowed down feature iteration.',
        whatWorked: [
          'Very low cloud bill during early low-traffic months.',
          'No servers to patch.',
        ],
        whatHurt: [
          'Local end-to-end testing and relational DB pooling took extra setup.',
          'Cold starts occasionally annoyed clinic receptionists during check-in.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 4, scaling: 5, costEfficiency: 5, faultIsolation: 4 },
      },
      'event-driven': {
        verdict: 'over-engineered',
        headline: 'Unnecessary eventual consistency for a straightforward CRUD app.',
        sixMonthsLater:
          'Putting a message broker between Bookings and Invoices meant receptionists sometimes saw "Invoice pending..." after checkout, creating confusion for zero real scaling gain.',
        whatWorked: [
          'Sending appointment reminder emails asynchronously worked nicely.',
        ],
        whatHurt: [
          'Running and monitoring a broker for 15 req/sec was pure overhead.',
          'Debugging why an invoice lagged behind a booking frustrated the small team.',
        ],
        scores: { devSpeed: 2, opsSimplicity: 2, scaling: 5, costEfficiency: 3, faultIsolation: 4 },
      },
    },
  },
  {
    id: 'sim-global-marketplace',
    title: 'Global Multi-Team E-Commerce Marketplace',
    company: 'BazaarGrid',
    brief:
      'BazaarGrid has grown to 95 engineers across 12 autonomous squads (Search, Checkout, Seller Payouts, Reviews, Fraud ML in Python, Shipping). Teams are constantly blocked waiting on a shared monolith release train.',
    constraints: {
      teamSize: '95 engineers across 12 squads (TS, Go, Python)',
      trafficPattern: 'Massive global traffic with huge Search/Browse spikes',
      budgetOps: 'Dedicated SRE & platform engineering team',
      latencyConsistency: 'Checkout must NEVER go down if Reviews crashes',
      timeToMarket: 'Teams need independent daily deploys',
    },
    bestFit: 'microservices',
    outcomes: {
      microservices: {
        verdict: 'best-fit',
        headline: 'Right call! Squads ship independently and Search scales without touching Checkout.',
        sixMonthsLater:
          'Each squad owns its service and private database. Python ML engineers deploy Fraud models twice a day, Search scales 20x during holiday sales, and a Reviews bug never touches Checkout revenue.',
        whatWorked: [
          'Eliminated the 95-person merge-queue and deploy bottleneck.',
          'Fault isolation kept Checkout at 99.99% uptime even during Reviews incidents.',
          'Polyglot freedom let Fraud run Python while Checkout ran TypeScript/Go.',
        ],
        whatHurt: [
          'Required disciplined API versioning, OpenTelemetry tracing, and platform investment.',
        ],
        scores: { devSpeed: 4, opsSimplicity: 2, scaling: 5, costEfficiency: 3, faultIsolation: 5 },
      },
      'modular-monolith': {
        verdict: 'risky',
        headline: 'Organizational bottleneck: 95 engineers colliding in one deploy pipeline.',
        sixMonthsLater:
          'Even with tidy folders, a broken test in Reviews blocked Checkout hotfixes, Python ML teams couldn’t ship inside the Node.js binary, and scaling Search meant over-provisioning the entire app.',
        whatWorked: [
          'Simple local onboarding for a single language.',
        ],
        whatHurt: [
          'Merge conflicts and 45-minute CI queues frustrated all 12 squads.',
          'One memory leak in Reviews risked taking down global Checkout.',
        ],
        scores: { devSpeed: 2, opsSimplicity: 4, scaling: 2, costEfficiency: 3, faultIsolation: 2 },
      },
      serverless: {
        verdict: 'viable',
        headline: 'Great for glue tasks, but costly and fragmented as the entire core platform.',
        sixMonthsLater:
          'Running high-volume 24/7 global Search and Checkout purely on per-invocation functions cost 3x more than reserved containers, and coordinating 300+ functions across 12 squads got messy.',
        whatWorked: [
          'Handled sudden flash-sale spikes automatically.',
        ],
        whatHurt: [
          '24/7 heavy baseline traffic made Serverless pricier than containers.',
          'Complex cross-team governance across hundreds of small functions.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 3, scaling: 4, costEfficiency: 2, faultIsolation: 4 },
      },
      'event-driven': {
        verdict: 'viable',
        headline: 'Strong companion pattern, but you still need clear service ownership boundaries.',
        sixMonthsLater:
          'Events worked wonderfully for post-checkout fulfillment and notifications, yet core synchronous customer queries (Search, Cart, Checkout auth) still needed clean independent microservices.',
        whatWorked: [
          'Decoupled order fan-out cleanly across Shipping, Payouts, and Analytics.',
        ],
        whatHurt: [
          'Forcing synchronous user queries like Search into async event loops added needless latency.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 2, scaling: 5, costEfficiency: 3, faultIsolation: 5 },
      },
    },
  },
  {
    id: 'sim-invoice-ocr',
    title: 'Month-End Invoice OCR & PDF Generator',
    company: 'TaxSnap',
    brief:
      'Small businesses upload receipts and generate monthly tax PDFs. Traffic is nearly zero 28 days a month, then spikes to 60,000 uploads on the last two days of the month. Two engineers maintain the entire system.',
    constraints: {
      teamSize: '2 backend engineers',
      trafficPattern: '95% idle, massive 2-day month-end bursts',
      budgetOps: 'Bootstrap budget — cannot pay for idle servers',
      latencyConsistency: 'Async processing (5–15 seconds per PDF is totally fine)',
      timeToMarket: 'Ship quickly with minimal infrastructure work',
    },
    bestFit: 'serverless',
    outcomes: {
      serverless: {
        verdict: 'best-fit',
        headline: 'Spot on! Near-$0 idle bill and instant parallel scaling on the 30th.',
        sixMonthsLater:
          'Storage uploads trigger stateless OCR and PDF functions automatically. TaxSnap’s monthly compute bill is under $45, and 60,000 month-end documents finish in minutes without waking up engineers.',
        whatWorked: [
          'Scale-to-zero eliminated wasted compute for 28 quiet days each month.',
          'Parallel function bursts processed month-end spikes effortlessly.',
          '2 engineers spent zero hours managing Kubernetes or auto-scaling groups.',
        ],
        whatHurt: [
          'Had to add concurrency caps and connection pooling so spikes didn’t overwhelm Postgres.',
        ],
        scores: { devSpeed: 5, opsSimplicity: 5, scaling: 5, costEfficiency: 5, faultIsolation: 5 },
      },
      'modular-monolith': {
        verdict: 'risky',
        headline: 'Either crashes on the 30th or wastes money idling all month.',
        sixMonthsLater:
          'Running a small always-on server choked on CPU-heavy OCR bursts during month-end, while provisioning 15 big servers 24/7 blew past the bootstrap budget.',
        whatWorked: [
          'Easy initial code structure.',
        ],
        whatHurt: [
          'Manual scaling or paying for idle CPU 95% of the month.',
          'Heavy OCR jobs starved normal web login requests on the same server.',
        ],
        scores: { devSpeed: 4, opsSimplicity: 4, scaling: 2, costEfficiency: 2, faultIsolation: 2 },
      },
      microservices: {
        verdict: 'over-engineered',
        headline: 'Way too much always-on infrastructure for a 2-person bursty tool.',
        sixMonthsLater:
          'Maintaining container clusters, service meshes, and always-on worker pods for a workload that sleeps 28 days a month drained both budget and engineering focus.',
        whatWorked: [
          'Isolated OCR workers from the upload API.',
        ],
        whatHurt: [
          'Always-on cluster base costs wasted money during quiet weeks.',
          'High operational burden for just 2 engineers.',
        ],
        scores: { devSpeed: 2, opsSimplicity: 1, scaling: 4, costEfficiency: 2, faultIsolation: 4 },
      },
      'event-driven': {
        verdict: 'viable',
        headline: 'Good queue buffering, but always-on brokers & workers still cost more at idle.',
        sixMonthsLater:
          'Queueing OCR jobs smoothed out the burst nicely, though running a managed Kafka cluster 24/7 just for two busy days per month cost far more than serverless triggers.',
        whatWorked: [
          'Zero dropped receipts during month-end bursts.',
        ],
        whatHurt: [
          'Paid 24/7 broker costs during 28 silent days.',
          'Still needed separate auto-scaling setup for worker containers.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 3, scaling: 4, costEfficiency: 3, faultIsolation: 4 },
      },
    },
  },
  {
    id: 'sim-food-delivery',
    title: 'Real-Time Food Delivery Order Fan-Out',
    company: 'CraveDash',
    brief:
      'Every time a customer taps "Order" or a courier picks up food, 6 separate systems must react simultaneously: Restaurant POS, Courier Dispatch, Live Map, Push Notifications, Loyalty Points, and Fraud Scoring.',
    constraints: {
      teamSize: '28 engineers across 5 domain teams',
      trafficPattern: 'Intense dinner-rush bursts (5,000 status updates/sec)',
      budgetOps: 'Mid-sized platform team available',
      latencyConsistency: 'Checkout must stay fast even if Loyalty or Push is slow',
      timeToMarket: 'New teams frequently subscribe to order updates',
    },
    bestFit: 'event-driven',
    outcomes: {
      'event-driven': {
        verdict: 'best-fit',
        headline: 'Textbook EDA! One event fans out cleanly to 6 resilient consumers.',
        sixMonthsLater:
          'Order Service publishes `OrderPlaced` and `OrderPickedUp` via an Outbox to the event broker. When Push Notifications slowed down on Super Bowl Sunday, orders and courier dispatch never missed a beat.',
        whatWorked: [
          'Adding a 7th consumer (SMS Updates) required zero changes to Order Service.',
          'Broker buffered dinner-rush surges so slower consumers caught up safely.',
          'Idempotency keys prevented duplicate loyalty points or kitchen tickets.',
        ],
        whatHurt: [
          'Needed schema versioning and correlation IDs to trace cross-consumer flows.',
        ],
        scores: { devSpeed: 4, opsSimplicity: 3, scaling: 5, costEfficiency: 4, faultIsolation: 5 },
      },
      'modular-monolith': {
        verdict: 'risky',
        headline: 'Tightly coupled dinner-rush bottleneck.',
        sixMonthsLater:
          'Calling POS webhooks, push APIs, fraud checks, and loyalty calculations inside one monolithic request caused dinner-rush timeouts whenever any external partner hiccupped.',
        whatWorked: [
          'Quick initial prototype.',
        ],
        whatHurt: [
          'Flaky restaurant POS APIs stalled the shared app process.',
          '5 teams constantly edited the same `placeOrder()` function.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 4, scaling: 2, costEfficiency: 4, faultIsolation: 2 },
      },
      microservices: {
        verdict: 'viable',
        headline: 'Works only if you avoid brittle synchronous 6-hop call chains.',
        sixMonthsLater:
          'With pure synchronous HTTP between Order Service and 6 downstream services, Order Service had to know every consumer, manage 6 retry loops, and broke whenever downstream endpoints changed.',
        whatWorked: [
          'Teams deployed independently.',
        ],
        whatHurt: [
          'Tight point-to-point HTTP fan-out became fragile during dinner-rush spikes.',
          'Adding a new consumer meant editing and redeploying Order Service.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 2, scaling: 4, costEfficiency: 3, faultIsolation: 3 },
      },
      serverless: {
        verdict: 'viable',
        headline: 'Nice for individual consumers, but you still need an Event Broker at the core.',
        sixMonthsLater:
          'Serverless functions handled Push and Loyalty consumers well, though steady high-frequency 5,000 msg/sec dinner-rush streams benefited from pairing with a proper Event-Driven backbone.',
        whatWorked: [
          'Easy auto-scaling for lightweight notification tasks.',
        ],
        whatHurt: [
          'Without an event broker + schema registry, orchestrating 6 consumers got tangled.',
        ],
        scores: { devSpeed: 4, opsSimplicity: 3, scaling: 4, costEfficiency: 3, faultIsolation: 4 },
      },
    },
  },
  {
    id: 'sim-hr-payroll',
    title: 'Internal HR, Leave & Payroll Portal',
    company: 'PeopleCore',
    brief:
      'A 6-person internal engineering team is building an HR portal for 4,000 employees: leave approvals, org charts, expense reimbursements, and monthly payroll exports.',
    constraints: {
      teamSize: '6 TypeScript engineers',
      trafficPattern: 'Predictable office-hours traffic (~20 req/sec)',
      budgetOps: 'Prefers simple, auditable single deployment',
      latencyConsistency: 'Strict relational accuracy across leave balances & payroll',
      timeToMarket: 'Replace legacy spreadsheets in 3 months',
    },
    bestFit: 'modular-monolith',
    outcomes: {
      'modular-monolith': {
        verdict: 'best-fit',
        headline: 'Clean, auditable, and rock-solid relational integrity.',
        sixMonthsLater:
          'Clear modules (`directory`, `leave`, `expenses`, `payroll`) in one TypeScript + Postgres app made compliance audits straightforward and kept the 6-person team shipping smoothly.',
        whatWorked: [
          'Single ACID transaction ensured approved leave always matched payroll deductions.',
          'Simple deployment, backups, and security auditing.',
          'Zero distributed debugging overhead.',
        ],
        whatHurt: [
          'Enforced ESLint boundary rules so `payroll` never reached directly into `leave` tables.',
        ],
        scores: { devSpeed: 5, opsSimplicity: 5, scaling: 4, costEfficiency: 5, faultIsolation: 3 },
      },
      microservices: {
        verdict: 'over-engineered',
        headline: 'Massive operational tax for 20 internal requests per second.',
        sixMonthsLater:
          'Splitting HR into 6 microservices created complex distributed transactions between Leave and Payroll and took 3x longer to pass internal security review.',
        whatWorked: [
          'Clean separation on paper.',
        ],
        whatHurt: [
          'Synchronizing employee IDs and leave totals across 6 databases caused payroll discrepancies.',
          '6 engineers spent too much time maintaining service deployments.',
        ],
        scores: { devSpeed: 2, opsSimplicity: 1, scaling: 5, costEfficiency: 2, faultIsolation: 4 },
      },
      serverless: {
        verdict: 'viable',
        headline: 'Workable, though steady office-hours CRUD is simpler as one cohesive app.',
        sixMonthsLater:
          'Serverless worked nicely for the monthly payroll CSV export job, but splitting every internal CRUD endpoint into individual functions complicated local dev and relational transactions.',
        whatWorked: [
          'Monthly export job scaled cleanly on demand.',
        ],
        whatHurt: [
          'Extra wiring for auth, shared validation, and SQL connection pooling.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 4, scaling: 4, costEfficiency: 4, faultIsolation: 4 },
      },
      'event-driven': {
        verdict: 'over-engineered',
        headline: 'Eventual consistency caused headaches during payroll cutoffs.',
        sixMonthsLater:
          'HR managers approved a leave request and immediately ran payroll export — missing the update because an async event was still in flight.',
        whatWorked: [
          'Audit logging via events was tidy.',
        ],
        whatHurt: [
          'Eventual consistency conflicted with immediate HR admin workflows.',
          'Unneeded broker maintenance for 20 req/sec.',
        ],
        scores: { devSpeed: 2, opsSimplicity: 2, scaling: 4, costEfficiency: 3, faultIsolation: 4 },
      },
    },
  },
  {
    id: 'sim-webhook-enrichment',
    title: 'Marketing Webhook & Lead-Enrichment Glue',
    company: 'LeadSpark',
    brief:
      'Whenever a prospect fills out a landing page form or clicks a webinar link, LeadSpark validates the webhook, calls 2 enrichment APIs, and syncs the lead to HubSpot. Traffic comes in sudden bursts right after email newsletters go out.',
    constraints: {
      teamSize: '1 growth engineer',
      trafficPattern: 'Silent most hours, sudden 3,000-webhook bursts after newsletters',
      budgetOps: 'Zero time for server administration',
      latencyConsistency: 'Respond 202 fast; enrichment can finish in 2–5 seconds',
      timeToMarket: 'Needs to go live this week',
    },
    bestFit: 'serverless',
    outcomes: {
      serverless: {
        verdict: 'best-fit',
        headline: 'Built for this! Zero servers to baby-sit and effortless newsletter bursts.',
        sixMonthsLater:
          'One thin intake function replies `202` in 25ms and pushes leads onto a managed queue triggering enrichment functions. Total monthly bill: $12, zero downtime.',
        whatWorked: [
          'Built and deployed by 1 engineer in two days.',
          'Queue + worker functions absorbed 3,000-lead newsletter bursts automatically.',
          'Automatic retries handled flaky third-party CRM APIs.',
        ],
        whatHurt: [
          'Needed rate-limit throttling on workers so bursts didn’t hit HubSpot’s API limit.',
        ],
        scores: { devSpeed: 5, opsSimplicity: 5, scaling: 5, costEfficiency: 5, faultIsolation: 5 },
      },
      'modular-monolith': {
        verdict: 'viable',
        headline: 'Works at low scale, but a solo engineer has to manage server uptime & bursts.',
        sixMonthsLater:
          'Simple to code, yet a big newsletter blast overwhelmed the single small VM and dropped incoming webhooks until a queue was bolted on anyway.',
        whatWorked: [
          'Familiar single Node.js server.',
        ],
        whatHurt: [
          'Paying for an always-on VM even when no newsletters are running.',
          'Dropped webhooks during bursts without separate queue workers.',
        ],
        scores: { devSpeed: 4, opsSimplicity: 3, scaling: 2, costEfficiency: 3, faultIsolation: 2 },
      },
      microservices: {
        verdict: 'over-engineered',
        headline: 'A 1-person team should never run a microservices cluster for webhook glue.',
        sixMonthsLater:
          'Container orchestration, service discovery, and multiple repos turned a 2-day webhook integration into a 6-week infrastructure project.',
        whatWorked: [
          'Clean separation of intake and enrichment.',
        ],
        whatHurt: [
          'Extreme ops overhead for 1 engineer.',
          'High fixed hosting costs.',
        ],
        scores: { devSpeed: 1, opsSimplicity: 1, scaling: 4, costEfficiency: 1, faultIsolation: 4 },
      },
      'event-driven': {
        verdict: 'viable',
        headline: 'Right async mindset, just heavier than managed serverless queues for 1 dev.',
        sixMonthsLater:
          'Decoupling intake from HubSpot sync via a broker worked great functionally, though managing a dedicated broker cluster was heavier than serverless functions + managed queue.',
        whatWorked: [
          'Resilient against HubSpot outages.',
        ],
        whatHurt: [
          'More broker setup and monitoring than a solo growth engineer needed.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 3, scaling: 5, costEfficiency: 3, faultIsolation: 4 },
      },
    },
  },
  {
    id: 'sim-iot-telemetry',
    title: 'Smart-Home IoT Sensor Stream & Alerting',
    company: 'HomePulse',
    brief:
      '500,000 smart thermostats and smoke detectors emit readings every 10 seconds. Separate systems consume this firehose for Emergency Smoke Alerts, Energy Dashboards, Predictive Maintenance ML, and Long-Term Archival.',
    constraints: {
      teamSize: '20 backend & data engineers',
      trafficPattern: 'Continuous 50,000 messages/second firehose',
      budgetOps: 'Engineering team comfortable with streaming brokers',
      latencyConsistency: 'Smoke alerts must fire in <2s; dashboards can lag slightly',
      timeToMarket: 'Must support adding new analytics consumers easily',
    },
    bestFit: 'event-driven',
    outcomes: {
      'event-driven': {
        verdict: 'best-fit',
        headline: 'Purpose-built for high-throughput sensor streams and independent consumers!',
        sixMonthsLater:
          'Kafka/Event Hubs ingests 50k sensor events/sec cleanly. Emergency Smoke Alert consumers run on a dedicated high-priority group while Archival batches writes cheaply to object storage.',
        whatWorked: [
          'Handled 50,000 events/sec without breaking a sweat.',
          'Urgent smoke alerts stayed sub-second even if Energy Dashboards fell behind.',
          'Replayable event log let the ML team retrain models on past sensor streams.',
        ],
        whatHurt: [
          'Required careful partitioning by `deviceId` to keep per-device readings ordered.',
        ],
        scores: { devSpeed: 4, opsSimplicity: 3, scaling: 5, costEfficiency: 5, faultIsolation: 5 },
      },
      'modular-monolith': {
        verdict: 'risky',
        headline: 'Crushed by the 50,000/sec sensor firehose.',
        sixMonthsLater:
          'Writing 50k sensor ticks/sec straight into one monolithic app and database saturated connections immediately, delaying critical smoke alarms.',
        whatWorked: [
          'Easy device registration CRUD endpoints.',
        ],
        whatHurt: [
          'Database write lockups delayed life-safety smoke alerts.',
          'Couldn’t independently scale alerting vs. archival.',
        ],
        scores: { devSpeed: 2, opsSimplicity: 3, scaling: 1, costEfficiency: 2, faultIsolation: 1 },
      },
      serverless: {
        verdict: 'risky',
        headline: 'Per-invocation billing gets painfully expensive on a 24/7 50k/sec firehose.',
        sixMonthsLater:
          'Without heavy batching, triggering 4.3 billion invocations per day drove cloud bills sky-high compared to a streaming event-driven cluster.',
        whatWorked: [
          'Quick prototype at 1,000 test devices.',
        ],
        whatHurt: [
          'Runaway per-request costs on constant 24/7 high-volume streams.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 4, scaling: 4, costEfficiency: 1, faultIsolation: 4 },
      },
      microservices: {
        verdict: 'viable',
        headline: 'Good service boundaries, but synchronous RPCs fail on a 50k/sec fan-out.',
        sixMonthsLater:
          'Ingest services trying to fan out 50k HTTP calls/sec to 4 downstream microservices created massive network overhead until the team introduced an Event-Driven broker.',
        whatWorked: [
          'Clear team ownership across Alerting and ML.',
        ],
        whatHurt: [
          'Point-to-point HTTP fan-out couldn’t buffer spikes or replay historical streams.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 2, scaling: 3, costEfficiency: 3, faultIsolation: 4 },
      },
    },
  },
  {
    id: 'sim-fintech-platform',
    title: 'Multi-Product Regulated Fintech Platform',
    company: 'VaultWave',
    brief:
      'VaultWave offers Debit Cards, Crypto Custody, Lending, and Real-Time Fraud Detection. Strict financial regulations require physical network & database isolation for Card/PCI workloads, and 70 engineers work across 8 specialized squads.',
    constraints: {
      teamSize: '70 engineers across 8 specialized squads',
      trafficPattern: 'High 24/7 global card authorization traffic',
      budgetOps: 'Strong security & DevOps platform team',
      latencyConsistency: 'Strict PCI isolation & independent fault domains',
      timeToMarket: 'Each product line ships on its own compliance cadence',
    },
    bestFit: 'microservices',
    outcomes: {
      microservices: {
        verdict: 'best-fit',
        headline: 'Meets strict PCI isolation and lets 8 regulated squads ship safely.',
        sixMonthsLater:
          'Card Authorization lives in a tightly locked-down PCI network zone with its own database and sub-100ms SLA, while Lending and Marketing iterate rapidly outside PCI scope.',
        whatWorked: [
          'Minimized PCI audit scope to just the Card Vault service.',
          '8 specialized squads deployed independently with strict blast-radius isolation.',
          'Steady 24/7 traffic ran cost-effectively on container clusters.',
        ],
        whatHurt: [
          'Required mature observability, strict contract testing, and strong platform tooling.',
        ],
        scores: { devSpeed: 4, opsSimplicity: 2, scaling: 5, costEfficiency: 4, faultIsolation: 5 },
      },
      'modular-monolith': {
        verdict: 'risky',
        headline: 'Pulls the ENTIRE 70-person codebase into strict PCI compliance scope.',
        sixMonthsLater:
          'Because Card processing shared a deployment and database with Lending and Marketing, every tiny UI tweak required PCI security review and slowed all 8 squads to a crawl.',
        whatWorked: [
          'Simpler initial transactions.',
        ],
        whatHurt: [
          'Massive compliance blast radius across unrelated product teams.',
          '70 engineers blocked by shared release gates.',
        ],
        scores: { devSpeed: 1, opsSimplicity: 3, scaling: 2, costEfficiency: 3, faultIsolation: 1 },
      },
      serverless: {
        verdict: 'risky',
        headline: 'Cold starts & 24/7 card-auth volume clash with strict sub-100ms SLAs.',
        sixMonthsLater:
          'Card networks drop authorizations that exceed strict millisecond timeouts, and paying per-invocation on 24/7 steady global payment volume cost more than dedicated containers.',
        whatWorked: [
          'Nice for scheduled compliance report exports.',
        ],
        whatHurt: [
          'Cold start tail-latency spikes risked declined card swipes.',
          'Higher cost on steady 24/7 volume.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 3, scaling: 4, costEfficiency: 2, faultIsolation: 4 },
      },
      'event-driven': {
        verdict: 'viable',
        headline: 'Great for post-transaction Fraud & Ledger feeds, but card swipes need sync auth.',
        sixMonthsLater:
          'Asynchronous events powered fraud alerts and customer push receipts brilliantly, while real-time card swipe authorization still relied on isolated synchronous microservices.',
        whatWorked: [
          'Clean audit trail and post-auth fraud scoring.',
        ],
        whatHurt: [
          'Pure async couldn’t answer synchronous card-terminal approval checks alone.',
        ],
        scores: { devSpeed: 3, opsSimplicity: 2, scaling: 5, costEfficiency: 4, faultIsolation: 5 },
      },
    },
  },
];
