import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#2D4356',
  secondary: '#435B66',
  accent: '#A76F6F',
  light: '#EAB2A0',
  background: '#F8F6F4',
  white: '#FFFFFF',
  text: '#2D4356',
  textLight: '#435B66',
  textMuted: '#A76F6F'
};

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      navigation.replace('Home');
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
        </View>
        <Text style={styles.title}>Al-Qur'an Digital</Text>
        <Text style={styles.subtitle}>Baca dan Pelajari Al-Qur'an</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.secondary,
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: width * 0.8,
    height: height * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    fontSize: 32,
    color: COLORS.white,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.light,
    textAlign: 'center',
  },
}); 