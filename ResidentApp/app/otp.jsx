import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, ImageBackground, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import styles from '../styles/otp';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';
import backIcon from '../assets/icons/back.png';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

const OtpVerification = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next box
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert('Incomplete', 'Please enter the complete 6-digit OTP.');
      return;
    }
    // OTP accepted — account now awaits BDRRMC approval
    router.replace('/pending-verification');
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(RESEND_COUNTDOWN);
    setCanResend(false);
    inputs.current[0]?.focus();
    Alert.alert('OTP Sent', 'A new OTP has been sent to your registered mobile number.');
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Image source={backIcon} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Image source={Logo} style={styles.logoImg} />

          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to your registered{'\n'}mobile number. Please enter it below.
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputs.current[index] = ref)}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                value={digit}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                returnKeyType="next"
                textAlign="center"
              />
            ))}
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendCountdown}>Resend in {countdown}s</Text>
            )}
          </View>

          <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
            <Text style={styles.verifyText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default OtpVerification;
