import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Production-grade Real-Time Live GPS Geolocation Hook for NaturePulse
 * 
 * Uses navigator.geolocation.watchPosition() with high accuracy, zero maximumAge,
 * manages watcher lifecycle safely, handles all GeolocationPositionError codes,
 * and provides accurate real-time GPS coordinates, accuracy circle, and state.
 */
export function useLiveLocation(options = {}) {
  const {
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 20000,
    autoStart = false,
  } = options;

  // Location Coordinates & Metrics
  const [coords, setCoords] = useState(() => {
    try {
      const cached = localStorage.getItem('pulse_live_gps_coords');
      return cached ? JSON.parse(cached) : {
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: null,
      };
    } catch {
      return {
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: null,
      };
    }
  });

  // State Management
  const [status, setStatus] = useState('idle'); // 'idle' | 'locating' | 'active' | 'error' | 'denied' | 'unavailable' | 'timeout'
  const [permission, setPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [lastUpdatedSecondsAgo, setLastUpdatedSecondsAgo] = useState(0);

  // Watcher ref to prevent duplicate watchers across re-renders
  const watchIdRef = useRef(null);
  const mountedRef = useRef(true);
  const lastPositionRef = useRef(null);

  // Listen to browser permission state if supported
  useEffect(() => {
    mountedRef.current = true;

    if (!navigator.geolocation) {
      setPermission('unsupported');
      setStatus('unavailable');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((statusObj) => {
        if (!mountedRef.current) return;
        setPermission(statusObj.state);
        statusObj.onchange = () => {
          if (!mountedRef.current) return;
          setPermission(statusObj.state);
          if (statusObj.state === 'denied') {
            setStatus('denied');
            setError('Location permission is blocked. Please allow location access in your browser settings.');
          }
        };
      }).catch(() => {});
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Update "last updated seconds ago" counter
  useEffect(() => {
    if (!coords.timestamp) return;

    const interval = setInterval(() => {
      const diffSec = Math.max(0, Math.floor((Date.now() - coords.timestamp) / 1000));
      setLastUpdatedSecondsAgo(diffSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [coords.timestamp]);

  // Handle position success
  const handlePositionSuccess = useCallback((position) => {
    if (!mountedRef.current) return;

    const {
      latitude,
      longitude,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed,
    } = position.coords;

    const timestamp = position.timestamp || Date.now();

    const newCoords = {
      latitude,
      longitude,
      accuracy: Math.round(accuracy * 10) / 10,
      altitude: altitude != null ? Math.round(altitude * 10) / 10 : null,
      altitudeAccuracy: altitudeAccuracy != null ? Math.round(altitudeAccuracy * 10) / 10 : null,
      heading: heading != null ? Math.round(heading) : null,
      speed: speed != null ? Math.round(speed * 3.6 * 10) / 10 : null, // convert m/s to km/h
      timestamp,
    };

    lastPositionRef.current = newCoords;
    setCoords(newCoords);
    setStatus('active');
    setError(null);
    setIsLocating(false);
    setLastUpdatedSecondsAgo(0);

    try {
      localStorage.setItem('pulse_live_gps_coords', JSON.stringify(newCoords));
    } catch {}
  }, []);

  // Handle position error
  const handlePositionError = useCallback((geoError) => {
    if (!mountedRef.current) return;

    setIsLocating(false);

    let errorMsg = 'Unable to determine GPS location.';
    let errorStatus = 'error';

    switch (geoError.code) {
      case 1: // PERMISSION_DENIED
        errorMsg = 'Location permission is blocked. Please allow location access in your browser settings.';
        errorStatus = 'denied';
        setPermission('denied');
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMsg = 'Your device or network could not determine your current GPS position.';
        errorStatus = 'unavailable';
        break;
      case 3: // TIMEOUT
        errorMsg = 'Location request timed out. Please verify your GPS connection and try again.';
        errorStatus = 'timeout';
        break;
      default:
        errorMsg = geoError.message || 'An unknown error occurred while retrieving location.';
        break;
    }

    setError(errorMsg);
    setStatus(errorStatus);
  }, []);

  // Stop watching GPS position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  // Start continuous watchPosition
  const startWatching = useCallback((overrideOptions = {}) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStatus('unavailable');
      return;
    }

    // Clear existing watcher if any
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const posOptions = {
      enableHighAccuracy,
      maximumAge,
      timeout,
      ...overrideOptions,
    };

    setIsLocating(true);
    setStatus('locating');
    setError(null);
    setIsWatching(true);

    try {
      const id = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        posOptions
      );
      watchIdRef.current = id;
    } catch (err) {
      setIsLocating(false);
      setIsWatching(false);
      setError(err.message || 'Failed to initialize GPS watcher.');
      setStatus('error');
    }
  }, [enableHighAccuracy, maximumAge, timeout, handlePositionSuccess, handlePositionError]);

  // One-shot Immediate Locate Me action
  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStatus('unavailable');
      return Promise.reject(new Error('Geolocation unsupported'));
    }

    setIsLocating(true);
    setStatus('locating');
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handlePositionSuccess(position);
          // Also make sure continuous watcher is active for live tracking
          if (watchIdRef.current === null) {
            startWatching();
          }
          resolve(lastPositionRef.current);
        },
        (geoError) => {
          handlePositionError(geoError);
          reject(geoError);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );
    });
  }, [handlePositionSuccess, handlePositionError, startWatching]);

  // Recalibrate / Restart GPS connection
  const recalibrate = useCallback(() => {
    stopWatching();
    return locateMe();
  }, [stopWatching, locateMe]);

  // Clean up watcher on component unmount
  useEffect(() => {
    if (autoStart) {
      startWatching();
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [autoStart, startWatching]);

  // Human-formatted last updated label
  const getLastUpdatedLabel = useCallback(() => {
    if (!coords.timestamp) return 'Not yet updated';
    if (lastUpdatedSecondsAgo < 5) return 'Just now';
    if (lastUpdatedSecondsAgo < 60) return `${lastUpdatedSecondsAgo}s ago`;
    const minutes = Math.floor(lastUpdatedSecondsAgo / 60);
    return `${minutes}m ago`;
  }, [coords.timestamp, lastUpdatedSecondsAgo]);

  // Accuracy confidence classifier
  const getAccuracyQuality = useCallback(() => {
    if (coords.accuracy == null) return null;
    if (coords.accuracy <= 15) return { level: 'High', color: 'emerald', label: `±${coords.accuracy} m (High Accuracy)` };
    if (coords.accuracy <= 50) return { level: 'Medium', color: 'amber', label: `±${coords.accuracy} m (Standard GPS)` };
    return { level: 'Low', color: 'rose', label: `±${coords.accuracy} m (Coarse Network/Wi-Fi)` };
  }, [coords.accuracy]);

  return {
    // Coordinate values
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    speed: coords.speed,
    timestamp: coords.timestamp,
    hasLocation: coords.latitude !== null && coords.longitude !== null,

    // Status & Flags
    status,
    permission,
    error,
    isWatching,
    isLocating,
    followUser,
    setFollowUser,
    lastUpdatedSecondsAgo,
    lastUpdatedLabel: getLastUpdatedLabel(),
    accuracyQuality: getAccuracyQuality(),

    // Action Triggers
    startWatching,
    stopWatching,
    locateMe,
    recalibrate,
  };
}

/**
 * Haversine formula to compute exact distance in kilometers between two GPS coordinates
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance in meters or kilometers nicely
 */
export function formatDistance(distKm) {
  if (distKm == null || Number.isNaN(distKm)) return null;
  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return `${meters} m`;
  }
  return `${distKm.toFixed(1)} km`;
}

/**
 * Format walking / travel time estimate from distance in km
 */
export function formatTravelTime(distKm, mode = 'walk') {
  if (distKm == null || Number.isNaN(distKm)) return null;
  const speedKmH = mode === 'drive' ? 25 : mode === 'bike' ? 12 : 4.5;
  const minutes = Math.max(1, Math.round((distKm / speedKmH) * 60));
  if (minutes < 60) {
    return `${minutes} min ${mode}`;
  }
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours} hr ${remMin > 0 ? remMin + 'm' : ''} ${mode}`;
}

export default useLiveLocation;
