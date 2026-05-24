// services/location.js
//
// Adaptive location-fetching service for SOS Phase-2 / Thread B.
// Single-responsibility wrapper around expo-location + NetInfo so the UI
// never talks to the radio APIs directly.
//
// Strategy (see prompt/024_SOS_polishing.md):
//   ONLINE  → Accuracy.Balanced   (Wi-Fi / cell-tower assisted, fast)
//   OFFLINE → Accuracy.Highest    (GNSS / satellites, slower but works offline)

import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';

const ONLINE_TIMEOUT_MS  = 8000;
const OFFLINE_TIMEOUT_MS = 20000;

class LocationPermissionError extends Error {
  constructor() {
    super('Location permission denied.');
    this.code = 'PERMISSION_DENIED';
  }
}

class LocationTimeoutError extends Error {
  constructor(source) {
    super(`Location request timed out (${source}).`);
    this.code = 'TIMEOUT';
    this.source = source;
  }
}

const withTimeout = (promise, ms, source) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new LocationTimeoutError(source)), ms)
    ),
  ]);

const ensurePermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new LocationPermissionError();
};

/**
 * Fetch device coordinates using the network-adaptive hierarchy.
 * @returns {Promise<{ latitude: number, longitude: number, source: 'network' | 'gnss' }>}
 */
export const fetchAdaptiveLocation = async () => {
  await ensurePermission();

  const net = await NetInfo.fetch();
  const online = !!(net.isConnected && net.isInternetReachable !== false);

  const accuracy = online ? Location.Accuracy.Balanced : Location.Accuracy.Highest;
  const timeout  = online ? ONLINE_TIMEOUT_MS         : OFFLINE_TIMEOUT_MS;
  const source   = online ? 'network'                 : 'gnss';

  const loc = await withTimeout(
    Location.getCurrentPositionAsync({ accuracy }),
    timeout,
    source
  );

  return {
    latitude:  loc.coords.latitude,
    longitude: loc.coords.longitude,
    source,
  };
};

/**
 * Reverse-geocode a coordinate pair into a human-readable address.
 * Falls back to a lat/lng string if geocoding yields nothing.
 */
export const reverseGeocode = async ({ latitude, longitude }) => {
  const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
  if (geo.length > 0) {
    const a = geo[0];
    const formatted = `${a.street || ''} ${a.name || ''}, ${a.city || ''}`.trim();
    if (formatted && formatted !== ',') return formatted;
  }
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
};

export { LocationPermissionError, LocationTimeoutError };
