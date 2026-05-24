// styles/locator.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topAddressBar: {
    position: 'absolute',
    top: 110, 
    alignSelf: 'center',
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addressText: {
    fontSize: 13,
    color: '#8E5A5A', 
    textAlign: 'center',
    fontWeight: '500',
  },
  etaContainer: {
    position: 'absolute',
    bottom: 160, 
    alignSelf: 'center',
    backgroundColor: '#C3E4FC', 
    width: '70%',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  etaLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  etaTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  rescuerInfo: {
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
  },
  truckMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    elevation: 5,
  },

  // --- REPORT MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportModalContent: {
    width: '95%', // Slightly wider to fit row content
    height: '75%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalScrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
    marginTop: 5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // --- MEMBER LIST & DROPDOWN STYLES ---
  memberListContainer: {
    marginBottom: 15,
  },
  memberRow: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
    // Flex column ensures the list drops DOWN, not sideways
    flexDirection: 'column', 
  },
  // NEW: Holds the Name and the Trigger Button in one row
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Takes up remaining space
    marginRight: 10, // Space between name and dropdown
  },
  dropdownHeader: {
    width: 160, // Fixed width for cleaner alignment
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
  },
  dropdownHeaderText: {
    fontSize: 13,
    color: '#333',
    flex: 1, // Ensures text doesn't push icon out
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 5,
  },
  dropdownList: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  dropdownItem: {
    paddingVertical: 10, // Slightly tighter padding
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#555',
  },
  dropdownItemSelected: {
    backgroundColor: '#E1F5FE',
  },
  dropdownItemTextSelected: {
    color: '#3FA9F5',
    fontWeight: 'bold',
  },

  // --- INPUT & BUTTONS ---
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 20,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#3FA9F5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default styles;