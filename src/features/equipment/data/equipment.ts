import type { EquipmentItem } from '@/types/game';

export const equipment: EquipmentItem[] = [
  {
    id: 'lockpick',
    name: 'Lockpick Kit',
    category: 'Access',
    description: 'Quiet entry for mechanical locks.',
  },
  {
    id: 'jammer',
    name: 'Signal Jammer',
    category: 'Stealth',
    description: 'Interrupts nearby wireless alarms.',
  },
  {
    id: 'camera-loop',
    name: 'Camera Loop Device',
    category: 'Hacking',
    description: 'Repeats a short camera feed.',
  },
  {
    id: 'tablet',
    name: 'Hacking Tablet',
    category: 'Hacking',
    description: 'Portable intrusion workstation.',
  },
  {
    id: 'cutter',
    name: 'Glass Cutter',
    category: 'Access',
    description: 'Precision access through display glass.',
  },
  {
    id: 'grapple',
    name: 'Grappling Hook',
    category: 'Mobility',
    description: 'Alternative vertical routes.',
  },
];
