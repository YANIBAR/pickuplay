import { COLORS, images } from '@constants';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Image as RNImage,
  Modal,
  Switch,
  StyleSheet,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { ConfirmModal, Header, Icon } from '@components';
import publicApi, { authenticatedApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import publicCompetitionApi, { authCompetitionsdApi } from '@services/competitionApi';
import { useUserData } from '@services/useUserData';
import { JAVA_API } from '@env';
import { timeAgo } from '@utils/dateUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

type RequestStatus = 'Pending' | 'Accepted' | 'Declined';
type RequestKind    = 'teams' | 'individuals';

interface AssignableTeam {
  id: string;
  name: string;
  logo?: string;
  joinedPlayersCount: number;
}

interface TeamRequest {
  id: string;
  team_id: string;
  team_name: string;
  team_logo?: string;
  city: string;
  format: number;
  captain_name: string;
  venmo_username: string;
  payment_confirmed: boolean;
  message?: string;
  status: RequestStatus;
  assigned_group_name?: string;
  created_at: string;
}

interface IndividualRequest {
  id: string;
  player_id: string;
  player_name: string;
  player_photo?: string;
  position: string;
  skill_level: string;
  preferred_team_id: string | null; // null = player chose "random" assignment at signup
  preferred_team_name?: string;
  venmo_username: string;
  payment_confirmed: boolean;
  message?: string;
  status: RequestStatus;
  assigned_team_name?: string;
  created_at: string;
}

// Every item in the combined list is tagged with its kind so we know how to
// render it and which endpoints/handlers to call.
type CombinedRequest =
  | ({ _kind: 'teams' } & TeamRequest)
  | ({ _kind: 'individuals' } & IndividualRequest);

type AssignTarget =
  | { type: 'teams'; request: TeamRequest }
  | { type: 'individuals'; request: IndividualRequest };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SKILL_COLOR: Record<string, string> = {
  beginner:     '#22c55e',
  intermediate: '#3b82f6',
  advanced:     '#f59e0b',
  competitive:  '#ef4444',
};

const STATUS_META: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#f59e0b', bg: '#fffbeb' },
  accepted: { label: 'Accepted', color: '#22c55e', bg: '#f0fdf4' },
  declined: { label: 'Declined', color: '#ef4444', bg: '#fef2f2' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const CompetitionRequestsScreen = () => {
  const route = useRoute();
  const { competition_id } = (route.params as any) || {};
  const { userData } = useUserData();  

    const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); 
  const [decliningId, setDecliningId] = useState<string | null>(null);

  // ─── Mock data ────────────────────────────────────────────────────────────
  const [requests, setRequests] = useState<TeamRequest[]>();
  const [assignableTeams, setAssignableTeams] = useState<[]>();
  const [maxPlayers, setMaxPlayers] = useState();
  const pendingCount = requests?.length;
  const fetchRequests = async (isRefresh = false) => {
    
    isRefresh ? setRefreshing(true) : setLoading(true);
    setLoading(false);
    try {
      const response = await authCompetitionsdApi.get(`competition-entries?organizerId=`+ userData?.id);
      setRequests(response.result.data);
      setRefreshing(false);
    }  catch (err) {
        console.error('Error fetching competition:', err);
        setError('Unable to load competition.');
      } finally {
        setLoading(false);
      }
    }; 

  const fetchAll = async (isRefresh = false) => {
    fetchRequests(isRefresh);
  };

  useEffect(() => { 
    fetchAll(); 
  }, [userData?.id]);

  // ─── Decline ─────────────────────────────────────────────────────────────

  const handleDecline = (id: string) => {
    Alert.alert(
      'Decline Request?',
      'The applicant will be notified that their request was declined.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setDecliningId(id);
            try {
              const response = await authCompetitionsdApi.patch(`competition-entries/${id}`,
                { "status": "Rejected", "teamId": "10" }, {
                headers: { 'Content-Type': 'application/json' }
              });
              setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' } : r));
            } catch {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setDecliningId(null);
            }
          },
        },
      ],
    );
  };

  // ─── Assign / Accept modal ───────────────────────────────────────────────

  const [assignTarget, setAssignTarget]           = useState<AssignTarget | null>(null);
  const [modalPaymentConfirmed, setModalPaymentConfirmed] = useState(false);
  const [modalSelectedId, setModalSelectedId]     = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting]     = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const openAssignModal = async (target: AssignTarget) => {
    setAssignTarget(target);
    if (target.request.teamId != null) {
      setConfirmModalVisible(true);
    } else {

      const competitionId = target.request.competitionId;
      const response = await publicCompetitionApi.get(`competitions/${competitionId}`);
      const compitition = response.result.data;
      setAssignableTeams(compitition.teams);
      setMaxPlayers(compitition.teamSize + compitition.nbrOfSubs);
      setAssignTarget(target);
      setModalPaymentConfirmed(target.request.payment_confirmed);
      setModalSelectedId(
        target.type === 'individuals' ? target.request.preferred_team_id ?? null : null,
      );
    }
  };

  const closeAssignModal = () => {
    if (modalSubmitting) return;
    setAssignTarget(null);
    setModalSelectedId(null);
    setModalPaymentConfirmed(false);
  };

  const confirmAssign = async () => {
    try {
      const teamId = assignTarget.request.teamId ?? assignableTeams.find(t => t.id === modalSelectedId).id;
      const response = await authCompetitionsdApi.patch(`competition-entries/${assignTarget.request.id}`,
        { "status": "Confirmed", "teamId": teamId }, {
        headers: { 'Content-Type': 'application/json' }
      });
      closeAssignModal();
    } catch (error) {
      console.log(error);
      Alert.alert('Update failed', error?.message ?? 'Something went wrong while saving.');
    }
  };

  // ─── Shared pieces ────────────────────────────────────────────────────────
  const KindBadge = ({ kind }: { kind: RequestKind }) => (
    <View style={[styles.kindTag, kind === 'teams' ? styles.kindTagTeam : styles.kindTagIndividual]}>
      <Icon
        name={kind === 'teams' ? 'shield' : 'person'}
        type="materialIcons"
        size={11}
        color={kind === 'teams' ? '#6366f1' : '#0891b2'}
      />
      <Text style={[styles.kindTagText, { color: kind === 'teams' ? '#6366f1' : '#0891b2' }]}>
        {kind === 'teams' ? 'Team' : 'Individual'}
      </Text>
    </View>
  );

  const ActionRow = ({
    id,
    status,
    assignedLabel,
    onAccept,
    onDecline,
  }: {
    id: string;
    status: RequestStatus;
    assignedLabel?: string;
    onAccept: () => void;
    onDecline: () => void;
  }) => {
    if (status !== 'Pending') {
      const meta = STATUS_META[status];
      return (
        <View style={{ gap: 6, alignItems: 'flex-start' }}>
          <View style={[styles.statusPill]}>
            <View style={[styles.statusDot]} />
          </View>
          {assignedLabel ? (
            <View style={styles.assignedTag}>
              <Icon name="place" type="materialIcons" size={12} color={COLORS.primary} />
              <Text style={styles.assignedTagText}>{assignedLabel}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    const isDeclining = decliningId === id;
    return (
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.declineBtn, isDeclining && { opacity: 0.5 }]}
          onPress={onDecline}
          disabled={isDeclining}
        >
          {isDeclining ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <>
              <Icon name="close" type="materialIcons" size={15} color="#ef4444" />
              <Text style={styles.declineBtnText}>Decline</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
          <Icon name="check" type="materialIcons" size={15} color="#fff" />
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
      </View>
    );
  };


  // ─── Individual request card ─────────────────────────────────────────────
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };


  // Dispatches to the right card renderer based on `_kind`.
 const renderRequest = ({ item }: { item: CombinedRequest }) => (
    <View style={[styles.card, item.status !== 'pending' && styles.cardMuted]}>
      <View style={styles.headerRow}>
        <Image
          source={
            imageErrors[item.player?.id]
              ? images.avatar
              : { uri: `${JAVA_API}profile/${item.player?.id}/image` }
          }
          onError={() => handleImageError(item.player?.id)}
          style={styles.playerAvatar}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.player.firstName + " " + item.player.lastName}</Text>
            <Text style={styles.timeAgo}>{timeAgo(item.joinedAt)}</Text>
          </View>
          <View style={styles.tagRow}>
            <KindBadge kind={item.isTeam ? "teams" : "individuals"} />

     
            <View style={[styles.tag, { backgroundColor: `${SKILL_COLOR[item.skill_level]}18` }]}>
              <View style={[styles.skillDot, { backgroundColor: SKILL_COLOR[item.skill_level] }]} />
              <Text style={[styles.tagText, { color: SKILL_COLOR[item.skill_level] }]}>
                {item.player.skillLevel}
              </Text>
            </View>
            {!!item.guestCount && (
              <View style={styles.tag}>
                <Icon name="people-outline" type="materialIcons" size={11} color={COLORS.primary} />
                <Text style={styles.tagText}>
                  {item.guestCount} guest{item.guestCount === 1 ? '' : 's'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.captainText}>
            {item.teamName
              ? `Wants to join: ${item.teamName} with ${item.guestCount} guests`
              : `Wants: Random team assignment${item.guestCount ? ` with ${item.guestCount} guests` : ''}`}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {item.comment ? (
        <View style={styles.messageBox}>
          <Icon name="chat-bubble-outline" type="materialIcons" size={13} color={COLORS.grayscale400} />
          <Text style={styles.messageText} numberOfLines={3}>{item?.comment}</Text>
        </View>
      ) : null}

      <ActionRow
        id={item.id}
        status={item.status}
        assignedLabel={item.teamName} 
        onAccept={() => openAssignModal({ type: 'individuals', request: item })}
        onDecline={() => handleDecline( item.id)}
      />
    </View>
  );

  // ─── Empty state ──────────────────────────────────────────────────────────

  const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Icon name={icon} type="materialIcons" size={40} color={COLORS.grayscale400} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  // ─── Assign modal content ─────────────────────────────────────────────────

  const renderAssignModal = () => {
    if (!assignTarget) return null;

    const isTeam = assignTarget.type === 'teams';
    const name   = isTeam
      ? (assignTarget as TeamRequest).team_name
      : (assignTarget.request as IndividualRequest).player_name;
    const venmo  = assignTarget.request.venmo_username;
    const options = assignableTeams;
    const optionsLabel = isTeam ? 'Assign to Group / Division' : 'Assign to Team';
    const wasRandom = !isTeam && (assignTarget.request as IndividualRequest).preferred_team_id === null;

    const canConfirm = !!modalSelectedId && !modalSubmitting;

    return (
      <>
        {assignTarget.request.teamId ? (
          <ConfirmModal
            visible={confirmModalVisible}
            onConfirm={confirmAssign}
            onCancel={() => setConfirmModalVisible(false)}
            title="confirm Request"
            message="Are you sure you want to confirm this request?"
          />
        ) : (
          <Modal visible transparent animationType="slide" onRequestClose={closeAssignModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Accept {name}</Text>
                  <TouchableOpacity onPress={closeAssignModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="close" type="materialIcons" size={20} color={COLORS.grayscale400} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                  {/* Assignment */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionLabel}>{optionsLabel}</Text>
                    {wasRandom ? (
                      <View style={styles.randomNote}>
                        <Icon name="shuffle" type="materialIcons" size={13} color={COLORS.grayscale400} />
                        <Text style={styles.randomNoteText}>Player asked to be placed on any team</Text>
                      </View>
                    ) : null}

                    {options?.map(opt => {
                      const isTeamOpt = 'max_players' in opt;
                      const count = isTeamOpt ? (opt as AssignableTeam).player_count : (opt as Group).joinedPlayersCount;
                      const max = maxPlayers;
                      const isFull = count >= max;
                      const isSelected = modalSelectedId === opt.id;

                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.optionRow,
                            isSelected && styles.optionRowSelected,
                            isFull && !isSelected && { opacity: 0.5 },
                          ]}
                          disabled={isFull && !isSelected}
                          onPress={() => setModalSelectedId(opt.id)}
                        >
                          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                            {isSelected ? <View style={styles.radioInner} /> : null}
                          </View>
                          <Text style={styles.optionName}>{opt.name}</Text>
                          <Text style={[styles.optionCount, isFull && { color: '#ef4444' }]}>
                            {isFull ? 'Full' : `${count}/${maxPlayers}`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.modalConfirmBtn, !canConfirm && { opacity: 0.4 }]}
                  disabled={!canConfirm}
                  onPress={confirmAssign}
                >
                  {modalSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="check" type="materialIcons" size={16} color="#fff" />
                      <Text style={styles.modalConfirmBtnText}>Confirm & Accept</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Header title="Competition Requests" />

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {requests?.length} request{requests?.length === 1 ? '' : 's'}
        </Text>
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount > 99 ? '99+' : pendingCount} pending</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color={COLORS.primary} size="large" /></View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => `${item._kind}-${item.id}`}
          renderItem={renderRequest}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="group-add"
              title="No requests yet"
              subtitle="Teams and players applying to join this competition will appear here."
            />
          }
        />
      )}

      {renderAssignModal()}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },

  // Summary bar (replaces the old tab bar)
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  summaryText: { fontSize: 13, fontWeight: '700', color: '#333' },

  badge: {
    minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  // Kind badge (Team / Individual), shown on each card in the merged list
  kindTag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  kindTagTeam: { backgroundColor: '#eef2ff' },
  kindTagIndividual: { backgroundColor: '#ecfeff' },
  kindTagText: { fontSize: 11, fontWeight: '700' },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e8e8e8', padding: 14, gap: 12 },
  cardMuted: { opacity: 0.75 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

  teamLogo: { width: 48, height: 48, borderRadius: 10, resizeMode: 'contain', backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e8e8e8' },
  teamLogoFallback: { width: 48, height: 48, borderRadius: 10, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  playerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f0f0' },
  playerAvatarFallback: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: '#fff' },

  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111', flex: 1 },
  timeAgo: { fontSize: 11, color: '#bbb', fontWeight: '500' },
  captainText: { fontSize: 12, color: '#888', fontWeight: '500', marginTop: 4 },

  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f0f4ff', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  skillDot: { width: 6, height: 6, borderRadius: 3 },

  divider: { height: 1, backgroundColor: '#f3f4f6' },

  // Payment
  paymentPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  paymentPillText: { fontSize: 12, fontWeight: '700' },
  paymentVenmo: { fontSize: 11, color: '#999', fontWeight: '500', marginLeft: 2 },

  // Message
  messageBox: { flexDirection: 'row', gap: 7, backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, alignItems: 'flex-start' },
  messageText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 19 },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  declineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#ef4444' },
  declineBtnText: { fontSize: 13, fontWeight: '700', color: '#ef4444' },
  acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.primary },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Status pill / assignment tag
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  assignedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  assignedTagText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySubtitle: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 40 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: 28, gap: 14, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111', flex: 1, marginRight: 12 },

  modalSection: { gap: 10, marginBottom: 12 },
  modalSectionLabel: { fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.4 },

  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12 },
  paymentRowTitle: { fontSize: 13, fontWeight: '700', color: '#222' },
  paymentRowSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },

  randomNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  randomNoteText: { fontSize: 12, color: '#999', fontStyle: 'italic' },

  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 10, padding: 12, marginBottom: 8 },
  optionRowSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}0d` },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary },
  optionName: { fontSize: 13, fontWeight: '700', color: '#222', flex: 1 },
  optionCount: { fontSize: 12, fontWeight: '600', color: '#999' },

  modalConfirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12 },
  modalConfirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default CompetitionRequestsScreen; 