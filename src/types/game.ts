export type CrewRole = 'runner' | 'hacker' | 'safecracker' | 'lookout' | 'driver';
export type SecurityDeviceType =
  'camera' | 'motion-sensor' | 'laser' | 'alarm' | 'keypad' | 'card-reader' | 'door';
export type MissionStatus = 'locked' | 'available' | 'planned' | 'completed';
export type MissionResult = 'success' | 'failure';

export interface MissionObjective {
  id: string;
  label: string;
  optional?: boolean;
}

export interface Mission {
  id: string;
  title: string;
  location: string;
  difficulty: string;
  reward: number;
  crewSize: number;
  securityLevel: string;
  status: MissionStatus;
  objectives: MissionObjective[];
}

export interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  skill: string;
  speed: number;
  risk: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'Access' | 'Hacking' | 'Stealth' | 'Mobility' | 'Disguise' | 'Utility';
  description: string;
}

export interface SecurityDevice {
  id: string;
  type: SecurityDeviceType;
  label: string;
  active: boolean;
}

export interface TimelineAction {
  id: string;
  atSeconds: number;
  actor: string;
  label: string;
}

export interface PlanRoute {
  id: string;
  crewMemberId: string;
  points: { x: number; y: number }[];
}

export interface MissionResultData {
  result: MissionResult;
  completionSeconds?: number;
  alarmsTriggered?: number;
  guardsDetected?: number;
  rating?: number;
  reason?: string;
}
