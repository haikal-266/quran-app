import React, { useState, useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SurahScreen from './screens/SurahScreen';
import SplashScreen from './screens/SplashScreen';
import SearchScreen from './screens/SearchScreen';
import TafsirScreen from './screens/TafsirScreen';
import TafsirDetail from './screens/TafsirDetail';
import AIScreen from './screens/AIScreen';
import SettingsScreen from './screens/SettingsScreen';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from './constants/Colors';
import Navbar from './components/Navbar';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [activeRoute, setActiveRoute] = useState('');
  const navigationRef = useNavigationContainerRef();

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
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={(state) => {
        if (state !== undefined) {
          const currentRoute = navigationRef.getCurrentRoute()?.name;
          setShowNavbar(currentRoute !== 'Splash');
          setActiveRoute(currentRoute || '');
          setIsReady(true);
        }
      }}
    >
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
          <Stack.Screen 
            name="Search" 
            component={SearchScreen}
          />
          <Stack.Screen 
            name="Tafsir" 
            component={TafsirScreen}
          />
          <Stack.Screen 
            name="AI" 
            component={AIScreen}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
          />
          <Stack.Screen 
            name="TafsirDetail" 
            component={TafsirDetail}
          />
        </Stack.Navigator>
        {showNavbar && (
          <Navbar 
            navigation={navigationRef} 
            activeRoute={activeRoute}
          />
        )}
      </View>
    </NavigationContainer>
  );
} 