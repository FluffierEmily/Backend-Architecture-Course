import type { FoundationBlock } from '../types/course';

export const FOUNDATION_BLOCKS: FoundationBlock[] = [
  {
    id: 'client-http',
    name: 'Client, Server & Sync HTTP',
    icon: 'globe',
    oneLiner: 'A browser or mobile app sends a request and waits for the backend to reply.',
    realWorldAnalogy:
      'Like ordering at a coffee counter and standing there until the barista hands you your cup.',
    howItWorks:
      'Synchronous HTTP (REST/JSON) is simple, predictable, and easy to debug. Every backend starts here — trouble only begins when one slow step forces the user to wait too long or blocks other requests.',
    beginnerWatchOut:
      'Doing slow work (like generating a PDF or resizing a video) synchronously inside an HTTP request causes timeouts and makes your server run out of capacity fast.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless'],
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    icon: 'shield',
    oneLiner: 'One front door that routes requests, checks auth tokens, and applies rate limits.',
    realWorldAnalogy:
      'A hotel concierge who checks your keycard and directs you to the right elevator without making you memorize floor layouts.',
    howItWorks:
      'Instead of making frontend apps talk directly to 12 internal services or 30 functions, an API Gateway exposes one clean URL, validates JWTs, enforces rate limits, and forwards requests to the right backend target.',
    beginnerWatchOut:
      'Do not put heavy business logic inside your API Gateway. Keep it focused on routing, authentication, and request protection.',
    relevantArchitectures: ['microservices', 'serverless'],
  },
  {
    id: 'databases',
    name: 'Databases & Data Ownership',
    icon: 'database',
    oneLiner: 'Where persistent state lives — and who is allowed to read or modify each table.',
    realWorldAnalogy:
      'Shared whiteboards work fine for a 4-person startup, but 10 teams erasing each other’s columns causes chaos.',
    howItWorks:
      'In a Modular Monolith, modules share one database engine while keeping table ownership separate. In Microservices, each service owns its own private database so teams can change schemas without breaking neighbors.',
    beginnerWatchOut:
      'Letting two independent services read and write the exact same database tables creates a "distributed monolith" — all the operational pain of microservices with none of the independence.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'event-driven'],
  },
  {
    id: 'queues-brokers',
    name: 'Message Queues & Event Brokers',
    icon: 'layers',
    oneLiner: 'A shock absorber that holds work or broadcasts facts so services do not block each other.',
    realWorldAnalogy:
      'A restaurant ticket rail: waiters clip orders up quickly and the kitchen cooks them at a steady pace, even during the dinner rush.',
    howItWorks:
      'A queue (like SQS or BullMQ) buffers tasks for workers to process asynchronously. An event broker (like Kafka, RabbitMQ, or EventBridge) broadcasts events like "OrderPlaced" so multiple independent consumers can react simultaneously.',
    beginnerWatchOut:
      'Queues usually deliver messages "at least once" — meaning the same message can arrive twice! Consumers must be idempotent so retries never double-charge a user.',
    relevantArchitectures: ['event-driven', 'serverless', 'microservices'],
  },
  {
    id: 'sync-vs-async',
    name: 'Synchronous vs. Asynchronous',
    icon: 'zap',
    oneLiner: 'Deciding whether the caller needs an answer right now or just confirmation that work is queued.',
    realWorldAnalogy:
      'Checking if a seat is available is synchronous (you wait). Receiving your boarding pass email is asynchronous (it arrives seconds later).',
    howItWorks:
      'Use synchronous calls when the user immediately needs the result (login, payment authorization). Use asynchronous workflows for side effects (emails, analytics, thumbnails, fraud checks) so failures in secondary features never break the main action.',
    beginnerWatchOut:
      'Asynchronous systems introduce "eventual consistency" — your UI should handle temporary states like "Processing..." rather than assuming instant completion.',
    relevantArchitectures: ['event-driven', 'serverless', 'microservices', 'modular-monolith'],
  },
  {
    id: 'stateless-scaling',
    name: 'Statelessness & Scaling',
    icon: 'scale',
    oneLiner: 'Growing by buying a bigger machine (vertical) or running more copies (horizontal).',
    realWorldAnalogy:
      'Hiring a faster cashier is vertical scaling; opening 5 identical checkout lanes is horizontal scaling.',
    howItWorks:
      'To run multiple copies of your backend behind a load balancer (or auto-scale serverless functions), your server code must be stateless — store sessions, files, and caches in external stores (Redis, S3, DB), never in server memory.',
    beginnerWatchOut:
      'Saving uploaded files to local disk or storing login sessions in an in-memory JS Map works on localhost, then randomly fails as soon as you deploy 2 instances or a serverless function restarts.',
    relevantArchitectures: ['serverless', 'microservices', 'modular-monolith'],
  },
  {
    id: 'caching',
    name: 'Caching (CDN & Redis Cache-Aside)',
    icon: 'cpu',
    oneLiner: 'Storing frequent read results in fast memory or at the network edge so your database does less work.',
    realWorldAnalogy:
      'Keeping the most popular menu items written on a chalkboard behind the register instead of walking to the storeroom every time someone asks.',
    howItWorks:
      'With the Cache-Aside pattern, your backend checks Redis first; on a cache miss, it queries the database, saves the result in Redis with a TTL (expiration time), and returns it. CDNs cache static assets and public GET responses geographically close to users.',
    beginnerWatchOut:
      'Watch for Cache Stampedes (a popular key expires and 500 requests hit the DB at once — add small random TTL jitter), stale data after writes, and NEVER cache private user data in a shared public CDN key!',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless'],
  },
  {
    id: 'rate-limiting-backpressure',
    name: 'Rate Limiting & Backpressure',
    icon: 'gauge',
    oneLiner: 'Protecting backends from traffic floods and stopping fast producers from overwhelming slow consumers.',
    realWorldAnalogy:
      'A bouncer letting people into a club at a steady pace (rate limiting) and pausing entry when the room is full (backpressure).',
    howItWorks:
      'Rate limiters cap requests per user/IP (e.g., 100 req/min via a token bucket) to block scrapers, accidental infinite loops, and noisy neighbors. Backpressure ensures that when workers fall behind, upstream queues bound their size, slow intake, or shed non-critical load instead of running out of memory.',
    beginnerWatchOut:
      'A queue absorbs temporary spikes, NOT permanent overload! If producers push 500 jobs/sec forever while workers only process 100/sec, the queue grows unbounded until delays hit hours or brokers crash.',
    relevantArchitectures: ['serverless', 'microservices', 'event-driven', 'modular-monolith'],
  },
];

