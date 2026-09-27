import type { CrewMember } from '@/types/game';

export const crew: CrewMember[] = [
  { id: 'runner', name: 'Rook', role: 'runner', skill: 'Infiltration', speed: 94, risk: 'Medium' },
  { id: 'hacker', name: 'Cipher', role: 'hacker', skill: 'Systems', speed: 67, risk: 'Low' },
  {
    id: 'safecracker',
    name: 'Tumbler',
    role: 'safecracker',
    skill: 'Access',
    speed: 58,
    risk: 'Low',
  },
  { id: 'lookout', name: 'Vantage', role: 'lookout', skill: 'Intel', speed: 72, risk: 'Low' },
  { id: 'driver', name: 'Torque', role: 'driver', skill: 'Escape', speed: 88, risk: 'Medium' },
];
