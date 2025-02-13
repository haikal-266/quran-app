import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

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

export default function Navbar({ navigation, activeRoute }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Home')}
      >
        <MaterialIcons 
          name="menu-book" 
          size={24} 
          color={activeRoute === 'Home' ? COLORS.accent : COLORS.textLight} 
        />
        <Text style={[
          styles.navText,
          { color: activeRoute === 'Home' ? COLORS.accent : COLORS.textLight }
        ]}>Surah</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Search')}
      >
        <MaterialIcons 
          name="search" 
          size={24} 
          color={activeRoute === 'Search' ? COLORS.accent : COLORS.textLight} 
        />
        <Text style={[
          styles.navText,
          { color: activeRoute === 'Search' ? COLORS.accent : COLORS.textLight }
        ]}>Cari</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Qibla')}
      >
        <MaterialCommunityIcons 
          name="compass" 
          size={24} 
          color={activeRoute === 'Qibla' ? COLORS.accent : COLORS.textLight} 
        />
        <Text style={[
          styles.navText,
          { color: activeRoute === 'Qibla' ? COLORS.accent : COLORS.textLight }
        ]}>Kiblat</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('AI')}
      >
        <Ionicons 
          name="chatbubble-ellipses" 
          size={24} 
          color={activeRoute === 'AI' ? COLORS.accent : COLORS.textLight} 
        />
        <Text style={[
          styles.navText,
          { color: activeRoute === 'AI' ? COLORS.accent : COLORS.textLight }
        ]}>AI</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Settings')}
      >
        <MaterialIcons 
          name="settings" 
          size={24} 
          color={activeRoute === 'Settings' ? COLORS.accent : COLORS.textLight} 
        />
        <Text style={[
          styles.navText,
          { color: activeRoute === 'Settings' ? COLORS.accent : COLORS.textLight }
        ]}>Pengaturan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: 8,
    paddingHorizontal: 15,
    paddingBottom: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
}); 