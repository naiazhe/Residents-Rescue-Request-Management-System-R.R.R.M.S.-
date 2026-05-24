// styles/home.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  sosContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  
  // GLOW & BUTTON STYLES
  glowLayer4: { width: 275, height: 275, borderRadius: 275/2, backgroundColor: 'rgba(195, 228, 252, 0.25)', alignItems: 'center', justifyContent: 'center' },
  glowLayer3: { width: 250, height: 250, borderRadius: 250/2, backgroundColor: 'rgba(195, 228, 252, 0.50)', alignItems: 'center', justifyContent: 'center' },
  glowLayer2: { width: 215, height: 215, borderRadius: 215/2, backgroundColor: '#C3E4FC', alignItems: 'center', justifyContent: 'center' },
  sosButton: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#3FA9F5', alignItems: 'center', justifyContent: 'center', shadowColor: '#3FA9F5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  deactivatedButton: { backgroundColor: '#163B56', shadowColor: '#000' },
  sosText: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', letterSpacing: 4 },
  timerContainer: { alignItems: 'center', justifyContent: 'center' },
  timerText: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' },
  timerLabel: { fontSize: 14, color: '#A0B0C0', textTransform: 'uppercase', letterSpacing: 1 },
  handIconContainer: { position: 'absolute', bottom: 20, right: 30 },
  tapImage: { width: 100, height: 100, resizeMode: 'contain', position: 'absolute', bottom: -50, left: -20, transform: [{ rotate: '-22deg' }], tintColor: '#163B56' },
  instructionContainer: { alignItems: 'center', paddingHorizontal: 40, marginTop: 20 },
  instructionTitle: { fontSize: 18, fontWeight: '700', color: '#212121', textAlign: 'center', marginBottom: 8 },
  instructionSubtitle: { fontSize: 14, color: '#757575', textAlign: 'center' },
  screenContent: { alignItems: 'center', justifyContent: 'center' },
  screenTitle: { fontSize: 24, fontWeight: '700', color: '#212121', marginTop: 16, marginBottom: 8 },
  screenText: { fontSize: 16, color: '#757575', textAlign: 'center' },

  // --- MODAL BASICS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: 'black', marginBottom: 5 },
  modalSubtitle: { fontSize: 12, color: '#666', marginBottom: 20, lineHeight: 16 },
  
  // --- DEPLOYED MODAL STYLES ---
  deployedModalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    elevation: 20,
  },
  deployedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  deployedIcon: { width: 50, height: 50, tintColor: '#3FA9F5' },
  deployedTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  deployedSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  trackBtn: {
    width: '100%',
    backgroundColor: '#3FA9F5',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  trackBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  // --- ADDRESS SECTION STYLES ---
  addressSection: { marginBottom: 15 },
  addressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 8,
  },
  addrIcon: { width: 20, height: 20, tintColor:'#3FA9F5' },
  addressInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 8 },
  iconBtn: { padding: 8, backgroundColor: '#E1F5FE', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconImg: { width: 18, height: 18, tintColor: '#3FA9F5', resizeMode: 'contain' },

  // --- MEMBER TABLE ---
  tableHeader: { flexDirection: 'row', marginBottom: 10, paddingHorizontal: 5 },
  headerText: { fontSize: 12, fontWeight: 'bold', color: '#000', letterSpacing: 0.5 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  rowText: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  dimText: { color: '#ccc' },
  circleBtn: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#004d99', justifyContent: 'center', alignItems: 'center' },
  plusBtn: { borderColor: '#3FA9F5' },
  circleBtnText: { fontSize: 14, fontWeight: 'bold', color: '#004d99', lineHeight: 16 },
  plusBtnText: { color: '#3FA9F5' },
  
  // ADD MEMBER FORM
  addMemberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: '#F9FAFB', borderRadius: 8, marginTop: 10, gap: 5 },
  inputField: { borderBottomWidth: 1, borderBottomColor: '#CCC', fontSize: 13, paddingVertical: 2, color: '#333' },

  // BUTTONS
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginTop: 20 },
  modalBtn: { flex: 1, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  addBtn: { backgroundColor: '#3FA9F5' },
  confirmAddBtn: { backgroundColor: '#3FA9F5' },
  saveBtn: { backgroundColor: '#3FA9F5' },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#FF5252', elevation: 0 },
  cancelBtnText: { color: '#FF5252', fontWeight: 'bold', fontSize: 14 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // --- MAP MODAL STYLES ---
  mapModalContainer: { flex: 1, backgroundColor: 'white' },
  map: { width: '100%', height: '100%' },
  closeMapBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: 'white', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 5, zIndex: 10 },
  centerMarkerContainer: { position: 'absolute', top: '50%', left: '50%', marginTop: -32, marginLeft: -24, zIndex: 5 },
  centerMarker: { width: 48, height: 64, resizeMode: 'contain' },
  mapOverlayContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 10, alignItems: 'center' },
  mapAddressText: { fontSize: 13, color: '#555', marginBottom: 15, textAlign: 'center' },
  mapConfirmBtn: { backgroundColor: '#3FA9F5', paddingVertical: 12, width: '100%', borderRadius: 25, alignItems: 'center' },

  // --- BLOCKING OVERLAY (Phase 2: freeze background UI while location resolves) ---
  freezeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freezeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    elevation: 12,
  },
  freezeText: { marginTop: 14, fontSize: 14, color: '#333', fontWeight: '600' },
});

export default styles;