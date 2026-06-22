import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, Alert, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Game, extractCity } from './GameCard';
import GameGrid from './GamesGrid';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Checkbox, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import { COLORS, icons, images } from '@constants';
import { publicApi } from '@services/api';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { getCurrentCity } from '@utils/helpers';
import { useNotifications } from '@contexts/NotificationContext';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { isStoredTokenExpired } from '@utils/api/auth';
import { JAVA_API } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
type Nav = {
  navigate: (value: string) => void
}

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
const toLocalDateString = (date: Date): string => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};
const PLAYER_OPTIONS = [
    { label: '2v2', value: '4' },
    { label: '3v3', value: '6' },
    { label: '4v4', value: '8' },
    { label: '5v5', value: '10' },
    { label: '6v6', value: '12' },
    { label: '7v7', value: '14' },
    { label: '8v8', value: '16' },
    { label: '9v9', value: '18' },
    { label: '10v10', value: '20' },
    { label: '11v11', value: '22' },
  ];
 const getWeekDays = () => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const daysUntil= 7;

  for (let i = 0; i <= daysUntil; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      label: i === 0 ? 'Today' : dayNames[date.getDay()],
      date: toLocalDateString(date),
      dayObj: date,
    });
  }
  return days;
};
export default function HomeScreen() {
  const { t } = useTranslation();
  const [isLogged, setIsLogged] = useState(false);
  const { unreadCount, addNotification } = useNotifications();
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
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  // Modal states
  const [sportModalVisible, setSportModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const weekDays = getWeekDays();

  const onRefresh = () => {
    setRefreshing(true);
    fetchGames();
  };
  const fetchGames = async () => {
      const response = await publicApi.get(`games`, { params: { date: new Date().toISOString().split('T')[0] } });
      setGames(response.result.data.games);
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

        if (!dbCities.includes(userCity)) {
          updatedCities.unshift(userCity);
        } else {
          updatedCities = [
            userCity,
            ...dbCities.filter((c) => c !== userCity),
          ];
        }

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
    const favoriteSportId = AsyncStorage.getItem('favoriteSport');
    if (selectedSports.length > 0) {
      filtered = filtered.filter(game => game.sportType.id === selectedSports[0]);
    }
    // Use selected cities, or default to user's city if no city filter is active
    const citiesToFilter = selectedCities.length > 0 
      ? selectedCities 
      : cities;
    if (citiesToFilter.length > 0) {
      filtered = filtered.filter(game => 
        citiesToFilter.includes(extractCity(game.city))
      );
    }
    
    // Filter by selected weekdays
    if (selectedDays.length > 0) {
      filtered = filtered.filter(game => {
        const gameDate = toLocalDateString(new Date(game.startTime));
        return selectedDays.includes(gameDate);
      });
    }

    // Filter by selected players
    if (selectedPlayers.length > 0) {
      filtered = filtered.filter(game =>{
        return selectedPlayers.includes(String(game.nbrSpots));
      }
        
      );
    }
    setFilteredGames(filtered);
  };

  useFocusEffect(
    useCallback(() => {
      if (currentCity) {
        fetchGames();
      }
    }, [currentCity])
  ); 

  // Apply filters whenever filter state changes
  useEffect(() => {
    const checkToken = async () => {
        const expired = await isStoredTokenExpired();
        setIsLogged(!expired); // ← also note the `!` — logged = NOT expired
      };
  
      checkToken();
    applyFilters();
    setRefreshing(false);
  }, [selectedSports, selectedCities, selectedDays, selectedPlayers, games]);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const city = await getCurrentCity();
        setCurrentCity("Kansas City");
      } catch (error) {
        console.error('Failed to get city:', error);
      }
    };
    
    const loadFavoriteSport = async () => {
      try {
        const value = await AsyncStorage.getItem('favoriteSport');
        if (value !== null) {
          const parsed = parseInt(value, 10);
          setSelectedSports([isNaN(parsed) ? null : parsed]);
        }
      } catch (e) {
        console.warn('Failed to load favorite sport', e);
      }
    };
    loadFavoriteSport();
    fetchCity();
  }, []);

  useEffect(() => {
    fetchGames();
    getCities();
    getSports();
  }, [currentCity]);

  const handleSportToggle = (sport: string) => {
    setSelectedSports(prev =>
      prev.includes(sport) ? [] : [sport]
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

  const handlePlayersToggle = (value: string) => {
    setSelectedPlayers(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    );
  };

  const clearAllFilters = () => {
    setSelectedSports([]);
    setSelectedCities([]);
    setSelectedDays([]); 
    setSelectedPlayers([]);
  };

  const hasActiveFilters = selectedSports.length > 0 || selectedCities.length > 0;
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onMessage(getMessaging(getApp()), remoteMessage => {
      const { messageId, notification, sentTime } = remoteMessage;

      addNotification({
        id: messageId ?? Date.now().toString(),
        title: notification?.title ?? '',
        body: notification?.body ?? '',
        date: new Date().toLocaleDateString(),
        type: remoteMessage.data?.type ?? 'general',
        isNew: true,
      });

      // Show toast
      setToast({ title: notification?.title ?? '', body: notification?.body ?? '' });
      setTimeout(() => setToast(null), 10000);
    });

    return () => unsubscribe();
  }, []);
  // Sport icon map — maps lowercase sport names to materialCommunityIcons icon names
  const sportIconMap: Record<string, string> = {
      1: 'soccer',
      2: 'basketball',
      3: 'volleyball',
      5: 'tennis',
      4: 'hockey-sticks',
      6: 'cricket',
      7: 'table-tennis',
      8: 'football',
      9: 'baseball',
  };

  const getSportIcon = (id: string): string => {
    const key = id;
    return sportIconMap[key] ?? 'trophy-outline';
  };

  const allSportsSelected = selectedSports.length === 0;
