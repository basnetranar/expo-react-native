import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type {
  CultureStage,
  GenerationSummary,
  Hominin,
  LearnedBehaviourType,
  SimulationEvent,
} from '@/simulation/engine/types';
import { classifyCulture } from '@/simulation/learning/cultureStats';

const learnedTypes: LearnedBehaviourType[] = ['stoneCracking', 'socialForaging'];

export class EventDetector {
  private readonly cultureStages: Record<LearnedBehaviourType, CultureStage> = {
    stoneCracking: 'absent',
    socialForaging: 'absent',
  };
  private extinctionEmitted = false;
  private migrationCooldown = 0;
  private migrationSignalStreak = 0;
  private bottleneckCooldown = 0;

  detect(
    summary: GenerationSummary,
    summaries: readonly GenerationSummary[],
    population: readonly Hominin[],
    tick: number,
    config: SimulationConfig,
  ): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    for (const behaviour of learnedTypes) {
      const count = population.filter(
        (agent) => agent.alive && agent.learnedBehaviours.some((item) => item.type === behaviour),
      ).length;
      const stage = classifyCulture(count, summary.population);
      const previous = this.cultureStages[behaviour];
      if (previous === 'absent' && stage !== 'absent') {
        const innovator = population.find((agent) =>
          agent.learnedBehaviours.some((item) => item.type === behaviour),
        );
        if (innovator)
          events.push({
            id: `first-${behaviour}-${tick}`,
            type: 'firstDiscovery',
            behaviour,
            agentId: innovator.id,
            tick,
            generation: summary.generation,
          });
        if (stage !== 'innovation') {
          events.push({
            id: `culture-${behaviour}-${stage}-${tick}`,
            type: 'culturalThreshold',
            behaviour,
            stage,
            prevalence: summary.behaviourPrevalence[behaviour],
            tick,
            generation: summary.generation,
          });
        }
      } else if (stage === 'absent' && previous !== 'absent') {
        events.push({
          id: `lost-${behaviour}-${tick}`,
          type: 'traditionLost',
          behaviour,
          previousStage: previous,
          tick,
          generation: summary.generation,
        });
      } else if (stage !== previous && stage !== 'absent' && stage !== 'innovation') {
        events.push({
          id: `culture-${behaviour}-${stage}-${tick}`,
          type: 'culturalThreshold',
          behaviour,
          stage,
          prevalence: summary.behaviourPrevalence[behaviour],
          tick,
          generation: summary.generation,
        });
      }
      this.cultureStages[behaviour] = stage;
    }
    const window = summaries.slice(-config.analytics.bottleneckWindow);
    if (this.bottleneckCooldown > 0) this.bottleneckCooldown -= 1;
    if (window.length === config.analytics.bottleneckWindow) {
      const from = window[0]!.population;
      const decline = from > 0 ? (from - summary.population) / from : 0;
      if (decline > config.analytics.bottleneckDecline && this.bottleneckCooldown === 0) {
        events.push({
          id: `bottleneck-${tick}`,
          type: 'populationBottleneck',
          decline,
          fromPopulation: from,
          toPopulation: summary.population,
          tick,
          generation: summary.generation,
        });
        this.bottleneckCooldown = config.analytics.bottleneckWindow;
      }
    }
    if (this.migrationCooldown > 0) this.migrationCooldown -= 1;
    const migrationSignal =
      summary.population >= 10 &&
      summary.migration.meanDisplacement >= config.analytics.migrationMeanDisplacement &&
      summary.migration.changedRegionProportion >= config.analytics.migrationThreshold &&
      summary.migration.centroidShift >= config.analytics.migrationCentroidShift;
    this.migrationSignalStreak = migrationSignal ? this.migrationSignalStreak + 1 : 0;
    if (
      this.migrationSignalStreak >= config.analytics.migrationPersistence &&
      this.migrationCooldown === 0
    ) {
      events.push({
        id: `migration-${tick}`,
        type: 'migrationDetected',
        migrationRate: summary.migration.changedRegionProportion,
        resourcePressure: summary.environment.resourcePressure,
        centroidShift: summary.migration.centroidShift,
        meanDisplacement: summary.migration.meanDisplacement,
        tick,
        generation: summary.generation,
      });
      this.migrationCooldown = 10;
      this.migrationSignalStreak = 0;
    }
    events.push(...this.detectExtinction(summary.population, summary.generation, tick));
    return events;
  }

  detectExtinction(population: number, generation: number, tick: number): SimulationEvent[] {
    if (population !== 0 || this.extinctionEmitted) return [];
    this.extinctionEmitted = true;
    return [{ id: `extinction-${tick}`, type: 'extinction', tick, generation }];
  }

  exportState(): EventDetectorState {
    return {
      cultureStages: { ...this.cultureStages },
      extinctionEmitted: this.extinctionEmitted,
      migrationCooldown: this.migrationCooldown,
      migrationSignalStreak: this.migrationSignalStreak,
      bottleneckCooldown: this.bottleneckCooldown,
    };
  }

  restoreState(state: EventDetectorState): void {
    Object.assign(this.cultureStages, state.cultureStages);
    this.extinctionEmitted = state.extinctionEmitted;
    this.migrationCooldown = state.migrationCooldown;
    this.migrationSignalStreak = state.migrationSignalStreak;
    this.bottleneckCooldown = state.bottleneckCooldown;
  }
}

export interface EventDetectorState {
  cultureStages: Record<LearnedBehaviourType, CultureStage>;
  extinctionEmitted: boolean;
  migrationCooldown: number;
  migrationSignalStreak: number;
  bottleneckCooldown: number;
}
