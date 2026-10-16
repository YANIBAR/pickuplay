import { COLORS, images } from '@constants';
import { Button, Header, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from '@services/auth/auth.utils';
import { useNavigation } from '@react-navigation/native';
import publicNestApi from '@services/api';
import axios from 'axios';
import { API_BASE_URL, JAVA_API, NEST_BACKEND_URL } from '@env';

type Competition = {
  id: number;
  organizerId: number;
  name: string;
  sportType: string;
  city: string;
  address: string;
  startDate: string;
  description: string | null;
  startRegistration: string;
  endRegistration: string;
  nbrOfTeams: number;
  teamSize: number;
  nbrOfSubs: number;
  format: string;
  pricePlayer: number;
  gender: string;
  availableSpots: number | undefined;
  minimumAge: number;
  comment: string;
  referee: boolean;
  prize: boolean;
  pennies: boolean;
  teams: Record<string, string>;
  logo?: string;
};

type FilterKey = 'city' | 'sportType' | 'teamSize' | 'format' | 'gender';
type Filters = Record<FilterKey, string | null>;

const EMPTY_FILTERS: Filters = {
  city: null,
  sportType: null,
  teamSize: null,
  format: null,
  gender: null,
};

const FILTERS: { key: FilterKey; labelKey: string; fallback: string }[] = [
  { key: 'city', labelKey: 'filters.city', fallback: 'City' },
  { key: 'sportType', labelKey: 'filters.sport', fallback: 'Sport' },
  { key: 'teamSize', labelKey: 'filters.teamSize', fallback: 'Team size' },
  { key: 'format', labelKey: 'filters.format', fallback: 'Format' },
  { key: 'gender', labelKey: 'filters.gender', fallback: 'Gender' },
];

function getFilterValue(c: Competition, key: FilterKey): string {
  return String(c[key] ?? '');
}

function getOptionLabel(key: FilterKey, value: string) {
  return key === 'teamSize' ? `${value}v${value}` : value;
}

const SPORT_ICONS: Record<string, string> = {
  Soccer: '⚽',
  Basketball: '🏀',
  Volleyball: '🏐',
  Softball: '⚾',
  Flag_Football: '🏈',
};

function formatPrice(price: number) {
  return `$${Number(price).toFixed(2)}`;
}

function getRegistrationStatus(endRegistration: string) {
  const now = new Date();
  const end = new Date(endRegistration);
  return now <= end ? 'open' : 'closed';
}

export default function NoCompetitionPage() {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const [role, setRole] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  const filteredCompetitions = useMemo(
    () =>
      competitions.filter((c) =>
        (Object.keys(filters) as FilterKey[]).every(
          (key) => !filters[key] || getFilterValue(c, key) === filters[key]
        )
      ),
    [competitions, filters]
  );

  // Options are built from the loaded data so users only see values that exist.
  const filterOptions = useMemo(() => {
    const result = {} as Record<FilterKey, string[]>;
    FILTERS.forEach(({ key }) => {
      const unique = Array.from(
        new Set(competitions.map((c) => getFilterValue(c, key)).filter(Boolean))
      );
      result[key] =
        key === 'teamSize'
          ? unique.sort((a, b) => Number(a) - Number(b))
          : unique.sort((a, b) => a.localeCompare(b));
    });
    return result;
  }, [competitions]);

  const selectFilter = (key: FilterKey, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOpenFilter(null);
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}competitions`
      );
      setCompetitions(response.data.data.content ?? []);
    } catch (err) {
      const errorMessage =
        (err as any).response?.data?.message ?? t('errors.fetchFailed');
      setError(errorMessage);
      console.error('competition fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCompetitions();

    const fetchRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          setRole(null);
          return;
        }
        const userInfo = decodeToken(token);
        setRole(userInfo?.role ?? null);
      } catch (err) {
        console.error('Failed to fetch role:', err);
        setRole(null);
      }
    };
    fetchRole();
  }, [fetchCompetitions]);

  const renderCompetition = ({ item: competition }: { item: Competition }) => {
    const registrationStatus = getRegistrationStatus(competition.endRegistration);
    const sportIcon = SPORT_ICONS[competition.sportType] ?? '🏆';

    return (
      <TouchableOpacity
        style={styles.competitionCard}
        activeOpacity={0.85}
        onPress={() =>
          navigate('competitionDetail', { competition_id: competition.id })
        }
      >
        <Image
          source={{
            uri: competition?.logo,
          }}
          style={styles.competitionImage}
        />

        <View style={styles.competitionInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.competitionName} numberOfLines={1}>
              {competition.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                registrationStatus === 'closed' && styles.statusBadgeClosed,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  registrationStatus === 'closed' && styles.statusBadgeTextClosed,
                ]}
              >
                {registrationStatus === 'open'
                  ? t('competitions.registrationOpen')
                  : t('competitions.registrationClosed')}
              </Text>
            </View>
          </View>

          <Text style={styles.competitionSport}>
            {sportIcon} {competition.sportType}
          </Text>

          <View style={styles.metaRow}>
            <Icon type="feather" name="users" size={13} color="#777" />
            <Text style={styles.metaText}>
              {competition.nbrOfTeams} {t('competitions.teams')} ·{' '}
              {competition.teamSize}v{competition.teamSize} ·{' '}
              {competition.gender}
              {competition.availableSpots !== undefined && (
                <Text style={styles.metaText}>
                  {' '}
                  · {competition.availableSpots} {t('competitions.slots')}
                </Text>
              )}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.priceText}>
              {formatPrice(competition.pricePlayer)} / {t('competitions.player')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterBar = () => (
    <View style={styles.filterBarWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        {FILTERS.map(({ key, labelKey, fallback }) => {
          const value = filters[key];
          const label = t(labelKey, { defaultValue: fallback });
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, value && styles.chipActive]}
              activeOpacity={0.8}
              onPress={() => setOpenFilter(key)}
            >
              <Text style={[styles.chipText, value && styles.chipTextActive]}>
                {value ? getOptionLabel(key, value) : label}
              </Text>
              <Icon
                type="feather"
                name="chevron-down"
                size={14}
                color={value ? COLORS.primary : '#777'}
              />
            </TouchableOpacity>
          );
        })}
        {activeFilterCount > 0 && (
          <TouchableOpacity
            style={styles.clearChip}
            activeOpacity={0.8}
            onPress={clearFilters}
          >
            <Text style={styles.clearChipText}>
              {t('filters.clear', { defaultValue: 'Clear' })} ({activeFilterCount})
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  const renderFilterModal = () => {
    const activeConfig = FILTERS.find((f) => f.key === openFilter);
    const options = openFilter ? filterOptions[openFilter] : [];
    const selected = openFilter ? filters[openFilter] : null;

    return (
      <Modal
        visible={openFilter !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setOpenFilter(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpenFilter(null)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {activeConfig
              ? t(activeConfig.labelKey, { defaultValue: activeConfig.fallback })
              : ''}
          </Text>
          <ScrollView style={styles.sheetList}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => openFilter && selectFilter(openFilter, null)}
            >
              <Text style={[styles.optionText, !selected && styles.optionTextActive]}>
                {t('filters.all', { defaultValue: 'All' })}
              </Text>
              {!selected && (
                <Icon type="feather" name="check" size={18} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            {options.map((option) => {
              const isSelected = selected === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  onPress={() => openFilter && selectFilter(openFilter, option)}
                >
                  <Text
                    style={[styles.optionText, isSelected && styles.optionTextActive]}
                  >
                    {openFilter ? getOptionLabel(openFilter, option) : option}
                  </Text>
                  {isSelected && (
                    <Icon type="feather" name="check" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('menu.competitions')}>
        {role === 'ADMIN' && (
          <TouchableOpacity
            onPress={() => navigate('addCompetition')}
            style={styles.iconBtn}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon type="feather" name="plus" />
          </TouchableOpacity>
        )}
      </Header>

      {!error && competitions.length > 0 && renderFilterBar()}

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.description}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={fetchCompetitions}>
            <Text style={styles.primaryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : competitions.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.emptyStateIcon}>
            <Text style={styles.emptyStateText}>🏆</Text>
          </View>
          <Text style={styles.mainTitle}>{t('competition.emptyTitle')}</Text>
          <Text style={styles.description}>{t('competition.emptyDescription')}</Text>
        </View>
      ) : filteredCompetitions.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.mainTitle}>
            {t('filters.noResultsTitle', { defaultValue: 'No competitions match' })}
          </Text>
          <Text style={styles.description}>
            {t('filters.noResultsDescription', {
              defaultValue: 'Try removing a filter to see more results.',
            })}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={clearFilters}>
            <Text style={styles.primaryButtonText}>
              {t('filters.clearAll', { defaultValue: 'Clear filters' })}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCompetitions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCompetition}
          contentContainerStyle={styles.scrollContent}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          onRefresh={fetchCompetitions}
          refreshing={loading}
        />
      )}
      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 16 },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconBtn: { marginHorizontal: 8 },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f5f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: { fontSize: 48 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  competitionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  competitionImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#ddd',
  },
  competitionInfo: { flex: 1, marginLeft: 14, justifyContent: 'space-between' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  competitionName: { fontSize: 18, fontWeight: '700', color: '#111', flexShrink: 1 },
  competitionSport: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  metaText: { fontSize: 13, color: '#777', flexShrink: 1 },
  statusBadge: {
    backgroundColor: '#E8FFFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeClosed: { backgroundColor: '#FFEDED' },
  statusBadgeText: { color: '#19C2A0', fontSize: 11, fontWeight: '700' },
  statusBadgeTextClosed: { color: '#E05A5A' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  priceText: { fontSize: 14, fontWeight: '700', color: '#111' },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: { fontSize: 11, color: '#666', fontWeight: '600' },

  filterBarWrap: { flexGrow: 0 },
  filterBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e3',
  },
  chipActive: { backgroundColor: '#E8FFFA', borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: '#333' },
  chipTextActive: { color: COLORS.primary },
  clearChip: { paddingHorizontal: 10, paddingVertical: 8 },
  clearChipText: { fontSize: 13, fontWeight: '600', color: '#E05A5A' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
  sheetList: { flexGrow: 0 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e3e3',
  },
  optionText: { fontSize: 16, color: '#333' },
  optionTextActive: { color: COLORS.primary, fontWeight: '700' },
});