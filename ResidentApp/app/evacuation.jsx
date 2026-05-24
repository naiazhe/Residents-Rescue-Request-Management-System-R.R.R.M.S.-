import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  Text
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import BottomNavbar from '../components/navbar';
import Header from '../components/header';

// --- IMPORT STYLES ---
import styles from '../styles/evacuation';

// --- ICONS ---
import evacuationIcon from '../assets/icons/house-normal.png';
import pin from '../assets/icons/pin.png';
import searchIcon from '../assets/icons/search-line.png';

// --- ICONS FOR CARD ---
import closeIcon from '../assets/icons/close.png';
import navIcon from '../assets/icons/send.png';
import bedIcon from '../assets/icons/bed.png';
import medicIcon from '../assets/icons/medic.png';
import showerIcon from '../assets/icons/shower.png';

const { width, height } = Dimensions.get('window');

const Locator = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  
  // State to control map region dynamically
  const [region, setRegion] = useState({
    latitude: 13.6370,
    longitude: 123.1950,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const evacuationCenters = [
    {
      id: 1,
      title: 'CSNHS',
      coords: { latitude: 13.6350, longitude: 123.1920 },
      capacity: { max: 200, current: 150 },
      details: { shower: 5, sleeping: 15, health: 2 }
    },
    {
      id: 2,
      title: 'Naga City Gym',
      coords: { latitude: 13.6390, longitude: 123.1980 },
      capacity: { max: 300, current: 50 },
      details: { shower: 10, sleeping: 30, health: 4 }
    },
    {
      id: 3,
      title: 'San Felipe Brgy Hall',
      coords: { latitude: 13.6410, longitude: 123.1910 },
      capacity: { max: 100, current: 90 },
      details: { shower: 3, sleeping: 10, health: 1 }
    },
  ];

  const handleMarkerPress = (facility) => {
    setSelectedFacility(facility);
  };

  const openNavigation = (lat, long, label) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${long}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url);
  };

  // --- SEARCH FUNCTIONALITY ---
  const handleSearch = () => {
    const foundCenter = evacuationCenters.find(center => 
        center.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundCenter) {
        // Move map to location
        setRegion({
            latitude: foundCenter.coords.latitude,
            longitude: foundCenter.coords.longitude,
            latitudeDelta: 0.005, // Zoom in closer
            longitudeDelta: 0.005,
        });
        // Open popup details
        handleMarkerPress(foundCenter);
    } else {
        Alert.alert("Not Found", "No evacuation center found with that name.");
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 1. MAP (Background) */}
      <MapView
        style={styles.map}
        region={region} 
        onRegionChangeComplete={(r) => setRegion(r)} 
        onPress={() => setSelectedFacility(null)} 
      >
        <Marker coordinate={{ latitude: 13.6370, longitude: 123.1950 }}>
          <Image source={pin} style={styles.pinIcon} resizeMode="contain" />
        </Marker>

        {evacuationCenters.map((center) => (
          <Marker
            key={center.id}
            coordinate={center.coords}
            onPress={(e) => {
                e.stopPropagation();
                handleMarkerPress(center);
            }}
          >
            <Image 
              source={evacuationIcon} 
              style={{ width: 35, height: 35, tintColor: selectedFacility?.id === center.id ? '#D32F2F' : '#3FA9F5' }} 
              resizeMode="contain" 
            />
          </Marker>
        ))}
      </MapView>

      {/* 2. Header */}
      <Header />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search location..."
          onSubmitEditing={handleSearch} 
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
             <Image source={searchIcon} style={styles.searchIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* 3. DETAILS CARD (Replaces Modal) */}
      {selectedFacility && (
        <View style={styles.detailsCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedFacility(null)}>
                <Image source={closeIcon} style={{width: 15, height: 15, tintColor: '#999'}} />
            </TouchableOpacity>

            <View style={styles.cardHeader}>
                <Text style={styles.facilityName}>{selectedFacility.title}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>OPEN</Text>
                </View>
            </View>

            {/* Capacity Bar */}
            <View style={styles.capacityContainer}>
                <View style={styles.capacityLabels}>
                    <Text style={styles.capLabel}>Occupancy</Text>
                    <Text style={styles.capValue}>
                        {selectedFacility.capacity.current} / {selectedFacility.capacity.max}
                    </Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View 
                        style={[
                            styles.progressBarFill, 
                            { 
                                width: `${(selectedFacility.capacity.current / selectedFacility.capacity.max) * 100}%`,
                                backgroundColor: (selectedFacility.capacity.current / selectedFacility.capacity.max) > 0.8 ? '#FF5252' : '#4CAF50'
                            }
                        ]} 
                    />
                </View>
            </View>

            {/* Amenities Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Image source={bedIcon} style={styles.statImageIcon} resizeMode="contain" />
                    <Text style={styles.statNumber}>{selectedFacility.details.sleeping}</Text>
                    <Text style={styles.statLabel}>Beds</Text>
                </View>
                <View style={styles.statItem}>
                    <Image source={showerIcon} style={styles.statImageIcon} resizeMode="contain" />
                    <Text style={styles.statNumber}>{selectedFacility.details.shower}</Text>
                    <Text style={styles.statLabel}>Showers</Text>
                </View>
                <View style={styles.statItem}>
                    <Image source={medicIcon} style={styles.statImageIcon} resizeMode="contain" />
                    <Text style={styles.statNumber}>{selectedFacility.details.health}</Text>
                    <Text style={styles.statLabel}>Medics</Text>
                </View>
            </View>

            {/* Navigation Button */}
            <TouchableOpacity 
                style={styles.navButton}
                onPress={() => openNavigation(selectedFacility.coords.latitude, selectedFacility.coords.longitude, selectedFacility.title)}
            >
                <Text style={styles.navButtonText}>Get Directions</Text>
                <Image source={navIcon} style={styles.navIcon} resizeMode="contain"/>
            </TouchableOpacity>
        </View>
      )}

      {/* Navbar (Active: Emergency) */}
      <BottomNavbar activeTab="emergency" />

    </View>
  );
};

export default Locator;