import React, { useState } from 'react';
import {
  TouchableOpacity, Text, TextInput, View, Image, ImageBackground,
  Platform, ScrollView,
} from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import styles from '../styles/signup';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';

// ─── Radio button ─────────────────────────────────────────────────────────────

const RadioButton = ({ label, value, selectedValue, onSelect }) => {
  const isSelected = value === selectedValue;
  return (
    <TouchableOpacity style={styles.radioContainer} onPress={() => onSelect(value)}>
      <View style={[styles.outerCircle, isSelected && styles.outerCircleSelected]}>
        {isSelected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const MyInputField = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isMember = params.isMember;
  // Decode residentType — Expo Router may URL-encode the '/' in 'Tenant/Renter'
  const residentType = params.residentType
    ? decodeURIComponent(String(params.residentType))
    : '';

  const [lastname,         setLastname]        = useState('');
  const [firstname,        setFirstname]        = useState('');
  const [middlename,       setMiddlename]       = useState('');
  const [contactNumber,    setContactNumber]    = useState('');
  const [gender,           setGender]           = useState(null);
  const [isPwd,            setIsPwd]            = useState(null);
  const [medRecordDetails, setMedRecordDetails] = useState('');
  const [date,             setDate]             = useState(new Date());
  const [showPicker,       setShowPicker]       = useState(false);
  const [hasSelectedDate,  setHasSelectedDate]  = useState(false);
  const [errors,           setErrors]           = useState({});

  const handleContactChange = (text) => {
    setContactNumber(text.replace(/[^0-9]/g, ''));
    if (errors.contactNumber) setErrors(e => ({ ...e, contactNumber: false }));
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setHasSelectedDate(true);
      if (errors.date) setErrors(e => ({ ...e, date: false }));
    }
  };

  const handleChange = (setter, field, text) => {
    setter(text);
    if (errors[field]) setErrors(e => ({ ...e, [field]: false }));
  };

  const formatDate = (d) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

  const handleNext = () => {
    const err = {};
    if (!lastname.trim())      err.lastname      = true;
    if (!firstname.trim())     err.firstname     = true;
    if (!hasSelectedDate)      err.date          = true;
    if (!gender)               err.gender        = true;
    if (!contactNumber.trim()) err.contactNumber = true;
    if (!isPwd)                err.isPwd         = true;
    if (isPwd === 'Yes' && !medRecordDetails.trim()) err.medRecordDetails = true;

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const pad = (n) => String(n).padStart(2, '0');

    const partialData = JSON.stringify({
      firstName:        firstname.trim(),
      middleName:       middlename.trim() || null,
      lastName:         lastname.trim(),
      sex:              gender.toUpperCase(),
      birthdate:        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      mobileNumber:     contactNumber,
      residentType:     residentType || 'Household Head',
      isRepresentative: residentType === 'Household Head',
      vulnerabilities:  isPwd === 'Yes' && medRecordDetails.trim()
                          ? [medRecordDetails.trim()]
                          : [],
    });

    router.push({ pathname: '/signupAddress', params: { partialData, isMember } });
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <ScrollView
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image source={Logo} style={styles.logoImg} />
        <Text style={styles.title}>User Detail</Text>

        {/* ── Name fields ─────────────────────────────────────────── */}
        <TextInput
          style={[styles.nameIn, errors.lastname && styles.inputError]}
          onChangeText={(t) => handleChange(setLastname, 'lastname', t)}
          value={lastname}
          placeholder="Lastname"
          placeholderTextColor="#666"
        />
        <TextInput
          style={[styles.nameIn, errors.firstname && styles.inputError]}
          onChangeText={(t) => handleChange(setFirstname, 'firstname', t)}
          value={firstname}
          placeholder="Firstname"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.nameIn}
          onChangeText={setMiddlename}
          value={middlename}
          placeholder="Middlename (optional)"
          placeholderTextColor="#666"
        />

        {/* ── Birthdate & Gender ──────────────────────────────────── */}
        <View style={styles.rowWrapper}>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={[styles.dateInputHalf, errors.date && styles.inputError]}
          >
            <Text style={[styles.dateText, !hasSelectedDate && { color: '#666' }]}>
              {hasSelectedDate ? formatDate(date) : 'Birthdate'}
            </Text>
          </TouchableOpacity>
          <View style={styles.genderGroup}>
            <Text style={[styles.genderLabel, errors.gender && { color: 'red' }]}>Gender:</Text>
            <RadioButton label="Male" value="Male" selectedValue={gender}
              onSelect={(v) => { setGender(v); if (errors.gender) setErrors(e => ({ ...e, gender: false })); }} />
            <RadioButton label="Fem" value="Female" selectedValue={gender}
              onSelect={(v) => { setGender(v); if (errors.gender) setErrors(e => ({ ...e, gender: false })); }} />
          </View>
        </View>
        {showPicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}

        {/* ── Contact ─────────────────────────────────────────────── */}
        <TextInput
          style={[styles.nameIn, errors.contactNumber && styles.inputError]}
          onChangeText={handleContactChange}
          value={contactNumber}
          placeholder="Contact Number (09...)"
          keyboardType="number-pad"
          maxLength={11}
          placeholderTextColor="#666"
        />

        {/* ── Medical Record ───────────────────────────────────────── */}
        <Text style={[styles.title, { fontSize: 16, marginTop: 10 }, errors.isPwd && { color: 'red' }]}>
          Medical Record:
        </Text>
        <View style={styles.medRecContainer}>
          <Text style={styles.medRecLabel}>
            Are you a Person with Disability (PWD) / Chronic Illness?
          </Text>
          <View style={styles.medRecButtonsRow}>
            <RadioButton label="Yes" value="Yes" selectedValue={isPwd}
              onSelect={(v) => { setIsPwd(v); if (errors.isPwd) setErrors(e => ({ ...e, isPwd: false })); }} />
            <RadioButton label="No" value="No" selectedValue={isPwd}
              onSelect={(v) => { setIsPwd(v); if (errors.isPwd) setErrors(e => ({ ...e, isPwd: false })); }} />
          </View>
        </View>
        {isPwd === 'Yes' && (
          <TextInput
            style={[styles.nameIn, errors.medRecordDetails && styles.inputError]}
            onChangeText={(t) => handleChange(setMedRecordDetails, 'medRecordDetails', t)}
            value={medRecordDetails}
            placeholder="Specify condition"
            placeholderTextColor="#666"
          />
        )}

        <TouchableOpacity style={styles.loginBtn} onPress={handleNext}>
          <Text style={styles.loginText}>Next</Text>
        </TouchableOpacity>

        <View style={styles.register}>
          <Text style={styles.textStyle}>I already have an Account</Text>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={styles.registerBtn}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default MyInputField;
