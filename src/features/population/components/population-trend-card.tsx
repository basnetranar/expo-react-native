import { useState } from 'react';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SegmentControl } from '@/components/common/SegmentControl';
import { LineChartPlot } from '@/features/evolution/components/line-chart-plot';
import type { PopulationTrendPoint } from '@/features/population/types';

const metrics = ['population', 'births', 'deaths'] as const;

export function PopulationTrendCard({ trend }: { trend: readonly PopulationTrendPoint[] }) {
  const [metric, setMetric] = useState<(typeof metrics)[number]>('population');
  return (
    <AppCard>
      <AppText variant="heading">Population trend</AppText>
      <SegmentControl<(typeof metrics)[number]>
        label="Population trend metric"
        options={metrics}
        value={metric}
        onChange={setMetric}
      />
      {trend.length ? (
        <LineChartPlot
          points={trend.map((point) => ({ generation: point.generation, value: point[metric] }))}
        />
      ) : (
        <AppText color="secondary">Complete a generation to begin recording trends.</AppText>
      )}
    </AppCard>
  );
}
