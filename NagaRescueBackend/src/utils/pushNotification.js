const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function sendPush(token, title, body, data = {}) {
    if (!token || !Expo.isExpoPushToken(token)) return;
    try {
        await expo.sendPushNotificationsAsync([{
            to: token,
            sound: 'default',
            title,
            body,
            data,
        }]);
    } catch (err) {
        console.error('Push notification error:', err.message);
    }
}

module.exports = { sendPush };
