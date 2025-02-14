import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

export default function AIScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fitur AI Akan Segera Hadir</Text>
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
  text: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
}); 