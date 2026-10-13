import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { PopulationIndividualRow } from '@/features/population/components/population-individual-row';
import type { PopulationIndividualRow as Individual } from '@/features/population/types';
import type { Genome } from '@/simulation';

const traits = {
  strength: 50,
  speed: 50,
  endurance: 50,
  dexterity: 50,
  vision: 50,
  metabolicEfficiency: 50,
  memoryPotential: 50,
  learningAbility: 50,
  socialSensitivity: 50,
  curiosity: 50,
} satisfies Genome;

const individual: Individual = {
  id: 'g2-stable-id',
  name: 'Ara',
  generation: 2,
  age: 24,
  lifeStage: 'adult',
  health: 90,
  currentBehaviour: 'explore',
  learnedBehaviours: [],
  traits,
  portraitVariant: 0,
};

describe('PopulationIndividualRow', () => {
  it('navigates using the stable individual ID', () => {
    const open = jest.fn();
    let renderer: ReactTestRenderer;
    act(() => {
      renderer = create(
        <PopulationIndividualRow
          individual={individual}
          selectedTrait="memoryPotential"
          onPress={open}
        />,
      );
    });
    const target = renderer!.root
      .findAllByProps({ accessibilityLabel: 'Inspect Ara, g2-stable-id' })
      .find((candidate) => typeof candidate.props.onPress === 'function')!;
    act(() => target.props.onPress());
    expect(open).toHaveBeenCalledWith('g2-stable-id');
    act(() => renderer!.unmount());
  });
});
