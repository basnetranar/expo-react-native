import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { GuidedExperimentCard } from '@/features/help/components/guided-experiment-card';

describe('guided experiment', () => {
  it('explains player control and dismisses without applying an intervention', () => {
    const dismiss = jest.fn();
    let renderer: ReactTestRenderer;
    act(() => {
      renderer = create(<GuidedExperimentCard onDismiss={dismiss} />);
    });
    expect(
      renderer!.root.findAll(
        (node) =>
          typeof node.props.children === 'string' && node.props.children.includes('only begin'),
      ),
    ).not.toHaveLength(0);
    act(() =>
      renderer!.root.findByProps({ accessibilityLabel: 'Continue on My Own' }).props.onPress(),
    );
    expect(dismiss).toHaveBeenCalledTimes(1);
    act(() => renderer!.unmount());
  });
});
