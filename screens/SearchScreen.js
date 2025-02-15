import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS } from '../constants/Colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SPACING = 12;

// Data tema Al-Quran
const QURAN_THEMES = [
  {
    id: 1,
    name: 'Aqidah',
    description: 'Keyakinan dan keimanan',
    surahs: [1, 2, 3, 6, 9, 10, 12, 13, 16, 21, 23, 27, 31, 39, 40, 42, 51, 57, 59, 67, 87, 112, 113, 114],
    icon: '🌟'
  },
  {
    id: 2,
    name: 'Ibadah',
    description: 'Tata cara beribadah',
    surahs: [2, 4, 5, 7, 9, 17, 22, 24, 29, 31, 35, 39, 42, 49, 51, 62, 73, 87, 96, 107, 108],
    icon: '🕌'
  },
  {
    id: 3,
    name: 'Akhlak',
    description: 'Perilaku dan moral',
    surahs: [2, 3, 4, 7, 9, 16, 17, 23, 24, 25, 31, 33, 41, 42, 49, 58, 68, 83, 103, 104],
    icon: '💝'
  },
  {
    id: 4,
    name: 'Muamalah',
    description: 'Hubungan antar manusia',
    surahs: [2, 3, 4, 5, 8, 9, 24, 33, 48, 49, 58, 59, 60, 61, 62, 64, 65, 76, 83, 107],
    icon: '🤝'
  },
  {
    id: 5,
    name: 'Kisah Nabi',
    description: 'Sejarah para nabi',
    surahs: [2, 3, 4, 5, 6, 7, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 23, 26, 27, 28, 29, 37, 38, 40, 51, 54, 71],
    icon: '📚'
  },
  {
    id: 6,
    name: 'Hari Akhir',
    description: 'Kehidupan setelah kematian',
    surahs: [2, 3, 4, 6, 7, 10, 11, 14, 15, 16, 17, 18, 19, 20, 22, 23, 25, 27, 30, 31, 32, 34, 36, 37, 39, 40, 44, 45, 46, 50, 54, 56, 64, 66, 67, 69, 70, 75, 78, 79, 80, 81, 82, 83, 84, 85, 86, 88, 89, 99, 100, 101, 102],
    icon: '⚡'
  },
  {
    id: 7,
    name: 'Penciptaan',
    description: 'Alam semesta dan kehidupan',
    surahs: [2, 3, 6, 7, 10, 13, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 27, 29, 30, 31, 32, 35, 36, 39, 40, 41, 42, 45, 46, 50, 51, 67, 71, 78, 79, 86, 88, 95],
    icon: '🌎'
  },
  {
    id: 8,
    name: 'Rezeki',
    description: 'Kehidupan dan ekonomi',
    surahs: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 20, 22, 23, 24, 27, 28, 29, 30, 34, 35, 36, 39, 42, 51, 56, 62, 65, 67, 73, 78],
    icon: '✨'
  },
  {
    id: 9,
    name: 'Keluarga',
    description: 'Hubungan keluarga',
    surahs: [2, 3, 4, 5, 7, 8, 9, 13, 14, 15, 16, 17, 23, 24, 25, 27, 28, 29, 30, 31, 33, 39, 42, 46, 47, 49, 58, 64, 65, 66],
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 10,
    name: 'Jihad',
    description: 'Perjuangan di jalan Allah',
    surahs: [2, 3, 4, 5, 8, 9, 16, 22, 29, 33, 47, 48, 49, 57, 59, 60, 61, 63, 64, 66, 73, 76],
    icon: '⚔️'
  },
  {
    id: 11,
    name: 'Taubat',
    description: 'Pengampunan dan pertobatan',
    surahs: [2, 3, 4, 5, 6, 7, 8, 9, 11, 16, 17, 18, 19, 20, 23, 24, 25, 28, 33, 39, 40, 42, 46, 48, 49, 51, 57, 58, 60, 61, 66, 71, 73, 110],
    icon: '🙏'
  },
  {
    id: 12,
    name: 'Doa',
    description: 'Permohonan kepada Allah',
    surahs: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 35, 37, 40, 44, 46, 51, 54, 59, 60, 66, 71, 113, 114],
    icon: '💫'
  }
];

// Fungsi untuk menghitung kemiripan string (Levenshtein Distance)
const calculateSimilarity = (str1, str2) => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  return 1 - (track[str2.length][str1.length] / Math.max(str1.length, str2.length));
};

