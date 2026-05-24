import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center', 
        justifyContent: 'flex-start',
        padding: 30, 
        paddingTop: 30,
    },
    logoImg: {
        resizeMode: 'contain',
        width: 150, 
        height: 100,
        marginTop: 20
    },
    title: {
        alignSelf: 'flex-start',
        fontWeight: 'bold',
        fontSize: 25,
        color: 'black',
        marginTop: 10,
        marginBottom: 5,
    },
    // --- NEW LABEL STYLE ---
    errorLabel: {
        alignSelf: 'flex-start',
        color: 'red',
        fontSize: 12,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    nameIn: {
        height: 40,
        width: '100%',
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white',
    },
    
    // --- ROW STYLES (Date/Gender & Address/Brgy) ---
    rowWrapper: {
        flexDirection: 'row', 
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
        gap: 10, 
    },
    
    // Date Input
    dateInputHalf: {
        flex: 1, 
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    dateText: {
        fontSize: 14, 
        color: 'black',
    },

    // Gender Styles
    genderGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end', 
    },
    genderLabel: {
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Address & Picker Styles
    addressInput: {
        flex: 2, 
        height: 50, 
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white',
    },
    pickerContainer: {
        flex: 1.5, 
        height: 50, 
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: 'white',
        justifyContent: 'center', 
        overflow: 'hidden', 
    },
    picker: {
        width: '100%',
        height: 50,
        color: 'black',
    },

    // --- MEDICAL RECORD STYLES ---
    medRecContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
    },
    medRecLabel: {
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 5, 
        textAlign: 'left',
    },
    medRecButtonsRow: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'flex-start', 
        gap: 20, 
    },
    
    // --- RADIO BUTTON STYLES ---
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10, 
    },
    outerCircle: {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
        backgroundColor: 'white',
    },
    outerCircleSelected: {
        borderColor: '#3FA9F5',
    },
    innerCircle: {
        height: 9,
        width: 9,
        borderRadius: 4.5,
        backgroundColor: '#3FA9F5',
    },
    radioLabel: {
        fontSize: 14,
        color: 'black',
    },

    // --- BUTTONS ---
    loginBtn: {
        width: '100%',
        height: 50,
        backgroundColor: '#3FA9F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    loginText: {
        color: 'white',
        fontWeight: 'bold',
    },
    register: {
       flexDirection: 'row',
       marginTop: 20,
       alignItems: 'center',
    },
    registerBtn: {
       fontWeight: 'bold',
       color: '#3FA9F5',
       fontSize: 16,
       marginLeft: 10,
    },
    image: {
      flex: 1,
    },

    // --- ERROR BORDER ---
    inputError: {
        borderColor: 'red',
        borderWidth: 1,
    },
    btnRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
        marginTop: 20,
    },
    outlineBtn: {
        flex: 1,
        height: 50,
        borderWidth: 1.5,
        borderColor: '#3FA9F5',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outlineBtnText: {
        color: '#3FA9F5',
        fontWeight: 'bold',
        fontSize: 14,
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
});

export default styles;