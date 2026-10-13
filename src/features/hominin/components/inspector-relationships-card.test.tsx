import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { InspectorRelationshipsCard } from '@/features/hominin/components/inspector-relationships-card';
import type { HomininInspectorViewModel } from '@/features/hominin/types';

const open = jest.fn();

const individual: HomininInspectorViewModel = {
  id: 'g1-child',
  name: 'Ara',
  generation: 1,
  age: 12,
  lifeStage: 'Juvenile',
  alive: true,
  statusLabel: 'Living · live state',
  behaviour: 'Explore',
  needs: { energy: 80, hydration: 80, health: 100, safety: 70 },
  traits: [],
  learnedBehaviours: [],
  preferences: [],
  parents: [
    {
      id: 'g0-parent',
      name: 'Sena',
      detail: 'Adult · Gen 0',
      available: true,
    },
  ],
  children: [],
  socialConnections: [],
  history: [],
  retainedMemoryCount: 0,
  deathDetail: null,
  groupId: null,
  carriedFood: 0,
};

describe('InspectorRelationshipsCard', () => {
  let renderer: ReactTestRenderer;

  beforeEach(() => {
    open.mockClear();
    act(() => {
      renderer = create(<InspectorRelationshipsCard individual={individual} onOpen={open} />);
    });
  });

  afterEach(() => act(() => renderer.unmount()));

  it('navigates through an available family identifier', () => {
    const rows = renderer.root.findAllByProps({ accessibilityLabel: 'Inspect Sena' });
    const row = rows.find((candidate) => typeof candidate.props.onPress === 'function')!;
    act(() => row.props.onPress());
    expect(open).toHaveBeenCalledWith('g0-parent');
  });
});
