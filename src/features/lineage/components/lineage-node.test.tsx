import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { LineageNode } from '@/features/lineage/components/lineage-node';
import type { LineagePerson } from '@/features/lineage/types';
import { genome } from '@/simulation/testing/fixtures';

const person: LineagePerson = {
  record: {
    id: 'g2-stable-id',
    parentIds: ['g1-first', 'g1-second'],
    birthTick: 80,
    birthGeneration: 2,
    genome: genome(),
  },
  name: 'Ara',
  alive: true,
  inspector: null,
  portraitVariant: 0,
};

describe('LineageNode', () => {
  it('selects a relative using the stable engine ID', () => {
    const select = jest.fn();
    let renderer: ReactTestRenderer;
    act(() => {
      renderer = create(<LineageNode person={person} selected={false} onPress={select} />);
    });
    const target = renderer!.root
      .findAllByProps({ accessibilityLabel: 'Ara, generation 2, living' })
      .find((candidate) => typeof candidate.props.onPress === 'function')!;
    act(() => target.props.onPress());
    expect(select).toHaveBeenCalledWith('g2-stable-id');
    act(() => renderer!.unmount());
  });

  it('announces selected and deceased state without inferring other attributes', () => {
    let renderer: ReactTestRenderer;
    act(() => {
      renderer = create(
        <LineageNode person={{ ...person, alive: false }} selected onPress={jest.fn()} />,
      );
    });
    expect(
      renderer!.root.findAllByProps({ accessibilityLabel: 'Ara, generation 2, deceased' }),
    ).not.toHaveLength(0);
    expect(renderer!.root.findAllByProps({ children: 'Deceased' })).not.toHaveLength(0);
    act(() => renderer!.unmount());
  });
});
