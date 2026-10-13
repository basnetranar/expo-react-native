export type AppEnvironment = 'development' | 'preview' | 'production';

export interface EnvironmentConfig {
  name: AppEnvironment;
  apiUrl: string;
  enableDebugTools: boolean;
  isDevelopment: boolean;
  isPreview: boolean;
  isProduction: boolean;
}

const names: readonly AppEnvironment[] = ['development', 'preview', 'production'];

export function getEnvironmentName(value?: string): AppEnvironment {
  return names.includes(value as AppEnvironment) ? (value as AppEnvironment) : 'development';
}

export function createEnvironment(source: Record<string, string | undefined>): EnvironmentConfig {
  const name = getEnvironmentName(source.EXPO_PUBLIC_APP_ENV);
  return {
    name,
    apiUrl: source.EXPO_PUBLIC_API_URL?.trim() ?? '',
    enableDebugTools: name !== 'production',
    isDevelopment: name === 'development',
    isPreview: name === 'preview',
    isProduction: name === 'production',
  };
}

export function validateEnvironment(config: EnvironmentConfig): void {
  if (config.apiUrl) {
    try {
      new URL(config.apiUrl);
    } catch {
      throw new Error('EXPO_PUBLIC_API_URL must be a valid URL.');
    }
  }
}

// Expo statically replaces direct EXPO_PUBLIC_* references in application bundles.
export const env = createEnvironment({
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});
