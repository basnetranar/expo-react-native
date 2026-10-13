import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { LineChartPlot } from '@/features/evolution/components/line-chart-plot';
import type { CulturalTrendPoint, TraitTrendPoint } from '@/features/evolution/types';

export function TrendCard({
  title,
  description,
  points,
  percent,
}: {
  title: string;
  description: string;
  points: readonly TraitTrendPoint[] | readonly CulturalTrendPoint[];
  percent?: boolean;
}) {
  const values = points.map((point) => ('prevalence' in point ? point.prevalence : point.value));
  return (
    <AppCard>
      <AppText variant="heading">{title}</AppText>
      <AppText color="secondary">{description}</AppText>
      {points.length ? (
        <LineChartPlot
          points={points.map((point, index) => ({
            generation: point.generation,
            value: values[index]!,
          }))}
          maximum={percent ? 1 : 100}
          formatValue={(value) =>
            percent ? `${Math.round(value * 100)}%` : String(Math.round(value))
          }
        />
      ) : (
        <AppText color="secondary">No completed generation measurements are available.</AppText>
      )}
    </AppCard>
  );
}
