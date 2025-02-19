import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  Animated,
  Dimensions 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import axios from 'axios';
import { COLORS } from '../constants/Colors';

const { width } = Dimensions.get('window');

const cleanHtmlTags = (text) => {
  return text.replace(/<[^>]*>/g, '');
};

const DescriptionDropdown = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  return (
    <View style={styles.descriptionContainer}>
      <TouchableOpacity 
        onPress={toggleExpand} 
        style={[
          styles.expandButton,
          expanded && styles.expandButtonActive
        ]}
      >
        <Text style={styles.expandText}>
          {expanded ? 'Tutup deskripsi surah' : 'Baca deskripsi surah'}
        </Text>
        <MaterialIcons 
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
          size={20} 
          color={COLORS.light} 
        />
      </TouchableOpacity>

      {expanded && (
        <Animated.View 
          style={[
            styles.descriptionContent,
            {
              opacity,
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.descriptionHeader}>
            <MaterialIcons 
              name="info-outline" 
              size={20} 
              color={COLORS.accent}
              style={styles.infoIcon}
            />
            <Text style={styles.descriptionTitle}>Tentang Surah Ini</Text>
          </View>
          <Text style={styles.description}>
            {cleanHtmlTags(description)}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const AyahCard = ({ item, isHighlighted }) => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format audio URL menggunakan API alquran.cloud
  const getAudioUrl = (surahNumber, ayatNumber) => {
    // Menggunakan reciter Mishari Rashid al-`Afasy
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${item.nomor_ayat_global}.mp3`;
  };

  async function playSound(surahNumber, ayatNumber) {
    try {
      setIsLoading(true);
      if (sound) {
        await sound.unloadAsync();
      }

      const audioUrl = getAudioUrl(surahNumber, ayatNumber);
      console.log('Playing audio:', audioUrl);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
      alert('Maaf, terjadi kesalahan saat memainkan audio. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await sound?.pauseAsync();
        setIsPlaying(false);
      } else {
        if (sound) {
          await sound.playAsync();
          setIsPlaying(true);
        } else {
          await playSound(item.surah, item.nomor);
        }
      }
    } catch (error) {
      console.error('Error handling play/pause:', error);
      alert('Maaf, terjadi kesalahan saat memainkan audio');
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View>
      <View style={styles.ayahCard}>
        <View style={styles.ayahHeader}>
          <View style={styles.numberContainer}>
            <Text style={styles.ayahNumber}>{item.nomor}</Text>
          </View>
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.accent} />
            ) : (
              <Ionicons 
                name={isPlaying ? "pause-circle" : "play-circle"} 
                size={36} 
                color={COLORS.accent} 
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.ayahContent}>
          <View style={styles.arabicContainer}>
            <Text style={styles.arabicText}>{item.ar}</Text>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.translationContainer}>
            <Text style={styles.latinText}>{cleanHtmlTags(item.tr)}</Text>
            <Text style={styles.translationText}>{item.idn}</Text>
          </View>
        </View>
      </View>
      {isHighlighted && <View style={styles.searchDivider} />}
    </View>
  );
};

export default function SurahScreen({ route, navigation }) {
  const { nomor, nama, nama_latin, deskripsi, jumlah_ayat, scrollToAyat, activeRoute } = route.params;
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set activeRoute saat komponen dimount
    navigation.getParent()?.setParams({ activeRoute });
    
    fetchAyahs();
    // Setup audio mode
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const fetchAyahs = async () => {
    try {
      const response = await axios.get(`https://quran-api.santrikoding.com/api/surah/${nomor}`);
      
      // Hitung nomor ayat global
      let startAyat = 0;
      if (nomor > 1) {
        // Fetch data surah sebelumnya untuk mendapatkan total ayat
        const prevSurahsResponse = await axios.get('https://quran-api.santrikoding.com/api/surah');
        for (let i = 0; i < nomor - 1; i++) {
          startAyat += prevSurahsResponse.data[i].jumlah_ayat;
        }
      }

      // Tambahkan nomor surah dan nomor ayat global ke setiap ayat
      let ayatsWithData = response.data.ayat.map((ayat) => ({
        ...ayat,
        surah: nomor,
        nomor_ayat_global: startAyat + ayat.nomor
      }));

      // Jika ada ayat yang dicari, atur ulang urutan ayat
      if (scrollToAyat) {
        const targetAyatIndex = ayatsWithData.findIndex(
          ayat => ayat.nomor === parseInt(scrollToAyat)
        );
        
        if (targetAyatIndex !== -1) {
          const targetAyat = ayatsWithData[targetAyatIndex];
          ayatsWithData = [
            targetAyat,
            ...ayatsWithData.slice(0, targetAyatIndex),
            ...ayatsWithData.slice(targetAyatIndex + 1)
          ];
        }
      }

      setAyahs(ayatsWithData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ayahs:', error);
      setLoading(false);
    }
  };

  const renderAyahCard = useCallback(({ item }) => (
    <AyahCard 
      item={item}
      isHighlighted={scrollToAyat && item.nomor === parseInt(scrollToAyat)}
    />
  ), [scrollToAyat]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.surahName}>{nama}</Text>
          <Text style={styles.surahNameLatin}>{nama_latin}</Text>
          <Text style={styles.surahInfo}>
            {jumlah_ayat} Ayat
          </Text>
        </View>
        <View style={styles.divider} />
        <DescriptionDropdown description={deskripsi} />
      </View>

      <FlatList
        data={ayahs}
        renderItem={renderAyahCard}
        keyExtractor={(item) => item.nomor.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        initialNumToRender={5}
        windowSize={5}
        ListHeaderComponent={scrollToAyat ? (
          <View style={styles.jumpToContainer}>
            <Text style={styles.jumpToText}>
              Menampilkan Ayat {scrollToAyat}
            </Text>
          </View>
        ) : null}
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 12,
    paddingTop: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 8,
  },
  surahName: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  surahNameLatin: {
    fontSize: 15,
    color: COLORS.light,
    marginBottom: 2,
  },
  surahInfo: {
    fontSize: 13,
    color: COLORS.light,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.light,
    opacity: 0.2,
    marginVertical: 8,
  },
  descriptionContainer: {
    overflow: 'hidden',
  },
  descriptionContent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoIcon: {
    marginRight: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: COLORS.light,
    textAlign: 'justify',
    lineHeight: 22,
    opacity: 0.9,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  expandButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  expandText: {
    color: COLORS.light,
    fontSize: 13,
    marginRight: 5,
    opacity: 0.9,
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
    paddingTop: 12,
  },
  ayahCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 2,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: COLORS.primary + '08',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  numberContainer: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  ayahNumber: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  audioButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  ayahContent: {
    padding: 16,
  },
  arabicContainer: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  arabicText: {
    fontSize: 30,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 55,
    textAlignVertical: 'center',
    writingDirection: 'rtl',
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS.accent + '30',
    marginVertical: 12,
    width: '100%',
  },
  translationContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    width: '100%',
  },
  latinText: {
    fontSize: 16,
    color: '#9A7777',
    marginBottom: 8,
    fontStyle: 'italic',
    textAlign: 'left',
    lineHeight: 24,
  },
  translationText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'left',
  },
  highlightedAyah: {
    backgroundColor: COLORS.accent + '08',
  },
  jumpToContainer: {
    backgroundColor: COLORS.accent + '20',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  jumpToText: {
    color: COLORS.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  searchDivider: {
    height: 2,
    backgroundColor: COLORS.accent,
    marginHorizontal: 20,
    marginBottom: 15,
    opacity: 0.5,
  },
});