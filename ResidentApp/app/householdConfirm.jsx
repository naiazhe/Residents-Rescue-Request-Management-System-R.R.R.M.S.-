import React, { useState } from 'react';
import {
  TouchableOpacity, Text, View, Image, ImageBackground,
  Alert, FlatList, Modal, TextInput, StyleSheet, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import styles from '../styles/householdConfirm';
import Logo from '../assets/img/BADGE.png';
import bg from '../assets/img/LANDING.jpg';
import backIcon from '../assets/icons/back.png';
import editIcon from '../assets/icons/edit.png';
import deleteIcon from '../assets/icons/delete-outline.png';

// ── helpers ──────────────────────────────────────────────────────────────────

const calcAge = (birthdate) => {
  if (!birthdate) return '?';
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

// Build the Household Head entry from signupData JSON
const buildHeadEntry = (raw) => {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const name = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
  const vulns = Array.isArray(data.vulnerabilities) ? data.vulnerabilities : [];
  return {
    id:         'head',
    name,
    age:        calcAge(data.birthdate),
    gender:     capitalize(data.sex),
    medical:    vulns.length > 0 ? vulns.join(', ') : 'None',
    cell:       data.mobileNumber || '',
    pwd:        vulns.length > 0 ? 'PWD' : 'NONE',
    isMainUser: true,
  };
};

// ── Radio button (reused from householdMember) ────────────────────────────────
const RadioButton = ({ label, value, selectedValue, onSelect }) => {
  const isSelected = value === selectedValue;
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}
      onPress={() => onSelect(value)}
    >
      <View style={[
        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#666',
          justifyContent: 'center', alignItems: 'center', marginRight: 6 },
        isSelected && { borderColor: '#3FA9F5' },
      ]}>
        {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#3FA9F5' }} />}
      </View>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const HouseholdSummary = () => {
  const router = useRouter();
  const { signupData, membersData } = useLocalSearchParams();

  const [members, setMembers] = useState(() => {
    // Always show head first, then added members
    const head = signupData ? buildHeadEntry(signupData) : null;
    let added = [];
    try { added = membersData ? JSON.parse(membersData) : []; } catch { added = []; }
    return head ? [head, ...added] : added;
  });

  // ── Edit modal state ─────────────────────────────────────────────────────
  const [editVisible,  setEditVisible]  = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);   // member being edited
  const [editForm,     setEditForm]     = useState({});
  const [showPicker,   setShowPicker]   = useState(false);
  const [editDate,     setEditDate]     = useState(new Date());
  const [editHasDate,  setEditHasDate]  = useState(false);

  const openEdit = (member) => {
    setEditTarget(member);
    setEditForm({
      name:    member.name,
      age:     member.age,
      gender:  member.gender,
      cell:    member.cell,
      medical: member.medical,
      pwd:     member.pwd,
    });
    setEditHasDate(false);
    setEditVisible(true);
  };

  const handleEditSave = () => {
    if (!editForm.name?.trim()) {
      Alert.alert('Missing Info', 'Name is required.');
      return;
    }
    setMembers(prev =>
      prev.map(m => m.id === editTarget.id ? { ...m, ...editForm } : m)
    );
    setEditVisible(false);
  };

  const onPickDate = (event, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) {
      setEditDate(selected);
      setEditHasDate(true);
      const age = String(new Date().getFullYear() - selected.getFullYear());
      setEditForm(f => ({ ...f, age }));
    }
  };

  const formatDate = (d) =>
    `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (id, isMainUser) => {
    if (isMainUser) {
      Alert.alert('Action not allowed', 'You cannot delete the primary user.');
      return;
    }
    Alert.alert('Confirm Delete', 'Remove this member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => setMembers(prev => prev.filter(m => m.id !== id)),
      },
    ]);
  };

  const handleNext    = () => router.push({ pathname: '/register', params: { signupData } });
  const handleAddMore = () => {
    // Pass only the non-head members back so householdMember can append
    const addedOnly = members.filter(m => !m.isMainUser);
    router.push({
      pathname: '/householdMember',
      params: { signupData, membersData: JSON.stringify(addedOnly) },
    });
  };

  // ── Render card ──────────────────────────────────────────────────────────
  const renderMemberCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.leftBorder} />

      <View style={styles.cardContent}>
        {/* Row 1: name + tag */}
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.valueTextBig}>{item.name}</Text>
            {item.isMainUser && <Text style={styles.mainTag}>Household Head</Text>}
            <Text style={styles.labelText}>{item.age} yrs • {item.gender}</Text>
          </View>
        </View>

        {/* Row 2: contact / medical / pwd — each with fixed flex so nothing gets cut */}
        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={{ flex: 1.2 }}>
            <Text style={styles.labelText}>Contact</Text>
            <Text style={styles.valueText} numberOfLines={1}>{item.cell || '—'}</Text>
          </View>
          <View style={{ flex: 1.3 }}>
            <Text style={styles.labelText}>Medical</Text>
            <Text style={styles.valueText} numberOfLines={2}>{item.medical || 'None'}</Text>
          </View>
          <View style={{ flex: 0.7 }}>
            <Text style={styles.labelText}>PWD</Text>
            <Text style={styles.valueText}>{item.pwd || 'NONE'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
          <Image source={editIcon} style={styles.actionIconImage} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          disabled={item.isMainUser}
          onPress={() => handleDelete(item.id, item.isMainUser)}
        >
          <Image
            source={deleteIcon}
            style={[
              styles.actionIconImage,
              { tintColor: '#D32F2F' },
              item.isMainUser && { opacity: 0.3, tintColor: 'gray' },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.addBtn} onPress={handleAddMore}>
        <Text style={styles.addBtnText}>Add Member</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <ImageBackground source={bg} resizeMode="cover" style={styles.image}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Image source={backIcon} style={styles.backIcon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Image source={Logo} style={styles.logoImg} />
      </View>

      <Text style={styles.title}>Household Information</Text>

      <FlatList
        data={members}
        renderItem={renderMemberCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Edit Modal ── */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={editStyles.overlay}>
          <View style={editStyles.sheet}>
            <Text style={editStyles.title}>Edit Member</Text>

            <Text style={editStyles.label}>Full Name</Text>
            <TextInput
              style={editStyles.input}
              value={editForm.name}
              onChangeText={t => setEditForm(f => ({ ...f, name: t }))}
              placeholder="Full Name"
            />

            {/* Age via date picker */}
            <Text style={editStyles.label}>Birthdate (updates Age)</Text>
            <TouchableOpacity style={editStyles.input} onPress={() => setShowPicker(true)}>
              <Text style={{ color: editHasDate ? '#000' : '#888' }}>
                {editHasDate ? formatDate(editDate) : `Current age: ${editForm.age}`}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker value={editDate} mode="date" display="default" onChange={onPickDate} />
            )}

            {/* Gender */}
            <Text style={editStyles.label}>Gender</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <RadioButton label="Male"   value="Male"   selectedValue={editForm.gender} onSelect={v => setEditForm(f => ({ ...f, gender: v }))} />
              <RadioButton label="Female" value="Female" selectedValue={editForm.gender} onSelect={v => setEditForm(f => ({ ...f, gender: v }))} />
            </View>

            <Text style={editStyles.label}>Contact Number</Text>
            <TextInput
              style={editStyles.input}
              value={editForm.cell}
              onChangeText={t => setEditForm(f => ({ ...f, cell: t.replace(/[^0-9]/g, '') }))}
              placeholder="09..."
              keyboardType="number-pad"
              maxLength={11}
            />

            {/* PWD */}
            <Text style={editStyles.label}>PWD / Disability Status</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <RadioButton label="PWD"  value="PWD"  selectedValue={editForm.pwd} onSelect={v => setEditForm(f => ({ ...f, pwd: v, medical: f.medical === 'None' ? '' : f.medical }))} />
              <RadioButton label="None" value="NONE" selectedValue={editForm.pwd} onSelect={v => setEditForm(f => ({ ...f, pwd: v, medical: 'None' }))} />
            </View>

            {/* Medical — only editable when PWD */}
            <Text style={editStyles.label}>Medical Condition (if PWD)</Text>
            <TextInput
              style={[editStyles.input, editForm.pwd !== 'PWD' && editStyles.disabled]}
              value={editForm.medical}
              onChangeText={t => setEditForm(f => ({ ...f, medical: t }))}
              placeholder="Specify condition"
              editable={editForm.pwd === 'PWD'}
            />

            <View style={editStyles.btnRow}>
              <TouchableOpacity style={editStyles.cancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={editStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={editStyles.saveBtn} onPress={handleEditSave}>
                <Text style={editStyles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const editStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    marginBottom: 2,
  },
  disabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    color: '#aaa',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1, height: 46, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtn: {
    flex: 1, height: 46, borderRadius: 8,
    backgroundColor: '#3FA9F5',
    justifyContent: 'center', alignItems: 'center',
  },
  cancelText: { color: '#555', fontWeight: 'bold' },
  saveText:   { color: 'white', fontWeight: 'bold' },
});

export default HouseholdSummary;
