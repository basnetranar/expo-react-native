import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { OnboardingProgress } from '@/features/onboarding/components/onboarding-progress';
import { onboardingSlides } from '@/features/onboarding/data/onboarding-slides';
import { dismissOnboarding } from '@/features/onboarding/services/onboarding-storage';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function OnboardingScreen() {
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const { isTablet } = useResponsiveLayout();
  const slide = onboardingSlides[index]!;

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index === 0) return false;
      setIndex((value) => value - 1);
      return true;
    });
    return () => subscription.remove();
  }, [index]);

  const finish = async (status: 'completed' | 'skipped') => {
    if (saving) return;
    setSaving(true);
    try {
      await dismissOnboarding(status);
      if (replay === '1' && router.canGoBack()) router.back();
      else router.replace(routes.lab);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen scroll maxWidth="none" edges={['top', 'bottom']} style={styles.screen}>
      <View style={[styles.composition, isTablet && styles.compositionTablet]}>
        <View style={[styles.artFrame, isTablet && styles.artFrameTablet]}>
          <Image
            source={slide.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            accessibilityLabel="Savannah illustration"
            style={styles.art}
          />
          <View style={styles.scrim} />
          {'logo' in slide ? (
            <Image
              source={slide.logo}
              contentFit="contain"
              accessibilityLabel="First Minds logo"
              style={styles.logo}
            />
          ) : null}
          <Image
            source={slide.accent}
            contentFit="contain"
            accessibilityLabel={slide.accentLabel}
            style={styles.accentArt}
          />
        </View>
        <View style={[styles.copy, isTablet && styles.copyTablet]}>
          <AppText variant={isTablet ? 'display' : 'heading'}>{slide.title}</AppText>
          {'subtitle' in slide ? (
            <AppText variant="heading" style={styles.tagline}>
              {slide.subtitle}
            </AppText>
          ) : null}
          <AppText color="secondary">{slide.body}</AppText>
          {slide.highlights.length ? (
            <View style={styles.highlights}>
              {slide.highlights.map((item) => (
                <View key={item} style={styles.highlight}>
                  <View style={styles.marker} />
                  <AppText variant="label">{item}</AppText>
                </View>
              ))}
            </View>
          ) : null}
          <OnboardingProgress current={index} count={onboardingSlides.length} />
          <View style={styles.actions}>
            {index > 0 ? (
              <AppButton label="Back" variant="secondary" onPress={() => setIndex(index - 1)} />
            ) : null}
            <AppButton
              label={index === 0 ? 'Get Started' : index === 3 ? 'Start Exploring' : 'Next'}
              disabled={saving}
              onPress={() =>
                index === onboardingSlides.length - 1
                  ? void finish('completed')
                  : setIndex(index + 1)
              }
              style={styles.primaryAction}
            />
          </View>
          {index < onboardingSlides.length - 1 ? (
            <AppButton
              label="Skip Introduction"
              variant="secondary"
              disabled={saving}
              onPress={() => void finish('skipped')}
            />
          ) : null}
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  composition: { flex: 1, gap: spacing.lg },
  compositionTablet: { minHeight: 620, flexDirection: 'row', alignItems: 'stretch' },
  artFrame: { minHeight: 340, overflow: 'hidden', borderRadius: radius.lg },
  artFrameTablet: { flex: 1.25, minHeight: 600 },
  art: { position: 'absolute', inset: 0 },
  scrim: { position: 'absolute', inset: 0, backgroundColor: 'rgba(3, 12, 21, 0.22)' },
  logo: { width: 190, height: 170, alignSelf: 'center', marginTop: spacing.xl },
  accentArt: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 150,
    height: 130,
  },
  copy: { gap: spacing.md, justifyContent: 'center', paddingHorizontal: spacing.sm },
  copyTablet: { flex: 1, padding: spacing.xl },
  tagline: { color: colors.accentDiscovery },
  highlights: { gap: spacing.sm },
  highlight: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  marker: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentScience },
  actions: { flexDirection: 'row', gap: spacing.sm },
  primaryAction: { flex: 1 },
});
