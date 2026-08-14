import { COLORS } from '@constants';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image as RNImage,
  Animated,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { Header, Icon } from '@components';
import { authenticatedApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type MatchupStatus = 'pending' | 'accepted' | 'declined';
type JoinStatus    = 'pending' | 'accepted' | 'declined';
type TabKey        = 'matchups' | 'requests';

interface Matchup {
  id: string;
  challenger_team_id: string;
  challenger_team_name: string;
  challenger_team_logo?: string;
  challenger_team_city: string;
  challenger_team_format: number;
  proposed_date: string;
  proposed_venue?: string;
  message?: string;
  status: MatchupStatus;
  created_at: string;
}

interface JoinRequest {
  id: string;
  player_id: string;
  player_name: string;
  player_photo?: string;
  position: string;
  skill_level: string;
  message?: string;
  status: JoinStatus;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SKILL_COLOR: Record<string, string> = {
  beginner:     '#22c55e',
  intermediate: '#3b82f6',
  advanced:     '#f59e0b',
  competitive:  '#ef4444',
};

const STATUS_META: Record<MatchupStatus | JoinStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#f59e0b', bg: '#fffbeb' },
  accepted: { label: 'Accepted', color: '#22c55e', bg: '#f0fdf4' },
  declined: { label: 'Declined', color: '#ef4444', bg: '#fef2f2' },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const TeamInboxScreen = () => {
  const { navigate } = useNavigation();
  const route = useRoute();
  const { team_id } = (route.params as any) || {};

  const [activeTab, setActiveTab]           = useState<TabKey>('matchups'); 
  const [loadingMatchups, setLoadingMatchups]       = useState(false);
  const [loadingRequests, setLoadingRequests]       = useState(false);
  const [refreshingMatchups, setRefreshingMatchups] = useState(false);
  const [refreshingRequests, setRefreshingRequests] = useState(false);
  const [processingId, setProcessingId]     = useState<string | null>(null);

  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const TAB_WIDTH = (SCREEN_WIDTH - 32) / 2;
  const [matchups, setMatchups] = useState<Matchup[]>([
    {
      id: '1',
      challenger_team_id: 'team_101',
      challenger_team_name: 'FC Thunder',
      challenger_team_logo: 'https://i.pravatar.cc/150?img=11',
      challenger_team_city: 'Kansas City',
      challenger_team_format: 11,
      proposed_date: '2026-07-18T15:00:00Z',
      proposed_venue: 'Swope Soccer Village',
      message: 'Looking for a friendly before the league starts. We are a competitive level team, hope you\'re up for it!',
      status: 'pending',
      created_at: new Date(Date.now() - 25 * 60000).toISOString(), // 25m ago
    },
    {
      id: '2',
      challenger_team_id: 'team_102',
      challenger_team_name: 'Blue Wave SC',
      challenger_team_logo: undefined,
      challenger_team_city: 'Overland Park',
      challenger_team_format: 7,
      proposed_date: '2026-07-22T18:30:00Z',
      proposed_venue: undefined,
      message: undefined,
      status: 'accepted',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(), // 3h ago
    },
    {
      id: '3',
      challenger_team_id: 'team_103',
      challenger_team_name: 'Red Dragons United',
      challenger_team_logo: 'https://i.pravatar.cc/150?img=33',
      challenger_team_city: 'Lee\'s Summit',
      challenger_team_format: 5,
      proposed_date: '2026-07-25T10:00:00Z',
      proposed_venue: 'Longview Park',
      message: 'We play every Saturday morning. Would love to scrimmage your squad!',
      status: 'declined',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2d ago
    },
  ]);

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    {
      id: 'jr_1',
      player_id: 'player_201',
      player_name: 'Marcus Rivera',
      player_photo: 'https://i.pravatar.cc/150?img=51',
      position: 'Center Midfielder',
      skill_level: 'advanced',
      message: 'Been playing for 10 years, just moved to the area and looking for a competitive team. Available weekends and weeknights.',
      status: 'pending',
      created_at: new Date(Date.now() - 40 * 60000).toISOString(), // 40m ago
    },
    {
      id: 'jr_2',
      player_id: 'player_202',
      player_name: 'Sophie Nguyen',
      player_photo: 'https://i.pravatar.cc/150?img=47',
      position: 'Goalkeeper',
      skill_level: 'intermediate',
      message: undefined,
      status: 'pending',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString(), // 5h ago
    },
    {
      id: 'jr_3',
      player_id: 'player_203',
      player_name: 'James Okafor',
      player_photo: undefined,
      position: 'Striker',
      skill_level: 'competitive',
      message: 'Played semi-pro in Lagos before relocating. Happy to trial if needed.',
      status: 'accepted',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(), // 1d ago
    },
    {
      id: 'jr_4',
      player_id: 'player_204',
      player_name: 'Tyler Brooks',
      player_photo: 'https://i.pravatar.cc/150?img=60',
      position: 'Left Back',
      skill_level: 'beginner',
      message: 'New to organised football but very keen and fit. Would love the opportunity!',
      status: 'declined',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(), // 3d ago
    },
  ]);
  // ─── Fetch ───────────────────────────────────────────────────────────────────

  const fetchMatchups = async (isRefresh = false) => {
    isRefresh ? setRefreshingMatchups(true) : setLoadingMatchups(true);
    try {
      const res = await authenticatedApi.get(`teams/${team_id}/matchup-requests`);
      setMatchups(res.result.data);
    } catch {
      setMatchups([]);
    } finally {
      isRefresh ? setRefreshingMatchups(false) : setLoadingMatchups(false);
    }
  };

  const fetchJoinRequests = async (isRefresh = false) => {
    isRefresh ? setRefreshingRequests(true) : setLoadingRequests(true);
    try {
      const res = await authenticatedApi.get(`teams/${team_id}/join-requests`);
      setJoinRequests(res.result.data);
    } catch {
      setJoinRequests([]);
    } finally {
      isRefresh ? setRefreshingRequests(false) : setLoadingRequests(false);
    }
  };

  useEffect(() => { fetchMatchups(); }, [team_id]);

  useEffect(() => {
    if (activeTab === 'requests' && joinRequests.length === 0) {
      fetchJoinRequests();
    }
  }, [activeTab]);

  // ─── Tab switch ──────────────────────────────────────────────────────────────

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    Animated.spring(indicatorAnim, {
      toValue: tab === 'matchups' ? 0 : TAB_WIDTH,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const handleMatchupAction = async (id: string, action: 'accept' | 'decline') => {
    Alert.alert(
      action === 'accept' ? 'Accept Challenge?' : 'Decline Challenge?',
      action === 'accept'
        ? 'You will be committed to this match. The challenger will be notified.'
        : 'The challenger will be notified that you declined.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'accept' ? 'Accept' : 'Decline',
          style: action === 'decline' ? 'destructive' : 'default',
          onPress: async () => {
            setProcessingId(id);
            try {
              await authenticatedApi.post(`teams/matchup-requests/${id}/${action}`);
              setMatchups(prev =>
                prev.map(m => m.id === id ? { ...m, status: action === 'accept' ? 'accepted' : 'declined' } : m),
              );
            } catch {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const handleJoinAction = async (id: string, action: 'accept' | 'decline') => {
    Alert.alert(
      action === 'accept' ? 'Accept Player?' : 'Decline Request?',
      action === 'accept'
        ? 'This player will be added to your team roster.'
        : 'This player\'s request will be declined.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'accept' ? 'Accept' : 'Decline',
          style: action === 'decline' ? 'destructive' : 'default',
          onPress: async () => {
            setProcessingId(id);
            try {
              await authenticatedApi.post(`teams/join-requests/${id}/${action}`);
              setJoinRequests(prev =>
                prev.map(r => r.id === id ? { ...r, status: action === 'accept' ? 'accepted' : 'declined' } : r),
              );
            } catch {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const pendingMatchups  = matchups.filter(m => m.status === 'pending').length;
  const pendingRequests  = joinRequests.filter(r => r.status === 'pending').length;

  const ActionButtons = ({
    id,
    status,
    onAccept,
    onDecline,
  }: {
    id: string;
    status: MatchupStatus | JoinStatus;
    onAccept: () => void;
    onDecline: () => void;
  }) => {
    const isProcessing = processingId === id;

    if (status !== 'pending') {
      const meta = STATUS_META[status];
      return (
        <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      );
    }

    return (
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.declineBtn, isProcessing && { opacity: 0.5 }]}
          onPress={onDecline}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <>
              <Icon name="close" type="materialIcons" size={15} color="#ef4444" />
              <Text style={styles.declineBtnText}>Decline</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.acceptBtn, isProcessing && { opacity: 0.5 }]}
          onPress={onAccept}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="check" type="materialIcons" size={15} color="#fff" />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Matchup card ─────────────────────────────────────────────────────────────

  const renderMatchup = ({ item }: { item: Matchup }) => (
    <View style={[styles.card, item.status !== 'pending' && styles.cardMuted]}>
      {/* Team row */}
      <View style={styles.challengerRow}>
        {item.challenger_team_logo ? (
          <RNImage source={{ uri: item.challenger_team_logo }} style={styles.teamLogo} />
        ) : (
          <View style={styles.teamLogoFallback}>
            <Icon name="shield" type="materialIcons" size={20} color="#fff" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.teamName} numberOfLines={1}>{item.challenger_team_name}</Text>
            <Text style={styles.timeAgo}>{timeAgo(item.created_at)}</Text>
          </View>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Icon name="place" type="materialIcons" size={11} color={COLORS.primary} />
              <Text style={styles.tagText}>{item.challenger_team_city}</Text>
            </View>
            <View style={styles.tag}>
              <Icon name="grid-view" type="materialIcons" size={11} color={COLORS.primary} />
              <Text style={styles.tagText}>{item.challenger_team_format}-a-side</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Match details */}
      <View style={styles.matchDetails}>
        <View style={styles.matchDetailItem}>
          <Icon name="event" type="materialIcons" size={15} color={COLORS.grayscale400} />
          <Text style={styles.matchDetailText}>{formatDate(item.proposed_date)}</Text>
        </View>
        {item.proposed_venue ? (
          <View style={styles.matchDetailItem}>
            <Icon name="stadium" type="materialIcons" size={15} color={COLORS.grayscale400} />
            <Text style={styles.matchDetailText}>{item.proposed_venue}</Text>
          </View>
        ) : null}
      </View>

      {/* Optional message */}
      {item.message ? (
        <View style={styles.messageBox}>
          <Icon name="chat-bubble-outline" type="materialIcons" size={13} color={COLORS.grayscale400} />
          <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <ActionButtons
        id={item.id}
        status={item.status}
        onAccept={() => handleMatchupAction(item.id, 'accept')}
        onDecline={() => handleMatchupAction(item.id, 'decline')}
      />
    </View>
  );

  // ─── Join request card ────────────────────────────────────────────────────────

  const renderJoinRequest = ({ item }: { item: JoinRequest }) => (
    <View style={[styles.card, item.status !== 'pending' && styles.cardMuted]}>
      {/* Player row */}
      <View style={styles.challengerRow}>
        {item.player_photo ? (
          <RNImage source={{ uri: item.player_photo }} style={styles.playerAvatar} />
        ) : (
          <View style={styles.playerAvatarFallback}>
            <Text style={styles.avatarInitial}>{item.player_name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.teamName} numberOfLines={1}>{item.player_name}</Text>
            <Text style={styles.timeAgo}>{timeAgo(item.created_at)}</Text>
          </View>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Icon name="sports-soccer" type="materialIcons" size={11} color={COLORS.primary} />
              <Text style={styles.tagText}>{item.position}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: `${SKILL_COLOR[item.skill_level]}18` }]}>
              <View style={[styles.skillDot, { backgroundColor: SKILL_COLOR[item.skill_level] }]} />
              <Text style={[styles.tagText, { color: SKILL_COLOR[item.skill_level] }]}>
                {item.skill_level.charAt(0).toUpperCase() + item.skill_level.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Optional message */}
      {item.message ? (
        <>
          <View style={styles.divider} />
          <View style={styles.messageBox}>
            <Icon name="chat-bubble-outline" type="materialIcons" size={13} color={COLORS.grayscale400} />
            <Text style={styles.messageText} numberOfLines={3}>{item.message}</Text>
          </View>
        </>
      ) : null}

      {/* Actions */}
      <View style={{ marginTop: item.message ? 0 : 4 }}>
        <ActionButtons
          id={item.id}
          status={item.status}
          onAccept={() => handleJoinAction(item.id, 'accept')}
          onDecline={() => handleJoinAction(item.id, 'decline')}
        />
      </View>
    </View>
  );

  // ─── Empty state ──────────────────────────────────────────────────────────────

  const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Icon name={icon} type="materialIcons" size={40} color={COLORS.grayscale400} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  // ─── Main render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Header title="Team Inbox" />

      {/* Tab bar */}
      <View style={styles.tabBarWrap}>
        {([
          { key: 'matchups' as TabKey, label: 'Matchups',     icon: 'sports',        badge: pendingMatchups },
          { key: 'requests' as TabKey, label: 'Join Requests', icon: 'person-add',   badge: pendingRequests },
        ]).map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => switchTab(tab.key)}
            activeOpacity={0.8}
          >
            <View style={styles.tabInner}>
              <Icon
                name={tab.icon}
                type="materialIcons"
                size={18}
                color={activeTab === tab.key ? COLORS.primary : COLORS.grayscale400}
              />
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[styles.tabIndicator, { width: TAB_WIDTH, transform: [{ translateX: indicatorAnim }] }]}
        />
      </View>

      {/* Matchups tab */}
      {activeTab === 'matchups' && (
        loadingMatchups ? (
          <View style={styles.loader}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={matchups}
            keyExtractor={item => item.id}
            renderItem={renderMatchup}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshingMatchups}
                onRefresh={() => fetchMatchups(true)}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="sports"
                title="No challenges yet"
                subtitle="When other teams challenge you, they'll appear here."
              />
            }
          />
        )
      )}

      {/* Join Requests tab */}
      {activeTab === 'requests' && (
        loadingRequests ? (
          <View style={styles.loader}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={joinRequests}
            keyExtractor={item => item.id}
            renderItem={renderJoinRequest}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshingRequests}
                onRefresh={() => fetchJoinRequests(true)}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="person-add"
                title="No join requests"
                subtitle="Players who want to join your team will appear here."
              />
            }
          />
        )
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const TAB_WIDTH = (SCREEN_WIDTH - 32) / 2;

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },

  // Tab bar
  tabBarWrap: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
    position: 'relative',
  },
  tabItem: { flex: 1, paddingVertical: 13, alignItems: 'center', zIndex: 1 },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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

  // Notification badge
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    padding: 14,
    gap: 12,
  },
  cardMuted: { opacity: 0.75 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },

  // Challenger row
  challengerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teamLogo: { width: 48, height: 48, borderRadius: 10, resizeMode: 'contain', backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e8e8e8' },
  teamLogoFallback: { width: 48, height: 48, borderRadius: 10, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  teamName: { fontSize: 15, fontWeight: '700', color: '#111', flex: 1 },
  timeAgo: { fontSize: 11, color: '#bbb', fontWeight: '500' },

  // Player avatar
  playerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f0f0' },
  playerAvatarFallback: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: '#fff' },

  // Tags
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f0f4ff', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  skillDot: { width: 6, height: 6, borderRadius: 3 },

  // Divider
  divider: { height: 1, backgroundColor: '#f3f4f6' },

  // Match details
  matchDetails: { gap: 6 },
  matchDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  matchDetailText: { fontSize: 13, color: '#555', fontWeight: '500' },

  // Message
  messageBox: { flexDirection: 'row', gap: 7, backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, alignItems: 'flex-start' },
  messageText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 19 },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  declineBtnText: { fontSize: 13, fontWeight: '700', color: '#ef4444' },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Status pill (after decision)
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 2,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },

  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySubtitle: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 40 },
});

export default TeamInboxScreen;