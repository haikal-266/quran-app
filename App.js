import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SurahScreen from './screens/SurahScreen';
import SplashScreen from './screens/SplashScreen';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from './constants/Colors';
import Navbar from './components/Navbar';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulasi inisialisasi aplikasi
    setTimeout(() => {
      setIsReady(true);
    }, 100);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <NavigationContainer onStateChange={(state) => {
      if (state !== undefined) {
        setIsReady(true);
      }
    }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <Stack.Navigator 
          initialRouteName="Splash" 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade',
            contentStyle: {
              paddingBottom: 85, // Menambah padding bottom
            }
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
            options={{
              contentStyle: {
                paddingBottom: 0 // Tidak ada padding untuk splash screen
              }
            }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
          />
          <Stack.Screen 
            name="Surah" 
            component={SurahScreen}
          />
        </Stack.Navigator>
        {isReady && <Navbar />}
      </View>
    </NavigationContainer>
  );
} 