import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { HomininInspectorViewModel, InspectorRelatedPerson } from '@/features/hominin/types';
import { colors, radius, spacing } from '@/theme';

export function InspectorRelationshipsCard({
  individual,
  onOpen,
  onOpenExplorer,
  onOpenGroup,
}: {
  individual: HomininInspectorViewModel;
  onOpen(id: string): void;
  onOpenExplorer?(): void;
  onOpenGroup?(id: string): void;
}) {
  return (
    <AppCard>
      <AppText variant="heading">Family and social connections</AppText>
      <View style={styles.summary}>
        <AppText color="secondary">
          {individual.groupId ? `Current group: ${individual.groupId}` : 'No current group'} ·
          Carried food {individual.carriedFood.toFixed(1)}
        </AppText>
        {individual.groupId && onOpenGroup ? (
          <Pressable onPress={() => onOpenGroup(individual.groupId!)}>
            <AppText variant="label" style={styles.action}>
              Open group ›
            </AppText>
          </Pressable>
        ) : null}
        {onOpenExplorer ? (
          <Pressable onPress={onOpenExplorer}>
            <AppText variant="label" style={styles.action}>
              Explore relationship network ›
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <RelationGroup label="Parents" people={individual.parents} onOpen={onOpen} />
      <RelationGroup label="Children" people={individual.children} onOpen={onOpen} />
      <AppText variant="label">Recorded social connections</AppText>
      {individual.socialConnections.length ? (
        individual.socialConnections.map((connection) => (
          <RelatedRow key={connection.id} person={connection} onOpen={onOpen}>
            <AppText variant="caption">
              Familiarity {Math.round(connection.familiarity)} · Trust{' '}
              {Math.round(connection.trust)}
              {' · '}Affinity {Math.round(connection.affinity)}
              {connection.kinship > 0 ? ` · Kinship ${Math.round(connection.kinship * 100)}%` : ''}
            </AppText>
            <AppText variant="caption">
              Observed successes {connection.observedSuccess} · Helpful follows{' '}
              {connection.followBenefits}
            </AppText>
            <AppText variant="caption">
              Interactions {connection.interactionCount} · Cooperation {connection.cooperationCount}{' '}
              · Sharing {connection.sharingCount} · Grooming {connection.groomingCount}
            </AppText>
          </RelatedRow>
        ))
      ) : (
        <Empty text="No social connections are currently recorded." />
      )}
    </AppCard>
  );
}

function RelationGroup({
  label,
  people,
  onOpen,
}: {
  label: string;
  people: readonly InspectorRelatedPerson[];
  onOpen(id: string): void;
}) {
  return (
    <View style={styles.group}>
      <AppText variant="label">{label}</AppText>
      {people.length ? (
        people.map((person) => <RelatedRow key={person.id} person={person} onOpen={onOpen} />)
      ) : (
        <Empty text={`No ${label.toLowerCase()} are recorded.`} />
      )}
    </View>
  );
}

function RelatedRow({
  person,
  onOpen,
  children,
}: React.PropsWithChildren<{
  person: InspectorRelatedPerson;
  onOpen(id: string): void;
}>) {
  return (
    <Pressable
      accessibilityRole={person.available ? 'button' : undefined}
      accessibilityLabel={person.available ? `Inspect ${person.name}` : undefined}
      disabled={!person.available}
      onPress={() => onOpen(person.id)}
      style={({ pressed }) => [
        styles.related,
        !person.available && styles.unavailable,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.relatedCopy}>
        <AppText variant="label">{person.name}</AppText>
        <AppText variant="caption" selectable>
          {person.id} · {person.detail}
        </AppText>
        {children}
      </View>
      {person.available ? (
        <AppText variant="heading" style={styles.chevron}>
          ›
        </AppText>
      ) : null}
    </Pressable>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <AppText variant="caption">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  related: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
  },
  relatedCopy: { flex: 1, gap: 2 },
  chevron: { color: colors.accentScience },
  unavailable: { opacity: 0.6 },
  pressed: { opacity: 0.7 },
  empty: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
  },
  summary: { gap: spacing.xs },
  action: { color: colors.accentScience },
});
