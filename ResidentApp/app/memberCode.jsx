import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity, Text, TextInput, View,
  Image, ImageBackground, Alert, StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

import roleStyles from '../styles/householdRole';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';
import backIcon from '../assets/icons/back.png';

const MemberCode = () => {
  const router = useRouter();
  const { residentType } = useLocalSearchParams();
  const [tab, setTab] = useState('manual'); // 'manual' | 'scan'
  const [code, setCode] = useState('');
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleVerify = (resolvedCode) => {
    const finalCode = resolvedCode || code;
    if (!finalCode.trim()) {
      Alert.alert('Missing Code', 'Please enter or scan the Member Code provided by your Household Head.');
      return;
    }
    router.push({ pathname: '/signup', params: { isMember: 'true', residentType: residentType || 'Household Member' } });
  };

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    Alert.alert(
      'Code Scanned',
      `Member Code: ${data}\n\nProceed to registration?`,
      [
        { text: 'Rescan', onPress: () => setScanned(false) },
        { text: 'Continue', onPress: () => handleVerify(data) },
      ]
    );
  };

  const handleSwitchToScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera Permission', 'Camera access is required to scan the QR code.');
        return;
      }
    }
    setScanned(false);
    setTab('scan');
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={roleStyles.image}>
      <TouchableOpacity style={roleStyles.backBtn} onPress={() => router.back()}>
        <Image source={backIcon} style={roleStyles.backIcon} />
        <Text style={roleStyles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={roleStyles.container}>
        <Image source={Logo} style={roleStyles.logoImg} />
        <Text style={roleStyles.title}>Member Code</Text>

        {/* --- TABS --- */}
        <View style={local.tabRow}>
          <TouchableOpacity
            style={[local.tab, tab === 'manual' && local.tabActive]}
            onPress={() => setTab('manual')}
          >
            <Text style={[local.tabText, tab === 'manual' && local.tabTextActive]}>Enter Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[local.tab, tab === 'scan' && local.tabActive]}
            onPress={handleSwitchToScan}
          >
            <Text style={[local.tabText, tab === 'scan' && local.tabTextActive]}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* --- MANUAL ENTRY --- */}
        {tab === 'manual' && (
          <View style={roleStyles.card}>
            <Text style={roleStyles.questionText}>Enter the Member Code given by your Household Head</Text>
            <Text style={[roleStyles.radioSublabel, { marginBottom: 15 }]}>
              Your Household Head can find this code under their Profile → Household Members section.
            </Text>
            <TextInput
              style={roleStyles.codeInput}
              value={code}
              onChangeText={setCode}
              placeholder="e.g. BO - 123456"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
            />
          </View>
        )}

        {/* --- QR SCANNER --- */}
        {tab === 'scan' && permission?.granted && (
          <View style={local.scanCard}>
            <CameraView
              style={local.camera}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />
            <View style={local.scanFrame} pointerEvents="none">
              <View style={local.corner} />
              <View style={[local.corner, { right: 0 }]} />
              <View style={[local.corner, { bottom: 0 }]} />
              <View style={[local.corner, { bottom: 0, right: 0 }]} />
            </View>
            <Text style={local.scanHint}>Point the camera at the QR Code</Text>
            {scanned && (
              <TouchableOpacity style={local.rescanBtn} onPress={() => setScanned(false)}>
                <Text style={local.rescanText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* --- VERIFY BUTTON (manual only) --- */}
        {tab === 'manual' && (
          <TouchableOpacity style={roleStyles.nextBtn} onPress={() => handleVerify()}>
            <Text style={roleStyles.nextBtnText}>Verify &amp; Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
};

const local = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#3FA9F5',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  tabActive: {
    backgroundColor: '#3FA9F5',
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#3FA9F5',
  },
  tabTextActive: {
    color: 'white',
  },
  scanCard: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: 15,
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '70%',
    height: '70%',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#3FA9F5',
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  scanHint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rescanBtn: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: 'rgba(63,169,245,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rescanText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MemberCode;
