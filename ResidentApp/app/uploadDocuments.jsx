import React, { useState } from 'react';
import {
  TouchableOpacity, Text, View, Image, ImageBackground,
  Alert, Modal, StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import styles from '../styles/uploadDocuments';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';
import backIcon from '../assets/icons/back.png';

const UploadDocuments = () => {
  const router = useRouter();
  const { signupData } = useLocalSearchParams();
  const [documentUri, setDocumentUri] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setDocumentUri(result.assets[0].uri);
  };

  const handleNext = () => {
    if (!documentUri) {
      Alert.alert('Missing Document', 'Please upload a valid Proof of Residency before proceeding.');
      return;
    }
    setShowPrompt(true);
  };

  const handleSkip = () => {
    setShowPrompt(false);
    router.push({ pathname: '/register', params: { signupData } });
  };

  const handleAddMember = () => {
    setShowPrompt(false);
    router.push({ pathname: '/householdMember', params: { signupData } });
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Image source={backIcon} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Image source={Logo} style={styles.logoImg} />
        <Text style={styles.title}>Proof of Residency</Text>
        <Text style={styles.subTitle}>
          Please upload a clear photo of your Valid ID, Billing Statement, or Barangay Certificate.
        </Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
          {documentUri ? (
            <Image source={{ uri: documentUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.uploadIcon}>+</Text>
              <Text style={styles.uploadText}>Tap to Upload Document</Text>
            </View>
          )}
        </TouchableOpacity>

        {documentUri && (
          <TouchableOpacity onPress={() => setDocumentUri(null)}>
            <Text style={styles.reselectText}>Remove / Reselect</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* ── Household Members Prompt Modal ── */}
      <Modal visible={showPrompt} transparent animationType="fade" onRequestClose={() => setShowPrompt(false)}>
        <View style={promptStyles.overlay}>
          <View style={promptStyles.card}>
            <Image source={Logo} style={promptStyles.logo} />
            <Text style={promptStyles.title}>Household Members</Text>
            <Text style={promptStyles.question}>Do you want to add a Household Member now?</Text>
            <Text style={promptStyles.hint}>
              You can also add members later from your profile. Each member can register their own
              account using the Member Code generated for them.
            </Text>
            <View style={promptStyles.btnRow}>
              <TouchableOpacity style={promptStyles.noBtn} onPress={handleSkip}>
                <Text style={promptStyles.noBtnText}>No, Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={promptStyles.yesBtn} onPress={handleAddMember}>
                <Text style={promptStyles.yesBtnText}>Yes, Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const promptStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: { resizeMode: 'contain', width: 100, height: 65, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 12 },
  question: { fontSize: 15, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 8 },
  hint: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 20 },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  noBtn: {
    flex: 1, height: 45, backgroundColor: '#ccc',
    justifyContent: 'center', alignItems: 'center', borderRadius: 8,
  },
  yesBtn: {
    flex: 1, height: 45, backgroundColor: '#3FA9F5',
    justifyContent: 'center', alignItems: 'center', borderRadius: 8,
  },
  noBtnText: { color: '#333', fontWeight: 'bold' },
  yesBtnText: { color: 'white', fontWeight: 'bold' },
});

export default UploadDocuments;
