import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 5,
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoImg: {
    resizeMode: 'contain',
    width: 150,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#3FA9F5',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 22,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  // --- OTP BOXES ---
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: '#3FA9F5',
  },

  // --- RESEND ---
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendLabel: {
    fontSize: 13,
    color: '#444',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3FA9F5',
  },
  resendCountdown: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#999',
  },

  // --- VERIFY BUTTON ---
  verifyBtn: {
    width: '60%',
    height: 50,
    backgroundColor: '#3FA9F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  verifyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default styles;
