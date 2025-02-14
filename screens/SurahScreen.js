import React, { useState, useEffect } from 'react';
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
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 300],
  });

  return (
    <View style={styles.descriptionContainer}>
      <Animated.View style={[styles.descriptionContent, { maxHeight }]}>
        <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
          {cleanHtmlTags(description)}
        </Text>
      </Animated.View>
      <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
        <Text style={styles.expandText}>
          {expanded ? 'Lihat lebih sedikit' : 'Lihat selengkapnya'}
        </Text>
        <MaterialIcons 
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
          size={24} 
          color={COLORS.light} 
        />
      </TouchableOpacity>
    </View>
  );
};

const AyahCard = ({ item, index }) => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format nomor surah dan ayat untuk URL audio
  const formatAudioUrl = (surahNumber, ayatNumber) => {
    const paddedSurah = String(surahNumber).padStart(3, '0');
    const paddedAyat = String(ayatNumber).padStart(3, '0');
    return `https://equran.id/audio/ayat/arabic-${paddedSurah}-${paddedAyat}.mp3`;
  };

  async function playSound(surahNumber, ayatNumber) {
    try {
      setIsLoading(true);
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }

      const audioUrl = formatAudioUrl(surahNumber, ayatNumber);
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
      alert('Maaf, terjadi kesalahan saat memainkan audio');
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
          // Dapatkan nomor surah dari parent component
          const surahNumber = item.surah || 1; // default ke surah 1 jika tidak ada
          await playSound(surahNumber, item.nomor);
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
              size={32} 
              color={COLORS.accent} 
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.ayahContent}>
        <Text style={styles.arabicText}>{item.ar}</Text>
        <View style={styles.translationContainer}>
          <Text style={styles.latinText}>{cleanHtmlTags(item.tr)}</Text>
          <Text style={styles.translationText}>{item.idn}</Text>
        </View>
      </View>
    </View>
  );
};

export default function SurahScreen({ route }) {
  const { nomor, nama, nama_latin, deskripsi, jumlah_ayat } = route.params;
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      // Tambahkan nomor surah ke setiap ayat
      const ayatsWithSurah = response.data.ayat.map(ayat => ({
        ...ayat,
        surah: nomor
      }));
      setAyahs(ayatsWithSurah);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ayahs:', error);
      setLoading(false);
    }
  };

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
        renderItem={({ item, index }) => <AyahCard item={item} index={index} />}
        keyExtractor={(item) => item.nomor.toString()}
        contentContainerStyle={styles.listContainer}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  surahName: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  surahNameLatin: {
    fontSize: 20,
    color: COLORS.light,
    marginBottom: 5,
  },
  surahInfo: {
    fontSize: 16,
    color: COLORS.light,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.light,
    opacity: 0.2,
    marginVertical: 15,
  },
  descriptionContainer: {
    overflow: 'hidden',
  },
  descriptionContent: {
    overflow: 'hidden',
  },
  description: {
    fontSize: 14,
    color: COLORS.light,
    textAlign: 'left',
    lineHeight: 20,
    opacity: 0.9,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  expandText: {
    color: COLORS.light,
    fontSize: 14,
    marginRight: 5,
  },
  listContainer: {
    padding: 15,
  },
  ayahCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  numberContainer: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumber: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  audioButton: {
    padding: 5,
  },
  ayahContent: {
    padding: 15,
  },
  arabicText: {
    fontSize: 28,
    color: COLORS.text,
    textAlign: 'right',
    lineHeight: 55,
    marginBottom: 20,
  },
  translationContainer: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    paddingLeft: 15,
  },
  latinText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  translationText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
});