import React, { useState } from 'react';
import { TouchableOpacity, Text, View, Image, ImageBackground, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import styles from '../styles/householdRole';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';
import backIcon from '../assets/icons/back.png';

const RadioButton = ({ label, sublabel, value, selectedValue, onSelect }) => {
  const isSelected = value === selectedValue;
  return (
    <TouchableOpacity style={styles.radioContainer} onPress={() => onSelect(value)}>
      <View style={[styles.outerCircle, isSelected && styles.outerCircleSelected]}>
        {isSelected && <View style={styles.innerCircle} />}
      </View>
      <View>
        <Text style={styles.radioLabel}>{label}</Text>
        {sublabel ? <Text style={styles.radioSublabel}>{sublabel}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const HouseholdRole = () => {
  const router = useRouter();
  const [role, setRole] = useState(null);

  const handleNext = () => {
    if (!role) {
      Alert.alert('Missing Info', 'Please select your Household Role first.');
      return;
    }

    if (role === 'Household Member') {
      router.push('/memberCode');
    } else {
      router.push({ pathname: '/signup', params: { residentType: role } });
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
        <Text style={styles.title}>Household Role</Text>

        <View style={styles.card}>
          <Text style={styles.questionText}>What is your role in the household?</Text>
          <View style={styles.optionsContainer}>
            <RadioButton
              label="Household Head"
              sublabel="Primary account holder of the household"
              value="Household Head"
              selectedValue={role}
              onSelect={setRole}
            />
            <RadioButton
              label="Tenant / Renter"
              sublabel="Renting a property in the barangay"
              value="Tenant/Renter"
              selectedValue={role}
              onSelect={setRole}
            />
            <RadioButton
              label="Boarder"
              sublabel="Boarding inside a household"
              value="Boarder"
              selectedValue={role}
              onSelect={setRole}
            />
            <RadioButton
              label="Household Member"
              sublabel="Member of an existing household — requires a Member Code"
              value="Household Member"
              selectedValue={role}
              onSelect={setRole}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default HouseholdRole;
