import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

const cleanHtmlTags = (text) => {
  return text.replace(/<[^>]*>/g, '');
};

export default function SurahScreen({ route }) {
  const { nomor, nama, nama_latin } = route.params;
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAyahs();
  }, []);

  const fetchAyahs = async () => {
    try {
      const response = await axios.get(`https://quran-api.santrikoding.com/api/surah/${nomor}`);
      setAyahs(response.data.ayat);
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
        <Text style={styles.ayahNumber}>{item.nomor}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.arabicText}>{item.ar}</Text>
        <Text style={styles.translationText}>{cleanHtmlTags(item.tr)}</Text>
        <Text style={styles.indonesianText}>{item.idn}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.surahName}>{nama}</Text>
        <Text style={styles.surahNameEnglish}>{nama_latin}</Text>
      </View>
      <FlatList
        data={ayahs}
        renderItem={renderItem}
        keyExtractor={(item) => item.nomor.toString()}
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
    letterSpacing: 1,
    marginBottom: 10,
  },
  translationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  indonesianText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'left',
    alignSelf: 'stretch',
  },
}); 