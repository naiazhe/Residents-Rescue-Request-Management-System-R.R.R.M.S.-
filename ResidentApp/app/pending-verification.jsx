import React, { useEffect, useRef } from 'react';
import {
  View, Text, Image, ImageBackground, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

import styles from '../styles/pending-verification';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';

import { getAccountStatus } from '../services/api';
import { getSession, setSession, clearSession } from '../services/session';

const POLL_INTERVAL = 10000; // check every 10 seconds

const PendingVerification = () => {
  const router = useRouter();
  const pollRef = useRef(null);

  useEffect(() => {
    const session = getSession();
    if (!session?.accountId) {
      router.replace('/');
      return;
    }

    const checkStatus = async () => {
      try {
        const account = await getAccountStatus(session.accountId);
        if (account.is_verified) {
          clearInterval(pollRef.current);
          setSession({ isVerified: true });
          Alert.alert(
            'Account Verified!',
            'You are now a verified resident!',
            [{ text: 'Continue', onPress: () => router.replace('/home') }]
          );
        }
      } catch (err) {
        if (err.message === 'Record not found') {
          clearInterval(pollRef.current);
          Alert.alert(
            'Registration Not Approved',
            "We weren't able to find a match to your details. Please try again.",
            [{ text: 'OK', onPress: () => { clearSession(); router.replace('/'); } }]
          );
        }
        // Network/other errors — keep polling silently
      }
    };

    checkStatus();
    pollRef.current = setInterval(checkStatus, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, []);

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <View style={styles.container}>
        <Image source={Logo} style={styles.logoImg} />
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#3FA9F5" style={styles.spinner} />
          <Text style={styles.title}>Account Under Review</Text>
          <Text style={styles.message}>
            Your Account is under verification process. We will notify you once your account is verified.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default PendingVerification;
