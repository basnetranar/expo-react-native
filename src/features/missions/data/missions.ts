import type { Mission } from '@/types/game';

export const missions: Mission[] = [
  {
    id: 'museum-vault',
    title: 'Museum Vault',
    location: 'Northbridge Museum',
    difficulty: 'Medium',
    reward: 12500,
    crewSize: 3,
    securityLevel: 'High',
    status: 'available',
    objectives: [
      { id: 'crown', label: 'Steal the Emerald Crown' },
      { id: 'silent', label: 'No alarms', optional: true },
      { id: 'records', label: 'Recover security records', optional: true },
      { id: 'speed', label: 'Finish under 90 seconds', optional: true },
    ],
  },
  ...[
    ['diamond-exchange', 'Diamond Exchange', 'Financial District', 'Hard', 22000, 4, 'Extreme'],
    ['private-gallery', 'Private Gallery', 'Old Quarter', 'Easy', 7200, 2, 'Medium'],
    ['corporate-archive', 'Corporate Archive', 'Helix Tower', 'Medium', 15800, 3, 'High'],
  ].map(([id, title, location, difficulty, reward, crewSize, securityLevel]) => ({
    id: String(id),
    title: String(title),
    location: String(location),
    difficulty: String(difficulty),
    reward: Number(reward),
    crewSize: Number(crewSize),
    securityLevel: String(securityLevel),
    status: 'available' as const,
    objectives: [{ id: 'primary', label: 'Secure the primary target' }],
  })),
];

export function getMission(missionId: string): Mission {
  return missions.find((mission) => mission.id === missionId) ?? missions[0]!;
}
