import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { TraitBar } from '@/components/common/TraitBar';
import { createHomininInspectorViewModel } from '@/features/hominin/utils/hominin-presentation';
import type { FamilyTreeViewModel } from '@/features/lineage/types';
import { HOMININ_ASSETS } from '@/features/simulation/utils/simulation-assets';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function LineageDetailPanel({ family, onSelect }: Props) {
  const person = family.selected;
  const inspector = person.inspector
    ? createHomininInspectorViewModel(
        person.inspector,
        (id) => family.people.get(id)?.inspector ?? null,
      )
    : null;
  const stage = person.inspector?.phenotype.lifeStage ?? 'adult';
  const variants = HOMININ_ASSETS[stage];
  return (
    <View style={styles.panel}>
      <View style={styles.identity}>
        <Image
          source={variants[person.portraitVariant % variants.length]!}
          contentFit="cover"
          style={styles.portrait}
        />
        <View style={styles.identityCopy}>
          <AppText variant="heading">{person.name}</AppText>
          <AppText color="secondary">
            Generation {person.record.birthGeneration} · {person.alive ? 'Living' : 'Deceased'}
          </AppText>
          <AppText variant="caption" color="secondary" numberOfLines={1}>
            {person.record.id}
          </AppText>
          {inspector ? <AppText style={styles.behaviour}>{inspector.behaviour}</AppText> : null}
        </View>
      </View>
      <AppCard>
        <AppText variant="label">Family connections</AppText>
        <Relation label="Parents" count={family.statistics.recordedParents} />
        <Relation label="Full siblings" count={family.statistics.fullSiblings} />
        <Relation label="Half siblings" count={family.statistics.halfSiblings} />
        <Relation label="Children" count={family.statistics.children} />
        <Relation label="Grandchildren" count={family.statistics.grandchildren} />
      </AppCard>
      <AppCard>
        <AppText variant="label">Inherited traits</AppText>
        {inspector ? (
          inspector.traits
            .slice(0, 4)
            .map((trait) => <TraitBar key={trait.key} label={trait.label} value={trait.value} />)
        ) : (
          <AppText color="secondary">Final inspector detail is unavailable.</AppText>
        )}
      </AppCard>
      <AppCard>
        <AppText variant="label">Learned behaviours</AppText>
        {inspector?.learnedBehaviours.length ? (
          inspector.learnedBehaviours.map((item) => (
            <AppText key={item.key} color="secondary">
              {item.label} · learned tick {item.learnedAtTick}
            </AppText>
          ))
        ) : (
          <AppText color="secondary">No learned behaviours are recorded.</AppText>
        )}
      </AppCard>
      <AppCard>
        <AppText variant="label">Recent life events</AppText>
        {inspector?.history.length ? (
          inspector.history
            .slice(-3)
            .reverse()
            .map((item) => (
              <Pressable key={item.key} style={styles.event}>
                <AppText variant="caption" style={styles.tick}>
                  Tick {item.tick}
                </AppText>
                <AppText color="secondary">{item.title}</AppText>
              </Pressable>
            ))
        ) : (
          <AppText color="secondary">No recorded life-history events.</AppText>
        )}
      </AppCard>
      <AppButton
        label="View Full Inspector"
        onPress={() => router.push(routes.hominin(person.record.id))}
      />
      <AppButton
        label="Focus nearest relative"
        variant="secondary"
        disabled={!family.lineage.parents[0] && !family.lineage.children[0]}
        onPress={() => onSelect((family.lineage.parents[0] ?? family.lineage.children[0])!.id)}
      />
    </View>
  );
}

function Relation({ label, count }: { label: string; count: number }) {
  return (
    <View style={styles.relation}>
      <AppText color="secondary">{label}</AppText>
      <AppText variant="label">{count}</AppText>
    </View>
  );
}

interface Props {
  family: FamilyTreeViewModel;
  onSelect(id: string): void;
}

const styles = StyleSheet.create({
  panel: { gap: spacing.sm },
  identity: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  portrait: { width: 104, height: 124, borderRadius: radius.md, backgroundColor: colors.surface },
  identityCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  behaviour: { color: colors.accentScience },
  relation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  event: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  tick: { minWidth: 62, color: colors.accentDiscovery },
});
