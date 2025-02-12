import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

export default function SurahScreen({ route }) {
  const { number, name, englishName } = route.params;
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAyahs();
  }, []);

  const fetchAyahs = async () => {
    try {
      const response = await axios.get(`https://api.alquran.cloud/v1/surah/${number}/ar.asad`);
      setAyahs(response.data.data.ayahs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ayahs:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.ayahContainer}>
      <View style={styles.numberContainer}>
        <Text style={styles.ayahNumber}>{item.numberInSurah}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.arabicText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.surahName}>{name}</Text>
        <Text style={styles.surahNameEnglish}>{englishName}</Text>
      </View>
      <FlatList
        data={ayahs}
        renderItem={renderItem}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  surahName: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  surahNameEnglish: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  ayahContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  numberContainer: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ayahNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    alignItems: 'flex-end',
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 55,
    textAlign: 'right',
    color: '#333',
    fontFamily: 'HAFS-Arabic-Quran',
    letterSpacing: 1,
  },
}); 