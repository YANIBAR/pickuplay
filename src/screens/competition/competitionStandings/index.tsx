import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '@constants';
import { Icon } from '@components'; 
import { API_BASE_URL } from '@env';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StandingTeam {
  id: number | string;
  name: string;
  color?: string | null;
  wins: number;
  losses: number;
  points: number;
  /** Optional: if the API adds a group (e.g. "A"), teams are split into group tables. */
  group?: string | null;
}

type Tab = 'group' | 'knockout';

interface Slot {
  label: string; // e.g. "1st Group B"
  team?: StandingTeam; // filled once the group has played games
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Team colors come from the API as words ("yellow", "pink", "white"…).
const TEAM_COLORS: Record<string, string> = {
  yellow: '#FACC15',
  red: '#EF4444',
  green: '#22C55E',
  blue: '#3B82F6',
  orange: '#F97316',
  purple: '#A855F7',
  pink: '#EC4899',
  black: '#111827',
  white: '#FFFFFF',
};

const teamColor = (color?: string | null) => TEAM_COLORS[color?.toLowerCase() ?? ''] ?? COLORS.gray3;

const sortStandings = (list: StandingTeam[]) =>
  [...list].sort(
    (a, b) =>
      b.points - a.points ||
      b.wins - a.wins ||
      a.losses - b.losses ||
      a.name.localeCompare(b.name),
  );

const SlotLine = ({ slot }: { slot: Slot }) => (
  <View style={styles.slotLine}>
    <View style={[styles.dot, { backgroundColor: slot.team ? teamColor(slot.team.color) : BORDER }]} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.teamName, !slot.team && styles.tbdName]} numberOfLines={1}>
        {slot.team ? slot.team.name.trim() : 'TBD'}
      </Text>
      <Text style={styles.slotLabel}>{slot.label}</Text>
    </View>
  </View>
);

