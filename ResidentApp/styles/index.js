import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    // Changed container to support ScrollView layout
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    innerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingBottom: 20, // Add padding at bottom for scrolling space
    },
    register: {
       flexDirection: 'row',
       justifyContent: 'center', 
       alignItems: 'center',
       marginTop: 20, 
       padding: 10,
       gap: 10, 
    },
    textStyle: {
        color: 'black', 
        fontSize: 14,
    },
    registerBtn: {
        fontWeight: 'bold',
        color: '#3FA9F5',
        fontSize: 16,
    },
    logoImg:{
      resizeMode:'contain',
      width: 250, 
      height: 200,
      marginTop: 20
    },
    image: {
      flex: 1,
    },
    loginBtn: {
      width: '50%',
      height: 50,
      backgroundColor: '#3FA9F5',
      justifyContent: 'center', 
      alignItems: 'center',
      borderRadius: 5,
      marginTop: 20, 
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    loginText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 35,
        color: '#3FA9F5',
        textShadowColor: 'rgba(0, 0, 0, 0.75)', 
        marginBottom: 20,
        textShadowOffset: { width: 0, height: 2 }, 
        textShadowRadius: 2, 
    },
    
    // --- WRAPPER STYLE ---
    inputWrapper: {
      flexDirection: 'row', 
      alignItems: 'center', 
      width: '60%',
      height: 50, 
      borderRadius: 10,
      paddingHorizontal: 15, 
      marginBottom: 15, 
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1, 
      shadowRadius: 4, 
      elevation: 3
    },
    icon: {
      width: 24, 
      height: 24,
      marginRight: 10, 
      tintColor: '#2F7FB8', 
      resizeMode: 'contain'
    },
    // New style for the eye icon touchable area
    eyeIcon: {
        padding: 5,
        marginLeft: 5,
    },
    input: {
      flex: 1,
      fontWeight: 'medium',
      fontSize: 16,
      height: '100%',
      color: '#000',
    },

    // --- HOUSEHOLD ROLE MODAL ---
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalSheet: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingBottom: 36,
      paddingTop: 12,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: '#ddd',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 13,
      color: '#666',
      marginBottom: 20,
    },
    roleList: {
      gap: 12,
      marginBottom: 24,
    },
    roleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: '#E0E0E0',
      backgroundColor: '#FAFAFA',
    },
    roleRadioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#bbb',
      justifyContent: 'center',
      alignItems: 'center',
    },
    roleRadioOuterSelected: {
      borderColor: '#3FA9F5',
    },
    roleRadioInner: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: '#3FA9F5',
    },
    roleLabel: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#000',
    },
    roleSublabel: {
      fontSize: 11,
      color: '#888',
      marginTop: 1,
    },
    modalContinueBtn: {
      height: 50,
      backgroundColor: '#3FA9F5',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    modalContinueText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    modalCancelBtn: {
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCancelText: {
      color: '#999',
      fontSize: 15,
      fontWeight: '600',
    },
});

export default styles;