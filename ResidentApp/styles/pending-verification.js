import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  image: {
    flex: 1,
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
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  spinner: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#3FA9F5',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default styles;
