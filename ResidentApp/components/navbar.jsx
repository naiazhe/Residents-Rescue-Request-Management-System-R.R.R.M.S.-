import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; 

// Import your local icons
import locatorIcon from '../assets/icons/location-normal.png'; 
import evacuationIcon from '../assets/icons/house-normal.png'; 
import centralIcon from '../assets/icons/sos-active.png'; 

const Navbar = ({ activeTab }) => {
  const router = useRouter(); 

  const handlePress = (tabName) => {
    if (activeTab === tabName) return;

    switch (tabName) {
      case 'location':
        // CORRECT: Navigates to app/locator.jsx (Map with Search)
        router.push('/locator'); 
        break;
        
      case 'home':
        router.push('/home');     
        break;
        
      case 'emergency':
        // CORRECT: Navigates to app/evacuation.jsx (Route & ETA)
        router.push('/evacuation'); 
        break;
        
      default:
        break;
    }
  };

  const renderTab = (tabName, label, iconSource) => {
    const isActive = activeTab === tabName;

    return (
      <TouchableOpacity
        style={isActive ? styles.floatingButtonContainer : styles.navItem}
        onPress={() => handlePress(tabName)} 
        activeOpacity={0.9}
      >
        <View style={[
            isActive ? styles.floatingButtonCircle : styles.iconContainer,
            isActive && styles.activeFloatingButton
        ]}>
          <Image 
            source={iconSource} 
            style={[
              isActive ? styles.activeIcon : styles.icon, 
              { tintColor: isActive ? '#2196F3' : '#9E9E9E' }
            ]} 
          />
        </View>

        {!isActive && (
          <Text style={styles.navLabel}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bottomNav}>
      <View style={styles.navContainer}>
        {renderTab('location', 'Locator', locatorIcon)}
        {renderTab('home', 'SOS', centralIcon)}
        {renderTab('emergency', 'Evacuation', evacuationIcon)}
      </View>
    </View>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 140, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', 
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    height: '80%',
    paddingBottom: 20, 
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  navLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  floatingButtonContainer: {
    alignItems: 'center',
    marginTop: -60, 
    flex: 1,
  },
  floatingButtonCircle: {
    width: 80,  
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    borderWidth: 5, 
    borderColor: '#F5F5F5', 
  },
  activeFloatingButton: {
    backgroundColor: '#E3F2FD', 
    borderColor: '#FFFFFF', 
  },
  activeIcon: {
    width: 45,  
    height: 45,
    resizeMode: 'contain',
  },
});