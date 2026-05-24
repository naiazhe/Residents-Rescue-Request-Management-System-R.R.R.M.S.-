import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView from 'react-native-maps';

import BottomNavbar from '../components/navbar';
import Header from '../components/header';
import styles from '../styles/home';

import { sendSOS, getResidentProfile, getHouseholdMembers } from '../services/api';
import { getSession } from '../services/session';
import {
  fetchAdaptiveLocation,
  reverseGeocode,
  LocationPermissionError,
} from '../services/location';
import { addLocalMember } from '../services/memberStore';

// Phase 1: tap counter resets if no follow-up tap within this window.
const TAP_WINDOW_MS = 2000;

import tapIcon      from '../assets/icons/tap.png';
import bg           from '../assets/img/LANDING.jpg';
import locationIcon from '../assets/icons/location-normal.png';
import mapPinIcon   from '../assets/icons/pin.png';
import boatIcon     from '../assets/icons/location-normal.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcAge = (birthdate) => {
  if (!birthdate) return '?';
  return new Date().getFullYear() - new Date(birthdate).getFullYear();
};

const buildMemberRow = (m) => ({
  id:       String(m.resident_id),
  name:     `${m.first_name} ${m.last_name}`,
  age:      String(calcAge(m.birthdate)),
  remark:   Array.isArray(m.vulnerabilities) && m.vulnerabilities.length > 0
              ? m.vulnerabilities.join(', ')
              : 'None',
  selected: true,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');

  // ── SOS tap state ─────────────────────────────────────────────────────────
  const [tapCount,      setTapCount]      = useState(0);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [countdown,     setCountdown]     = useState(0);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const tapResetTimer = useRef(null);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showMemberConfirm, setShowMemberConfirm] = useState(false);
  const [showDeployedModal, setShowDeployedModal] = useState(false);


  // ── Location state ────────────────────────────────────────────────────────
  const [address,           setAddress]           = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isFreezingForLocation, setIsFreezingForLocation] = useState(false);
  const [showMapPicker,     setShowMapPicker]      = useState(false);
  const [mapRegion,         setMapRegion]          = useState({
    latitude:      13.6139,
    longitude:     123.1853,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  // ── Household members state ───────────────────────────────────────────────
  const [confirmMembers,  setConfirmMembers]  = useState([]);
  const [membersLoading,  setMembersLoading]  = useState(true);
  const [isAddingMember,  setIsAddingMember]  = useState(false);
  const [newMember,       setNewMember]       = useState({ name: '', age: '', remark: '' });

  // ─── Load resident data on mount ──────────────────────────────────────────
  useEffect(() => {
    const loadResidentData = async () => {
      const session = getSession();

      if (!session?.residentId) {
        setMembersLoading(false);
        return;
      }

      try {
        const profile = await getResidentProfile(session.residentId);

        const selfRow = {
          id:       String(profile.resident_id),
          name:     `${profile.first_name} ${profile.last_name}`,
          age:      String(calcAge(profile.birthdate)),
          remark:   profile.vulnerabilities?.length > 0
                      ? profile.vulnerabilities.map(v => v.vulnerability_name).join(', ')
                      : 'None',
          selected: true,
        };

        if (profile.household_id && profile.member_count > 1) {
          const members = await getHouseholdMembers(profile.household_id);
          setConfirmMembers(members.map(buildMemberRow));
        } else {
          setConfirmMembers([selfRow]);
        }
      } catch {
        // Fallback: show session username if profile fetch fails
        const session2 = getSession();
        setConfirmMembers([{
          id: '0', name: session2?.username ?? 'You', age: '?', remark: 'None', selected: true,
        }]);
      } finally {
        setMembersLoading(false);
      }
    };

    loadResidentData();
  }, []);

  // ─── Auto-fetch location when confirmation modal opens ────────────────────
  // Phase 2: the initial fetch (right after the 3rd tap) freezes background UI
  // until coords resolve. Manual re-taps of the location button do not freeze.
  useEffect(() => {
    if (showMemberConfirm) handleUseCurrentLocation({ freeze: true });
  }, [showMemberConfirm]);

  // ─── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    let timer;
    if (isDeactivated && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && isDeactivated) {
      setIsDeactivated(false);
      setTapCount(0);
      // deployed modal is shown by the dispatch poll, not the timer
    }
    return () => clearInterval(timer);
  }, [isDeactivated, countdown]);


  // ─── SOS tap logic ────────────────────────────────────────────────────────
  // Phase 1 spec: three taps in *rapid succession*. tapResetTimer clears the
  // counter if the user pauses longer than TAP_WINDOW_MS between taps, so a
  // stray tap from minutes ago can't combine with two fresh taps to fire SOS.
  const handleSOSPress = () => {
    if (isDeactivated) return;

    if (tapResetTimer.current) clearTimeout(tapResetTimer.current);

    setTapCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setShowMemberConfirm(true);
        return 0;
      }
      tapResetTimer.current = setTimeout(() => setTapCount(0), TAP_WINDOW_MS);
      return next;
    });

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => () => {
    if (tapResetTimer.current) clearTimeout(tapResetTimer.current);
  }, []);

  // ─── Confirm SOS ──────────────────────────────────────────────────────────
  const handleConfirmRescue = async () => {
    if (!address.trim()) {
      Alert.alert('Missing Address', 'Please enter a valid location.');
      return;
    }
    const presentMembers = confirmMembers.filter(m => m.selected);
    if (presentMembers.length === 0) {
      Alert.alert('No Members Selected', 'Please select at least one person to rescue.');
      return;
    }

    const session = getSession();
    if (session?.residentId) {
      try {
        await sendSOS({
          residentId:   session.residentId,
          urgencyLevel: 3,
          latitude:     mapRegion.latitude,
          longitude:    mapRegion.longitude,
        });
      } catch (err) {
        Alert.alert('SOS Failed', 'Could not send SOS. Please try again.\n' + err.message);
        return;
      }
    }

    setShowMemberConfirm(false);
    setIsDeactivated(true);
    setCountdown(60);
  };

  const handleCancelRescue = () => {
    setShowMemberConfirm(false);
    setIsAddingMember(false);
  };

  // ─── Member list logic ────────────────────────────────────────────────────
  const toggleMemberSelection = (id) => {
    setConfirmMembers(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  const handleAddMemberPress = () => {
    if (isAddingMember) {
      if (!newMember.name.trim() || !newMember.age.trim()) {
        Alert.alert('Incomplete', 'Please enter Name and Age.');
        return;
      }
      const added = {
        id: Date.now().toString(),
        name: newMember.name,
        age: newMember.age,
        remark: newMember.remark || 'None',
        selected: true,
      };
      addLocalMember({
        id:         added.id,
        name:       added.name,
        age:        added.age,
        gender:     '',
        medical:    added.remark,
        cell:       '',
        pwd:        'NONE',
        isMainUser: false,
        hasAccount: false,
        memberCode: added.id,
      });
      setConfirmMembers(prev => [...prev, added]);
      setNewMember({ name: '', age: '', remark: '' });
      setIsAddingMember(false);
    } else {
      setIsAddingMember(true);
    }
  };

  // ─── Location logic ───────────────────────────────────────────────────────
  // All radio access goes through services/location.js (adaptive Network↔GNSS).
  const handleUseCurrentLocation = useCallback(async ({ freeze = false } = {}) => {
    setIsLoadingLocation(true);
    if (freeze) setIsFreezingForLocation(true);
    try {
      const { latitude, longitude } = await fetchAdaptiveLocation();
      setMapRegion(prev => ({ ...prev, latitude, longitude }));
      setAddress(await reverseGeocode({ latitude, longitude }));
    } catch (err) {
      if (err instanceof LocationPermissionError) {
        Alert.alert('Permission Denied', 'Allow location access to use this feature.');
      } else {
        Alert.alert('Location Error', err.message || 'Could not fetch location.');
      }
    } finally {
      setIsLoadingLocation(false);
      setIsFreezingForLocation(false);
    }
  }, []);

  const handleRegionChange = (region) => setMapRegion(region);

  const handleConfirmMapLocation = async () => {
    try {
      setAddress(await reverseGeocode(mapRegion));
      setShowMapPicker(false);
    } catch {
      Alert.alert('Error', 'Could not determine address.');
    }
  };

  // ─── Render helpers ───────────────────────────────────────────────────────
  const sosButtonDisabled = isDeactivated;

  const instructionTitle = isDeactivated
    ? 'Help is on the way!'
    : `Tap ${3 - tapCount} ${3 - tapCount === 1 ? 'time' : 'times'} to Request Help!`;

  const instructionSubtitle = isDeactivated
    ? 'Request is Delivered!'
    : 'We will send a Rescuer to your Area Immediately!';

  const renderScreen = () => {
    switch (activeTab) {
      case 'location':  return <View style={styles.screenContent}><Text>Location</Text></View>;
      case 'emergency': return <View style={styles.screenContent}><Text>Evac Info</Text></View>;
      default:          return null;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <ImageBackground source={bg} style={styles.container} resizeMode="cover">
      <Header />
      <View style={styles.content}>
        {activeTab === 'home' ? (
          <>
            <View style={styles.sosContainer}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View style={styles.glowLayer4}>
                  <View style={styles.glowLayer3}>
                    <View style={styles.glowLayer2}>
                      <TouchableOpacity
                        style={[styles.sosButton, sosButtonDisabled && styles.deactivatedButton]}
                        onPress={handleSOSPress}
                        activeOpacity={0.9}
                        disabled={sosButtonDisabled}
                      >
                        {isDeactivated ? (
                          <View style={styles.timerContainer}>
                            <Text style={styles.timerText}>{countdown}s</Text>
                            <Text style={styles.timerLabel}>Wait</Text>
                          </View>
                        ) : (
                          <Text style={styles.sosText}>SOS</Text>
                        )}
                        {tapCount === 0 && !isDeactivated && (
                          <View style={styles.handIconContainer}>
                            <Image source={tapIcon} style={styles.tapImage} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </View>

            <View style={styles.instructionContainer}>
              <Text style={styles.instructionTitle}>{instructionTitle}</Text>
              <Text style={styles.instructionSubtitle}>{instructionSubtitle}</Text>
            </View>
          </>
        ) : (
          renderScreen()
        )}
      </View>

      <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── 1. Member Confirmation Modal ── */}
      <Modal visible={showMemberConfirm} transparent animationType="fade" onRequestClose={handleCancelRescue}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1}
            onPressOut={handleCancelRescue}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Request</Text>
                <Text style={styles.modalSubtitle}>Verify your location and household members.</Text>

                {/* Address */}
                <View style={styles.addressSection}>
                  <View style={styles.addressInputRow}>
                    <Image source={locationIcon} style={styles.addrIcon} resizeMode="contain" />
                    <TextInput
                      style={styles.addressInput}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Fetching location…"
                    />
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleUseCurrentLocation()}>
                      {isLoadingLocation
                        ? <ActivityIndicator size="small" color="#3FA9F5" />
                        : <Image source={locationIcon} style={styles.iconImg} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMapPicker(true)}>
                      <Image source={mapPinIcon} style={styles.iconImg} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Member table header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, { flex: 2 }]}>NAME</Text>
                  <Text style={[styles.headerText, { flex: 0.5, textAlign: 'center' }]}>AGE</Text>
                  <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>REMARK</Text>
                  <View style={{ width: 30 }} />
                </View>

                {/* Member rows */}
                <View style={{ maxHeight: 200 }}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {membersLoading ? (
                      <ActivityIndicator size="small" color="#3FA9F5" style={{ marginVertical: 12 }} />
                    ) : (
                      confirmMembers.map((member) => (
                        <View key={member.id} style={styles.memberRow}>
                          <Text style={[styles.rowText, !member.selected && styles.dimText, { flex: 2 }]}>{member.name}</Text>
                          <Text style={[styles.rowText, !member.selected && styles.dimText, { flex: 0.5, textAlign: 'center' }]}>{member.age}</Text>
                          <Text style={[styles.rowText, !member.selected && styles.dimText, { flex: 1, textAlign: 'center' }]}>{member.remark}</Text>
                          <TouchableOpacity onPress={() => toggleMemberSelection(member.id)} style={{ width: 30, alignItems: 'center' }}>
                            <View style={[styles.circleBtn, !member.selected && styles.plusBtn]}>
                              <Text style={[styles.circleBtnText, !member.selected && styles.plusBtnText]}>
                                {member.selected ? '−' : '+'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                    {isAddingMember && (
                      <View style={styles.addMemberRow}>
                        <TextInput style={[styles.inputField, { flex: 2 }]} placeholder="Name" value={newMember.name} onChangeText={t => setNewMember({ ...newMember, name: t })} />
                        <TextInput style={[styles.inputField, { flex: 0.5, textAlign: 'center' }]} placeholder="Age" keyboardType="numeric" value={newMember.age} onChangeText={t => setNewMember({ ...newMember, age: t })} />
                        <TextInput style={[styles.inputField, { flex: 1, textAlign: 'center' }]} placeholder="Remark" value={newMember.remark} onChangeText={t => setNewMember({ ...newMember, remark: t })} />
                        <View style={{ width: 30 }} />
                      </View>
                    )}
                  </ScrollView>
                </View>

                {/* Action buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, isAddingMember ? styles.confirmAddBtn : styles.addBtn]}
                    onPress={handleAddMemberPress}
                  >
                    <Text style={styles.btnText}>{isAddingMember ? 'Confirm Add' : 'Add Member'}</Text>
                  </TouchableOpacity>
                  {isAddingMember ? (
                    <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsAddingMember(false)}>
                      <Text style={[styles.btnText, styles.cancelBtnText]}>Cancel</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleConfirmRescue}>
                      <Text style={styles.btnText}>Confirm SOS</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── 2. Rescuer Deployed Modal ── */}
      <Modal visible={showDeployedModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.deployedModalContent}>
            <View style={styles.deployedIconContainer}>
              <Image source={boatIcon} style={styles.deployedIcon} resizeMode="contain" />
            </View>
            <Text style={styles.deployedTitle}>Rescuer Deployed!</Text>
            <Text style={styles.deployedSubtitle}>A rescue team has been dispatched to your location.</Text>
            <TouchableOpacity style={styles.trackBtn} onPress={() => { setShowDeployedModal(false); router.push('/locator'); }}>
              <Text style={styles.trackBtnText}>Track Rescuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── 3. Freeze Overlay (Phase 2: blocks UI during initial adaptive location fetch) ── */}
      <Modal visible={isFreezingForLocation} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.freezeOverlay}>
          <View style={styles.freezeCard}>
            <ActivityIndicator size="large" color="#3FA9F5" />
            <Text style={styles.freezeText}>Locating you…</Text>
          </View>
        </View>
      </Modal>

      {/* ── 4. Map Picker Modal ── */}
      <Modal visible={showMapPicker} animationType="slide" onRequestClose={() => setShowMapPicker(false)}>
        <View style={styles.mapModalContainer}>
          <MapView style={styles.map} region={mapRegion} onRegionChangeComplete={handleRegionChange} />
          <View style={styles.centerMarkerContainer}>
            <Image source={mapPinIcon} style={styles.centerMarker} />
          </View>
          <TouchableOpacity style={styles.closeMapBtn} onPress={() => setShowMapPicker(false)}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
          <View style={styles.mapOverlayContainer}>
            <Text style={styles.modalTitle}>Drag Map to Locate</Text>
            <Text style={styles.mapAddressText}>Target: {mapRegion.latitude.toFixed(4)}, {mapRegion.longitude.toFixed(4)}</Text>
            <TouchableOpacity style={styles.mapConfirmBtn} onPress={handleConfirmMapLocation}>
              <Text style={styles.btnText}>Use this Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
