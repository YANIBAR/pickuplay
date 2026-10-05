import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  FlatList,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '@constants';
import { Button, Icon } from '@components';
import styles from './styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { formatDateLong } from '@utils/dateUtils';
import { CompetitionTeam, Competition } from '../types';
import InfoCard from './components/infoCard';
import RegistrationRow from './components/registrationRow';
import ToggleRow from './components/toggleRow';
import TeamAccordionItem from './components/teamAccordionItem';
import MatchResultModal from './components/matchResultModal';
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { authenticatedApi } from '@services/api';
import { authCompetitionsdApi } from '@services/competitionApi';
import  PaymentApiClient  from '@services/payment';
import NumericInput from '@components/NumericInput';
import { decodeToken } from '@services/auth/auth.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Mock: teams already registered in this com, available for a player to request to join
const COMPETITION_TEAMS: CompetitionTeam[] = [
  
];

// Teams from COMPETITION_TEAMS with no players yet — the only ones eligible to be
// registered as a new team entry (already-populated teams are simply hidden here).
const EMPTY_COMPETITION_TEAMS: CompetitionTeam[] = COMPETITION_TEAMS.filter(t => t.playersCount === 0);




// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ label }: { label: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{label}</Text>
  </View>
);

// ─── Registration popup sub-components ────────────────────────────────────────

type RegisterStep = 'choose' | 'teamPick' | 'teamCreate' | 'teamDetails' | 'playerPick' | 'playerMessage' | 'success';
type RegisterMode = 'team' | 'player' | null;
type PlayerLevel = 'beginner' | 'intermediate' | 'advanced';

const PLAYER_LEVELS: { value: PlayerLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];


const RegisterOptionCard = ({
  icon,
  title,
  description,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.registerOptionCard} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.registerOptionIconWrap}>
      <Icon type="materialCommunityIcons" name={icon as any} size={26} color={COLORS.primary} />
    </View>
    <View style={styles.registerOptionText}>
      <Text style={styles.registerOptionTitle}>{title}</Text>
      <Text style={styles.registerOptionDesc}>{description}</Text>
    </View>
    <Icon type="materialCommunityIcons" name="chevron-right" size={20} color={COLORS.gray3} />
  </TouchableOpacity>
);

const TEAM_COLOR_MAP: Record<string, string> = {
  yellow: COLORS.yellow,
  red: COLORS.red,
  green: COLORS.green,
  blue: COLORS.blue,
  orange: COLORS.orange,
  purple: COLORS.purple,
  pink: '#EC4899',
  black: '#111827',
  white: '#FFFFFF',
};

const FALLBACK_TEAM_COLOR = COLORS.secondary;

