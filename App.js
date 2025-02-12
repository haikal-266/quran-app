import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SurahScreen from './screens/SurahScreen';
import SplashScreen from './screens/SplashScreen';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4CAF50' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <NavigationContainer onStateChange={(state) => {
      // Memastikan navigasi sudah siap
      if (state !== undefined) {
        setIsReady(true);
      }
    }}>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Splash" 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade'
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Al-Quran App',
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="Surah" 
          component={SurahScreen}
          options={({ route }) => ({ 
            title: route.params?.name,
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerShown: true,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 