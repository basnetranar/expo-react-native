import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { PlanningCanvas } from '@/features/planning/components/planning-canvas';
import { PlanningNavigation } from '@/features/planning/components/planning-navigation';
import { ToolPalette } from '@/features/planning/components/tool-palette';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function PlanningScreen({ missionId }: { missionId: string }) {
  const { isTablet } = useResponsiveLayout();
  return (
    <AppScreen scroll edges={['top', 'bottom']}>
      <PlanningNavigation missionId={missionId} active="Planning" />
      <View style={[styles.workspace, isTablet && styles.tabletWorkspace]}>
        <ToolPalette vertical={isTablet} />
        <View style={styles.canvasColumn}>
          <PlanningCanvas />
          <View style={styles.filters}>
            {['Guards', 'Cameras', 'Vision Cones', 'Routes', 'Grid'].map((item) => (
              <View key={item} style={styles.filter}>
                <AppText variant="caption">{item}</AppText>
              </View>
            ))}
          </View>
        </View>
        {isTablet ? (
          <View style={styles.intel}>
            <AppText variant="label">Live Intel</AppText>
            <AppText color="secondary">Route duration: 40s</AppText>
            <AppText color="secondary">Detection risk: Moderate</AppText>
          </View>
        ) : null}
      </View>
      <AppButton label="Execute Plan" onPress={() => router.push(routes.execution(missionId))} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  workspace: { gap: spacing.md },
  tabletWorkspace: { flexDirection: 'row', alignItems: 'stretch' },
  canvasColumn: { flex: 1, gap: spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filter: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
  },
  intel: {
    width: 190,
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
