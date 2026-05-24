// components/SafetyConfirmGate.jsx
//
// App-wide gate for Phase 2 of the Mission Completion & Safety Verification
// feature (see prompt/026_residentResponder_comletion_feedback.md).
//
// Mounted once at the root layout. Listens for push notifications
// (type: 'verify-safe') and polls /sos/resident/:id every 30s as a fallback.
// When a PendingCompletion SOS is detected, renders a full-screen modal that
// blocks the entire app until the resident taps "I am Safe ✓".
//
// This component is the SOLE owner of safe-confirmation state.
// Do not duplicate this logic in screen-level files.

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import * as Notifications from 'expo-notifications';

import { getSOSHistory, confirmSos } from '../services/api';
import { getSession } from '../services/session';

const POLL_INTERVAL_MS = 30_000;

const SafetyConfirmGate = () => {
  const [pendingSosId, setPendingSosId] = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const pollTimerRef = useRef(null);

  const checkPending = useCallback(async () => {
    const session = getSession();
    if (!session?.residentId) return;
    try {
      const history = await getSOSHistory(session.residentId);
      const pending = history.find(s => s.status === 'PendingCompletion');
      setPendingSosId(pending ? String(pending.sos_id) : null);
    } catch { /* network blips are fine — next poll will retry */ }
  }, []);

  // ── Polling fallback (push is primary) ─────────────────────────────────────
  useEffect(() => {
    checkPending();
    pollTimerRef.current = setInterval(checkPending, POLL_INTERVAL_MS);
    return () => clearInterval(pollTimerRef.current);
  }, [checkPending]);

  // ── Push listeners: refetch immediately on verify-safe notifications ───────
  useEffect(() => {
    const handlePush = (notification) => {
      const type = notification?.request?.content?.data?.type;
      if (type === 'verify-safe') checkPending();
    };

    const receivedSub = Notifications.addNotificationReceivedListener(handlePush);
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => handlePush(response?.notification)
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [checkPending]);

  const handleConfirmSafe = async () => {
    if (!pendingSosId || submitting) return;
    setSubmitting(true);
    try {
      await confirmSos(pendingSosId);
      setPendingSosId(null);
      Alert.alert('Thank You', 'You have been marked as safe. Stay well!');
    } catch {
      Alert.alert('Error', 'Could not confirm. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={!!pendingSosId}
      transparent
      animationType="fade"
      // Hardware back button must not dismiss — resident MUST confirm
      onRequestClose={() => {}}
    >
      <View style={overlay}>
        <View style={card}>
          <View style={iconCircle}>
            <Text style={iconText}>✓</Text>
          </View>
          <Text style={title}>Your rescue is complete!</Text>
          <Text style={subtitle}>
            Please confirm you are safe so we can close this rescue and notify your barangay.
          </Text>
          <TouchableOpacity
            onPress={handleConfirmSafe}
            disabled={submitting}
            style={[confirmBtn, submitting && { opacity: 0.7 }]}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={confirmText}>I am Safe ✓</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Inline styles — this component owns one screen and won't share styling.
const overlay = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.85)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
};
const card = {
  width: '100%',
  backgroundColor: 'white',
  borderRadius: 20,
  paddingVertical: 32,
  paddingHorizontal: 24,
  alignItems: 'center',
  elevation: 20,
};
const iconCircle = {
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: '#E8F5E9',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
};
const iconText = { fontSize: 36, color: '#2E7D32', fontWeight: 'bold' };
const title = { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' };
const subtitle = { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 24, lineHeight: 20 };
const confirmBtn = {
  backgroundColor: '#2E7D32',
  borderRadius: 30,
  paddingVertical: 16,
  paddingHorizontal: 48,
  minWidth: 200,
  alignItems: 'center',
};
const confirmText = { color: '#fff', fontSize: 18, fontWeight: 'bold' };

export default SafetyConfirmGate;
