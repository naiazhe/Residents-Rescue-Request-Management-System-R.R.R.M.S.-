import React, { useState } from 'react';
import {
  TouchableOpacity, Text, TextInput, View, Image,
  ImageBackground, Platform, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import styles from '../styles/signup';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';
import backIcon from '../assets/icons/back.png';

// --- REUSABLE RADIO BUTTON COMPONENT ---
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

const HouseholdMember = () => {
  const router = useRouter();
  const { signupData, membersData } = useLocalSearchParams();

  // Members accumulated so far (passed back from householdConfirm when adding more)
  const [members, setMembers] = useState(() => {
    try { return membersData ? JSON.parse(membersData) : []; }
    catch { return []; }
  });

  // Form fields
  const [lastname,         setLastname]         = useState('');
  const [firstname,        setFirstname]         = useState('');
  const [middlename,       setMiddlename]        = useState('');
  const [contactNumber,    setContactNumber]     = useState('');
  const [gender,           setGender]            = useState(null);
  const [isPwd,            setIsPwd]             = useState(null);
  const [medRecordDetails, setMedRecordDetails]  = useState('');
  const [date,             setDate]              = useState(new Date());
  const [showPicker,       setShowPicker]        = useState(false);
  const [hasSelectedDate,  setHasSelectedDate]   = useState(false);
  const [errors,           setErrors]            = useState({});

  const handleContactChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setContactNumber(numeric);
    if (errors.contactNumber) setErrors({ ...errors, contactNumber: false });
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setHasSelectedDate(true);
      if (errors.date) setErrors({ ...errors, date: false });
    }
  };

  const formatDate = (d) =>
    `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

  const handleChange = (setter, fieldName, text) => {
    setter(text);
    if (errors[fieldName]) setErrors({ ...errors, [fieldName]: false });
  };

  const validate = () => {
    const newErrors = {};
    if (!lastname.trim())        newErrors.lastname       = true;
    if (!firstname.trim())       newErrors.firstname      = true;
    if (!contactNumber.trim())   newErrors.contactNumber  = true;
    if (!hasSelectedDate)        newErrors.date           = true;
    if (!gender)                 newErrors.gender         = true;
    if (!isPwd)                  newErrors.isPwd          = true;
    if (isPwd === 'Yes' && !medRecordDetails.trim()) newErrors.medRecordDetails = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildEntry = () => ({
    id:      Date.now().toString(),
    name:    [firstname.trim(), middlename.trim(), lastname.trim()].filter(Boolean).join(' '),
    age:     String(new Date().getFullYear() - date.getFullYear()),
    gender,
    medical: isPwd === 'Yes' ? medRecordDetails.trim() : 'None',
    cell:    contactNumber,
    pwd:     isPwd === 'Yes' ? 'PWD' : 'NONE',
    isMainUser: false,
  });

  const resetForm = () => {
    setLastname('');
    setFirstname('');
    setMiddlename('');
    setContactNumber('');
    setGender(null);
    setIsPwd(null);
    setMedRecordDetails('');
    setDate(new Date());
    setHasSelectedDate(false);
    setErrors({});
  };

  // "Add Member" — save current entry to local list and reset form to add another
  const handleAddAnother = () => {
    if (!validate()) return;
    setMembers(prev => [...prev, buildEntry()]);
    resetForm();
  };

  // "Save" — save current entry and navigate to householdConfirm with all members
  const handleSave = () => {
    if (!validate()) return;
    const allMembers = [...members, buildEntry()];
    router.push({
      pathname: '/householdConfirm',
      params: { signupData, membersData: JSON.stringify(allMembers) },
    });
  };

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Image source={backIcon} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Image source={Logo} style={styles.logoImg} />
        <Text style={styles.title}>
          Add Member{members.length > 0 ? ` (${members.length} added)` : ''}
        </Text>

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
          placeholder="Middlename"
          placeholderTextColor="#666"
        />

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
            <RadioButton label="Male" value="Male" selectedValue={gender} onSelect={(v) => {
              setGender(v);
              if (errors.gender) setErrors({ ...errors, gender: false });
            }} />
            <RadioButton label="Fem" value="Female" selectedValue={gender} onSelect={(v) => {
              setGender(v);
              if (errors.gender) setErrors({ ...errors, gender: false });
            }} />
          </View>
        </View>

        <TextInput
          style={[styles.nameIn, errors.contactNumber && styles.inputError]}
          onChangeText={handleContactChange}
          value={contactNumber}
          placeholder="Contact Number (09...)"
          keyboardType="number-pad"
          maxLength={11}
          placeholderTextColor="#666"
        />

        <Text style={[styles.title, errors.isPwd && { color: 'red' }]}>Medical Record:</Text>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        <View style={styles.medRecContainer}>
          <Text style={styles.medRecLabel}>
            Are they a Person with Disability (PWD) / Chronic Illness?
          </Text>
          <View style={styles.medRecButtonsRow}>
            <RadioButton label="Yes" value="Yes" selectedValue={isPwd} onSelect={(v) => {
              setIsPwd(v);
              if (errors.isPwd) setErrors({ ...errors, isPwd: false });
            }} />
            <RadioButton label="No" value="No" selectedValue={isPwd} onSelect={(v) => {
              setIsPwd(v);
              if (errors.isPwd) setErrors({ ...errors, isPwd: false });
            }} />
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

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={handleAddAnother}>
            <Text style={styles.outlineBtnText}>Add Member</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.loginBtn, { flex: 1, marginTop: 0 }]} onPress={handleSave}>
            <Text style={styles.loginText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HouseholdMember;
