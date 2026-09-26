import { env } from '@/config/environment';

export const featureFlags = {
  diagnostics: env.enableDebugTools,
  debugMenu: env.enableDebugTools,
  experimentalFeatures: false,
} as const;
