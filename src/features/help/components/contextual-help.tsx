import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { helpTopics, type HelpTopicId } from '@/features/help/data/help-topics';
import { colors, radius, sizing, spacing } from '@/theme';

export function ContextualHelp({ topic, label }: { topic: HelpTopicId; label?: string }) {
  const [visible, setVisible] = useState(false);
  const content = helpTopics[topic];
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Learn about ${content.title}`}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <AppText variant="label" style={styles.triggerText}>
          {label ?? '?'}
        </AppText>
      </Pressable>
      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <View accessibilityViewIsModal style={styles.sheet}>
            <ScrollView contentContainerStyle={styles.content}>
              <AppText variant="heading">{content.title}</AppText>
              <AppText color="secondary">{content.body}</AppText>
              <AppButton label="Close" onPress={() => setVisible(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minWidth: sizing.minimumTouchTarget,
    minHeight: sizing.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.accentScience,
  },
  triggerText: { color: colors.accentScience },
  pressed: { opacity: 0.65 },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  sheet: {
    maxHeight: '70%',
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: { gap: spacing.md, padding: spacing.lg },
});
