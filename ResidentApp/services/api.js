import Constants from 'expo-constants';

// Auto-detect the dev machine's LAN IP from Expo's debugger host,
// so you never need to update the IP when switching Wi-Fi.
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  const lanIp = debuggerHost?.split(':')[0];
  if (lanIp) return `http://${lanIp}:5000/api`;
  // Fallback for production or if detection fails
  return 'http://192.168.1.137:5000/api';
};

const BASE_URL = getBaseUrl();

const request = async (endpoint, method = 'GET', body = null) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 s

  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
  };
  if (body) config.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    clearTimeout(timeout);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Request failed');
    return data.data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Make sure the server is running and the IP is correct.');
    }
    throw err;
  }
};

export const loginUser = (username, password) =>
  request('/auth/login', 'POST', { username, password });

export const registerResident = (payload) =>
  request('/auth/register', 'POST', payload);

export const sendSOS = (payload) =>
  request('/sos/send', 'POST', payload);

export const getResidentProfile = (residentId) =>
  request(`/residents/${residentId}/profile`);

export const getSOSHistory = (residentId) =>
  request(`/sos/resident/${residentId}`);

export const getAccountStatus = (accountId) =>
  request(`/accounts/${accountId}`);

export const getHouseholdMembers = (householdId) =>
  request(`/residents/household/${householdId}/full`);

export const getResidentNotifications = (residentId) =>
  request(`/notifications/resident/${residentId}`);

export const markNotificationRead = (notificationId) =>
  request(`/notifications/${notificationId}/read`, 'PATCH');

export const savePushToken = (accountId, token) =>
  request(`/accounts/${accountId}/push-token`, 'PATCH', { expo_push_token: token });

export const confirmSos = (sosId) =>
  request(`/sos/${sosId}/confirm-safe`, 'PATCH');
