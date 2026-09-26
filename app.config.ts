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
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return {
    ...config,
    name: `${appConfig.name}${suffix.name}`,
    slug: appConfig.slug,
    version: appConfig.version,
    scheme: appConfig.scheme,
    orientation: 'default',
    userInterfaceStyle: 'automatic',
    icon: './assets/images/icon.png',
    ios: {
      supportsTablet: true,
      bundleIdentifier: `${appConfig.iosBundleIdentifier}${suffix.id}`,
      icon: './assets/expo.icon',
    },
    android: {
      package: `${appConfig.androidPackage}${suffix.id}`,
      adaptiveIcon: {
        backgroundColor: '#F2F2F7',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
    },
    web: { output: 'static', favicon: './assets/images/favicon.png' },
    plugins: [
      'expo-router',
      'expo-updates',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#F2F2F7',
          image: './assets/images/splash-icon.png',
          imageWidth: 96,
        },
      ],
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    runtimeVersion: { policy: 'appVersion' },
    extra: {
      environment,
      ...(projectId ? { eas: { projectId } } : {}),
    },
  };
};
