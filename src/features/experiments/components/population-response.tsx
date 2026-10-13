import { useState } from 'react';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SegmentControl } from '@/components/common/SegmentControl';
import { LineChartPlot } from '@/features/evolution/components/line-chart-plot';
import type { ExperimentsViewModel } from '@/features/experiments/types';

const metrics = ['population', 'births', 'deaths', 'predatorDeaths'] as const;

export function PopulationResponse({ experiments }: { experiments: ExperimentsViewModel }) {
  const [metric, setMetric] = useState<(typeof metrics)[number]>('population');
  const observed = experiments.firstObservedGeneration;
  return (
    <AppCard>
      <AppText variant="heading">Population response</AppText>
      <AppText color="secondary">
        Actual completed-generation observations only. Timing overlap does not establish causation.
      </AppText>
      <SegmentControl<(typeof metrics)[number]>
        label="Observed population metric"
        options={metrics}
        value={metric}
        onChange={setMetric}
        getLabel={(value) =>
          value === 'predatorDeaths'
            ? 'Predator deaths'
            : `${value[0]!.toUpperCase()}${value.slice(1)}`
        }
      />
      {experiments.trend.length ? (
        <>
          <LineChartPlot
            points={experiments.trend.map((point) => ({
              generation: point.generation,
              value: point[metric],
              critical: observed !== null && point.generation === observed,
            }))}
          />
          <AppText variant="caption" color="secondary">
            {observed === null
              ? 'Apply an intervention to establish an observation marker.'
              : `First intervention became active during generation ${observed}. Later points are observed after intervention.`}
          </AppText>
        </>
      ) : (
        <AppText color="secondary">
          Complete a generation to begin recording actual responses.
        </AppText>
      )}
    </AppCard>
  );
}

export function ResourceObservation({ experiments }: { experiments: ExperimentsViewModel }) {
  const summary = experiments.latestSummary;
  return (
    <AppCard>
      <AppText variant="heading">Resource pressure</AppText>
      {summary ? (
        <>
          <Metric label="Food per agent" value={summary.resources.foodPerAgent.toFixed(1)} />
          <Metric label="Water per agent" value={summary.resources.waterPerAgent.toFixed(1)} />
          <Metric label="Resource balance" value={summary.resources.balance} />
          <Metric label="Predator deaths" value={String(summary.deathCauses.predation)} />
          <AppText variant="caption" color="secondary">
            Observed in completed generation {summary.generation}.
          </AppText>
        </>
      ) : (
        <AppText color="secondary">No completed generation is available yet.</AppText>
      )}
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <AppText color="secondary">
      {label}: <AppText variant="label">{value}</AppText>
    </AppText>
  );
}
