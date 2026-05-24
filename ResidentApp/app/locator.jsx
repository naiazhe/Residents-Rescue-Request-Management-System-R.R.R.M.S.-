// app/locator.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Dimensions, 
  Image, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router'; 
import MapView, { Marker, Polyline } from 'react-native-maps';

import BottomNavbar from '../components/navbar';
import Header from '../components/header';

// --- IMPORT STYLES ---
import styles from '../styles/locator';

import pinIcon from '../assets/icons/pin.png'; 

const Locator = () => {
  const router = useRouter(); 
  
  // Mock Coordinates
  const userLocation = { latitude: 13.6370, longitude: 123.1950 };
  const rescuerLocation = { latitude: 13.6340, longitude: 123.1930 };
  
  const mapRegion = {
    latitude: 13.6355, 
    longitude: 123.1940,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  const routeCoordinates = [
    userLocation,
    { latitude: 13.6360, longitude: 123.1950 }, 
    { latitude: 13.6350, longitude: 123.1935 }, 
    rescuerLocation,
  ];

  // --- MOCK HOUSEHOLD DATA ---
  const householdMembers = [
    { id: '1', name: 'Juan Dela Cruz (Head)' },
    { id: '2', name: 'Maria Dela Cruz' },
    { id: '3', name: 'Baby Dela Cruz' },
    { id: '4', name: 'Lolo Dela Cruz' },
  ];

  const STATUS_OPTIONS = ['Rescued', 'Not Rescue', 'Transfer to Hospital', 'Injured'];

  // --- REPORT MODAL STATE ---
  const [showReportModal, setShowReportModal] = useState(false);
  const [rescueNotes, setRescueNotes] = useState('');

  // State to hold status for each member
  const [memberStatuses, setMemberStatuses] = useState({});
  // State to track which dropdown is currently open
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const initialStatuses = {};
    householdMembers.forEach(member => {
        initialStatuses[member.id] = 'Rescued'; 
    });
    setMemberStatuses(initialStatuses);
  }, []);

  // --- 10 SECOND TIMER ---
  useEffect(() => {
    const timer = setTimeout(() => {
        setShowReportModal(true);
    }, 10000); 

    return () => clearTimeout(timer); 
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleStatusSelect = (memberId, status) => {
    setMemberStatuses(prev => ({ ...prev, [memberId]: status }));
    setOpenDropdownId(null); 
  };

  const handleSubmitReport = () => {
    console.log("Report Data:", { memberStatuses, rescueNotes });

    Alert.alert("Report Submitted", "Thank you for your feedback!", [
        { text: "OK", onPress: () => {
            setShowReportModal(false);
            router.push('/home'); 
        }}
    ]);
  };

  return (
    <View style={styles.container}>
      
      {/* 1. MAP (Background) */}
      <MapView
        style={styles.map}
        initialRegion={mapRegion}
      >
        <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF3B30" 
            strokeWidth={3}
        />

        <Marker coordinate={userLocation}>
            <Image source={pinIcon} style={{width: 40, height: 40}} resizeMode="contain" />
        </Marker>

        <Marker coordinate={rescuerLocation}>
            <View style={styles.truckMarker}>
                <Text style={{fontSize: 20}}>🚑</Text> 
            </View>
        </Marker>
      </MapView>

      {/* 2. Header */}
      <Header />

      {/* Top Address Bar */}
      <View style={styles.topAddressBar}>
        <Text style={styles.addressText} numberOfLines={1}>
            6th Street, Cokeville Zone 6, San Felipe, Naga City
        </Text>
      </View>

      {/* ETA Popup */}
      <View style={styles.etaContainer}>
          <Text style={styles.etaLabel}>Estimated Time of Arrival</Text>
          <Text style={styles.etaTime}>5 mins</Text>
          <Text style={styles.rescuerInfo}>Rescuer: Alpha Team (Boat 01)</Text>
      </View>

      {/* --- RESCUE REPORT MODAL --- */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}} 
      >
        <View style={styles.modalOverlay}>
            <View style={styles.reportModalContent}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalScrollContainer}
                >
                    <Text style={styles.modalTitle}>Rescue Completed?</Text>
                    <Text style={styles.modalSubtitle}>Please update the status for each member.</Text>

                    {/* MEMBER LIST & DROPDOWNS */}
                    <View style={styles.memberListContainer}>
                        {householdMembers.map((member) => (
                            <View key={member.id} style={styles.memberRow}>
                                
                                {/* Header Row: Name | Status Dropdown */}
                                <View style={styles.memberHeader}>
                                    <Text style={styles.memberName} numberOfLines={2}>
                                        {member.name}
                                    </Text>
                                    
                                    <TouchableOpacity 
                                        style={styles.dropdownHeader} 
                                        onPress={() => toggleDropdown(member.id)}
                                    >
                                        <Text style={styles.dropdownHeaderText} numberOfLines={1}>
                                            {memberStatuses[member.id] || 'Select'}
                                        </Text>
                                        <Text style={styles.dropdownIcon}>
                                            {openDropdownId === member.id ? '▲' : '▼'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Dropdown Options List (Appears Below) */}
                                {openDropdownId === member.id && (
                                    <View style={styles.dropdownList}>
                                        {STATUS_OPTIONS.map((option) => (
                                            <TouchableOpacity 
                                                key={option}
                                                style={[
                                                    styles.dropdownItem,
                                                    memberStatuses[member.id] === option && styles.dropdownItemSelected
                                                ]}
                                                onPress={() => handleStatusSelect(member.id, option)}
                                            > 
                                                <Text style={[
                                                    styles.dropdownItemText,
                                                    memberStatuses[member.id] === option && styles.dropdownItemTextSelected
                                                ]}>
                                                    {option}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Notes Input */}
                    <Text style={styles.fieldLabel}>Notes / Remarks:</Text>
                    <TextInput 
                        style={styles.notesInput}
                        multiline
                        numberOfLines={3}
                        placeholder="Optional details..."
                        value={rescueNotes}
                        onChangeText={setRescueNotes}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReport}>
                        <Text style={styles.submitBtnText}>Submit Report</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </View>
      </Modal>

      <BottomNavbar />
    </View>
  );
};

export default Locator;