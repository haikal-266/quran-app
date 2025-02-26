import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  Pressable,
  Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
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

// Komponen JuzModal
const JuzModal = ({ visible, onClose, onSelectJuz }) => {
  const juzList = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    label: `Juz ${i + 1}`
  }));

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={onClose}
      >
        <View style={styles.juzMenuContainer}>
          <View style={styles.juzHeader}>
            <Text style={styles.juzTitle}>Pilih Juz</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={juzList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.juzItem}
                onPress={() => {
                  onSelectJuz(item.id);
                  onClose();
                }}
              >
                <Text style={styles.juzNumber}>{item.id}</Text>
                <Text style={styles.juzLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

// Komponen SortMenu
const SortMenu = ({ visible, onClose, onSort, currentSort, onJuzPress }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const sortOptions = [
    { id: 'juz', label: 'Urutan Juz', icon: 'format-list-numbered' },
    { id: 'revelation', label: 'Makkiyah/Madaniyah', icon: 'place' },
    { id: 'verses-asc', label: 'Ayat Terdikit', icon: 'arrow-upward' },
    { id: 'verses-desc', label: 'Ayat Terbanyak', icon: 'arrow-downward' },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.sortMenuContainer,
            {
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                currentSort === option.id && styles.sortOptionActive,
              ]}
              onPress={() => {
                if (option.id === 'juz') {
                  onJuzPress();
                } else {
                  onSort(option.id);
                  onClose();
                }
              }}
            >
              <MaterialIcons
                name={option.icon}
                size={24}
                color={currentSort === option.id ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  currentSort === option.id && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
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
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentSort, setCurrentSort] = useState(null);
  const [showJuzModal, setShowJuzModal] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [revelationType, setRevelationType] = useState(null);

  const fetchSurahs = useCallback(async () => {
    try {
      const response = await axios.get('https://quran-api.santrikoding.com/api/surah');
      setSurahs(response.data);
      setFilteredSurahs(response.data);
    } catch (error) {
      console.error('Error fetching surahs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSort = useCallback((sortType) => {
    let sortedSurahs = [...surahs];

    switch (sortType) {
      case 'revelation':
        if (revelationType === 'mekah') {
          // Jika sudah menampilkan Makkiyah, ganti ke Madaniyah
          setRevelationType('madinah');
          setCurrentSort('revelation');
          const madaniyahSurahs = surahs.filter(surah => 
            surah.tempat_turun.toLowerCase() === 'madinah'
          );
          setFilteredSurahs(madaniyahSurahs);
        } else if (revelationType === 'madinah') {
          // Jika sudah menampilkan Madaniyah, reset ke semua surah
          setRevelationType(null);
          setCurrentSort(null);
          setFilteredSurahs(surahs);
        } else {
          // Default: tampilkan Makkiyah
          setRevelationType('mekah');
          setCurrentSort('revelation');
          const makkiyahSurahs = surahs.filter(surah => 
            surah.tempat_turun.toLowerCase() === 'mekah'
          );
          setFilteredSurahs(makkiyahSurahs);
        }
        break;

      case 'verses-asc':
        setCurrentSort('verses-asc');
        setRevelationType(null);
        sortedSurahs.sort((a, b) => parseInt(a.jumlah_ayat) - parseInt(b.jumlah_ayat));
        setFilteredSurahs([...sortedSurahs]);
        break;

      case 'verses-desc':
        setCurrentSort('verses-desc');
        setRevelationType(null);
        sortedSurahs.sort((a, b) => parseInt(b.jumlah_ayat) - parseInt(a.jumlah_ayat));
        setFilteredSurahs([...sortedSurahs]);
        break;

      default:
        setCurrentSort(null);
        setRevelationType(null);
        sortedSurahs.sort((a, b) => a.nomor - b.nomor);
        setFilteredSurahs([...sortedSurahs]);
        break;
    }
  }, [surahs, revelationType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentSort(null);
    setRevelationType(null);
    setSelectedJuz(null);
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

  const handleJuzSelect = (juzNumber) => {
    setSelectedJuz(juzNumber);
    setShowJuzModal(false);
    
    // Data pembagian surah berdasarkan juz
    const juzData = {
      1: [1, 2], // Al-Fatihah 1-7, Al-Baqarah 1-141
      2: [2], // Al-Baqarah 142-252
      3: [2, 3], // Al-Baqarah 253-286, Ali Imran 1-91
      4: [3, 4], // Ali Imran 92-200, An-Nisa 1-23
      5: [4], // An-Nisa 24-147
      6: [4, 5], // An-Nisa 148-176, Al-Ma'idah 1-82
      7: [5, 6], // Al-Ma'idah 83-120, Al-An'am 1-110
      8: [6, 7], // Al-An'am 111-165, Al-A'raf 1-87
      9: [7, 8], // Al-A'raf 88-206, Al-Anfal 1-40
      10: [8, 9], // Al-Anfal 41-75, At-Taubah 1-93
      11: [9, 10, 11], // At-Taubah 94-129, Yunus 1-109, Hud 1-5
      12: [11, 12], // Hud 6-123, Yusuf 1-52
      13: [12, 13, 14], // Yusuf 53-111, Ar-Ra'd 1-43, Ibrahim 1-52
      14: [15, 16], // Al-Hijr 1-99, An-Nahl 1-128
      15: [17, 18], // Al-Isra' 1-111, Al-Kahfi 1-74
      16: [18, 19, 20], // Al-Kahfi 75-110, Maryam 1-98, Ta Ha 1-135
      17: [21, 22], // Al-Anbiya 1-112, Al-Hajj 1-78
      18: [23, 24, 25], // Al-Mu'minun 1-118, An-Nur 1-64, Al-Furqan 1-20
      19: [25, 26, 27], // Al-Furqan 21-77, Asy-Syu'ara' 1-227, An-Naml 1-55
      20: [27, 28, 29], // An-Naml 56-93, Al-Qasas 1-88, Al-'Ankabut 1-45
      21: [29, 30, 31, 32, 33], // Al-'Ankabut 46-69, Ar-Rum 1-60, Luqman 1-34, As-Sajdah 1-30, Al-Ahzab 1-30
      22: [33, 34, 35, 36], // Al-Ahzab 31-73, Saba' 1-54, Fatir 1-45, Ya Sin 1-27
      23: [36, 37, 38, 39], // Ya Sin 28-83, As-Saffat 1-182, Sad 1-88, Az-Zumar 1-31
      24: [39, 40, 41], // Az-Zumar 32-75, Al-Ghafir 1-85, Fussilat 1-46
      25: [41, 42, 43, 44, 45], // Fussilat 47-54, Asy-Syura 1-53, Az-Zukhruf 1-89, Ad-Dukhan 1-59, Al-Jatsiyah 1-37
      26: [45, 46, 47, 48, 49, 50, 51], // Al-Jatsiyah 33-37, Al-Ahqaf 1-35, Muhammad 1-38, Al-Fath 1-29, Al-Hujurat 1-18, Qaf 1-45, Az-Zariyat 1-30
      27: [51, 52, 53, 54, 55, 56, 57], // Az-Zariyat 31-60, At-Tur 1-49, An-Najm 1-62, Al-Qamar 1-55, Ar-Rahman 1-78, Al-Waqi'ah 1-96, Al-Hadid 1-29
      28: [58, 59, 60, 61, 62, 63, 64, 65, 66], // Al-Mujadilah 1-22, Al-Hasyr 1-24, Al-Mumtahanah 1-13, As-Saff 1-14, Al-Jumu'ah 1-11, Al-Munafiqun 1-11, At-Tagabun 1-18, At-Talaq 1-12, At-Tahrim 1-12
      29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77], // Al-Mulk sampai Al-Mursalat
      30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114] // An-Naba' - An-Nas
    };

    if (juzNumber === null) {
      setFilteredSurahs(surahs);
    } else {
      const surahsInJuz = juzData[juzNumber] || [];
      const filtered = surahs.filter(surah => surahsInJuz.includes(surah.nomor));
      setFilteredSurahs(filtered);
    }
  };

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
        <Text style={styles.headerSubtitle}>
          {selectedJuz ? `Juz ${selectedJuz}` : 'Baca dan Pelajari Al-Qur\'an'}
        </Text>
      </View>

      <SortMenu
        visible={showSortMenu}
        onClose={() => setShowSortMenu(false)}
        onSort={handleSort}
        currentSort={currentSort}
        onJuzPress={() => {
          setShowJuzModal(true);
          setShowSortMenu(false);
        }}
      />

      <JuzModal
        visible={showJuzModal}
        onClose={() => setShowJuzModal(false)}
        onSelectJuz={handleJuzSelect}
      />

      <FlatList
        data={filteredSurahs}
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
            onRefresh={() => {
              setSelectedJuz(null);
              onRefresh();
            }}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fabSort}
        onPress={() => setShowSortMenu(true)}
      >
        <MaterialIcons name="sort" size={24} color={COLORS.white} />
      </TouchableOpacity>
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
  fabSort: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortMenuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 8,
    width: width * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginVertical: 4,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
  },
  sortOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },
  juzMenuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    width: width * 0.8,
    maxHeight: height * 0.7,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  juzHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  juzTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  juzItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  juzNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  juzLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
});