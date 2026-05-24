import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1, alignItems: 'center', justifyContent: 'flex-start',
        padding: 30, paddingTop: 50,
    },
    image: { flex: 1 },
    logoImg: { resizeMode: 'contain', width: 150, height: 100 },
    title: {
        alignSelf: 'flex-start', fontWeight: 'bold', fontSize: 25,
        color: 'black', marginTop: 20, marginBottom: 5,
    },
    subTitle: {
        alignSelf: 'flex-start', fontSize: 14, color: '#444',
        marginBottom: 30,
    },
    uploadBox: {
        width: '100%', height: 200,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderWidth: 2, borderColor: '#3FA9F5', borderStyle: 'dashed',
        borderRadius: 10, justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', marginBottom: 15,
    },
    placeholder: { alignItems: 'center' },
    uploadIcon: { fontSize: 40, color: '#3FA9F5', fontWeight: 'bold' },
    uploadText: { fontSize: 16, color: '#666', marginTop: 10 },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    reselectText: { color: 'red', fontWeight: 'bold', fontSize: 14, marginBottom: 30 },
    nextBtn: {
        width: '100%', height: 50, backgroundColor: '#3FA9F5',
        justifyContent: 'center', alignItems: 'center', borderRadius: 5,
        marginTop: 'auto', marginBottom: 20,
    },
    nextText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
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