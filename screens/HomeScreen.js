import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Dimensions
} from 'react-native';
import axios from 'axios';

const { width } = Dimensions.get('window');
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

const SurahItem = React.memo(({ item, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.surahItem}
    onPress={() => onPress(item)}
  >
    <View style={styles.surahHeader}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{item.nomor}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={styles.nameArabic}>{item.nama}</Text>
        <Text style={styles.nameEnglish}>{item.nama_latin}</Text>
      </View>
      <View style={styles.extraInfo}>
        <Text style={styles.location}>{item.tempat_turun.toUpperCase()}</Text>
        <Text style={styles.verses}>{item.jumlah_ayat} Ayat</Text>
      </View>
    </View>
    
    <View style={styles.descriptionContainer}>
      <Text style={styles.meaning}>Arti: {item.arti}</Text>
      <Text numberOfLines={3} style={styles.description}>
        {cleanHtmlTags(item.deskripsi)}
      </Text>
    </View>
  </TouchableOpacity>
));

export default function HomeScreen({ navigation }) {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSurahs = useCallback(async () => {
    try {
      const response = await axios.get('https://quran-api.santrikoding.com/api/surah');
      setSurahs(response.data);
    } catch (error) {
      console.error('Error fetching surahs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSurahs();
  }, [fetchSurahs]);

  const handleSurahPress = useCallback((item) => {
    navigation.navigate('Surah', { 
      nomor: item.nomor,
      nama: item.nama,
      nama_latin: item.nama_latin,
      jumlah_ayat: item.jumlah_ayat,
      deskripsi: item.deskripsi,
      activeRoute: 'Home'
    });
  }, [navigation]);

  useEffect(() => {
    fetchSurahs();
  }, [fetchSurahs]);

  const renderItem = useCallback(({ item }) => (
    <SurahItem item={item} onPress={handleSurahPress} />
  ), [handleSurahPress]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Al-Qur'an Digital</Text>
        <Text style={styles.headerSubtitle}>Baca dan Pelajari Al-Qur'an</Text>
      </View>
      <FlatList
        data={surahs}
        renderItem={renderItem}
        keyExtractor={(item) => item.nomor.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 5,
    elevation: 5,
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
    fontSize: 16,
    color: COLORS.light,
    textAlign: 'center',
    opacity: 0.9,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  surahItem: {
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
  surahHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  nameEnglish: {
    fontSize: 16,
    color: COLORS.light,
  },
  extraInfo: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  location: {
    fontSize: 12,
    color: COLORS.light,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  verses: {
    fontSize: 12,
    color: COLORS.light,
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  meaning: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});