const MatchCard = ({ title, home, away }: { title: string; home: Slot; away: Slot }) => (
  <View style={styles.card}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.matchBody}>
      <SlotLine slot={home} />
      <Text style={styles.vs}>VS</Text>
      <SlotLine slot={away} />
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CompetitionStandingsScreen({ route }: { route: any }) {
  const { competitionId } = route.params;
  const navigation = useNavigation<NavigationProp<any>>();

  const [tab, setTab] = useState<Tab>('group');
  const [competitionName, setCompetitionName] = useState('');
  const [teams, setTeams] = useState<StandingTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}competitions/${competitionId}`);
      if (!res.ok) throw new Error(`Failed to fetch competition: ${res.status}`);
      const json = await res.json();
      setCompetitionName(json.data?.name ?? '');
      setTeams(json.data?.teams ?? []);
    } catch (e) {
      console.error('Error loading standings:', e);
      setError('Unable to load standings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [competitionId]);

  // Refetch every time the screen gains focus, so results saved elsewhere show up.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Two groups (A / B). Uses `team.group` if the API provides it, otherwise
  // splits the teams in half by id (8 teams -> 4 + 4).
  const groups = useMemo(() => {
    const buckets: { key: string; teams: StandingTeam[] }[] = [];

    if (teams.some(t => t.group)) {
      const map = new Map<string, StandingTeam[]>();
      teams.forEach(t => {
        const key = (t.group ?? 'A').toUpperCase();
        map.set(key, [...(map.get(key) ?? []), t]);
      });
      [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, list]) => buckets.push({ key, teams: list }));
    } else {
      const ordered = [...teams].sort((a, b) => Number(a.id) - Number(b.id));
      const size = Math.ceil(ordered.length / 2);
      buckets.push({ key: 'A', teams: ordered.slice(0, size) });
      buckets.push({ key: 'B', teams: ordered.slice(size) });
    }

    return buckets.map(b => ({ key: b.key, title: `Group ${b.key}`, teams: sortStandings(b.teams) }));
  }, [teams]);

  // Knock-out pairings from the group tables: 1st A vs 2nd B, 1st B vs 2nd A.
  const bracket = useMemo(() => {
    const gA = groups.find(g => g.key === 'A');
    const gB = groups.find(g => g.key === 'B');
    const slot = (g: typeof gA, pos: number, key: string): Slot => {
      const started = !!g && g.teams.some(t => t.wins + t.losses > 0);
      return { label: `${pos + 1}${pos === 0 ? 'st' : 'nd'} Group ${key}`, team: started ? g!.teams[pos] : undefined };
    };
    return {
      semis: [
        { title: 'Semi-final 1', home: slot(gB, 0, 'B'), away: slot(gA, 1, 'A') },
        { title: 'Semi-final 2', home: slot(gA, 0, 'A'), away: slot(gB, 1, 'B') },
      ],
    };
  }, [groups]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon type="materialCommunityIcons" name="arrow-left" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Standings</Text>
          {!!competitionName && <Text style={styles.subtitle} numberOfLines={1}>{competitionName}</Text>}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([
          { key: 'group', label: 'Group Stage' },
          { key: 'knockout', label: 'Knock-out' },
        ] as { key: Tab; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.muted}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); load(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : tab === 'group' ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={COLORS.primary}
            />
          }
        >
          {teams.length === 0 ? (
            <Text style={[styles.muted, { textAlign: 'center', marginTop: 40 }]}>No teams yet.</Text>
          ) : (
            groups.map(group => (
              <View key={group.key} style={styles.card}>
                <Text style={styles.groupTitle}>{group.title}</Text>

                {/* Column headers */}
                <View style={[styles.row, styles.headRow]}>
                  <Text style={[styles.cellRank, styles.headText]}>#</Text>
                  <Text style={[styles.cellTeam, styles.headText]}>Team</Text>
                  <Text style={[styles.cellNum, styles.headText]}>W</Text>
                  <Text style={[styles.cellNum, styles.headText]}>L</Text>
                  <Text style={[styles.cellNum, styles.headText]}>Pts</Text>
                </View>

                {group.teams.map((team, i) => (
                  <View key={team.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                    <Text style={styles.cellRank}>{i + 1}</Text>
                    <View style={[styles.cellTeam, styles.teamCell]}>
                      <View style={[styles.dot, { backgroundColor: teamColor(team.color) }]} />
                      <Text style={styles.teamName} numberOfLines={1}>{team.name.trim()}</Text>
                    </View>
                    <Text style={styles.cellNum}>{team.wins}</Text>
                    <Text style={styles.cellNum}>{team.losses}</Text>
                    <Text style={[styles.cellNum, styles.pts]}>{team.points}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Semi-finals</Text>
          {bracket.semis.map(m => (
            <MatchCard key={m.title} title={m.title} home={m.home} away={m.away} />
          ))}

          <Text style={styles.sectionLabel}>Final</Text>
          <MatchCard
            title="Final"
            home={{ label: 'Winner Semi-final 1' }}
            away={{ label: 'Winner Semi-final 2' }}
          />

          <Text style={[styles.muted, { marginTop: 4 }]}>
            Pairings follow the group standings and are confirmed once the group stage ends.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BORDER = '#E5E7EB';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 56,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.black },
  subtitle: { fontSize: 13, color: COLORS.gray3, marginTop: 2 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: COLORS.white,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  tabTextActive: { color: COLORS.white },

  content: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  muted: { color: COLORS.gray3, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray3, textTransform: 'uppercase', letterSpacing: 0.5 },
  matchBody: { paddingHorizontal: 14, paddingBottom: 8 },
  slotLine: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  slotLabel: { fontSize: 12, color: COLORS.gray3, marginTop: 1 },
  tbdName: { color: COLORS.gray3, fontWeight: '500' },
  vs: { fontSize: 11, fontWeight: '700', color: COLORS.gray3, letterSpacing: 1, marginLeft: 26 },
  tbdTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginTop: 8 },
  retryBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.primary },
  retryText: { color: COLORS.white, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  groupTitle: { fontSize: 16, fontWeight: '700', color: COLORS.black, paddingHorizontal: 14, paddingVertical: 8 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: BORDER },
  headRow: { paddingVertical: 6, backgroundColor: '#F3F4F6' },
  headText: { fontSize: 12, fontWeight: '700', color: COLORS.gray3 },

  cellRank: { width: 28, fontSize: 14, fontWeight: '600', color: COLORS.gray3 },
  cellTeam: { flex: 1 },
  cellNum: { width: 38, textAlign: 'center', fontSize: 14, color: COLORS.black },
  pts: { fontWeight: '700' },

  teamCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  teamName: { flexShrink: 1, fontSize: 15, fontWeight: '600', color: COLORS.black },
});