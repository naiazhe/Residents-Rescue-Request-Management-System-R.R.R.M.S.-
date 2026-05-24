import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 5,
    tintColor: '#3FA9F5',
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3FA9F5',
  },
  logoImg: {
    resizeMode: 'contain',
    width: 150,
    height: 80,
    marginTop: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 15,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },

  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 50,
  },

  // --- CARD ---
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF8FD',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  leftBorder: {
    width: 6,
    backgroundColor: '#2F7FB8',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cell: {
    flex: 1,
  },
  valueTextBig: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
  },
  valueText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#222',
  },
  labelText: {
    fontSize: 10,
    color: '#777',
    marginTop: 1,
  },
  mainTag: {
    color: '#2F7FB8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },

  // --- ACTIONS ---
  actionContainer: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 12,
    paddingRight: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#D0E8F5',
  },
  iconBtn: {
    padding: 6,
  },
  actionIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#2F7FB8',
  },

  // --- FOOTER BUTTONS ---
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  addBtn: {
    flex: 1,
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#2F7FB8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#2F7FB8',
    fontWeight: 'bold',
    fontSize: 15,
  },
  nextBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#3FA9F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  nextBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default styles;
