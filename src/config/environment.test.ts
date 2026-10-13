import { createEnvironment, validateEnvironment } from '@/config/environment';

describe('environment configuration', () => {
  it('creates strongly typed preview configuration', () => {
    const config = createEnvironment({
      EXPO_PUBLIC_APP_ENV: 'preview',
      EXPO_PUBLIC_API_URL: 'https://example.com',
    });
    expect(config).toMatchObject({ name: 'preview', isPreview: true, enableDebugTools: true });
    expect(() => validateEnvironment(config)).not.toThrow();
  });

  it('allows an offline configuration without an API URL', () => {
    expect(() =>
      validateEnvironment(createEnvironment({ EXPO_PUBLIC_APP_ENV: 'development' })),
    ).not.toThrow();
  });

  it('rejects a malformed configured API URL', () => {
    expect(() =>
      validateEnvironment(
        createEnvironment({
          EXPO_PUBLIC_APP_ENV: 'development',
          EXPO_PUBLIC_API_URL: 'not-a-url',
        }),
      ),
    ).toThrow('EXPO_PUBLIC_API_URL must be a valid URL');
  });
});