export const BEGINNER_GLOSSARY = [
  {
    term: 'Coupling',
    meaning:
      'How tightly two pieces of code or two services depend on each other. High coupling means changing A unexpectedly breaks B.',
  },
  {
    term: 'Idempotency',
    meaning:
      'Running the exact same operation twice produces the same final result as running it once (essential for payment webhooks and queue retries).',
  },
  {
    term: 'Cold Start',
    meaning:
      'The brief delay (tens to hundreds of milliseconds) when a serverless platform spins up a brand-new container for an idle function.',
  },
  {
    term: 'Eventual Consistency',
    meaning:
      'After an update happens, all parts of the system will agree on the latest state after a short delay rather than in the exact same millisecond.',
  },
  {
    term: 'Blast Radius',
    meaning:
      'How much of your application goes down when one component crashes or receives a bad deploy.',
  },
  {
    term: 'Distributed Monolith',
    meaning:
      'A common anti-pattern where a system is split into many microservices, yet they must all be deployed together because they are tightly coupled.',
  },
  {
    term: 'Cache Stampede',
    meaning:
      'When a hot cached entry expires and hundreds of concurrent requests miss the cache simultaneously, slamming the database.',
  },
  {
    term: 'Backpressure',
    meaning:
      'A mechanism where a busy consumer signals upstream producers to slow down or shed load instead of crashing from an unbounded backlog.',
  },
  {
    term: 'Saga Pattern',
    meaning:
      'A sequence of local transactions across microservices where each step has a compensating action (like a refund) to undo work if a later step fails.',
  },
  {
    term: 'Strangler Fig Pattern',
    meaning:
      'Safely migrating a legacy monolith by incrementally routing one feature at a time to new services instead of doing a risky big-bang rewrite.',
  },
];
