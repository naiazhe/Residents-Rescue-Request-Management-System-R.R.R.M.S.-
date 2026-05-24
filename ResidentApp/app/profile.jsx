import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 
import QRCode from 'react-native-qrcode-svg'; // <-- NEW: QR Code Library

import BottomNavbar from '../components/navbar';
import styles from '../styles/profile';

import { getResidentProfile, getHouseholdMembers } from '../services/api';
import { getSession } from '../services/session';
import { getLocalMembers, removeLocalMember } from '../services/memberStore';

import defaultProfileImg from '../assets/img/LOGO.png';
import editIcon from '../assets/icons/edit.png';
import deleteIcon from '../assets/icons/delete-outline.png';
import addIcon from '../assets/icons/add.png';
import logoutIcon from '../assets/icons/logout-rounded.png';
import imageIcon from '../assets/icons/image.png';

const calcAge = (birthdate) => {
  if (!birthdate) return '?';
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
};

const buildMember = (m, loggedInResidentId) => ({
  id:         String(m.resident_id),
  name:       [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(' '),
  age:   calcAge(m.birthdate),
  gender:     m.sex ? m.sex.charAt(0) + m.sex.slice(1).toLowerCase() : '',
  medical:    Array.isArray(m.vulnerabilities) && m.vulnerabilities.length > 0
                ? m.vulnerabilities.join(', ')
                : 'None',
  cell:       m.mobile_number || '',
  pwd:        Array.isArray(m.vulnerabilities) && m.vulnerabilities.length > 0 ? 'PWD' : 'NONE',
  isMainUser: m.resident_id === loggedInResidentId,
  hasAccount: m.resident_id === loggedInResidentId,
  memberCode: String(m.resident_id),
}); 

const ProfileScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile'); 

  // --- USER PROFILE STATE ---
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '', id: '', age: '', number: '', address: '', isVerified: false,
  });

  const [profileImage, setProfileImage] = useState(null);

  // --- MEMBERS STATE ---
  const [members, setMembers] = useState([]);

  // --- LOAD FROM BACKEND ---
  const loadProfile = useCallback(async () => {
    const session = getSession();
    if (!session?.residentId) { setLoading(false); return; }

    try {
      const profile = await getResidentProfile(session.residentId);

      const fullName = [profile.first_name, profile.middle_name, profile.last_name]
        .filter(Boolean).join(' ');
      const address = [profile.street_name, profile.barangay_name, profile.city_name]
        .filter(Boolean).join(', ');

      setUser({
        name:       fullName,
        id:         profile.household_id ? String(profile.household_id) : '—',
        age:        calcAge(profile.birthdate),
        number:     profile.mobile_number || '—',
        address:    address || '—',
        isVerified: !!session.isVerified,
      });

      let backendMembers;
      if (profile.household_id && profile.member_count > 1) {
        const allMembers = await getHouseholdMembers(profile.household_id);
        backendMembers = allMembers.map(m => buildMember(m, session.residentId));
      } else {
        // Solo resident — show self only
        const selfVulns = Array.isArray(profile.vulnerabilities)
          ? profile.vulnerabilities.map(v => v.vulnerability_name || v).filter(Boolean)
          : [];
        backendMembers = [{
          id:         String(profile.resident_id),
          name:       fullName,
          age:        calcAge(profile.birthdate),
          gender:     profile.sex ? profile.sex.charAt(0) + profile.sex.slice(1).toLowerCase() : '',
          medical:    selfVulns.length > 0 ? selfVulns.join(', ') : 'None',
          cell:       profile.mobile_number || '',
          pwd:        selfVulns.length > 0 ? 'PWD' : 'NONE',
          isMainUser: true,
          hasAccount: true,
          memberCode: String(profile.resident_id),
        }];
      }

      // Merge locally-added members (from SOS modal), avoiding duplicates by id
      const backendIds = new Set(backendMembers.map(m => m.id));
      const localOnly  = getLocalMembers().filter(m => !backendIds.has(m.id));
      setMembers([...backendMembers, ...localOnly]);
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, []);

  // Re-merge local members each time the profile tab comes into focus
  useFocusEffect(
    useCallback(() => {
      setMembers(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newLocal = getLocalMembers().filter(m => !existingIds.has(m.id));
        return newLocal.length > 0 ? [...prev, ...newLocal] : prev;
      });
    }, [])
  );

  // --- MODAL, EDITING & EXPAND STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);       
  const [isEditingProfile, setIsEditingProfile] = useState(false); 
  const [editId, setEditId] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null); // <-- NEW: Tracks expanded card
  
  const [showPwdDropdown, setShowPwdDropdown] = useState(false);

  // --- FORM DATA STATE ---
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    cell: '',
    medical: '',
    pwd: '',
    address: '' 
  });

  // --- ACTIONS ---

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to change the photo.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Member", "Are you sure you want to remove this member?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeLocalMember(id);
            setMembers(prev => prev.filter(m => m.id !== id));
          },
        }
    ]);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setIsEditingProfile(false);
    setShowPwdDropdown(false);
    setFormData({
        name: '', age: '', gender: '', cell: '', medical: 'None', pwd: 'NONE', address: '',
    });
    setModalVisible(true);
  };

  const openEditMemberModal = (member) => {
    setIsEditing(true);
    setIsEditingProfile(false);
    setShowPwdDropdown(false);
    setEditId(member.id);
    setFormData({
        name:     member.name,
        age: member.age || '',
        gender:   member.gender,
        cell:     member.cell,
        medical:  member.medical,
        pwd:      member.pwd || 'NONE',
        address:  '',
    });
    setModalVisible(true);
  };

  const openEditProfileModal = () => {
    setIsEditingProfile(true);
    setIsEditing(false);
    setShowPwdDropdown(false);
    setFormData({
        name:     user.name,
        age: user.age,
        cell:     user.number,
        address:  user.address,
        gender: '', medical: '', pwd: '',
    });
    setModalVisible(true);
  };

  const handleStatusSelect = (status) => {
    let updatedMedical = formData.medical;

    if (status === 'NONE') {
        updatedMedical = 'None'; 
    } else if (status === 'PWD') {
        if (updatedMedical === 'None' || updatedMedical === 'N/A') {
            updatedMedical = ''; 
        }
    }
    
    setFormData({ ...formData, pwd: status, medical: updatedMedical });
    setShowPwdDropdown(false);
  };

  const handleSave = () => {
    if (!formData.name) {
        Alert.alert("Missing Info", "Name is required.");
        return;
    }

    if (isEditingProfile) {
        setUser({
            ...user,
            name:     formData.name,
            age: formData.age,
            number:   formData.cell,
            address:  formData.address,
        });
        Alert.alert("Success", "Profile details updated.");
    } else if (isEditing) {
        setMembers(prev => prev.map(m => 
            m.id === editId ? { ...m, ...formData } : m
        ));
        Alert.alert("Success", "Member details updated.");
    } else {
        const newMember = {
            id: Date.now().toString(),
            memberCode: `BO - ${Math.floor(100000 + Math.random() * 900000)}`,
            ...formData,
            isMainUser: false,
            hasAccount: false,
        };
        setMembers(prev => [...prev, newMember]);
        Alert.alert("Success", "New member added.");
    }
    setModalVisible(false);
  };

  // --- RENDER MEMBER ITEM ---
  const renderMemberItem = ({ item }) => {

    return (
      <View style={styles.card}>
        <View style={styles.blueStrip} />
        
        <View style={styles.cardMainWrapper}>
          {/* Top Row: Always Visible */}
          <View style={styles.cardTopRow}>
            <View style={styles.cardContent}>
              <View style={styles.row}>
                  <View style={{ flex: 1.5, paddingRight: 5 }}>
                      <Text style={styles.valTextBig} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.lblText}>Name</Text>
                  </View>
                  <View style={{ flex: 0.4 }}>
                      <Text style={styles.valText}>{item.age}</Text>
                      <Text style={styles.lblText}>Age</Text>
                  </View>
                  <View style={{ flex: 0.7 }}>
                      <Text style={styles.valText}>{item.gender}</Text>
                      <Text style={styles.lblText}>Gender</Text>
                  </View>
                  <View style={{ flex: 1.2 }}>
                      <Text style={styles.valText} numberOfLines={1}>{item.cell}</Text>
                      <Text style={styles.lblText}>Cell #</Text>
                  </View>
              </View>

              <View style={[styles.row, { marginTop: 8 }]}>
                  <View style={{ flex: 1.5 }}>
                      <Text style={styles.valText} numberOfLines={1}>{item.medical}</Text>
                      <Text style={styles.lblText}>Medical Condition</Text>
                  </View>
                  <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                      <View style={{ flex: 0.6 }}>
                          <Text style={styles.valText}>{item.pwd}</Text>
                          <Text style={styles.lblText}>Status</Text>
                      </View>
                      <View style={[styles.accountBadge, item.hasAccount ? styles.accountBadgeActive : styles.accountBadgeNone, { flex: 0.9 }]}>
                          <Text style={styles.accountBadgeText} numberOfLines={1}>{item.hasAccount ? 'Has Account' : 'No Account'}</Text>
                      </View>
                  </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditMemberModal(item)}>
                  <Image source={editIcon} style={styles.actionIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Image source={deleteIcon} style={[styles.actionIcon, { tintColor: '#FF3B30' }]} />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3FA9F5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* PROFILE HEADER */}
        <View style={styles.profileSection}>
            <View style={styles.imageContainer}>
                <Image 
                    source={profileImage ? { uri: profileImage } : defaultProfileImg} 
                    style={styles.mainProfilePic} 
                />
            </View>

            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>

                {/* Barangay Verification Badge */}
                <View style={[styles.verifiedBadge, user.isVerified ? styles.verifiedBadgeGreen : styles.verifiedBadgeOrange]}>
                    <Text style={[styles.verifiedDot, { color: user.isVerified ? '#28A745' : '#FFA500' }]}>●</Text>
                    <Text style={[styles.verifiedText, { color: user.isVerified ? '#1a7a35' : '#b36b00' }]}>
                        {user.isVerified ? 'Verified by Barangay' : 'Pending Verification'}
                    </Text>
                </View>

                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statVal}>{user.id}</Text>
                        <Text style={styles.statLbl}>Household ID</Text>
                    </View>
                    <View style={{ marginLeft: 15 }}>
                        <Text style={styles.statVal}>{user.age}</Text>
                        <Text style={styles.statLbl}>Age</Text>
                    </View>
                    <View style={{ marginLeft: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.statVal}>{user.number}</Text>
                            <TouchableOpacity onPress={openEditProfileModal}>
                                <Image source={editIcon} style={styles.smallEditIcon} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.statLbl}>Number</Text>
                    </View>
                </View>
                <Text style={styles.addressText}>{user.address}</Text>
            </View>
        </View>

        {/* HOUSEHOLD QR CODE */}
        {user.id && user.id !== '—' && (
          <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Household Check-In Code</Text>
            <QRCode value={user.id} size={180} color="black" backgroundColor="white" />
            <Text style={{ marginTop: 8, fontSize: 13, color: '#555' }}>Household ID: {user.id}</Text>
          </View>
        )}

        {/* HOUSEHOLD MEMBERS LIST */}
        <Text style={styles.sectionTitle}>Household Members:</Text>

        <View>
            {members.map(member => (
                <View key={member.id}>
                    {renderMemberItem({ item: member })}
                </View>
            ))}
        </View>

        {/* ADD MEMBER BUTTON */}
        <View style={styles.addBtnContainer}>
            <TouchableOpacity style={styles.addMemberBtn} onPress={openAddModal}>
                <Image source={addIcon} style={styles.btnIconWhite} />
                <Text style={styles.addMemberText}>Add Member</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.push('/')}>
            <Image source={logoutIcon} style={styles.btnIconBlue} />
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                    {isEditingProfile ? 'Edit Profile' : (isEditing ? 'Edit Member' : 'Add New Member')}
                </Text>
                
                <View style={styles.formContainer}>
                    
                    {/* IMAGE PICKER (Profile Only) */}
                    {isEditingProfile && (
                        <View style={styles.modalImageSection}>
                            <TouchableOpacity onPress={pickImage} style={styles.modalImageContainer}>
                                <Image 
                                    source={profileImage ? { uri: profileImage } : defaultProfileImg} 
                                    style={styles.modalProfileImage} 
                                />
                                <View style={styles.modalCameraBadge}>
                                    <Image source={imageIcon} style={styles.modalCameraIcon} />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.changePhotoText}>Change Photo</Text>
                        </View>
                    )}

                    {/* Full Name */}
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput 
                        style={styles.textInput}
                        value={formData.name}
                        onChangeText={(t) => setFormData({...formData, name: t})}
                        placeholder="Name"
                    />

                    {/* PROFILE SPECIFIC */}
                    {isEditingProfile && (
                        <>
                            <Text style={styles.label}>Household ID (Cannot be changed)</Text>
                            <TextInput 
                                style={[styles.textInput, styles.disabledInput]}
                                value={user.id} 
                                editable={false} 
                            />

                            <Text style={styles.label}>Address</Text>
                            <TextInput 
                                style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                                value={formData.address}
                                onChangeText={(t) => setFormData({...formData, address: t})}
                                placeholder="Full Address"
                                multiline
                            />
                        </>
                    )}

                    {/* Age & Gender/Number */}
                    <View style={styles.inputRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.age}
                                onChangeText={(t) => setFormData({...formData, age: t})}
                                placeholder="Age"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{width: 10}} /> 
                        
                        {isEditingProfile ? (
                             <View style={{flex: 1.5}}>
                                <Text style={styles.label}>Number</Text>
                                <TextInput 
                                    style={styles.textInput}
                                    value={formData.cell}
                                    onChangeText={(t) => setFormData({...formData, cell: t})}
                                    placeholder="Number"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        ) : (
                            <View style={{flex: 1}}>
                                <Text style={styles.label}>Gender</Text>
                                <TextInput 
                                    style={styles.textInput}
                                    value={formData.gender}
                                    onChangeText={(t) => setFormData({...formData, gender: t})}
                                    placeholder="M / F"
                                />
                            </View>
                        )}
                    </View>

                    {/* MEMBER ONLY FIELDS */}
                    {!isEditingProfile && (
                        <>
                            <Text style={styles.label}>Cellphone Number</Text>
                            <TextInput 
                                style={styles.textInput}
                                value={formData.cell}
                                onChangeText={(t) => setFormData({...formData, cell: t})}
                                placeholder="0912..."
                                keyboardType="phone-pad"
                            />

                            <View style={styles.inputRow}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.label}>Status/PWD</Text>
                                    
                                    {/* DROPDOWN SELECTOR */}
                                    <TouchableOpacity 
                                        style={styles.dropdownSelector} 
                                        onPress={() => setShowPwdDropdown(!showPwdDropdown)}
                                    >
                                        <Text style={styles.dropdownText}>{formData.pwd || 'Select'}</Text>
                                        <Text style={{fontSize: 10}}>▼</Text>
                                    </TouchableOpacity>

                                    {/* DROPDOWN OPTIONS */}
                                    {showPwdDropdown && (
                                        <View style={styles.dropdownOptions}>
                                            <TouchableOpacity 
                                                style={styles.dropdownOption}
                                                onPress={() => handleStatusSelect('PWD')}
                                            >
                                                <Text style={styles.optionText}>PWD</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={styles.dropdownOption}
                                                onPress={() => handleStatusSelect('NONE')}
                                            >
                                                <Text style={styles.optionText}>NONE</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                <View style={{width: 10}} /> 
                                
                                <View style={{flex: 1}}>
                                    <Text style={styles.label}>Medical</Text>
                                    <TextInput 
                                        style={[
                                            styles.textInput, 
                                            formData.pwd !== 'PWD' && styles.disabledInput
                                        ]}
                                        value={formData.medical}
                                        onChangeText={(t) => setFormData({...formData, medical: t})}
                                        placeholder="Specific Condition"
                                        editable={formData.pwd === 'PWD'} 
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {/* Buttons */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>
                            {isEditing || isEditingProfile ? 'Save Changes' : 'Add Member'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      <BottomNavbar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
            setActiveTab(tab);
            if(tab === 'home') router.push('/home');
        }} 
      />
    </View>
  );
};

export default ProfileScreen;