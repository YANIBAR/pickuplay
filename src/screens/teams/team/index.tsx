import { COLORS, SIZES } from '@constants';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image as RNImage,
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Header, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import { authenticatedApi, publicApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  id: number;
  name: string;
  description: string;
  logo?: string;
  sport: string;
  team_type: string;
  team_format: number;
  skill_level: string;
  city: string;
  max_players: number;
  is_public: boolean;
  owner_id: string;
  created_at: string;
  total_members: number;
  wins?: number;
  draws?: number;
  losses?: number;
}

interface Member {
  id: string;
  name: string;
  photo?: string;
  position: string;
  rating: number;
  is_owner?: boolean;
  is_captain?: boolean;
}

type TabKey = 'info' | 'members';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEAM_TYPE_LABEL: Record<string, string> = {
  men: 'Men',
  women: 'Women',
  co_ed: 'Co-Ed',
  youth: 'Youth',
  over_30: 'Over 30',
};

const SKILL_COLOR: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#3b82f6',
  advanced: '#f59e0b',
  competitive: '#ef4444',
};

const SKILL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  competitive: 'Competitive',
};

const renderStars = (rating: number) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array(full).fill(0).map((_, i) => (
        <Icon key={`f${i}`} name="star" type="materialIcons" size={13} color="#f59e0b" />
      ))}
      {half && <Icon name="star-half" type="materialIcons" size={13} color="#f59e0b" />}
      {Array(empty).fill(0).map((_, i) => (
        <Icon key={`e${i}`} name="star-outline" type="materialIcons" size={13} color="#d1d5db" />
      ))}
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const TeamDetailScreen = () => {
  const { t } = useTranslation();
  const { navigate, goBack } = useNavigation();
  const route = useRoute();
  const { team_id } = (route.params as any) || {};

  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const TAB_WIDTH = (SCREEN_WIDTH - 32) / 2;

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchTeam = async () => {
    try {
      setLoadingTeam(true);
      const response = await authenticatedApi.get(`teams/${team_id}`);
      setTeam(response.result.data);
    } catch {
      setTeam(null);
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await authenticatedApi.get(`teams/${team_id}/members`);
      setMembers(response.result.data);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [team_id]);

  useEffect(() => {
    if (activeTab === 'members' && members.length === 0) {
      fetchMembers();
    }
  }, [activeTab]);

  // ─── Tab switch ────────────────────────────────────────────────────────────

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    Animated.spring(indicatorAnim, {
      toValue: tab === 'info' ? 0 : TAB_WIDTH,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loadingTeam) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <Header title="Team" />
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!team) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <Header title="Team" />
        <View style={styles.centered}>
          <Icon name="error-outline" type="materialIcons" size={48} color={COLORS.grayscale400} />
          <Text style={styles.emptyText}>Team not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Tab content ───────────────────────────────────────────────────────────

  const renderInfo = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentInner}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Members', value: team.total_members, icon: 'people' },
          { label: 'Wins',    value: team.wins ?? '—',    icon: 'emoji-events' },
          { label: 'Draws',   value: team.draws ?? '—',   icon: 'remove-circle-outline' },
          { label: 'Losses',  value: team.losses ?? '—',  icon: 'cancel' },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Icon name={s.icon} type="materialIcons" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.description}>{team.description}</Text>
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <Icon name="sports-soccer" type="materialIcons" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Sport</Text>
            <Text style={styles.detailValue}>{team.sport}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <Icon name="people" type="materialIcons" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Team Type</Text>
            <Text style={styles.detailValue}>{TEAM_TYPE_LABEL[team.team_type] ?? team.team_type}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <Icon name="grid-view" type="materialIcons" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Format</Text>
            <Text style={styles.detailValue}>{team.team_format}-a-side</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <Icon name="place" type="materialIcons" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.detailLabel}>City</Text>
            <Text style={styles.detailValue}>{team.city}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <Icon name="group-add" type="materialIcons" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Max Players</Text>
            <Text style={styles.detailValue}>{team.max_players}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <View style={styles.detailIconWrap}>
            <Icon name="lock-open" type="materialIcons" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Visibility</Text>
            <Text style={styles.detailValue}>{team.is_public ? 'Public' : 'Private'}</Text>
          </View>
        </View>
      </View>

      {/* Skill badge */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Skill Level</Text>
        <View style={[styles.skillBadge, { backgroundColor: `${SKILL_COLOR[team.skill_level]}18` }]}>
          <View style={[styles.skillDot, { backgroundColor: SKILL_COLOR[team.skill_level] }]} />
          <Text style={[styles.skillBadgeText, { color: SKILL_COLOR[team.skill_level] }]}>
            {SKILL_LABEL[team.skill_level] ?? team.skill_level}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderMemberItem = ({ item }: { item: Member }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => navigate('player', { player_id: item.id })}
      activeOpacity={0.75}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {item.photo ? (
          <RNImage source={{ uri: item.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {(item.is_captain || item.is_owner) && (
          <View style={styles.badgePin}>
            <Icon
              name={item.is_owner ? 'shield' : 'star'}
              type="materialIcons"
              size={10}
              color="#fff"
            />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
          {item.is_owner && (
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>Owner</Text>
            </View>
          )}
          {item.is_captain && !item.is_owner && (
            <View style={[styles.rolePill, styles.rolePillCaptain]}>
              <Text style={[styles.rolePillText, { color: '#f59e0b' }]}>Captain</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberPosition}>{item.position}</Text>
        <View style={styles.ratingRow}>
          {renderStars(item.rating)}
          <Text style={styles.ratingNum}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      <Icon name="chevron-right" type="materialIcons" size={20} color={COLORS.grayscale400} />
    </TouchableOpacity>
  );

  const renderMembers = () => (
    loadingMembers ? (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    ) : members.length === 0 ? (
      <View style={styles.centered}>
        <Icon name="people-outline" type="materialIcons" size={48} color={COLORS.grayscale400} />
        <Text style={styles.emptyText}>No members yet</Text>
      </View>
    ) : (
      <FlatList
        data={members}
        keyExtractor={item => String(item.id)}
        renderItem={renderMemberItem}
        contentContainerStyle={styles.membersList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    )
  );

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Header title="Team Details" />

      {/* Hero */}
      <View style={styles.hero}>
        {team.logo ? (
          <RNImage source={{ uri: team.logo }} style={styles.heroLogo} />
        ) : (
          <View style={styles.heroLogoFallback}>
            <Icon name="shield" type="materialIcons" size={36} color="#fff" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.heroName} numberOfLines={2}>{team.name}</Text>
          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Icon name="place" type="materialIcons" size={12} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>{team.city}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Icon name="sports-soccer" type="materialIcons" size={12} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>{team.sport}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['info', 'members'] as TabKey[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => switchTab(tab)}
            activeOpacity={0.8}
          >
            <Icon
              name={tab === 'info' ? 'info' : 'people'}
              type="materialIcons"
              size={18}
              color={activeTab === tab ? COLORS.primary : COLORS.grayscale400}
            />
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'info' ? 'Team Info' : `Members${team.total_members ? ` (${team.total_members})` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Sliding indicator */}
        <Animated.View
          style={[
            styles.tabIndicator,
            { width: TAB_WIDTH, transform: [{ translateX: indicatorAnim }] },
          ]}
        />
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'info' ? renderInfo() : renderMembers()}
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: '#999', fontWeight: '500' },

  // Hero
  hero: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heroLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  heroLogoFallback: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroName: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroBadgeText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    zIndex: 1,
  },
  tabLabel: { fontSize: 13, fontWeight: '600', color: COLORS.grayscale400 },
  tabLabelActive: { color: COLORS.primary },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  // Tab content
  tabContent: { flex: 1 },
  tabContentInner: { padding: 16, paddingBottom: 28, gap: 12 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 11, color: '#999', fontWeight: '500' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    padding: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 },

  // Description
  description: { fontSize: 14, color: '#555', lineHeight: 22 },

  // Detail rows
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  detailIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: { fontSize: 11, color: '#999', fontWeight: '500', marginBottom: 1 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#222' },
  separator: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 6 },

  // Skill badge
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillDot: { width: 8, height: 8, borderRadius: 4 },
  skillBadgeText: { fontSize: 14, fontWeight: '700' },

  // Members list
  membersList: { padding: 16, paddingBottom: 28 },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Avatar
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f0f0f0',
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: '#fff' },
  badgePin: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // Member info
  memberInfo: { flex: 1, gap: 3 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#111', flex: 1 },
  memberPosition: { fontSize: 12, color: '#888', fontWeight: '500' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  ratingNum: { fontSize: 12, fontWeight: '700', color: '#f59e0b' },

  // Role pills
  rolePill: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rolePillText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  rolePillCaptain: { backgroundColor: '#fffbeb' },
});

export default TeamDetailScreen;