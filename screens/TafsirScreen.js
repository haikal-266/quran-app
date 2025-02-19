import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/Colors';
import axios from 'axios';

export default function TafsirScreen({ navigation }) {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurahs();
  }, []);

  const fetchSurahs = async () => {
    try {
      const response = await axios.get('https://api.quran.com/api/v4/chapters?language=id');
      setSurahs(response.data.chapters);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching surahs:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tafsir Al-Qur'an</Text>
        <Text style={styles.headerSubtitle}>Tafsir Tahlili</Text>
      </View>
      <ScrollView style={styles.content}>
        {surahs.map((surah) => (
          <TouchableOpacity
            key={surah.id}
            style={styles.surahItem}
            onPress={() => navigation.navigate('TafsirDetail', { 
              surah,
              activeRoute: 'Tafsir'
            })}
          >
            <View style={styles.surahNumber}>
              <Text style={styles.numberText}>{surah.id}</Text>
            </View>
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>{surah.name_simple}</Text>
              <Text style={styles.surahNameArabic}>{surah.name_arabic}</Text>
              <Text style={styles.surahMeta}>
                {surah.verses_count} Ayat • {surah.revelation_place}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.light,
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  surahNameArabic: {
    fontSize: 20,
    color: COLORS.primary,
    marginVertical: 5,
    fontFamily: 'LPMQ',
  },
  surahMeta: {
    fontSize: 14,
    color: COLORS.textLight,
  },
}); 