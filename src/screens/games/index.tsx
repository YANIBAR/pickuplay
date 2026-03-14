import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Game, extractCity } from './GameCard';
import GameGrid from './GamesGrid';
import { useEffect, useState } from 'react';
import { Checkbox, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import { icons } from '@constants';
import { publicApi } from '@services/api';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { useUserData } from '@services/useUserData';
import { getCurrentCity } from '@utils/helpers';

type Nav = {
  navigate: (value: string) => void
}
const mockGames: Game[] = [];

const SPORTS = ['1', '2', '3', '5'];
const getSportLabels = (t: (key: string) => string) => ({
  1: t('home.sports.soccer'),
  2: t('home.sports.basketball'),
  3: t('home.sports.volleyball'),
  5: t('home.sports.tennis'),
});

export default function HomeScreen() {
  const { t } = useTranslation();
  const SPORT_LABELS = getSportLabels(t);
  const [games, setGames] = useState<Game[]>([]);
  const { userData, error, refreshUserData } = useUserData();
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { navigate } = useNavigation<Nav>();

  const [currentCity, setCurrentCity] = useState<string | null>(null);
  // Filter states
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  
  // Modal states
  const [sportModalVisible, setSportModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };
  const fetchRequests = async () => {
    try {
      const response = await publicApi.get(`games`);
      setGames(response.result.data.games);
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      Alert.alert('Error', errorMessage);
      setGames(mockGames);
    } finally {
      setRefreshing(false);
    }
  };

    // Get unique cities from games
  // Add this near your other state declarations
  const [cities, setCities] = useState<string[]>([]);

  // Replace your getCities function with this
  const getCities = async (): Promise<void> => {
    try {
      const response = await publicApi.get('cities');
      const cityList: City[] = response.result.data;

      const dbCities = cityList.map((city) => city.name);

      let updatedCities = [...dbCities];

      if (currentCity) {
        const userCity = extractCity(currentCity);

        // Add city if not in DB
        if (!dbCities.includes(userCity)) {
          updatedCities.unshift(userCity);
        } else {
          // Move it to first position
          updatedCities = [
            userCity,
            ...dbCities.filter((c) => c !== userCity),
          ];
        }

        // Select it by default
        setSelectedCities([userCity]);
      }

      setCities(updatedCities);
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message;
      Alert.alert('Error', errorMessage);
      console.error('Cities fetch failed:', error);
      setCities([]);
    }
  };
  // Filter games based on selected filters
  const applyFilters = () => {
    let filtered = [...games];

    if (selectedSports.length > 0) {
      filtered = filtered.filter(game => selectedSports.includes(String(game.sportType.id)));
    }
    // Use selected cities, or default to user's city if no city filter is active
    const citiesToFilter = selectedCities.length > 0 
      ? selectedCities 
      : currentCity ? [extractCity(currentCity)] : [];
    if (citiesToFilter.length > 0) {
      filtered = filtered.filter(game => 
        citiesToFilter.includes(extractCity(game.city))
      );
    }

    setFilteredGames(filtered);
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
    setRefreshing(false);
  }, [selectedSports, selectedCities, games]);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const city = await getCurrentCity();
        setCurrentCity(city);
      } catch (error) {
        console.error('Failed to get city:', error);
      }
    };
    fetchCity();
  }, []);

  useEffect(() => { 
    if (currentCity) {
      fetchRequests();
      getCities();
    }
  }, [currentCity]);

  const handleSportToggle = (sport: string) => {
    setSelectedSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const handleCityToggle = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const clearAllFilters = () => {
    setSelectedSports([]);
    setSelectedCities([]);
  };

  const hasActiveFilters = selectedSports.length > 0 || selectedCities.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Filters Bar */}

      <View style={styles.content}>
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersBar}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedSports.length > 0 && styles.filterButtonActive]}
              onPress={() => setSportModalVisible(true)}
            >
              <Text style={[styles.filterButtonText, selectedSports.length > 0 && styles.filterButtonTextActive]}>
                {selectedSports.length > 0 ? `${selectedSports.length} Sports` : 'Sport'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterButton, selectedCities.length > 0 && styles.filterButtonActive]}
              onPress={() => setCityModalVisible(true)}
            >
              <Text style={[styles.filterButtonText, selectedCities.length > 0 && styles.filterButtonTextActive]}>
                {selectedCities.length > 0 ? `${selectedCities.length} Cities` : 'City'}
              </Text>
            </TouchableOpacity>
            
            {hasActiveFilters && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearAllFilters}
              >
                <Icon type="materialCommunityIcons" name="close-circle" size={16} color="white" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Bell icon fixed to the right, outside the ScrollView */}
          <TouchableOpacity onPress={() => navigate("notifications")} style={styles.headerRight}>
            <Image
              source={icons.bellOutline}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>

        <GameGrid games={filteredGames} refreshing={refreshing} onRefresh={onRefresh}/>
      </View>

      {/* Sport Filter Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sportModalVisible}
        onRequestClose={() => setSportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sports</Text>
              <TouchableOpacity onPress={() => setSportModalVisible(false)}>
                <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {SPORTS.map(sport => (
              <TouchableOpacity
                key={sport}
                style={styles.filterOption}
                onPress={() => handleSportToggle(sport)}
              >
                <Checkbox
                  checked={selectedSports.includes(sport)}
                  onValueChange={() => handleSportToggle(sport)}
                />
                <Text style={styles.filterOptionText}>
                  {SPORT_LABELS[sport as keyof typeof SPORT_LABELS] || sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* City Filter Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cityModalVisible}
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Cities</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {cities.map(city => (
              <TouchableOpacity
                key={city}
                style={styles.filterOption}
                onPress={() => handleCityToggle(city)}
              >
                <Checkbox
                  checked={selectedCities.includes(city)}
                  onValueChange={() => handleCityToggle(city)}
                />
                <Text style={styles.filterOptionText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}