import React from 'react';
import { TouchableOpacity, Text, View, Image, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import styles from '../styles/householdRole';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';
import backIcon from '../assets/icons/back.png';

const AddMembersPrompt = () => {
  const router = useRouter();
  const { signupData } = useLocalSearchParams();

  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Image source={backIcon} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Image source={Logo} style={styles.logoImg} />
        <Text style={styles.title}>Household Members</Text>

        <View style={styles.card}>
          <Text style={styles.questionText}>Do you want to add a Household Member now?</Text>
          <Text style={[styles.radioSublabel, { marginBottom: 15 }]}>
            You can also add members later from your profile. Each member can register their own account using the Member Code generated for them.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.noBtn} onPress={() => router.push({ pathname: '/register', params: { signupData } })}>
              <Text style={styles.noBtnText}>No, Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.yesBtn} onPress={() => router.push({ pathname: '/householdMember', params: { signupData } })}>
              <Text style={styles.yesBtnText}>Yes, Add Member</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default AddMembersPrompt;
