import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity, Text, TextInput, View, Image, ImageBackground,
  Modal, FlatList, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import styles from '../styles/signup';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';
import backIcon from '../assets/icons/back.png';

const PSGC_BASE   = 'https://psgc.gitlab.io/api';
const REGION_CODE = '050000000'; // Bicol Region

const ZONE_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  code: `zone-${i + 1}`,
  name: `Zone ${i + 1}`,
}));

// ─── Shared picker modal ──────────────────────────────────────────────────────

const PickerModal = ({ visible, onClose, data, onSelect, title, isLoading }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <View style={{
        backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, maxHeight: '65%',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select {title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#3FA9F5', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3FA9F5" style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={{ fontSize: 15 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                No options available.
              </Text>
            }
          />
        )}
      </View>
    </View>
  </Modal>
);

// ─── Read-only field ──────────────────────────────────────────────────────────

const ReadOnlyField = ({ value, style }) => (
  <View style={[styles.nameIn, { justifyContent: 'center', backgroundColor: '#f0f0f0' }, style]}>
    <Text style={{ color: '#555' }}>{value}</Text>
  </View>
);

// ─── Picker trigger field ─────────────────────────────────────────────────────

const PickerField = ({ label, value, onPress, hasError, disabled }) => (
  <TouchableOpacity
    style={[
      styles.nameIn, { justifyContent: 'center' },
      hasError && styles.inputError,
      disabled && { backgroundColor: '#f0f0f0' },
    ]}
    onPress={disabled ? undefined : onPress}
    activeOpacity={disabled ? 1 : 0.7}
  >
    <Text style={{ color: value ? '#000' : '#666' }}>{value || label}</Text>
  </TouchableOpacity>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

const SignupAddress = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const partialData  = params.partialData
    ? decodeURIComponent(String(params.partialData))
    : null;
  const isMember     = params.isMember;

  // Read residentType from the JSON payload (avoids URL-encoding issues with '/')
  const partial      = partialData ? JSON.parse(partialData) : {};
  const residentType = partial.residentType || '';
  const isDualAddress = residentType.toLowerCase().includes('tenant') ||
                        residentType.toLowerCase().includes('renter') ||
                        residentType === 'Boarder';

  // DEBUG: remove after testing
  console.log('DEBUG residentType:', residentType, '| isDualAddress:', isDualAddress);
  console.log('DEBUG isMember:', isMember);

  // ── Naga City address ─────────────────────────────────────────────────────
  const [nagaBarangay,      setNagaBarangay]      = useState(null);
  const [nagaZone,          setNagaZone]          = useState(null);
  const [nagaStreet,        setNagaStreet]        = useState('');
  const [nagaBarangayList,  setNagaBarangayList]  = useState([]);
  const [loadingNaga,       setLoadingNaga]       = useState(true);
  const [nagaBarangayModal, setNagaBarangayModal] = useState(false);
  const [nagaZoneModal,     setNagaZoneModal]     = useState(false);

  // ── Permanent home address — Bicol cascade (Tenant/Boarder only) ──────────
  const [bicolProvinces,    setBicolProvinces]    = useState([]);
  const [homeProvince,      setHomeProvince]      = useState(null);
  const [homeCity,          setHomeCity]          = useState(null);
  const [homeBarangay,      setHomeBarangay]      = useState(null);
  const [homeZone,          setHomeZone]          = useState(null);
  const [homeStreet,        setHomeStreet]        = useState('');
  const [homeCities,        setHomeCities]        = useState([]);
  const [homeBarangays,     setHomeBarangays]     = useState([]);
  const [loadingHomeCities, setLoadingHomeCities] = useState(false);
  const [loadingHomeBrgys,  setLoadingHomeBrgys]  = useState(false);
  const [homeProvinceModal, setHomeProvinceModal] = useState(false);
  const [homeCityModal,     setHomeCityModal]     = useState(false);
  const [homeBarangayModal, setHomeBarangayModal] = useState(false);
  const [homeZoneModal,     setHomeZoneModal]     = useState(false);

  const [errors, setErrors] = useState({});

  // ── On mount: auto-navigate cascade to get Naga City barangays ────────────
  useEffect(() => {
    const initNagaBarangays = async () => {
      setLoadingNaga(true);
      try {
        // Step 1: Bicol provinces (reused for permanent home picker)
        const provRes   = await fetch(`${PSGC_BASE}/regions/${REGION_CODE}/provinces/`);
        const provinces = await provRes.json();
        const sorted    = provinces.sort((a, b) => a.name.localeCompare(b.name));
        setBicolProvinces(sorted);

        // Step 2: Cities of Camarines Sur
        const camSur = sorted.find(p => p.name.toLowerCase().includes('camarines sur'));
        if (!camSur) return;

        const cityRes = await fetch(`${PSGC_BASE}/provinces/${camSur.code}/cities-municipalities/`);
        const cities  = await cityRes.json();

        // Step 3: Find Naga City
        const nagaCity = cities.find(c => c.name.toLowerCase().includes('naga'));
        if (!nagaCity) return;

        // Step 4: Fetch its barangays
        const brgyRes   = await fetch(`${PSGC_BASE}/cities-municipalities/${nagaCity.code}/barangays/`);
        const barangays = await brgyRes.json();
        setNagaBarangayList(barangays.sort((a, b) => a.name.localeCompare(b.name)));
      } catch {
        // Silent — picker shows "No options available"
      } finally {
        setLoadingNaga(false);
      }
    };

    initNagaBarangays();
  }, []);

  // ── Cascading handlers for permanent home address ─────────────────────────

  const handleHomeProvinceSelect = async (province) => {
    setHomeProvince(province);
    setHomeCity(null);
    setHomeBarangay(null);
    setHomeZone(null);
    setHomeCities([]);
    setHomeBarangays([]);
    if (errors.homeProvince) setErrors(e => ({ ...e, homeProvince: false }));

    setLoadingHomeCities(true);
    try {
      const res  = await fetch(`${PSGC_BASE}/provinces/${province.code}/cities-municipalities/`);
      const data = await res.json();
      setHomeCities(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch { /* silent */ } finally {
      setLoadingHomeCities(false);
    }
  };

  const handleHomeCitySelect = async (city) => {
    setHomeCity(city);
    setHomeBarangay(null);
    setHomeZone(null);
    setHomeBarangays([]);
    if (errors.homeCity) setErrors(e => ({ ...e, homeCity: false }));

    setLoadingHomeBrgys(true);
    try {
      const res  = await fetch(`${PSGC_BASE}/cities-municipalities/${city.code}/barangays/`);
      const data = await res.json();
      setHomeBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch { /* silent */ } finally {
      setLoadingHomeBrgys(false);
    }
  };

  const handleChange = (setter, field, text) => {
    setter(text);
    if (errors[field]) setErrors(e => ({ ...e, [field]: false }));
  };

  // ── Validation & submit ───────────────────────────────────────────────────

  const handleNext = () => {
    const err = {};

    if (!nagaBarangay)      err.nagaBarangay = true;
    if (!nagaZone)          err.nagaZone     = true;
    if (!nagaStreet.trim()) err.nagaStreet   = true;

    if (isDualAddress) {
      if (!homeProvince)      err.homeProvince = true;
      if (!homeCity)          err.homeCity     = true;
      if (!homeBarangay)      err.homeBarangay = true;
      if (!homeZone)          err.homeZone     = true;
      if (!homeStreet.trim()) err.homeStreet   = true;
    }

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const signupData = JSON.stringify({
      ...partial,
      province: 'Camarines Sur',
      city:     'Naga City',
      barangay: nagaBarangay.name,
      zone:     nagaZone.name,
      street:   nagaStreet.trim(),
      ...(isDualAddress && {
        homeAddress: {
          province: homeProvince.name,
          city:     homeCity.name,
          barangay: homeBarangay.name,
          zone:     homeZone.name,
          street:   homeStreet.trim(),
        },
      }),
    });

    if (isMember === 'true') {
      router.push({ pathname: '/register', params: { signupData } });
    } else {
      router.push({ pathname: '/uploadDocuments', params: { signupData } });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Image source={backIcon} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[styles.container, { flex: undefined, flexGrow: 1, paddingTop: 80, paddingBottom: 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image source={Logo} style={styles.logoImg} />
        <Text style={styles.title}>Address Details</Text>

        {/* ── Address in Naga City ─────────────────────────────────────── */}
        <Text style={[styles.title, { fontSize: 16, marginTop: 12 }]}>
          {isDualAddress ? 'Address in Naga City (Rental / Boarding)' : 'Address in Naga City'}
        </Text>
        {isDualAddress && (
          <Text style={{ alignSelf: 'flex-start', fontSize: 12, color: '#888', marginBottom: 4 }}>
            Where you are currently renting or boarding in Naga City
          </Text>
        )}

        <View style={styles.rowWrapper}>
          <ReadOnlyField value="Camarines Sur" style={{ flex: 1 }} />
          <ReadOnlyField value="Naga City"     style={{ flex: 1 }} />
        </View>

        <PickerField
          label={loadingNaga ? 'Loading barangays…' : 'Select Barangay'}
          value={nagaBarangay?.name}
          onPress={() => setNagaBarangayModal(true)}
          hasError={errors.nagaBarangay}
          disabled={loadingNaga}
        />

        <PickerField
          label="Select Zone"
          value={nagaZone?.name}
          onPress={() => setNagaZoneModal(true)}
          hasError={errors.nagaZone}
        />

        <TextInput
          style={[styles.nameIn, errors.nagaStreet && styles.inputError]}
          onChangeText={(t) => handleChange(setNagaStreet, 'nagaStreet', t)}
          value={nagaStreet}
          placeholder="Street / House No."
          placeholderTextColor="#666"
        />

        {/* ── Permanent Home Address (Tenant/Boarder only) ─────────────── */}
        {isDualAddress && (
          <>
            <View style={{
              width: '100%', height: 1, backgroundColor: '#ccc',
              marginTop: 18, marginBottom: 10,
            }} />

            <Text style={[styles.title, { fontSize: 16, color: '#2F7FB8' }]}>
              Permanent Home Address
            </Text>
            <Text style={{ alignSelf: 'flex-start', fontSize: 12, color: '#888', marginBottom: 6 }}>
              Where you permanently reside (anywhere within Bicol Region)
            </Text>

            {/* Province */}
            <PickerField
              label={loadingNaga ? 'Loading provinces…' : 'Province'}
              value={homeProvince?.name}
              onPress={() => setHomeProvinceModal(true)}
              hasError={errors.homeProvince}
              disabled={loadingNaga}
            />

            {/* City / Municipality */}
            <PickerField
              label={loadingHomeCities ? 'Loading cities…' : 'City / Municipality'}
              value={homeCity?.name}
              onPress={() => homeProvince && setHomeCityModal(true)}
              hasError={errors.homeCity}
              disabled={!homeProvince || loadingHomeCities}
            />

            {/* Barangay */}
            <PickerField
              label={loadingHomeBrgys ? 'Loading barangays…' : 'Barangay'}
              value={homeBarangay?.name}
              onPress={() => homeCity && setHomeBarangayModal(true)}
              hasError={errors.homeBarangay}
              disabled={!homeCity || loadingHomeBrgys}
            />

            {/* Zone */}
            <PickerField
              label="Select Zone"
              value={homeZone?.name}
              onPress={() => setHomeZoneModal(true)}
              hasError={errors.homeZone}
              disabled={!homeBarangay}
            />

            {/* Street */}
            <TextInput
              style={[styles.nameIn, errors.homeStreet && styles.inputError]}
              onChangeText={(t) => handleChange(setHomeStreet, 'homeStreet', t)}
              value={homeStreet}
              placeholder="Street / House No."
              placeholderTextColor="#666"
            />
          </>
        )}

        <TouchableOpacity style={[styles.loginBtn, { marginTop: 20, marginBottom: 60 }]} onPress={handleNext}>
          <Text style={styles.loginText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Modals ────────────────────────────────────────────────────── */}

      {/* Naga City — barangay */}
      <PickerModal
        visible={nagaBarangayModal}
        onClose={() => setNagaBarangayModal(false)}
        data={nagaBarangayList}
        title="Barangay (Naga City)"
        isLoading={loadingNaga}
        onSelect={(item) => {
          setNagaBarangay(item);
          if (errors.nagaBarangay) setErrors(e => ({ ...e, nagaBarangay: false }));
        }}
      />

      {/* Naga City — zone */}
      <PickerModal
        visible={nagaZoneModal}
        onClose={() => setNagaZoneModal(false)}
        data={ZONE_OPTIONS}
        title="Zone (Naga City)"
        isLoading={false}
        onSelect={(item) => {
          setNagaZone(item);
          if (errors.nagaZone) setErrors(e => ({ ...e, nagaZone: false }));
        }}
      />

      {/* Permanent home — province */}
      <PickerModal
        visible={homeProvinceModal}
        onClose={() => setHomeProvinceModal(false)}
        data={bicolProvinces}
        title="Province (Bicol)"
        isLoading={loadingNaga}
        onSelect={handleHomeProvinceSelect}
      />

      {/* Permanent home — city */}
      <PickerModal
        visible={homeCityModal}
        onClose={() => setHomeCityModal(false)}
        data={homeCities}
        title="City / Municipality"
        isLoading={loadingHomeCities}
        onSelect={handleHomeCitySelect}
      />

      {/* Permanent home — barangay */}
      <PickerModal
        visible={homeBarangayModal}
        onClose={() => setHomeBarangayModal(false)}
        data={homeBarangays}
        title="Barangay"
        isLoading={loadingHomeBrgys}
        onSelect={(item) => {
          setHomeBarangay(item);
          if (errors.homeBarangay) setErrors(e => ({ ...e, homeBarangay: false }));
        }}
      />

      {/* Permanent home — zone */}
      <PickerModal
        visible={homeZoneModal}
        onClose={() => setHomeZoneModal(false)}
        data={ZONE_OPTIONS}
        title="Zone (Home Address)"
        isLoading={false}
        onSelect={(item) => {
          setHomeZone(item);
          if (errors.homeZone) setErrors(e => ({ ...e, homeZone: false }));
        }}
      />
    </ImageBackground>
  );
};

export default SignupAddress;
