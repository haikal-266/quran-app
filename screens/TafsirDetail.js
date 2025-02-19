import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, VirtualizedList, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/Colors';
import axios from 'axios';

const TafsirItem = memo(({ item }) => {
  return (
    <View style={styles.tafsirContainer}>
      <View style={styles.ayatHeader}>
        <Text style={styles.ayatNumber}>Ayat {item.ayat}</Text>
      </View>
      <Text style={styles.tafsirText}>
        {item.teks}
        <Text style={styles.ayatMark}> ﴿{item.ayat}﴾</Text>
      </Text>
    </View>
  );
});

const PendahuluanItem = memo(({ deskripsi }) => {
  return (
    <View style={styles.tafsirContainer}>
      <Text style={styles.tafsirTitle}>Pendahuluan</Text>
      <Text style={styles.tafsirText}>{deskripsi}</Text>
    </View>
  );
});

export default function TafsirDetail({ route, navigation }) {
  const { surah, activeRoute } = route.params;
  const [tafsir, setTafsir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Set activeRoute saat komponen dimount
    navigation.getParent()?.setParams({ activeRoute });
  }, []);

  const formatTafsirText = useCallback((text) => {
    if (!text) return 'Tafsir tidak tersedia';
    
    return text
      .replace(/<i>/g, '')
      .replace(/<\/i>/g, '')
      .replace(/<br>/g, '\n')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }, []);

  useEffect(() => {
    const fetchTafsir = async () => {
      try {
        const response = await axios.get(`https://equran.id/api/v2/tafsir/${surah.id}`);
        const tafsirData = response.data.data;
        setTafsir(tafsirData);

        // Format data untuk VirtualizedList
        const formattedData = [
          { type: 'pendahuluan', deskripsi: formatTafsirText(tafsirData.deskripsi) },
          ...tafsirData.tafsir.map(item => ({
            type: 'tafsir',
            ...item,
            teks: formatTafsirText(item.teks)
          }))
        ];
        setData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tafsir:', error);
        setLoading(false);
      }
    };

    fetchTafsir();
  }, [surah.id, formatTafsirText]);

  const getItem = (data, index) => data[index];
  const getItemCount = (data) => data.length;
  const getItemLayout = useCallback((data, index) => ({
    length: 300, // Perkiraan tinggi item
    offset: 300 * index,
    index,
  }), []);

  const keyExtractor = useCallback((item, index) => 
    item.type === 'pendahuluan' ? 'pendahuluan' : `tafsir-${item.ayat}`, 
  []);

  const renderItem = useCallback(({ item }) => {
    if (item.type === 'pendahuluan') {
      return <PendahuluanItem deskripsi={item.deskripsi} />;
    }
    return <TafsirItem item={item} />;
  }, []);

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
        <Text style={styles.surahName}>{tafsir?.namaLatin || surah.name_simple}</Text>
        <Text style={styles.surahNameArabic}>{tafsir?.nama || surah.name_arabic}</Text>
        <Text style={styles.surahInfo}>
          {tafsir?.jumlahAyat || surah.verses_count} Ayat • {tafsir?.tempatTurun || surah.revelation_place}
        </Text>
      </View>
      
      <VirtualizedList
        data={data}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        getItemCount={getItemCount}
        getItem={getItem}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
  },
  surahName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  surahNameArabic: {
    fontSize: 32,
    color: COLORS.light,
    marginBottom: 10,
    fontFamily: 'LPMQ',
  },
  surahInfo: {
    fontSize: 14,
    color: COLORS.light,
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  tafsirContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tafsirTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  ayatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '20',
  },
  ayatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tafsirText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 26,
    textAlign: 'justify',
  },
  ayatMark: {
    fontSize: 18,
    color: COLORS.primary,
    fontFamily: 'LPMQ',
  }
}); 