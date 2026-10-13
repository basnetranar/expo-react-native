import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SOCIAL_ART } from '@/features/simulation/utils/simulation-assets';
import type { SocialActivityViewModel } from '@/features/social/types';
import { colors, radius, spacing } from '@/theme';

export function SocialActivityList({
  events,
  onPerson,
  illustrated = false,
}: {
  events: readonly SocialActivityViewModel[];
  onPerson?(id: string): void;
  illustrated?: boolean;
}) {
  if (!events.length)
    return (
      <AppCard>
        <AppText variant="heading">No recorded social activity</AppText>
        <AppText color="secondary">
          Encounters, cooperation, sharing, grooming, and group changes will appear here when they
          occur in the simulation.
        </AppText>
      </AppCard>
    );
  return (
    <View style={styles.list}>
      {events.map((event) => (
        <AppCard key={event.id} style={styles.card}>
          {illustrated && artFor(event.type) ? (
            <Image source={artFor(event.type)} style={styles.art} contentFit="cover" />
          ) : null}
          <View style={styles.copy}>
            <AppText variant="label" style={styles.title}>
              {event.title}
            </AppText>
            <AppText variant="caption">
              Gen {event.generation} · Tick {event.tick}
            </AppText>
            <AppText color="secondary">{event.detail}</AppText>
            {onPerson ? (
              <View style={styles.people}>
                {event.participantIds.map((id, index) => (
                  <Pressable key={id} onPress={() => onPerson(id)} accessibilityRole="button">
                    <AppText variant="caption" style={styles.link}>
                      {event.participantNames[index]}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </AppCard>
      ))}
    </View>
  );
}

function artFor(type: SocialActivityViewModel['type']): number | null {
  if (type === 'cooperativeForaging') return SOCIAL_ART.foraging;
  if (type === 'foodShared') return SOCIAL_ART.sharing;
  if (type === 'socialGrooming') return SOCIAL_ART.grooming;
  return null;
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center' },
  art: { width: 82, height: 72, borderRadius: radius.md, backgroundColor: colors.surfaceStrong },
  copy: { flex: 1, gap: 3 },
  title: { color: colors.accentDiscovery },
  people: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  link: { color: colors.accentScience, textDecorationLine: 'underline' },
});
