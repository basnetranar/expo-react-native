import { AppText } from '@/components/common/AppText';
import { LineChartPlot } from '@/features/evolution/components/line-chart-plot';
import type { GenerationChartPoint, TimelineMetric } from '@/features/evolution/types';

export function TimelineChart({
  points,
  metric,
  selectedGeneration,
  onSelect,
}: {
  points: readonly GenerationChartPoint[];
  metric: TimelineMetric;
  selectedGeneration: number | null;
  onSelect(generation: number): void;
}) {
  if (!points.length)
    return <AppText color="secondary">No completed generations are available to plot.</AppText>;

  return (
    <LineChartPlot
      points={points.map((point) => ({
        generation: point.generation,
        value: point[metric],
        critical: point.extinct,
      }))}
      selectedGeneration={selectedGeneration}
      onSelect={onSelect}
    />
  );
}
