import { StyleSheet, View } from 'react-native';

import { TimelineAction } from '@/features/timeline/components/timeline-action';
import { TimelinePlayhead } from '@/features/timeline/components/timeline-playhead';
import { TimelineTrack } from '@/features/timeline/components/timeline-track';
import { colors, spacing } from '@/theme';
import type { TimelineAction as TimelineActionData } from '@/types/game';

const actions: TimelineActionData[] = [
  ['enter', 0, 'Runner', 'Runner enters'],
  ['cover', 4, 'Runner', 'Move to cover'],
  ['wait', 10, 'Runner', 'Wait for guard'],
  ['cross', 14, 'Runner', 'Cross corridor'],
  ['target', 22, 'Runner', 'Collect target'],
  ['exit', 30, 'Runner', 'Exit'],
].map(([id, atSeconds, actor, label]) => ({
  id: String(id),
  atSeconds: Number(atSeconds),
  actor: String(actor),
  label: String(label),
}));

export function Timeline() {
  return (
    <View style={styles.container}>
      <View>
        {actions.map((action) => (
          <TimelineAction key={action.id} action={action} />
        ))}
      </View>
      <View style={styles.tracks}>
        <TimelinePlayhead />
        <TimelineTrack label="Runner" width="75%" color={colors.route} />
        <TimelineTrack label="Guard Patrol" width="60%" color={colors.guardVision} />
        <TimelineTrack label="Camera Rotation" width="85%" color={colors.cameraVision} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  tracks: { position: 'relative', gap: spacing.md, paddingVertical: spacing.sm },
});