// Fungsi untuk membersihkan string dari karakter khusus
const cleanString = (str) => {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const ThemeCard = ({ theme, onPress, surahs, index, scrollX }) => {
  const relatedSurahs = surahs.filter(surah => theme.surahs.includes(surah.nomor));
  
  const inputRange = [
    (index - 1) * (CARD_WIDTH + SPACING),
    index * (CARD_WIDTH + SPACING),
    (index + 1) * (CARD_WIDTH + SPACING),
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.95, 1, 0.95],
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [4, 0, 4], // Slight lift for active card
  });

  return (
    <Animated.View
      style={[
        styles.themeCardContainer,
        {
          transform: [
            { scale },
            { translateY }
          ],
          opacity,
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.themeCard}
        onPress={() => onPress(theme, relatedSurahs)}
        activeOpacity={0.9}
      >
        <View style={styles.themeHeader}>
          <Text style={styles.themeIcon}>{theme.icon}</Text>
          <View style={styles.themeBadge}>
            <Text style={styles.themeCount}>{relatedSurahs.length} Surah</Text>
          </View>
        </View>
        <View style={styles.themeContent}>
          <Text style={styles.themeName} numberOfLines={1}>{theme.name}</Text>
          <Text style={styles.themeDescription} numberOfLines={2}>{theme.description}</Text>
          <Text style={styles.surahList} numberOfLines={2}>
            {relatedSurahs.slice(0, 3).map(surah => surah.nama_latin).join(', ')}
            {relatedSurahs.length > 3 ? `, dan ${relatedSurahs.length - 3} surah lainnya` : ''}
          </Text>
        </View>
        <View style={styles.themeFooter}>
          <Text style={styles.exploreText}>Jelajahi</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.accent} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SearchResult = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.resultItem}
    onPress={onPress}
  >
    <View style={styles.resultHeader}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{item.nomor}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={styles.nameArabic}>{item.nama}</Text>
        <Text style={styles.nameEnglish}>{item.nama_latin}</Text>
      </View>
      {item.ayat && (
        <View style={styles.ayatBadge}>
          <Text style={styles.ayatNumber}>Ayat {item.ayat}</Text>
        </View>
      )}
    </View>
    {item.relevance < 1 && (
      <Text style={styles.matchInfo}>Mungkin maksud Anda: {item.nama_latin}</Text>
    )}
  </TouchableOpacity>
);

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [surahs, setSurahs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollX = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchSurahs();
  }, []);

  const fetchSurahs = async () => {
    try {
      const response = await axios.get('https://quran-api.santrikoding.com/api/surah');
      setSurahs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching surahs:', error);
      setLoading(false);
    }
  };

  const handleThemePress = (theme, relatedSurahs) => {
    setSearchResults(relatedSurahs.map(surah => ({
      ...surah,
      relevance: 1
    })));
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerms = cleanString(query).split(' ');
    let ayatNumber = null;

    // Cek apakah ada angka di akhir query
    const lastTerm = searchTerms[searchTerms.length - 1];
    if (!isNaN(lastTerm)) {
      ayatNumber = parseInt(lastTerm);
      searchTerms.pop(); // Hapus angka dari search terms
    }

    const searchTerm = searchTerms.join(' ');
    
    const results = surahs.map(surah => {
      const nameLatin = cleanString(surah.nama_latin);
      const nama = cleanString(surah.nama);
      const arti = cleanString(surah.arti);

      const similarities = [
        calculateSimilarity(searchTerm, nameLatin),
        calculateSimilarity(searchTerm, nama),
        calculateSimilarity(searchTerm, arti)
      ];

      const maxSimilarity = Math.max(...similarities);

      return {
        ...surah,
        relevance: maxSimilarity,
        ayat: ayatNumber
      };
    })
    .filter(result => result.relevance > 0.3) // Hanya tampilkan hasil dengan kemiripan > 30%
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5); // Batasi hasil pencarian

    setSearchResults(results);
  }, [surahs]);

  const handleResultPress = (item) => {
    navigation.navigate('Surah', {
      nomor: item.nomor,
      nama: item.nama,
      nama_latin: item.nama_latin,
      jumlah_ayat: item.jumlah_ayat,
      deskripsi: item.deskripsi,
      scrollToAyat: item.ayat
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={24} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari surah (contoh: Al Baqarah 8)"
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchResults.length === 0 && !searchQuery && (
        <View style={styles.themesContainer}>
          <Text style={styles.themesTitle}>Jelajahi Tema Al-Qur'an</Text>
          <Text style={styles.themesSubtitle}>Temukan surat berdasarkan tema</Text>
          <Animated.FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesScroll}
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            data={selectedThemes}
            renderItem={({ item, index }) => (
              <ThemeCard
                theme={item}
                onPress={handleThemePress}
                surahs={surahs}
                index={index}
                scrollX={scrollX}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <SearchResult
            item={item}
            onPress={() => handleResultPress(item)}
          />
        )}
        keyExtractor={(item) => item.nomor.toString()}
        contentContainerStyle={styles.resultsList}
        ListEmptyComponent={() => (
          searchQuery ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Tidak ada hasil yang ditemukan
              </Text>
            </View>
          ) : null
        )}
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
  searchContainer: {
    backgroundColor: COLORS.primary,
    padding: 16,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: 8,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  number: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  nameArabic: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  nameEnglish: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  ayatBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ayatNumber: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchInfo: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  themesContainer: {
    paddingTop: 24,
  },
  themesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  themesSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  themesScroll: {
    paddingLeft: 16,
    paddingRight: width * 0.15,
  },
  themeCardContainer: {
    width: CARD_WIDTH,
    marginRight: SPACING,
  },
  themeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    height: 200,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeIcon: {
    fontSize: 32,
  },
  themeBadge: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  themeCount: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  themeContent: {
    flex: 1,
  },
  themeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  themeDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  surahList: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  themeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  exploreText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
    marginRight: 4,
  },
}); 