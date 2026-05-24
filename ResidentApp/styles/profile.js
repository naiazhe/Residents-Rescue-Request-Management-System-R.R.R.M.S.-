import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60, 
    paddingBottom: 160, 
  },
  
  // --- Profile Header ---
  profileSection: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'center',
  },
  imageContainer: {},
  mainProfilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd',
    resizeMode: 'cover',
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  statVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  statLbl: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  smallEditIcon: {
    width: 20,
    height: 20,
    marginLeft: 5,
    tintColor: '#2F7FB8', 
    resizeMode: 'contain',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },

  // --- Verification Badge ---
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
  },
  verifiedBadgeGreen: {
    backgroundColor: '#E6F9EE',
  },
  verifiedBadgeOrange: {
    backgroundColor: '#FFF4E5',
  },
  verifiedDot: {
    fontSize: 8,
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },

  // --- Account Badge (on member cards) ---
  accountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  accountBadgeActive: {
    backgroundColor: '#D4EDDA',
  },
  accountBadgeNone: {
    backgroundColor: '#E9ECEF',
  },
  accountBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#555',
  },

  // --- List Section ---
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  
  // --- CARD STYLES ---
  card: {
    flexDirection: 'row',
    backgroundColor: '#EFF8FD', 
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  blueStrip: {
    width: 8,
    backgroundColor: '#2F7FB8', 
  },
  cardMainWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  cardTopRow: {
    flexDirection: 'row',
    width: '100%',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8, 
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  valTextBig: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  valText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  lblText: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  
  // --- Actions ---
  actions: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column', 
    gap: 15,
    paddingRight: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#D0E8F8', // Adjusted to match theme better
  },
  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#2F7FB8', 
  },

  // --- EXPANDED QR SECTION ---
  expandedSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#D0E8F8', 
    backgroundColor: '#EFF8FD',
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  memberCodeVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  memberCodeLbl: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // --- BUTTONS ---
  addBtnContainer: {
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 40,
  },
  addMemberBtn: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#3FA9F5', 
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addMemberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5, 
  },
  
  logoutBtn: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#3FA9F5', 
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#002E4D', 
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  btnIconWhite: {
      width: 25,
      height: 25,
      tintColor: 'white',
      resizeMode: 'contain',
  },
  btnIconBlue: {
      width: 25,
      height: 25,
      tintColor: '#002E4D', 
      resizeMode: 'contain',
  },

  // ============================
  // --- MODAL STYLES ---
  // ============================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3FA9F5', 
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  
  // MODAL IMAGE STYLES
  modalImageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImageContainer: {
    position: 'relative',
  },
  modalProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DDD',
    resizeMode: 'cover',
  },
  modalCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: '#3FA9F5',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalCameraIcon: {
    width: 16,
    height: 16,
    tintColor: 'white',
    resizeMode: 'contain',
  },
  changePhotoText: {
    marginTop: 8,
    color: '#3FA9F5',
    fontSize: 14,
    fontWeight: '600',
  },

  // Inputs
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 14,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#EAEAEA',
    color: '#A0A0A0',
    borderColor: '#D0D0D0',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10, 
  },
  
  // Dropdown Styles
  dropdownSelector: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42, 
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 65, 
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1000, 
  },
  dropdownOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },

  // Buttons
  saveButton: {
    backgroundColor: '#3FA9F5', 
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    zIndex: 1, 
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 5,
    zIndex: 1,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default styles;