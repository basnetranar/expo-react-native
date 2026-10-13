export const helpTopics = {
  generation: {
    title: 'Generation',
    body: 'A generation groups changes recorded as the population survives, reproduces, and passes inherited traits forward.',
  },
  population: {
    title: 'Population',
    body: 'The number of living inhabitants in the current simulation state. Births and deaths can change it over time.',
  },
  inheritedTraits: {
    title: 'Inherited Traits',
    body: 'Traits are passed from parents to offspring with variation. Environmental conditions can influence which traits become more common over generations; individuals do not rewrite inherited traits during life.',
  },
  learnedBehaviours: {
    title: 'Learned Behaviours',
    body: 'Knowledge acquired during an individual life through experience or observation. It is distinct from inherited genetic potential.',
  },
  culturalTransmission: {
    title: 'Cultural Transmission',
    body: 'Some behaviours can spread when inhabitants observe one another. Whether that happens depends on the simulation state; it is not guaranteed.',
  },
  environmentalPressure: {
    title: 'Environmental Pressure',
    body: 'Food, water, predators, and climate affect survival conditions. You change the environment, not an inhabitant’s genes or decisions directly.',
  },
  mutation: {
    title: 'Mutation',
    body: 'Small inherited variations can occur during reproduction. A mutation does not guarantee an advantage.',
  },
  naturalSelection: {
    title: 'Natural Selection',
    body: 'Inherited differences can become more or less common when they affect survival and reproduction under particular conditions.',
  },
  checkpoints: {
    title: 'Checkpoints',
    body: 'A checkpoint preserves a deterministic simulation state so it can be revisited or used as the start of another history.',
  },
  branches: {
    title: 'Evolutionary Branches',
    body: 'A branch continues from a checkpoint with its own future state. Comparing branches shows recorded outcomes, not predetermined ones.',
  },
} as const;

export type HelpTopicId = keyof typeof helpTopics;
