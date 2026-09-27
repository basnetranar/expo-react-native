import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

const tools = ['Select', 'Draw Route', 'Add Action', 'Erase'];

export function ToolPalette({ vertical }: { vertical?: boolean }) {
  return (
    <View style={[styles.container, vertical && styles.vertical]}>
      {tools.map((tool, index) => (
        <Pressable key={tool} style={[styles.tool, index === 0 && styles.active]}>
          <AppText variant="caption" style={index === 0 && styles.activeText}>
            {tool}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  vertical: { flexDirection: 'column', width: 132 },
  tool: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  active: { borderColor: colors.primary, backgroundColor: colors.surfaceRaised },
  activeText: { color: colors.primary, fontWeight: '800' },
});
