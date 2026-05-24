import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

import bellIcon from '../assets/icons/notification-bell.png';
import { getResidentNotifications, markNotificationRead } from '../services/api';
import { getSession } from '../services/session';

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const Header = () => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    const session = getSession();
    if (!session?.residentId) return;
    getResidentNotifications(session.residentId)
      .then(data => setNotifications(data))
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleBellPress = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next && unreadCount > 0) {
      notifications
        .filter(n => !n.is_read)
        .forEach(n => markNotificationRead(n.notification_id).catch(() => {}));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  return (
    <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
            {/* 1. PROFILE PICTURE */}
            <TouchableOpacity onPress={() => router.push('/profile')}>
                <View style={styles.profilePic} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>NagaRescue</Text>
            
            {/* 2. NOTIFICATION BELL */}
            <TouchableOpacity
                style={styles.notificationIcon}
                onPress={handleBellPress}
            >
                {/* Icon changes color when clicked (active) */}
                <Image 
                  source={bellIcon} 
                  style={[
                    styles.icon, 
                    showNotifications && styles.iconActive // Apply active style if open
                  ]} 
                />
                
                {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                </View>
                )}
            </TouchableOpacity>
        </View>

        {/* 3. DROPDOWN */}
        {showNotifications && (
            <View style={styles.dropdownContainer}>
                <View style={styles.triangle} />

                <Text style={styles.dropdownTitle}>Notification</Text>
                {/* Dynamic Date */}
                <Text style={styles.dropdownDate}>{currentDate}</Text>

                <ScrollView style={styles.notifList} nestedScrollEnabled>
                    {notifications.length === 0 ? (
                      <Text style={{ textAlign: 'center', color: '#999', fontSize: 12, paddingVertical: 8 }}>
                        No notifications yet.
                      </Text>
                    ) : (
                      notifications.map((item) => (
                        <View key={item.notification_id} style={styles.notifItem}>
                            <View style={styles.statusCircle} />
                            <View style={styles.textColumn}>
                                <Text style={styles.levelText}>Rescue</Text>
                                <Text style={styles.messageText}>{item.message}</Text>
                            </View>
                            <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
                        </View>
                      ))
                    )}
                </ScrollView>
            </View>
        )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 100, 
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50, 
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BDBDBD', 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#000', // Default color (Black)
  },
  // New style for active state
  iconActive: {
    tintColor: '#3FA9F5', // Changes to Blue when active
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // --- DROPDOWN STYLES ---
  dropdownContainer: {
    position: 'absolute',
    top: 85,
    right: 15,
    width: 220, 
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 101,
  },
  triangle: {
    position: 'absolute',
    top: -8,
    right: 18,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  dropdownTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 0,
  },
  dropdownDate: {
    fontSize: 12, 
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
    opacity: 0.7,
  },
  notifList: {
    maxHeight: 200, 
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CBEAFE', 
    borderRadius: 12,
    paddingVertical: 8, 
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  statusCircle: {
    width: 14, 
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFF59D',
    marginRight: 8,
  },
  textColumn: {
    flex: 1,
  },
  levelText: {
    fontSize: 15, 
    fontWeight: 'bold',
    color: '#102A43',
  },
  messageText: {
    fontSize: 10, 
    color: '#334E68',
    marginTop: -1,
  },
  timeText: {
    fontSize: 10, 
    fontWeight: 'bold',
    color: '#102A43',
    marginLeft: 5,
  },
});