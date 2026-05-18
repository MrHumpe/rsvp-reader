// src/utils/onboarding.ts
// Tracks whether the user has completed the first-launch onboarding flow.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@rsvp_onboarding_v1';

export async function isOnboardingDone(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'done';
  } catch {
    return false;
  }
}

export async function markOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, 'done');
  } catch {}
}
