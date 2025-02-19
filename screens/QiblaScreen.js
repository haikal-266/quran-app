import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Alert, Animated } from 'react-native';
import { COLORS } from '../constants/Colors';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function QiblaScreen() {
  const [subscription, setSubscription] = useState(null);
  const [degree, setDegree] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationName, setLocationName] = useState('');
  
  const smoothedDegree = useRef(new Animated.Value(0)).current;
  const lastDegree = useRef(0);
  const movingAverage = useRef([]);
  const MA_WINDOW = 5;

  const calculateQiblaDirection = (latitude, longitude) => {
    // Untuk Jawa Barat, arah kiblat adalah 295 derajat
    setQiblaDirection(295);
  };

  const smoothCompassRotation = (newDegree) => {
    // Pastikan newDegree dalam range 0-360
    newDegree = ((newDegree % 360) + 360) % 360;
    
    // Tambahkan ke moving average
    movingAverage.current.push(newDegree);
    if (movingAverage.current.length > MA_WINDOW) {
      movingAverage.current.shift();
    }

    // Hitung rata-rata sederhana
    const avgDegree = movingAverage.current.reduce((a, b) => a + b, 0) / movingAverage.current.length;
    
    // Normalisasi kembali ke range 0-360
    const normalizedDegree = ((avgDegree % 360) + 360) % 360;

    // Threshold untuk mengurangi getaran
    const threshold = 1.0; // Menaikkan threshold sedikit
    if (Math.abs(normalizedDegree - lastDegree.current) < threshold) {
      return;
    }

    lastDegree.current = normalizedDegree;

    Animated.spring(smoothedDegree, {
      toValue: normalizedDegree,
      useNativeDriver: true,
      tension: 30, // Menurunkan tension untuk rotasi lebih halus
      friction: 9,  // Menaikkan friction untuk mengurangi osilasi
    }).start();
  };

  const getLocationName = async (latitude, longitude) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      }, {
        useGoogleMaps: false // Gunakan Expo's default geocoding
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const { street, city, region } = reverseGeocode[0];
        const locationString = [street, city, region]
          .filter(item => item)
          .join(', ');
        setLocationName(locationString || 'Lokasi tidak diketahui');
      }
    } catch (error) {
      console.log('Error getting location name:', error);
      setLocationName('Lokasi tidak diketahui');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (!isAvailable) {
          setErrorMsg('Sensor kompas tidak tersedia di perangkat Anda');
          return;
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Izin lokasi diperlukan untuk menentukan arah kiblat');
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        setLocation(location);
        calculateQiblaDirection(location.coords.latitude, location.coords.longitude);
        getLocationName(location.coords.latitude, location.coords.longitude);

        await Magnetometer.setUpdateInterval(100);
        _subscribe();
      } catch (error) {
        setErrorMsg('Terjadi kesalahan saat menginisialisasi sensor');
        console.log('Error:', error);
      }
    })();

    return () => {
      _unsubscribe();
    };
  }, []);

  const _subscribe = () => {
    setSubscription(
      Magnetometer.addListener(data => {
        // Mengkonversi pembacaan magnetometer ke sudut kompas (0-360)
        let angle = Math.atan2(data.y, data.x) * 180 / Math.PI;
        
        // Normalisasi ke range 0-360 dan tambah 90 derajat untuk menyesuaikan dengan arah utara
        angle = ((angle + 450) % 360);
        
        setDegree(angle);
        smoothCompassRotation(angle);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  const compassRotation = {
    transform: [{
      rotate: smoothedDegree.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '-360deg']
      })
    }]
  };

  // Rotasi ikon masjid yang benar untuk arah kiblat 295 derajat
  const fixedQiblaStyle = {
    transform: [{ 
      rotate: '-295deg' // Menggunakan nilai negatif untuk rotasi searah jarum jam
    }]
  };

  return (
    <View style={styles.container}>
      {locationName ? (
        <Text style={styles.locationText}>Lokasi: {locationName}</Text>
      ) : null}
      <View style={styles.compassWrapper}>
        <View style={styles.compassContainer}>
          <Animated.View style={[styles.compass, compassRotation]}>
            <View style={styles.compassMarkings}>
              <Text style={[styles.compassDirection, styles.northDirection]}>U</Text>
              <Text style={[styles.compassDirection, styles.eastDirection]}>T</Text>
              <Text style={[styles.compassDirection, styles.southDirection]}>S</Text>
              <Text style={[styles.compassDirection, styles.westDirection]}>B</Text>
              <View style={styles.degreeMarks}>
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <View key={deg} style={[styles.degreeMark, { transform: [{ rotate: `${deg}deg` }] }]} />
                ))}
              </View>
            </View>
            <View style={styles.compassCircle} />
            <View style={styles.innerCircle} />
            <View style={styles.phoneDirectionArrow}>
              <MaterialCommunityIcons name="arrow-up-bold" size={40} color={COLORS.accent} />
            </View>
          </Animated.View>
        </View>
        {/* Indikator Kiblat fixed di 295 derajat */}
        <View style={[styles.qiblaIndicatorOuter, fixedQiblaStyle]}>
          <MaterialCommunityIcons 
            name="mosque" 
            size={32} 
            color={COLORS.primary}
            style={styles.mosqueIcon} 
          />
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.degreeText}>{`${Math.round(degree)}°`}</Text>
        <Text style={styles.infoText}>Arah ponsel Anda saat ini</Text>
        <Text style={styles.qiblaText}>Arah Kiblat: {Math.round(qiblaDirection)}°</Text>
        <Text style={styles.guideText}>Sejajarkan panah merah dengan ikon masjid</Text>
      </View>
      {location && (
        <Text style={styles.coordinatesText}>
          Koordinat: {location.coords.latitude.toFixed(6)}°, {location.coords.longitude.toFixed(6)}°
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  compassWrapper: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
    width: 320, // Mengurangi ukuran wrapper
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassContainer: {
    width: 300,
    height: 300,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compass: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compassCircle: {
    width: '90%',
    height: '90%',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: COLORS.primary,
    position: 'absolute',
  },
  innerCircle: {
    width: '15%',
    height: '15%',
    borderRadius: 1000,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    position: 'absolute',
  },
  compassMarkings: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  degreeMarks: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  degreeMark: {
    position: 'absolute',
    width: '100%',
    height: 2,
    top: '50%',
    marginTop: -1,
    alignItems: 'flex-end',
  },
  compassDirection: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  northDirection: {
    top: 15,
    alignSelf: 'center',
  },
  southDirection: {
    bottom: 15,
    alignSelf: 'center',
  },
  eastDirection: {
    right: 15,
    top: '47%',
  },
  westDirection: {
    left: 15,
    top: '47%',
  },
  qiblaIndicatorOuter: {
    position: 'absolute',
    width: '115%',
    height: '115%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    pointerEvents: 'none', // Memastikan ikon tidak bisa diinteraksi
  },
  mosqueIcon: {
    marginTop: 0,
  },
  phoneDirectionArrow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  locationText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  degreeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoText: {
    marginTop: 5,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  qiblaText: {
    marginTop: 10,
    fontSize: 18,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  guideText: {
    marginTop: 5,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 15,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.accent,
    textAlign: 'center',
  },
}); 