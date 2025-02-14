import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const fadeTextAnim = new Animated.Value(0);

  useEffect(() => {
    // Animasi fade in untuk icon
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animasi fade in untuk teks dengan delay
    setTimeout(() => {
      Animated.timing(fadeTextAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Navigasi ke Home
    setTimeout(() => {
      navigation.replace('Home');
    }, 2500);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern} />
      
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="menu-book" size={50} color={COLORS.white} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeTextAnim }]}>
          <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</Text>
          <Text style={styles.title}>Al-Qur'an Digital</Text>
          <Text style={styles.subtitle}>Baca dan Pelajari Al-Qur'an</Text>
        </Animated.View>
      </View>
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
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.secondary,
    opacity: 0.03,
  },
  content: {
    alignItems: 'center',
    width: width * 0.9,
    padding: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.accent,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  textContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 25,
    borderRadius: 15,
    width: '100%',
  },
  bismillah: {
    fontSize: 28,
    color: COLORS.white,
    marginBottom: 25,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.light,
    textAlign: 'center',
  },
}); 