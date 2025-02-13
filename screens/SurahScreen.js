import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Animated } from 'react-native';
import axios from 'axios';

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

const cleanHtmlTags = (text) => {
  return text.replace(/<[^>]*>/g, '');
};

const ExpandableDescription = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  return (
    <View style={styles.expandableContainer}>
      <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
        <Text style={styles.headerDescription} numberOfLines={expanded ? undefined : 2}>
          {cleanHtmlTags(description)}
        </Text>
        <Text style={styles.expandText}>
          {expanded ? 'Lihat lebih sedikit' : 'Lihat selengkapnya'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function SurahScreen({ route }) {
  const { nomor, nama, nama_latin, deskripsi } = route.params;
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
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.ayahContainer}>
      <View style={styles.ayahHeader}>
        <View style={styles.numberContainer}>
          <Text style={styles.ayahNumber}>{item.nomor}</Text>
        </View>
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
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{nama}</Text>
        <Text style={styles.headerSubtitle}>{nama_latin}</Text>
        <ExpandableDescription description={deskripsi} />
      </View>
      <FlatList
        data={ayahs}
        renderItem={renderItem}
        keyExtractor={(item) => item.nomor.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 5,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: COLORS.light,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: COLORS.light,
    textAlign: 'left',
    opacity: 0.9,
    lineHeight: 20,
  },
  list: {
    padding: 16,
  },
  ayahContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  ayahHeader: {
    padding: 12,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumber: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    padding: 16,
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 55,
    textAlign: 'right',
    color: COLORS.text,
    marginBottom: 16,
  },
  translationText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'left',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  indonesianText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'left',
    lineHeight: 22,
  },
  expandableContainer: {
    marginTop: 8,
  },
  expandButton: {
    padding: 4,
  },
  expandText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
});