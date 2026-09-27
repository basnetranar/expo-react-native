import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export function TimelinePlayhead() {
  return <View accessibilityLabel="Timeline playhead at 16 seconds" style={styles.playhead} />;
}

const styles = StyleSheet.create({
  playhead: {
    position: 'absolute',
    left: '40%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.text,
  },
});