export function getTeamColor(teamName: string): string {
  return TEAM_COLOR_MAP[teamName?.toLowerCase()] ?? FALLBACK_TEAM_COLOR;
}
const CompetitionTeamRow = ({
  team,
  maxPlayers,
  selected,
  onPress,
}: {
  team: CompetitionTeam;
  maxPlayers: number;
  selected: boolean;
  onPress: () => void;
}) => {
  const isFull = team.playersCount >= team.maxPlayers;

  return (
    <TouchableOpacity
      style={[
        styles.teamRow,
        selected && styles.teamRowSelected,
        isFull && styles.teamRowDisabled,
      ]}
      activeOpacity={isFull ? 1 : 0.8}
      disabled={isFull}
      onPress={onPress}
    >
      <View style={[styles.teamRowLogo, { backgroundColor: getTeamColor((team as any).color) }, isFull && styles.teamRowLogoDisabled]} />
      <View style={styles.teamRowInfo}>
        <Text style={[styles.teamRowName, isFull && styles.teamRowNameDisabled]}>{team.name}</Text>
        <Text style={styles.teamRowMeta}>
          {team.joinedPlayersCount}/{maxPlayers} players
        </Text>
      </View>
      {isFull ? (
        <View style={styles.fullBadge}>
          <Text style={styles.fullBadgeText}>Full</Text>
        </View>
      ) : (
        <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const RANDOM_TEAM_ID = '__random__';

const RandomTeamRow = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.teamRow, styles.randomTeamRow, selected && styles.teamRowSelected]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={styles.randomTeamIconWrap}>
      <Icon type="materialCommunityIcons" name="shuffle-variant" size={22} color={COLORS.primary} />
    </View>
    <View style={styles.teamRowInfo}>
      <Text style={styles.teamRowName}>Assign me to any team</Text>
      <Text style={styles.teamRowMeta}>We'll match you with a team that has space</Text>
    </View>
    <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  </TouchableOpacity>
);

const VISIBILITY_ICONS: Record<string, string> = {
  public: 'earth',
  private: 'lock',
  'invite-only': 'account-group',
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CompetitionDetailScreen({ route }: { route: any }) {
  const { competition_id } = route.params;

  const { navigate } = useNavigation();
 
  // Registration popup state
  const [registerVisible, setRegisterVisible] = useState(false);
  const [registerMode, setRegisterMode] = useState<RegisterMode>(null);
  const [registerStep, setRegisterStep] = useState<RegisterStep>('choose');
  const [selectedMyTeamId, setSelectedMyTeamId] = useState<string | null>(null);
  const [isTeam, setIsTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedCompetitionTeamId, setSelectedCompetitionTeamId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [skillLevel, setSkillLevel] = useState<PlayerLevel | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [successText, setSuccessText] = useState('');
  const [errorText, setErrorText] = useState('');

  // Match result popup state
  const [resultVisible, setResultVisible] = useState(false);

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Teams accordion state
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // TODO: wire this up to a real PATCH /competition/:id call. For now this
  // just flips the corresponding field locally so the switches are functional.
  const toggleSetting = (setting: 'refereesEnabled' | 'statisticsEnabled' | 'playerRatingsEnabled') => {
    setCompetition(prev => {
      if (!prev) return prev;
      const fieldMap = { refereesEnabled: 'referee', statisticsEnabled: 'prize', playerRatingsEnabled: 'pennies' } as const;
      const field = fieldMap[setting];
      return { ...prev, [field]: prev[field] ? 0 : 1 };
    });
  };

  const toggleTeamAccordion = (teamId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTeamId(prev => (prev === teamId ? null : teamId));
  };

  const openRegister = () => {
    setRegisterMode(null);
    setRegisterStep('choose');
    setSelectedMyTeamId(null);
    setNewTeamName('');
    setSelectedCompetitionTeamId(null);
    setPhoneNumber('');
    setSkillLevel(null);
    setJoinMessage('');
    setGuestCount(''); 
    setRegisterVisible(true);
  };

  const closeRegister = () => setRegisterVisible(false);

  const chooseTeamMode = () => {
    setRegisterMode('team');
    setGuestCount(competition?.teamSize);
    setIsTeam(true);
    setRegisterStep(EMPTY_COMPETITION_TEAMS.length > 0 ? 'teamPick' : 'teamCreate');
  };

  const choosePlayerMode = () => {
    setRegisterMode('player');
    setIsTeam(false);
    setRegisterStep('playerPick');
  };

  const confirmRegistration = async () => {

    const teams = EMPTY_COMPETITION_TEAMS.find(t => t.id === selectedMyTeamId);
    
    try {
      const UpdateUserResponse = await authenticatedApi.patch(`profile`, {
      phone: phoneNumber,
      skillLevel: skillLevel,
    });
    console.log("selectedMyTeaew ew mId", selectedMyTeamId);
      const response = await authCompetitionsdApi.post(
        `competitions/${competition_id}/join`,
        {
          ...(selectedMyTeamId != null && { teamId: selectedMyTeamId }),
          "competitionId": competition_id,
          "isTeam": isTeam,
          "guestCount": guestCount,
          "comment": joinMessage,
          
        }
      );

      setSuccessText(`${teams?.name ?? 'Your team'} has been registered for ${competition?.name}.`);
      setRegisterStep('success');

    } catch (error) {
      if (axios.isAxiosError(error)) {
        // This is where your server's error message actually lives
        const serverMessage = error.response?.data?.message;
        console.log('Server message:', serverMessage);

        if (error.response?.status === 409) {
          // e.g. show a toast/alert: "You have already joined this competition."
          Alert.alert('Already joined', serverMessage ?? 'You have already joined this competition.');
        }
      } else {
        console.log('Unexpected error:', error);
      }
    }
  };


  const registerModalTitle = () => {
    switch (registerStep) {
      case 'choose':
        return 'Register';
      case 'teamPick':
        return 'Choose Your Team';
      case 'teamCreate':
        return 'Create a Team';
      case 'playerPick':
        return 'Join as Player';
      case 'playerMessage':
        return 'Send Request';
      case 'success':
        return 'Success';
      default:
        return 'Register';
    }
  };

  const canGoBack = registerStep !== 'choose' && registerStep !== 'success';

  const handleBack = () => {
    if (registerStep === 'teamPick' || registerStep === 'teamCreate' || registerStep === 'playerPick') {
      setRegisterStep('choose');
      setRegisterMode(null);
      return;
    }
    if (registerStep === 'playerMessage') {
      setRegisterStep('playerPick');
      return;
    }
  };

  useEffect(() => { 
    const fetchCompetition = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}competitions/${competition_id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch competition: ${response.status}`);
        }

        const data: Competition = await response.json();


        setCompetition(data.data);

        setTeams(data.data.teams);
      } catch (err) {
        console.error('Error fetching competition:', err);
        setError('Unable to load competition.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, []);

  const onVenmoPress = async () => {
    let amount = competition?.pricePlayer * (guestCount + 1);
    
    const token = await AsyncStorage.getItem('access_token');
    const userInfo = decodeToken(token);
    const paymentNote = `Payment from ${userInfo.first_name} ${userInfo.last_name} for ${guestCount + 1} player ${guestCount + 1 === 1 ? '' : 's'}`;

    console.log("amount : ", paymentNote);
    const result = await PaymentApiClient.handleVenmoPayment(amount, paymentNote);

    //if (result.success) {
      // e.g. navigate to a "waiting for confirmation" screen,
      // since Venmo doesn't return a callback — you can't know
      // the payment actually completed just because the link opened
    //}
  };
    const navigation = useNavigation<NavigationProp<any>>();
  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Banner + Logo ── */}
        <View style={styles.bannerWrap}>
          <Image source={{ uri: competition?.coverPhoto}} style={styles.banner} resizeMode="cover" />
          <View style={styles.bannerOverlay} />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon type="materialCommunityIcons" name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Edit button */}
          <TouchableOpacity style={styles.editBtn} onPress={() => navigate('editCompetition', { competitionId: competition.id, initialCompetition: competition })}>
            <Icon type="materialCommunityIcons" name="pencil" size={20} color={COLORS.white} />
          </TouchableOpacity>

          {/* Logo circle */}
          <View style={styles.logoRing}>
            <Image source={{ uri: competition?.logo }} style={styles.logo} resizeMode="cover" />
          </View>
        </View>

        {/* ── Competition Name & Meta ── */}
        <View style={styles.heroSection}>
          <Text style={styles.comName}>{competition?.name}</Text>

          {/* ── CTA Row ── */}
          <View style={styles.ctaRow}>
            {competition?.endRegistration && new Date() <= new Date(competition.endRegistration) && (
              <TouchableOpacity style={styles.registerBtn} activeOpacity={0.85} onPress={openRegister}>
                <Icon type="materialCommunityIcons" name="clipboard-check-outline" size={18} color={COLORS.white} />
                <Text style={styles.registerBtnText}>Register</Text>
              </TouchableOpacity>
            )}
            {/*<TouchableOpacity style={styles.requestsBtn} activeOpacity={0.85} onPress={() => navigation?.navigate('joinRequests', {organizerId: 1})}>
              <Icon type="materialCommunityIcons" name="bell-outline" size={18} color={COLORS.white} />
              <Text style={styles.registerBtnText}>Requests</Text>
            </TouchableOpacity>*/}
            <TouchableOpacity style={styles.requestsBtn} activeOpacity={0.85} onPress={() => setResultVisible(true)}>
              <Icon type="materialCommunityIcons" name="trophy-outline" size={18} color={COLORS.white} />
              <Text style={styles.registerBtnText}>Results</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>

          {/* ── Basic Info Cards ── */}
          <View style={styles.cardGrid}>
            <InfoCard icon="map" label="Location" value={competition?.address + ", " +  competition?.city} />
            <InfoCard icon="calendar" label="Date" value={formatDateLong(new Date(competition?.startDate))} accent />
          </View>

          {/* ── Description ── */}
          <View style={styles.descBlock}>
            <Text style={styles.descText}>{competition?.description}</Text>
          </View>

          {/* ── Registration ── */}
          <SectionHeader label="Registration" />
          <View style={styles.card}>
            <RegistrationRow label="Price" value={competition?.pricePlayer} />
            <View style={styles.divider} />
            <RegistrationRow label="Format" value={competition?.format} />
            <View style={styles.divider} />
            <RegistrationRow label="Registration Period" value={formatDateLong(new Date(competition?.startRegistration)) + ' · ' + formatDateLong(new Date(competition?.endRegistration))} />
            <View style={styles.divider} />
            <RegistrationRow label="Number of teams" value={String(competition?.nbrOfTeams)} />
            <View style={styles.divider} />
            <RegistrationRow
              label="Team Format"
              value={String(competition?.teamSize) + ' player + ' + String(competition?.nbrOfSubs) + ' subs'}
            />
            <View style={styles.divider} />
            <RegistrationRow
              label="Gender & Age"
              value={String(competition?.gender) + ' · +' + String(competition?.minimumAge) + ' years old'}
            />
          </View>
          
          {/* ── Feature Toggles ── */}
            <SectionHeader label="Features" />
            <View style={styles.card}>
              {/* NOTE: referee/prize/pennies are odd source fields for these three
                  toggles — likely meant to be dedicated *Enabled flags from the API.
                  Cast to boolean here so the Switch renders correctly either way. */}
              <ToggleRow
                icon="whistle"
                label="Referees"
                description="Assign referees to matches"
                value={Boolean(competition?.referee)}
                onToggle={() => toggleSetting('refereesEnabled')}
              />
              <View style={styles.divider} />
              <ToggleRow
                icon="trophy"
                label="Prize"
                description="this competition awards a prize"
                value={Boolean(competition?.prize)}
                onToggle={() => toggleSetting('statisticsEnabled')}
              />
              <View style={styles.divider} />
              <ToggleRow
                icon="tshirt-crew"
                label="Player Ratings"
                description="Provide pennies/bibs for teams"
                value={Boolean(competition?.pennies)}
                onToggle={() => toggleSetting('playerRatingsEnabled')}
              />
            </View>
          {/* ── Teams (accordion with players) ── */}
          <SectionHeader label="Teams" />
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}
            onPress={() => navigation.navigate('CompetitionStandings', { competitionId: competition_id })}
          >
            <Icon type="materialCommunityIcons" name="format-list-numbered" size={18} color={COLORS.primary} />
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>View standings</Text>
          </TouchableOpacity>
          <View style={{ gap: 10 }}>
            {competition?.teams.map(team => (
              <TeamAccordionItem
                key={team.id}
                team={team}
                maxPlayers={competition?.teamSize + competition?.nbrOfSubs}
                expanded={expandedTeamId === team.id}
                onToggle={() => toggleTeamAccordion(team.id)}
                joinedPlayersCount={team.joinedPlayersCount}
              />
            ))}
          </View>

          <View style={styles.bottomPad} />
        </View>
      </ScrollView>

      {/* ── Match Result Modal ── */}
      <MatchResultModal
        visible={resultVisible}
        onClose={() => setResultVisible(false)}
        competitionId={competition_id}
        teams={competition?.teams ?? []}
        getTeamColor={getTeamColor}
      />

      {/* ── Registration Modal ── */}
      <Modal
        visible={registerVisible}
        animationType="slide"
        transparent
        onRequestClose={closeRegister}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalBackdropTouch} activeOpacity={1} onPress={closeRegister} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              {canGoBack ? (
                <TouchableOpacity onPress={handleBack} style={styles.modalHeaderBtn}>
                  <Icon type="materialCommunityIcons" name="arrow-left" size={22} color={COLORS.black} />
                </TouchableOpacity>
              ) : (
                <View style={styles.modalHeaderBtn} />
              )}
              <Text style={styles.modalTitle}>{registerModalTitle()}</Text>
              <TouchableOpacity onPress={closeRegister} style={styles.modalHeaderBtn}>
                <Icon type="materialCommunityIcons" name="close" size={22} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            {/* ── Step: choose ── */}
            {registerStep === 'choose' && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>How would you like to register for {competition?.name}?</Text>

                <RegisterOptionCard
                  icon="account-group"
                  title="Register as a Team"
                  description="Choose one of your teams or create a new one"
                  onPress={chooseTeamMode}
                />
                <RegisterOptionCard
                  icon="account"
                  title="Join as a Player"
                  description="Browse teams and request to join one"
                  onPress={choosePlayerMode}
                />
              </View>
            )}

            {/* ── Step: teamPick ── */}
            {registerStep === 'teamPick' && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Choose an available team to register for {competition?.name}</Text>
                <FlatList
                  data={competition?.teams.filter(t => t.joinedPlayersCount === 0) ?? []}
                  keyExtractor={item => item.id}
                  style={{ maxHeight: 260 }}
                  renderItem={({ item }) => (
                    <CompetitionTeamRow
                      team={item}
                      maxPlayers={competition?.teamSize + competition?.nbrOfSubs}
                      selected={selectedMyTeamId === item.id}
                      onPress={() => setSelectedMyTeamId(item.id)}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />

                {/*<TouchableOpacity
                  style={styles.createTeamLink}
                  onPress={() => navigate('addTeam', { comId: competition?.name })}
                >
                  <Icon type="materialCommunityIcons" name="plus-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.createTeamLinkText}>Now you can create your own team to matchup other teams</Text>
                </TouchableOpacity>*/}

                <TouchableOpacity
                  style={[styles.primaryBtn, !selectedMyTeamId && styles.primaryBtnDisabled]}
                  disabled={!selectedMyTeamId}
                  onPress={() => {
                    setRegisterStep('playerMessage');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Register Team</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* ── Step: playerPick ── */}
            {registerStep === 'playerPick' && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Pick a team to send a join request to, or let us assign you one</Text>
                <FlatList
                  data={competition?.teams.filter(t => (t.joinedPlayersCount != 0 && t.joinedPlayersCount!=(competition?.teamSize + competition?.nbrOfSubs))) ?? []}
                  keyExtractor={item => item.id}
                  style={{ maxHeight: 340 }}
                  ListHeaderComponent={
                    <RandomTeamRow
                      selected={selectedCompetitionTeamId === "null"}
                      onPress={() => setSelectedCompetitionTeamId("null")}
                    />
                  }
                  ListHeaderComponentStyle={{ marginBottom: 8 }}
                  renderItem={({ item }) => (
                    <CompetitionTeamRow
                      team={item}
                      maxPlayers={competition?.teamSize + competition?.nbrOfSubs}
                      selected={selectedCompetitionTeamId === item.id}
                      onPress={() => setSelectedCompetitionTeamId(item.id)}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, !selectedCompetitionTeamId && styles.primaryBtnDisabled]}
                  disabled={!selectedCompetitionTeamId}
                  onPress={() => {
                    setRegisterStep('playerMessage');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step: playerMessage ── */}
            {registerStep === 'playerMessage' && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  {selectedCompetitionTeamId === RANDOM_TEAM_ID
                    ? 'A few details so the organizer can match you with a team'
                    : `A few details for your request to ${competition?.teams.find(t => t.id === selectedCompetitionTeamId)?.name ?? 'the team'}`}
                </Text>

                <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                  {/* Phone number */}
                  <Text style={styles.fieldLabel}>Your Phone number</Text>
                  <View style={styles.inputWrap}>
                    <Icon type="materialCommunityIcons" name="phone-outline" size={20} color={COLORS.gray3} />
                    <TextInput
                      style={styles.input}
                      placeholder="(555) 123-4567"
                      placeholderTextColor={COLORS.gray3}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>

                  {/* Skill level */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Your Skill level</Text>
                  <View style={styles.levelRow}>
                    {PLAYER_LEVELS.map(level => (
                      <TouchableOpacity
                        key={level.value}
                        style={[styles.levelChip, skillLevel === level.value && styles.levelChipActive]}
                        activeOpacity={0.8}
                        onPress={() => setSkillLevel(level.value)}
                      >
                        <Text style={[styles.levelChipText, skillLevel === level.value && styles.levelChipTextActive]}>
                          {level.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Number of guests</Text>
                  <View style={styles.inputWrap}>
                    <NumericInput
                      value={guestCount}
                      onChange={setGuestCount}
                      min={isTeam==true ? competition?.teamSize : 0}
                      max={(competition?.teamSize + competition?.nbrOfSubs) - teams[1].joinedPlayersCount}
                    />
                  </View>

                  {/* Comment */}
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Comment</Text>
                  <View style={styles.textAreaWrap}>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Position, availability, anything else the organizer should know..."
                      placeholderTextColor={COLORS.gray3}
                      value={joinMessage}
                      onChangeText={setJoinMessage}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Entry fee / Venmo */}
                  <View style={styles.feeCard}>
                    <View style={styles.feeCardHeader}>
                      <Icon type="materialCommunityIcons" name="cash-multiple" size={20} color={COLORS.primary} />
                      <Text style={styles.feeCardTitle}>Entry fee: ${competition?.pricePlayer}/Player</Text>
                    </View>
                    <Text style={styles.feeCardText}>
                      Send {competition?.pricePlayer * (guestCount+1)} via Venmo to @yanibar so the host can match you with a team.
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.primaryBtn, (!phoneNumber.trim() || !skillLevel) && styles.primaryBtnDisabled]}
                  disabled={!phoneNumber.trim() || !skillLevel}
                  onPress={() => confirmRegistration(false)}
                >
                  <Text style={styles.primaryBtnText}>Send Request</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step: success ── */}
            {registerStep === 'success' && (
              <View style={styles.modalBody}>
                <View style={styles.successIconWrap}>
                  <Icon type="materialCommunityIcons" name="check-circle" size={56} color={COLORS.primary} />
                </View>
                <Text style={styles.successText}>{successText}</Text>
                  <View style={{ width: '100%', marginTop: 12, gap: 10 }}>
                    <Button
                      title="Pay with Venmo"
                      icon="logo-venmo"
                      filled
                      style={{ backgroundColor: '#3D95CE', borderRadius: 32 }}
                      onPress={() => onVenmoPress()}
                    />
                  </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}