const FilterPillRow = ({
  label,
  items,
  selectedValues,
  onToggle,
}: {
  label: string;
  items: { value: string; label: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterSectionLabel}>{label}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillsContainer}
    >
      {items.map(({ value, label }) => {
        const isSelected = selectedValues.includes(value);
        return (
          <TouchableOpacity
            key={value}
            style={[styles.pill, isSelected && styles.pillActive]}
            onPress={() => onToggle(value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={label}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header row: filter icon + title + bell */}
        <View style={styles.headerRow}>
          <TouchableOpacity  onPress={() => setSportModalVisible(true)}>

          </TouchableOpacity>
          <Text style={styles.headerTitle}><Image
              source={images.logo}
              resizeMode="contain"
              style={styles.logo}
            /></Text>
          {isLogged ? (
            <TouchableOpacity onPress={() => navigate("notifications")} style={styles.headerRight}>
              <View>
                <Image source={icons.bellOutline} style={styles.headerIcon} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerRight} />
          )}
        </View>

        {/* Location + advanced filter row */}
        <View style={styles.locationRow}>
          <TouchableOpacity style={styles.locationPill} onPress={() => setCityModalVisible(true)}>
            <Icon type="materialCommunityIcons" name="map-marker-outline" size={16} color={COLORS.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedCities.length > 0 ? selectedCities.join(', ') : (currentCity ? extractCity(currentCity) : 'Select City')}
            </Text>
            <Icon type="fontAwesome" name="caret-down" size={14} color={COLORS.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerFilterIcon} onPress={() => setSportModalVisible(true)}>
            <Icon type="materialCommunityIcons" name="tune-variant" size={22} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        {/* Sport icon filter row */}
        <ScrollView
          style={filteredGames.length === 0 && !refreshing ? styles.sportsIconBarCompact : styles.sportsIconBar}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {/* All Sports */}
          <TouchableOpacity
            style={[styles.sportIconCard, allSportsSelected && styles.sportIconCardActive]}
            onPress={() => setSelectedSports([])}
          >
            <View style={[styles.sportIconCircle, allSportsSelected && styles.sportIconCircleActive]}>
              <Icon type="materialCommunityIcons" name="trophy-outline" size={26} color={allSportsSelected ? COLORS.white : COLORS.gray} />
            </View>
            <Text style={[styles.sportIconLabel, allSportsSelected && styles.sportIconLabelActive]}>All Sports</Text>
          </TouchableOpacity>

          {Sports.map(sport => {
            const isActive = selectedSports.includes(sport.value);
            return (
              <TouchableOpacity
                key={sport.value}
                style={[styles.sportIconCard, isActive && styles.sportIconCardActive]}
                onPress={() => handleSportToggle(sport.value)}
              >
                <View style={[styles.sportIconCircle, isActive && styles.sportIconCircleActive]}>
                  <Icon type="materialCommunityIcons" name={getSportIcon(sport.value)} size={26} color={isActive ? COLORS.white : COLORS.black} />
                </View>
                <Text style={[styles.sportIconLabel, isActive && styles.sportIconLabelActive]}>{sport.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        
        
        {filteredGames.length === 0 && !refreshing ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {selectedCities.length > 0
                ? `No games found in ${selectedCities.join(', ')}`
                : currentCity
                ? `No games found near ${extractCity(currentCity)}`
                : 'No games available'}
            </Text>
          </View>
        ) : (
          <GameGrid games={filteredGames} refreshing={refreshing} onRefresh={onRefresh} />
        )}
      </View>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastTitle}>{toast.title}</Text>
          <Text style={styles.toastBody}>{toast.body}</Text>
        </View>
      )}

      {/* Sport Filter Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={sportModalVisible}
        onRequestClose={() => setSportModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSportModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.dragHandle} />
              <Text style={styles.modalTitle}>Advanced Filter</Text>
              <TouchableOpacity
                onPress={() => setSportModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <Icon type="materialCommunityIcons" name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Filters */}
            <FilterPillRow
              label="Day"
              items={weekDays.map(d => ({ value: d.date, label: d.label }))}
              selectedValues={selectedDays}
              onToggle={handleDayToggle}
            />
            <FilterPillRow
              label="Players"
              items={PLAYER_OPTIONS}
              selectedValues={selectedPlayers}
              onToggle={handlePlayersToggle}
            />

            {/* Footer CTA */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setSportModalVisible(false)}
              accessibilityRole="button"
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
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
                <Text style={styles.filterOptionText}>{city==currentCity ? "Nearby (" + currentCity + ")" : city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}