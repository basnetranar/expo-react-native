import type { ConfigContext, ExpoConfig } from 'expo/config';

import appConfig from './src/config/app-values.json';

const suffixes = {
  development: { name: ' Dev', id: '.dev' },
  preview: { name: ' Preview', id: '.preview' },
  production: { name: '', id: '' },
} as const;

export default ({ config }: ConfigContext): ExpoConfig => {
  const requestedEnvironment = process.env.EXPO_PUBLIC_APP_ENV;
  const environment: keyof typeof suffixes =
    requestedEnvironment === 'preview' || requestedEnvironment === 'production'
      ? requestedEnvironment
      : 'development';
  const suffix = suffixes[environment];
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim() || appConfig.easProjectId;

  return {
    ...config,
    name: `${appConfig.name}${suffix.name}`,
    slug: appConfig.slug,
    version: appConfig.version,
    scheme: appConfig.scheme,
    orientation: 'default',
    userInterfaceStyle: 'dark',
    icon: './assets/branding/icon.png',
    ios: {
      supportsTablet: true,
      bundleIdentifier: `${appConfig.iosBundleIdentifier}${suffix.id}`,
      icon: './assets/branding/icon.png',
      config: { usesNonExemptEncryption: false },
    },
    android: {
      package: `${appConfig.androidPackage}${suffix.id}`,
      blockedPermissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
      ],
      adaptiveIcon: {
        backgroundColor: '#07131F',
        foregroundImage: './assets/branding/adaptive-icon-foreground.png',
      },
    },
    web: { output: 'static', favicon: './assets/branding/icon.png' },
    plugins: [
      'expo-router',
      'expo-updates',
      ['expo-status-bar', { hidden: false, style: 'light' }],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#07131F',
          image: './assets/branding/splash.png',
          imageWidth: 320,
        },
      ],
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    updates: { url: `https://u.expo.dev/${projectId}` },
    runtimeVersion: { policy: 'appVersion' },
    extra: {
      environment,
      ...(projectId ? { eas: { projectId } } : {}),
    },
  };
};
