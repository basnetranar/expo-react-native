import type {
  AcquisitionSource,
  CulturalGenerationSummary,
  LearnedBehaviourType,
  LearningEventType,
} from '@/simulation';

export interface LearningPersonViewModel {
  id: string;
  name: string;
  generation: number;
  age: number;
  groupId: string | null;
  proficiency: number;
  acquisitionSource: AcquisitionSource;
  learnedFrom?: { id: string; name: string };
  firstLearnedAtTick: number;
  practiceCount: number;
  successfulAttempts: number;
  failedAttempts: number;
}

export interface LearningEventViewModel {
  id: string;
  type: LearningEventType;
  title: string;
  detail: string;
  tick: number;
  generation: number;
  behaviour: LearnedBehaviourType;
  agentId?: string;
  sourceAgentId?: string;
  groupId?: string;
  outcome?: 'success' | 'failed' | 'observed';
}

export interface BehaviourCultureViewModel {
  id: LearnedBehaviourType;
  name: string;
  description: string;
  category: string;
  historicallyDiscovered: boolean;
  currentlyKnown: boolean;
  status: 'unknown' | 'known' | 'lost';
  practitioners: LearningPersonViewModel[];
  adoptionPercent: number;
  averageProficiency: number;
  highestProficiency: number;
  groups: Readonly<Record<string, number>>;
  firstDiscovery?: LearningEventViewModel;
  events: LearningEventViewModel[];
}

export interface LearningOverviewViewModel {
  tick: number;
  generation: number;
  population: number;
  knownCount: number;
  historicalCount: number;
  knowledgeableIndividuals: number;
  behaviours: BehaviourCultureViewModel[];
  events: LearningEventViewModel[];
  milestones: LearningEventViewModel[];
  summaries: readonly CulturalGenerationSummary[];
  historyLimited: boolean;
}
