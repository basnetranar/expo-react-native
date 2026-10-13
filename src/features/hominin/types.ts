export interface HomininTrait {
  name: string;
  value: number;
}

export interface HomininSummary {
  id: string;
  name: string;
  generation: number;
  age: number;
  lifeStage: 'Adult' | 'Juvenile';
  alive: boolean;
}

export interface InspectorTrait {
  key: string;
  label: string;
  value: number;
  explanation: string;
}

export interface InspectorRelatedPerson {
  id: string;
  name: string;
  detail: string;
  available: boolean;
}

export interface InspectorLearnedBehaviour {
  key: string;
  label: string;
  proficiency: number;
  reinforcement: number;
  learnedAtTick: number;
  learnedFrom: InspectorRelatedPerson | null;
  acquisitionSource: string;
  practiceCount: number;
  successfulAttempts: number;
  failedAttempts: number;
  lastPracticedAtTick: number;
}

export interface InspectorPreference {
  key: string;
  label: string;
  value: number;
  direction: 'favoured' | 'avoided';
}

export interface InspectorHistoryItem {
  key: string;
  tick: number;
  title: string;
  description: string;
  tone: 'experience' | 'learning' | 'death';
}

export interface InspectorSocialConnection extends InspectorRelatedPerson {
  familiarity: number;
  trust: number;
  kinship: number;
  observedSuccess: number;
  followBenefits: number;
  affinity: number;
  interactionCount: number;
  cooperationCount: number;
  sharingCount: number;
  groomingCount: number;
}

export interface HomininInspectorViewModel {
  id: string;
  name: string;
  generation: number;
  age: number;
  lifeStage: string;
  alive: boolean;
  statusLabel: string;
  behaviour: string;
  needs: { energy: number; hydration: number; health: number; safety: number };
  traits: InspectorTrait[];
  learnedBehaviours: InspectorLearnedBehaviour[];
  preferences: InspectorPreference[];
  parents: InspectorRelatedPerson[];
  children: InspectorRelatedPerson[];
  socialConnections: InspectorSocialConnection[];
  history: InspectorHistoryItem[];
  retainedMemoryCount: number;
  deathDetail: string | null;
  groupId: string | null;
  carriedFood: number;
}
