import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Game, extractCity } from './GameCard';
import GameGrid from './GamesGrid';
import { JAVA_API } from '@env';
import { useEffect, useState } from 'react';
import { Header, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@constants';
import { publicApi } from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';


const mockGames: Game[] = [];

const SPORTS = ['soccer', 'basketball', 'volleyball', 'tennis'];
const SPORT_LABELS = {
  soccer: '⚽ Soccer',
  basketball: '🏀 Basketball',
  volleyball: '🏐 Volleyball',
  tennis: '🎾 Tennis',
};

export default function HomeScreen({route}) {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  
  // Filter states
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Modal states
  const [sportModalVisible, setSportModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await publicApi.get(`games`);
      setGames(response.result.data.games);
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      Alert.alert('Error', errorMessage);
      console.error('Game creation failed:', error);
      setGames(mockGames);
    }
  };

  // Get unique cities from games
  const getCities = (): string[] => {
    const cities = new Set(games.map(game => extractCity(game.city)));
    return Array.from(cities).sort();
  };

  // Get next 7 days for date filter
  const getUpcomingDates = (): string[] => {
    const dates = [];
    for (let i = 1; i < 9; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Filter games based on selected filters
  const applyFilters = () => {
    let filtered = [...games];

    if (selectedSports.length > 0) {
      filtered = filtered.filter(game => selectedSports.includes(game.type));
    }

    if (selectedCities.length > 0) {
      filtered = filtered.filter(game => 
        selectedCities.includes(extractCity(game.city))
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(game => {
        if (!game.date) return false;
        return game.date.startsWith(selectedDate);
      });
    }

    setFilteredGames(filtered);
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [selectedSports, selectedCities, selectedDate, games]);

  useEffect(() => {
    fetchRequests();
  }, []);

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
    setSelectedDate(null);
  };

  const hasActiveFilters = selectedSports.length > 0 || selectedCities.length > 0 || selectedDate;

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Filters Bar */}

      <View style={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersBar}>
          <TouchableOpacity 
            style={[styles.filterButton, selectedSports.length > 0 && styles.filterButtonActive]}
            onPress={() => setSportModalVisible(true)}
          >
            <Icon type="materialCommunityIcons" name="soccer" size={16} color={selectedSports.length > 0 ? 'white' : COLORS.primary} />
            <Text style={[styles.filterButtonText, selectedSports.length > 0 && styles.filterButtonTextActive]}>
              {selectedSports.length > 0 ? `${selectedSports.length} Sports` : 'Sport'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, selectedCities.length > 0 && styles.filterButtonActive]}
            onPress={() => setCityModalVisible(true)}
          >
            <Icon type="materialCommunityIcons" name="map-marker" size={16} color={selectedCities.length > 0 ? 'white' : COLORS.primary} />
            <Text style={[styles.filterButtonText, selectedCities.length > 0 && styles.filterButtonTextActive]}>
              {selectedCities.length > 0 ? `${selectedCities.length} Cities` : 'City'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, selectedDate && styles.filterButtonActive]}
            onPress={() => setDateModalVisible(true)}
          >
            <Icon type="materialCommunityIcons" name="calendar" size={16} color={selectedDate ? 'white' : COLORS.primary} />
            <Text style={[styles.filterButtonText, selectedDate && styles.filterButtonTextActive]}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date'}
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
        <GameGrid games={filteredGames} />
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
                <View style={styles.checkbox}>
                  {selectedSports.includes(sport) && (
                    <Icon type="materialCommunityIcons" name="check" size={16} color="white" />
                  )}
                </View>
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
            
            {getCities().map(city => (
              <TouchableOpacity
                key={city}
                style={styles.filterOption}
                onPress={() => handleCityToggle(city)}
              >
                <View style={styles.checkbox}>
                  {selectedCities.includes(city) && (
                    <Icon type="materialCommunityIcons" name="check" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.filterOptionText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date Filter Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dateModalVisible}
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.filterOption, !selectedDate && styles.filterOptionActive]}
              onPress={() => {
                setSelectedDate(null);
                setDateModalVisible(false);
              }}
            >
              <View style={styles.checkbox}>
                {!selectedDate && (
                  <Icon type="materialCommunityIcons" name="check" size={16} color="white" />
                )}
              </View>
              <Text style={styles.filterOptionText}>All Dates</Text>
            </TouchableOpacity>

            {getUpcomingDates().map(date => (
              <TouchableOpacity
                key={date}
                style={[styles.filterOption, selectedDate === date && styles.filterOptionActive]}
                onPress={() => {
                  setSelectedDate(date);
                  setDateModalVisible(false);
                }}
              >
                <View style={styles.checkbox}>
                  {selectedDate === date && (
                    <Icon type="materialCommunityIcons" name="check" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.filterOptionText}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  filtersBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    maxHeight: 60,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    minHeight:"100%"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionActive: {
    backgroundColor: '#f9f9f9',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});