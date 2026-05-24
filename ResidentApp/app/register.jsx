import React, { useState } from 'react';
import {
  TouchableOpacity, Text, TextInput, View,
  Image, ImageBackground, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import styles from '../styles/register';
import Logo from '../assets/img/LOGO.png';
import bg from '../assets/img/LANDING.jpg';
import userIcon from '../assets/icons/user-outline.png';
import passIcon from '../assets/icons/password-outline.png';
import backIcon from '../assets/icons/back.png';

import { registerResident } from '../services/api';
import { setSession } from '../services/session';

const MyInputField = () => {
  const router = useRouter();
  const { signupData } = useLocalSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pickProfilePic = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setProfilePic(result.assets[0].uri);
  };

  const handleRegister = async () => {
    if (!profilePic) {
      Alert.alert('Missing Photo', 'Please upload a profile picture.');
      return;
    }
    if (!username.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    if (username.trim().length > 20) {
      Alert.alert('Username Too Long', 'Username must not exceed 20 characters.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      let parsedSignup = {};
      if (signupData) {
        parsedSignup = JSON.parse(signupData);
      }

      const result = await registerResident({
        ...parsedSignup,
        username: username.trim(),
        password,
      });

      setSession({
        accountId: result.account.account_id,
        residentId: result.residentId,
        username: result.account.username,
        role: result.account.role,
        isVerified: false,
      });

      router.push('/otp');
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Image source={backIcon} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Image source={Logo} style={styles.logoImg}/>
        <Text style={styles.title}>Account Details</Text>

        {/* PROFILE PICTURE */}
        <TouchableOpacity style={styles.profilePicContainer} onPress={pickProfilePic}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Image source={userIcon} style={styles.placeholderIcon} />
              <Text style={styles.uploadPicText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* USERNAME */}
        <View style={styles.inputWrapper}>
          <Image source={userIcon} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            onChangeText={setUsername}
            value={username}
            autoCapitalize="none"
            maxLength={20}
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputWrapper}>
          <Image source={passIcon} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            value={password}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subLabel}>Your password must be at least 8 characters long</Text>

        {/* CONFIRM PASSWORD */}
        <View style={styles.inputWrapper}>
          <Image source={passIcon} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            secureTextEntry={!showConfirmPassword}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleRegister} disabled={isLoading}>
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginText}>Create Account</Text>}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default MyInputField;
