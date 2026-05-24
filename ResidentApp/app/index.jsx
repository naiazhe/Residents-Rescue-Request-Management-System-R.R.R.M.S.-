import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  TextInput,
  View,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

import * as Notifications from 'expo-notifications';

import styles from '../styles/index';
import Logo from '../assets/img/LOGO.png';
import bg from '../assets/img/LANDING.jpg';
import userIcon from '../assets/icons/user-outline.png';
import passIcon from '../assets/icons/password-outline.png';

import { loginUser, savePushToken } from '../services/api';
import { setSession } from '../services/session';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerPushToken(accountId) {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await savePushToken(accountId, token);
  } catch { /* silent */ }
}

const ROLES = [
  { value: 'Household Head',   sublabel: 'Primary account holder of the household' },
  { value: 'Tenant / Renter',  sublabel: 'Renting a property in the barangay' },
  { value: 'Boarder',          sublabel: 'Boarding inside a household' },
  { value: 'Household Member', sublabel: 'Member of an existing household — requires a Member Code' },
];

const RadioButton = ({ label, sublabel, selected, onPress }) => (
  <TouchableOpacity style={styles.roleOption} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.roleRadioOuter, selected && styles.roleRadioOuterSelected]}>
      {selected && <View style={styles.roleRadioInner} />}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.roleLabel}>{label}</Text>
      <Text style={styles.roleSublabel}>{sublabel}</Text>
    </View>
  </TouchableOpacity>
);

const MyInputField = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await loginUser(username.trim(), password);
      setSession(data);
      registerPushToken(data.accountId); // fire-and-forget
      router.replace(data.isVerified ? '/home' : '/pending-verification');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (setter) => (text) => {
    setter(text);
    if (error) setError('');
  };

  const handleRoleContinue = () => {
    if (!selectedRole) {
      Alert.alert('Select a Role', 'Please select your household role to continue.');
      return;
    }
    setRoleModalVisible(false);
    if (selectedRole === 'Household Member') {
      router.push({ pathname: '/memberCode', params: { residentType: selectedRole } });
    } else {
      router.push({ pathname: '/signup', params: { residentType: selectedRole } });
    }
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <Image source={Logo} style={styles.logoImg} />
            <Text style={styles.title}>Login</Text>

            {/* USERNAME */}
            <View style={[styles.inputWrapper, error ? { borderColor: 'red', borderWidth: 1.5 } : null]}>
              <Image source={userIcon} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#888"
                onChangeText={handleInputChange(setUsername)}
                value={username}
                autoCapitalize="none"
              />
            </View>

            {/* PASSWORD */}
            <View style={[styles.inputWrapper, error ? { borderColor: 'red', borderWidth: 1.5 } : null]}>
              <Image source={passIcon} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={!isPasswordVisible}
                onChangeText={handleInputChange(setPassword)}
                value={password}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(v => !v)} style={styles.eyeIcon}>
                <Text style={{ color: '#2F7FB8', fontSize: 13, fontWeight: 'bold' }}>
                  {isPasswordVisible ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={{ color: 'red', marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>
                {error}
              </Text>
            ) : null}

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.register}>
              <Text style={styles.textStyle}>I don't have an account</Text>
              <TouchableOpacity onPress={() => { setSelectedRole(null); setRoleModalVisible(true); }}>
                <Text style={styles.registerBtn}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* HOUSEHOLD ROLE MODAL */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Household Role</Text>
            <Text style={styles.modalSubtitle}>What is your role in the household?</Text>
            <View style={styles.roleList}>
              {ROLES.map((role) => (
                <RadioButton
                  key={role.value}
                  label={role.value}
                  sublabel={role.sublabel}
                  selected={selectedRole === role.value}
                  onPress={() => setSelectedRole(role.value)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.modalContinueBtn} onPress={handleRoleContinue}>
              <Text style={styles.modalContinueText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRoleModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default MyInputField;
