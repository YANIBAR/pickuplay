import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, FONTS, SIZES, icons, images } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { Button, Icon, Header, NotSignedInView } from '@components';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@services/useUserData';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { JAVA_API } from '@env';
import { authenticatedApi } from '@services/api';
import GameCard, { Game } from './gameCard';
import { isStoredTokenExpired } from '@utils/api/auth';

type Nav = {
  navigate: (value: string, params?: any) => void;
};

// ─── Mini Calendar ──────────────────────────────────────────────────────────

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

interface MiniCalendarProps {
  games: Game[];
  onDayPress: (day: number, month: number, year: number) => void;
  selectedDate: { day: number; month: number; year: number } | null;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ games, onDayPress, selectedDate }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const cells = getCalendarDays(viewYear, viewMonth);

  // Build a set of days-in-this-month that have games
  const gameDays = new Set<number>();
  games.forEach((g) => {
    if (!g.startTime) return;
    const d = new Date(g.startTime);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      gameDays.add(d.getDate());
    }
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day: number) =>
    selectedDate?.day === day &&
    selectedDate?.month === viewMonth &&
    selectedDate?.year === viewYear;

  return (
    <View style={calStyles.card}>
      {/* Month navigation */}
      <View style={calStyles.monthRow}>
        <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
          <Icon type="ionicons" name="chevron-back" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={calStyles.monthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
          <Icon type="ionicons" name="chevron-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Day-of-week labels */}
      <View style={calStyles.weekRow}>
        {DAYS_SHORT.map((d) => (
          <Text key={d} style={calStyles.weekLabel}>{d}</Text>
        ))}
      </View>

      {/* Day cells */}
      <View style={calStyles.grid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={`empty-${idx}`} style={calStyles.cell} />;

          const todayStyle = isToday(day);
          const selectedStyle = isSelected(day);
          const hasGame = gameDays.has(day);

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={calStyles.cell}
              onPress={() => onDayPress(day, viewMonth, viewYear)}
              activeOpacity={0.7}
            >
              <View style={[
                calStyles.dayCircle,
                todayStyle && calStyles.todayCircle,
                selectedStyle && calStyles.selectedCircle,
              ]}>
                <Text style={[
                  calStyles.dayText,
                  todayStyle && calStyles.todayText,
                  selectedStyle && calStyles.selectedText,
                ]}>
                  {day}
                </Text>
              </View>
              {hasGame && (
                <View style={[
                  calStyles.dot,
                  selectedStyle && { backgroundColor: COLORS.white },
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={calStyles.legendRow}>
        <View style={calStyles.legendDot} />
        <Text style={calStyles.legendText}>Game scheduled</Text>
      </View>
    </View>
  );
};

// ─── Calendar styles ─────────────────────────────────────────────────────────
import { StyleSheet } from 'react-native';

const calStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#aaa',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: COLORS.primary,
  },
  selectedCircle: {
    backgroundColor: COLORS.primary,
    opacity: 0.85,
  },
  dayText: {
    fontSize: 13,
    color: '#333',
  },
  todayText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  selectedText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#888',
  },
});

// ─── Main Profile Component ───────────────────────────────────────────────────

const Profile = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const { userData, error, refreshUserData } = useUserData();
  const [isLogged, setIsLogged] = useState(false);
  const refRBSheet = useRef<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // ─── Games state ──────────────────────────────────────────────
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [showAllGames, setShowAllGames] = useState(false);
  const GAMES_PREVIEW = 3;

  // Joined games state for calendar
  const [joinedGames, setJoinedGames] = useState<Game[]>([]);
  const [joinedGamesLoading, setJoinedGamesLoading] = useState(false);
  const [joinedGamesError, setJoinedGamesError] = useState<string | null>(null);

  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ─── View mode: 'list' | 'calendar' ──────────────────────────
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedCalDate, setSelectedCalDate] = useState<{
    day: number; month: number; year: number;
  } | null>(null);

  // Games filtered by selected calendar day (for joined games)
  const gamesForSelectedDay: Game[] = selectedCalDate
    ? joinedGames.filter((g) => {
        if (!g.date) return false;
        const d = new Date(g.date);
        return (
          d.getDate() === selectedCalDate.day &&
          d.getMonth() === selectedCalDate.month &&
          d.getFullYear() === selectedCalDate.year
        );
      })
    : [];

  const fetchProfileInfo = async () => {
    if (!userData?.id) return;
    try {
      setProfileLoading(true);
      const response = await authenticatedApi.get(`profile/${userData.id}`);
      const data = response.result?.data ?? response.data ?? null;
      setProfileInfo(data);
    } catch (err: any) {
      console.error('Error fetching profile info:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      setGamesLoading(true);
      setGamesError(null);
      const response = await authenticatedApi.get(`profile/games`);
      let gamesData = response.result?.data ?? response.data ?? [];
      if (!Array.isArray(gamesData)) gamesData = [];
      setGames(gamesData);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      setGamesError('Failed to load games.');
    } finally {
      setGamesLoading(false);
    }
  };

  // Fetch joined games for calendar
  const fetchJoinedGames = async () => {
    try {
      setJoinedGamesLoading(true);
      setJoinedGamesError(null);
      const response = await authenticatedApi.get(`profile/games/joined`);
      let gamesData = response.result?.data.games ;
      if (!Array.isArray(gamesData)) gamesData = [];
      setJoinedGames(gamesData);
    } catch (err: any) {
      console.error('Error fetching joined games:', err);
      setJoinedGamesError('Failed to load joined games.');
    } finally {
      setJoinedGamesLoading(false);
    }
  };

  const renderHeader = () => (
    <Header title={t('menu.user')}>
      <TouchableOpacity onPress={() => navigate('setting')}>
        <Image
          source={icons.settings}
          style={[styles.headerIcon, { tintColor: COLORS.secondary }]}
        />
      </TouchableOpacity>
    </Header>

  );

  useEffect(() => {
    const checkToken = async () => {
      const expired = await isStoredTokenExpired();
      setIsLogged(!expired);
    };
    checkToken();
    if (isLogged) {
      setSelectedImage(`${JAVA_API}profile/45/image`);
      fetchGames();
      fetchProfileInfo();
      fetchJoinedGames(); // fetch joined games for calendar
    }
  }, [userData?.id]);

  const uploadImage = async (file: any) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('picture', {
      uri: file.uri,
      name: file.fileName || 'default-image.jpg',
      type: file.type || 'image/jpeg',
    });
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${JAVA_API}profile/upload-image`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      setSelectedImage(file.uri);
      Alert.alert(t('profile.uploadSuccessTitle'), t('profile.uploadSuccessMessage'));
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.uploadFailed'));
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      t('profile.selectImageTitle'),
      t('profile.selectImageDescription'),
      [
        { text: t('profile.camera'), onPress: () => launchCameraForImage() },
        { text: t('profile.photoLibrary'), onPress: () => launchGalleryForImage() },
        { text: t('common.cancel'), onPress: () => {}, style: 'cancel' },
      ]
    );
  };

  const launchCameraForImage = () => {
    launchCamera({ mediaType: 'photo', cameraType: 'back', quality: 0.8 }, (response) => {
      if (response.assets?.[0]) {
        setSelectedImage(response.assets[0]);
        uploadImage(response.assets[0]);
      }
    });
  };

  const launchGalleryForImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, (response) => {
      if (response.assets?.[0]) {
        setSelectedImage(response.assets[0]);
        uploadImage(response.assets[0]);
      }
    });
  };

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: `${JAVA_API}profile/${userData?.id}/image` }}
          resizeMode="center"
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.pickImage} onPress={handleImagePicker}>
          <Icon type="materialCommunityIcons" name="pencil-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <Text style={[FONTS.h3]}>
        {profileInfo?.firstName ?? userData?.firstName}{' '}
        {profileInfo?.lastName ?? userData?.lastName}
      </Text>
    </View>
  );

  // ─── Toggle pill ───────────────────────────────────────────────
  const renderToggle = () => (
    <View style={toggleStyles.pill}>
      <TouchableOpacity
        style={[toggleStyles.btn, viewMode === 'list' && toggleStyles.btnActive]}
        onPress={() => setViewMode('list')}
        activeOpacity={0.8}
      >
        <Icon
          type="ionicons"
          name="list"
          size={14}
          color={viewMode === 'list' ? COLORS.white : COLORS.primary}
        />
        <Text style={[toggleStyles.btnText, viewMode === 'list' && toggleStyles.btnTextActive]}>
          {t('profile.list') ?? 'List'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[toggleStyles.btn, viewMode === 'calendar' && toggleStyles.btnActive]}
        onPress={() => setViewMode('calendar')}
        activeOpacity={0.8}
      >
        <Icon
          type="ionicons"
          name="calendar-outline"
          size={14}
          color={viewMode === 'calendar' ? COLORS.white : COLORS.primary}
        />
        <Text style={[toggleStyles.btnText, viewMode === 'calendar' && toggleStyles.btnTextActive]}>
          {t('profile.calendar') ?? 'Cal'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Calendar view ─────────────────────────────────────────────
  const renderCalendarView = () => (
    <>
      <MiniCalendar
        games={joinedGames}
        onDayPress={(day, month, year) => setSelectedCalDate({ day, month, year })}
        selectedDate={selectedCalDate}
      />

      {selectedCalDate && (
        <View style={{ marginTop: 4 }}>
          {joinedGamesLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : joinedGamesError ? (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ color: COLORS.red, marginBottom: 8 }}>{joinedGamesError}</Text>
              <TouchableOpacity onPress={fetchJoinedGames}>
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
                  {t('common.tryAgain')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : gamesForSelectedDay.length === 0 ? (
            <View style={noEventStyles.box}>
              <Text style={noEventStyles.text}>No games on this day.</Text>
            </View>
          ) : (
            gamesForSelectedDay.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPress={() => navigate('game', { game_id: game.id })}
              />
            ))
          )}
        </View>
      )}
    </>
  );

  const noEventStyles = StyleSheet.create({
    box: {
      backgroundColor: '#f5f5f5',
      borderRadius: 12,
      paddingVertical: 18,
      alignItems: 'center',
      marginBottom: 8,
    },
    text: { fontSize: 13, color: '#999' },
  });

  const toggleStyles = StyleSheet.create({
    pill: {
      flexDirection: 'row',
      backgroundColor: '#e0f2f1',
      borderRadius: 20,
      padding: 3,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 18,
    },
    btnActive: {
      backgroundColor: COLORS.primary,
    },
    btnText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.primary,
    },
    btnTextActive: {
      color: COLORS.white,
    },
  });

  // ─── List view (existing renderGames logic) ────────────────────
  const renderListView = () => {
    if (gamesLoading) {
      return (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }
    if (gamesError) {
      return (
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ color: COLORS.red, marginBottom: 8 }}>{gamesError}</Text>
          <TouchableOpacity onPress={fetchGames}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
              {t('common.tryAgain')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (games.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBg}>
            <Text style={styles.emptyIconText}>⚽</Text>
          </View>
          <Text style={styles.emptyText}>
            {t('profile.noActivity')}{' '}
            <Text style={styles.emptyBold}>{t('profile.firstGame')}</Text>
          </Text>
        </View>
      );
    }

    const visibleGames = showAllGames ? games : games.slice(0, GAMES_PREVIEW);

    return (
      <>
        {visibleGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => navigate('game', { game_id: game.id })}
          />
        ))}
        {games.length > GAMES_PREVIEW && (
          <TouchableOpacity
            onPress={() => navigate('myGames')}
            style={{
              alignSelf: 'center',
              marginTop: 8,
              marginBottom: 4,
              paddingVertical: 10,
              paddingHorizontal: 32,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: COLORS.primary,
            }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 14 }}>
              {t('common.showMore')}
            </Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.area]}>
      <ScrollView style={[styles.container]}>
        {renderHeader()}

        {isLogged ? (
          <View style={[styles.bottomContainer, { backgroundColor: COLORS.white }]}>

            {renderProfile()}

            {/* Stats */}
            <View style={styles.summaryViewContainer}>
              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.sport2} resizeMode="contain" style={styles.viewIcon} />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: '700' }]}>
                  {profileInfo ? profileInfo.gameStatistics.gameCount : 0} {t('menu.games')}
                </Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t('profile.joined')}
                </Text>
              </View>

              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image source={icons.timeCircle} resizeMode="contain" style={styles.viewIcon} />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: '700' }]}>
                  {profileInfo ? Math.floor(profileInfo.gameStatistics.totalMinutes / 60) : 0} hr
                </Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t('profile.played')}
                </Text>
              </View>

              <View style={styles.viewItemContainer}>
                <View style={styles.viewIconContainer}>
                  <Image
                    source={icons.fieldOutline}
                    resizeMode="contain"
                    style={{ height: 44, width: 44, tintColor: COLORS.primary }}
                  />
                </View>
                <Text style={[styles.viewTitle, { color: COLORS.grayscale900, fontWeight: '700' }]}>
                  0 {t('profile.fields')}
                </Text>
                <Text style={[styles.viewSubtitle, { color: COLORS.grayscale700 }]}>
                  {t('profile.rented')}
                </Text>
              </View>
            </View>

            {/* Organized Games section */}
            <View style={styles.locationItemContainer}>

              {/* Schedule shortcut card */}
              <TouchableOpacity style={styles.scheduleCard} onPress={() => navigate('booking')}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon type="ionicons" name="calendar-outline" size={24} color="#2EC4A6" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.scheduleTitle}>My Schedule</Text>
                    <Text style={styles.scheduleSubtitle}>Upcoming games & reservations</Text>
                  </View>
                </View>
                <Icon type="ionicons" name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              {/* Section title + toggle */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                marginTop: 4,
              }}>
                <Text style={styles.sectionTitle}>
                  {t('profile.organizedGames')}
                </Text>
                {renderToggle()}
              </View>

              {/* Conditional view */}
              {viewMode === 'list' ? renderListView() : renderCalendarView()}

            </View>
          </View>

        ) : (
          <View style={[styles.bottomContainer, {
            backgroundColor: COLORS.white,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
            paddingHorizontal: 24,
          }]}>
            <NotSignedInView
              heading="Sign in to join game"
              description="Access your upcoming and past sessions when signed in."
              containerStyle={{ flex: 1 }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;