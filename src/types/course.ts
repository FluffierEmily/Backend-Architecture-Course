export type ArchitectureId =
  | 'modular-monolith'
  | 'microservices'
  | 'serverless'
  | 'event-driven';

export type ProjectArchitectureId = ArchitectureId | 'hybrid';

export interface ImplementationRecipe {
  id: string;
  label: string;
  summary: string;
  steps: string[];
  code?: {
    filename: string;
    snippet: string;
  };
  watchOut?: string;
}

export interface CodeAnnotation {
  id: string;
  label: string;
  problemLines: [number, number]; // 1-indexed inclusive [start, end]
  refactoredLines: [number, number]; // 1-indexed inclusive [start, end]
  problemExplanation: string;
  refactoredExplanation: string;
  severity?: 'high' | 'medium';
}

export interface CodeComparisonItem {
  id: string;
  title: string;
  subtitle: string;
  context: string;
  problemTitle: string;
  problemFile: string;
  problemCode: string;
  refactoredTitle: string;
  refactoredFile: string;
  refactoredCode: string;
  annotations: CodeAnnotation[];
  howToImplement?: ImplementationRecipe[];
}

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  kind:
    | 'client'
    | 'gateway'
    | 'service'
    | 'module'
    | 'function'
    | 'queue'
    | 'database';
  x: number; // ViewBox 0..800
  y: number; // ViewBox 0..340
  beginnerSummary: string;
  failureNote: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
  async?: boolean;
  failsInFailureMode?: boolean;
  buffersInFailureMode?: boolean;
}

export interface ArchitectureDiagramData {
  normalSummary: string;
  failureTitle: string;
  failureSummary: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface BestPracticeItem {
  title: string;
  detail: string;
}

export interface PitfallItem {
  title: string;
  symptom: string;
  fix: string;
  howToImplement?: ImplementationRecipe;
}

export interface MiniDecisionCheckItem {
  id: string;
  prompt: string;
  isGoodFit: boolean;
  explanation: string;
  betterAlternative?: ArchitectureId;
}

export interface PracticeProjectMilestone {
  id: string;
  title: string;
  detail: string;
}

export interface PracticeProject {
  id: string;
  architectureId: ProjectArchitectureId;
  title: string;
  difficulty: 'starter' | 'stretch';
  estimatedTime: string;
  summary: string;
  suggestedStack: string[];
  folderStructure: string;
  milestones: PracticeProjectMilestone[];
  architectureRules: string[];
  starterHints?: ImplementationRecipe[];
}

export interface DeepDiveConcept {
  id: string;
  badge: string;
  title: string;
  summary: string;
  bulletPoints?: string[];
  keyTakeaway: string;
  howToImplement?: ImplementationRecipe[];
}

export interface ArchitectureModule {
  id: ArchitectureId;
  order: number;
  name: string;
  shortName: string;
  tagline: string;
  accentColor: 'indigo' | 'sky' | 'amber' | 'emerald';
  beginnerSummary: string;
  whenToUse: string[];
  whenToAvoid: string[];
  scenario: {
    company: string;
    domain: string;
    teamSize: string;
    trafficProfile: string;
    story: string;
    whyThisArchitecture: string;
  };
  diagram: ArchitectureDiagramData;
  deepDiveConcepts: DeepDiveConcept[];
  codeComparisons: CodeComparisonItem[];
  bestPractices: BestPracticeItem[];
  pitfalls: PitfallItem[];
  miniChecks: MiniDecisionCheckItem[];
  practiceProjects: PracticeProject[];
  comparisonProfile: {
    idealTeamSize: string;
    deploymentUnit: string;
    scalingStyle: string;
    opsComplexity: 'Low' | 'Medium' | 'High';
    devVelocityEarly: 'High' | 'Medium' | 'Low';
    faultIsolation: 'Moderate' | 'High' | 'Very High';
    costAtIdle: 'Fixed (Low)' | 'Fixed (High)' | 'Near Zero' | 'Broker + Workers';
    dataConsistency: 'Strong (ACID)' | 'Eventual' | 'Per-Function / Mixed';
    typicalDatastore: string;
    bestFor: string;
  };
}

export interface FoundationBlock {
  id: string;
  name: string;
  icon:
    | 'globe'
    | 'shield'
    | 'database'
    | 'layers'
    | 'zap'
    | 'scale'
    | 'cpu'
    | 'gauge'
    | 'activity'
    | 'lock'
    | 'git-branch'
    | 'flask-conical'
    | 'key-round'
    | 'radio'
    | 'hard-drive'
    | 'rocket'
    | 'building'
    | 'heart-pulse';
  oneLiner: string;
  realWorldAnalogy: string;
  howItWorks: string;
  beginnerWatchOut: string;
  relevantArchitectures: ArchitectureId[];
  howToImplement?: ImplementationRecipe[];
}

export interface SimulatorScores {
  devSpeed: number; // 1-5
  opsSimplicity: number;
  scaling: number;
  costEfficiency: number;
  faultIsolation: number;
}

export interface SimulatorOutcome {
  verdict: 'best-fit' | 'viable' | 'over-engineered' | 'risky';
  headline: string;
  sixMonthsLater: string;
  whatWorked: string[];
  whatHurt: string[];
  howToMitigate?: string[];
  scores: SimulatorScores;
}

export interface SimulatorScenario {
  id: string;
  title: string;
  company: string;
  brief: string;
  constraints: {
    teamSize: string;
    trafficPattern: string;
    budgetOps: string;
    latencyConsistency: string;
    timeToMarket: string;
  };
  bestFit: ArchitectureId;
  hybridNote?: string;
  outcomes: Record<ArchitectureId, SimulatorOutcome>;
}
