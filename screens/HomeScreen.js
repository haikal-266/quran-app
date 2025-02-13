import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import axios from 'axios';

const SurahItem = React.memo(({ item, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={styles.surahItem}
    onPress={() => onPress(item)}
  >
    <View style={styles.numberContainer}>
      <Text style={styles.number}>{item.nomor}</Text>
    </View>
    <View style={styles.surahInfo}>
      <Text style={styles.nameArabic}>{item.nama}</Text>
      <Text style={styles.nameEnglish}>{item.nama_latin}</Text>
      <Text style={styles.verses}>{item.jumlah_ayat} Ayat • {item.tempat_turun}</Text>
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
      jumlah_ayat: item.jumlah_ayat
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
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={surahs}
        renderItem={renderItem}
        keyExtractor={(item) => item.nomor.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
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
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  surahItem: {
    flexDirection: 'row',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  number: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  nameArabic: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nameEnglish: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  verses: {
    fontSize: 14,
    color: '#888',
  },
}); 