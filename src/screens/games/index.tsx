import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Game, extractCity } from './GameCard';
import GameGrid from './GamesGrid';
import { useEffect, useState } from 'react';
import { Checkbox, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import { COLORS, icons } from '@constants';
import { publicApi } from '@services/api';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { getCurrentCity } from '@utils/helpers';

type Nav = {
  navigate: (value: string) => void
}
const mockGames: Game[] = [];

type Sport = {
  id: string;
  name: string;
};
 
type City = {
  name: string;
};
 
type SportOption = {
  label: string;
  value: string;
};
 const getWeekDays = () => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;

  for (let i = 0; i <= daysUntilThursday; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      label: i === 0 ? 'Today' : dayNames[date.getDay()],
      date: date.toISOString().split('T')[0], // ← YYYY-MM-DD
      dayObj: date,
    });
  }
  return days;
};
export default function HomeScreen() {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]); 
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { navigate } = useNavigation<Nav>();
  const [Sports, setSports] = useState<SportOption[]>([]);
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  // Filter states
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  // Modal states
  const [sportModalVisible, setSportModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const weekDays = getWeekDays();

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };
  const fetchRequests = async () => {
    try {
      const response = await publicApi.get(`games`, { params: { date: new Date().toISOString().split('T')[0] } });
      setGames(response.result.data.games);
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      Alert.alert('Error', errorMessage);
      setGames(mockGames);
    } finally {
      setRefreshing(false);
    }
  };

  const getSports = async (): Promise<void> => {
    try {
      const response = await publicApi.get('games/sports');
      const sportsList: Sport[] = response.result.data;
      setSports(sportsList.map((sport) => ({ label: sport.name, value: sport.id }))) 
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message;
      Alert.alert('Error', errorMessage);
      console.error('sport type fetch failed:', error);
      setSports([]); // fallback to empty array
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
      filtered = filtered.filter(game => selectedSports.includes(game.sportType.id));
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
    
    // Filter by selected weekdays
    if (selectedDays.length > 0) {
      filtered = filtered.filter(game => {
        const gameDate = new Date(game.startTime).toISOString().split('T')[0]; // ← YYYY-MM-DD
        return selectedDays.includes(gameDate);
      });
    }

    setFilteredGames(filtered);
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
    setRefreshing(false);
  }, [selectedSports, selectedCities, selectedDays, games]);

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
      getSports();
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

  const handleDayToggle = (dateString: string) => {
    setSelectedDays(prev =>
      prev.includes(dateString) ? prev.filter(d => d !== dateString) : [...prev, dateString]
    );
  };

  const clearAllFilters = () => {
    setSelectedSports([]);
    setSelectedCities([]);
    setSelectedDays([]);
  };

  const hasActiveFilters = selectedSports.length > 0 || selectedCities.length > 0;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersBar}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedSports.length > 0 && styles.filterButtonActive]}
              onPress={() => setSportModalVisible(true)}
            >
              <Text style={[styles.filterButtonText, selectedSports.length > 0 && styles.filterButtonTextActive]}>
                Sport
              </Text>
              {selectedSports.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{selectedSports.length}</Text>
                </View>
              )}
              <Icon type="fontAwesome" name="caret-down" size={16} color={selectedSports.length > 0 ? COLORS.white : COLORS.gray}/>

            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterButton, selectedCities.length > 0 && styles.filterButtonActive]}
              onPress={() => setCityModalVisible(true)}
            >
              <Text style={[styles.filterButtonText, selectedCities.length > 0 && styles.filterButtonTextActive]}>
                City
              </Text>
              {selectedCities.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{selectedCities.length}</Text>
                </View>
              )}
              <Icon type="fontAwesome" name="caret-down" size={16} color={selectedCities.length > 0 ? COLORS.white : COLORS.gray}/>
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
        <View style={styles.daysFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysFiltersBar}>
            {/* Weekday filter buttons */}
            {weekDays.map((day) => {
              const isSelected = selectedDays.includes(day.date);
              return (
                <TouchableOpacity
                  key={day.date}
                  style={[styles.filterButton, isSelected && styles.filterButtonActive]}
                  onPress={() => handleDayToggle(day.date)}
                >
                  <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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

            {Sports.map(sport => (
              <View style={styles.filterOption} key={sport.value}>
                <TouchableOpacity onPress={() => handleSportToggle(sport.value)}>
                  <Checkbox
                    checked={selectedSports.includes(sport.value)}
                    onValueChange={() => handleSportToggle(sport.value)}
                  />
                </TouchableOpacity>
                <Text onPress={() => handleSportToggle(sport.value)} style={styles.filterOptionText}>
                  {sport.label}
                </Text>
              </View>
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
                <Text style={styles.filterOptionText}>{city==currentCity ? "Nearby" : city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}