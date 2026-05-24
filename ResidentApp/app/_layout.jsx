// app/_layout.jsx
//
// Root layout for residentApp. Wraps the Expo Router Stack and mounts
// <SafetyConfirmGate /> at the root so the Phase-2 verification popup can
// overlay any screen the resident happens to be on.

import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';

import SafetyConfirmGate from '../components/SafetyConfirmGate';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <SafetyConfirmGate />
    </View>
  );
}
