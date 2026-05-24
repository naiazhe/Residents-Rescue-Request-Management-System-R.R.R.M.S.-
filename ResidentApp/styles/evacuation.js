import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // --- SEARCH BAR STYLE ---
  searchContainer: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, 
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0', 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  searchInput: {
    flex: 1, 
    height: 40,
    fontSize: 13, 
    color: '#333', 
    fontWeight: '500', 
  },
  searchIconContainer: {
    padding: 5,
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: '#163B56', 
  },
  pinIcon: {
    width: 40,
    height: 40,
  },

  // --- DETAILS CARD STYLES ---
  detailsCard: {
    position: 'absolute',
    bottom: 85, 
    left: 10, 
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingRight: 20, 
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A3B5D',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Capacity Bar
  capacityContainer: {
    marginBottom: 20,
  },
  capacityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  capLabel: { fontSize: 12, color: '#666' },
  capValue: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F1F1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statImageIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
    tintColor: '#333', 
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },

  // Action Button
  navButton: {
    backgroundColor: '#3FA9F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  navButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 10,
  },
  navIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFF',
  },
});

export default styles;