import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '@constants';
import { Icon } from '@components';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LeagueDetail {
  name: string;
  sport: string;
  description: string;
  season: 'fall' | 'spring' | 'summer' | 'winter';
  city: string;
  visibility: 'public' | 'private' | 'invite-only';
  bannerUrl: string;
  logoUrl: string;
  registration: {
    openDate: string;
    closeDate: string;
    maxTeams: number;
    minPlayersPerTeam: number;
    maxPlayersPerTeam: number;
  };
  format: 'round_robin' | 'double_round_robin' | 'knockout' | 'group_stage' | 'custom';
  settings: {
    pointsForWin: number;
    pointsForDraw: number;
    pointsForLoss: number;
    refereesEnabled: boolean;
    statisticsEnabled: boolean;
    playerRatingsEnabled: boolean;
    liveScoresEnabled: boolean;
  };
}

interface MyTeam {
  id: string;
  name: string;
  logoUrl: string;
  playersCount: number;
}

interface LeagueTeam {
  id: string;
  name: string;
  logoUrl: string;
  playersCount: number;
  maxPlayers: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LEAGUE: LeagueDetail = {
  name: 'KC Soccer League',
  sport: 'Soccer',
  description:
    'The most competitive amateur soccer league in the city, bringing together top local talent every season.',
  season: 'fall',
  city: 'Kansas City',
  visibility: 'public',
  bannerUrl: 'https://media.istockphoto.com/id/928200604/vector/soccer-game-match-goal-moment-with-ball-in-the-net-mesh-football-ball-in-goal-banners-for.jpg?s=612x612&w=0&k=20&c=3Hh3YZCSjELpf9HafD3l9F5OA7rne_jvTz0lAV4FVJ8=',
  logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200',
  registration: {
    openDate: 'Aug 1, 2025',
    closeDate: 'Sep 15, 2025',
    maxTeams: 16,
    minPlayersPerTeam: 11,
    maxPlayersPerTeam: 22,
  },
  format: 'round_robin',
  settings: {
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    refereesEnabled: true,
    statisticsEnabled: true,
    playerRatingsEnabled: false,
    liveScoresEnabled: true,
  },
};

// Mock: teams the current user manages/belongs to (empty array = user has no team yet)
const MY_TEAMS: MyTeam[] = [
  {
    id: 'mt1',
    name: 'Westside Wolves',
    logoUrl: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=200',
    playersCount: 14,
  },
  {
    id: 'mt2',
    name: 'River City FC',
    logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200',
    playersCount: 9,
  },
];

// Mock: teams already registered in this league, available for a player to request to join
const LEAGUE_TEAMS: LeagueTeam[] = [
  {
    id: 'lt1',
    name: 'Downtown Dynamos',
    logoUrl: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=200',
    playersCount: 16,
    maxPlayers: 22,
  },
  {
    id: 'lt2',
    name: 'Northland Strikers',
    logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200',
    playersCount: 20,
    maxPlayers: 22,
  },
  {
    id: 'lt3',
    name: 'Plaza United',
    logoUrl: 'https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=200',
    playersCount: 11,
    maxPlayers: 22,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ label }: { label: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{label}</Text>
  </View>
);

const InfoCard = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <View style={[styles.infoCard, accent && styles.infoCardAccent]}>
    <Icon
      type="materialCommunityIcons"
      name={icon as any}
      size={20}
      color={accent ? COLORS.white : COLORS.secondary}
    />
    <Text style={[styles.infoCardLabel, accent && styles.infoCardLabelAccent]}>{label}</Text>
    <Text style={[styles.infoCardValue, accent && styles.infoCardValueAccent]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const RegistrationRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.regRow}>
    <Text style={styles.regLabel}>{label}</Text>
    <Text style={styles.regValue}>{value}</Text>
  </View>
);

const FormatOption = ({
  label,
  value,
  active,
  icon,
}: {
  label: string;
  value: string;
  active: boolean;
  icon: string;
}) => (
  <View style={[styles.formatOption, active && styles.formatOptionActive]}>
    <Icon
      type="materialCommunityIcons"
      name={icon as any}
      size={22}
      color={active ? COLORS.primary : COLORS.gray3}
    />
    <Text style={[styles.formatLabel, active && styles.formatLabelActive]}>{label}</Text>
    {active && (
      <View style={styles.formatBadge}>
        <Text style={styles.formatBadgeText}>Active</Text>
      </View>
    )}
  </View>
);

const PointsBox = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.pointsBox}>
    <Text style={styles.pointsValue}>{value}</Text>
    <Text style={styles.pointsLabel}>{label}</Text>
  </View>
);

const ToggleRow = ({
  icon,
  label,
  description,
  value,
  onToggle,
}: {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) => (
  <View style={styles.toggleRow}>
    <View style={[styles.toggleIconWrap, value && styles.toggleIconWrapActive]}>
      <Icon
        type="materialCommunityIcons"
        name={icon as any}
        size={20}
        color={value ? COLORS.primary : COLORS.gray3}
      />
    </View>
    <View style={styles.toggleText}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: COLORS.grayscale300, true: `${COLORS.primary}55` }}
      thumbColor={value ? COLORS.primary : COLORS.gray3}
    />
  </View>
);

// ─── Registration popup sub-components ────────────────────────────────────────

type RegisterStep = 'choose' | 'teamPick' | 'teamCreate' | 'playerPick' | 'playerMessage' | 'success';
type RegisterMode = 'team' | 'player' | null;

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

const MyTeamRow = ({
  team,
  selected,
  onPress,
}: {
  team: MyTeam;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.teamRow, selected && styles.teamRowSelected]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <Image source={{ uri: team.logoUrl }} style={styles.teamRowLogo} />
    <View style={styles.teamRowInfo}>
      <Text style={styles.teamRowName}>{team.name}</Text>
      <Text style={styles.teamRowMeta}>{team.playersCount} players</Text>
    </View>
    <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  </TouchableOpacity>
);

const LeagueTeamRow = ({
  team,
  selected,
  onPress,
}: {
  team: LeagueTeam;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.teamRow, selected && styles.teamRowSelected]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <Image source={{ uri: team.logoUrl }} style={styles.teamRowLogo} />
    <View style={styles.teamRowInfo}>
      <Text style={styles.teamRowName}>{team.name}</Text>
      <Text style={styles.teamRowMeta}>
        {team.playersCount}/{team.maxPlayers} players
      </Text>
    </View>
    <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  </TouchableOpacity>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEASON_ICONS: Record<string, string> = {
  fall: 'leaf',
  spring: 'flower',
  summer: 'weather-sunny',
  winter: 'snowflake',
};

const SEASON_COLORS: Record<string, string> = {
  fall: '#E07B39',
  spring: '#4CAF50',
  summer: '#F9A825',
  winter: '#42A5F5',
};

const VISIBILITY_ICONS: Record<string, string> = {
  public: 'earth',
  private: 'lock',
  'invite-only': 'account-group',
};

const FORMAT_OPTIONS = [
  { value: 'round_robin', label: 'Round Robin', icon: 'rotate-right' },
  { value: 'double_round_robin', label: 'Double Round Robin', icon: 'sync' },
  { value: 'knockout', label: 'Knockout', icon: 'tournament' },
  { value: 'group_stage', label: 'Group Stage', icon: 'view-grid' },
  { value: 'custom', label: 'Custom', icon: 'pencil-ruler' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LeagueDetailScreen({ navigation }: any) {
  const [league, setLeague] = useState<LeagueDetail>(LEAGUE);

  // Registration popup state
  const [registerVisible, setRegisterVisible] = useState(false);
  const [registerMode, setRegisterMode] = useState<RegisterMode>(null);
  const [registerStep, setRegisterStep] = useState<RegisterStep>('choose');
  const [selectedMyTeamId, setSelectedMyTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedLeagueTeamId, setSelectedLeagueTeamId] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [successText, setSuccessText] = useState('');

  const toggleSetting = (key: keyof LeagueDetail['settings']) => {
    setLeague(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings[key as keyof typeof prev.settings],
      },
    }));
  };

  const seasonColor = SEASON_COLORS[league.season];

  const openRegister = () => {
    setRegisterMode(null);
    setRegisterStep('choose');
    setSelectedMyTeamId(null);
    setNewTeamName('');
    setSelectedLeagueTeamId(null);
    setJoinMessage('');
    setRegisterVisible(true);
  };

  const closeRegister = () => setRegisterVisible(false);

  const chooseTeamMode = () => {
    setRegisterMode('team');
    setRegisterStep(MY_TEAMS.length > 0 ? 'teamPick' : 'teamCreate');
  };

  const choosePlayerMode = () => {
    setRegisterMode('player');
    setRegisterStep('playerPick');
  };

  const confirmTeamRegistration = () => {
    const team = MY_TEAMS.find(t => t.id === selectedMyTeamId);
    setSuccessText(`${team?.name ?? 'Your team'} has been registered for ${league.name}.`);
    setRegisterStep('success');
  };

  const confirmCreateAndRegister = () => {
    if (!newTeamName.trim()) return;
    setSuccessText(`"${newTeamName.trim()}" was created and registered for ${league.name}.`);
    setRegisterStep('success');
  };

  const confirmPlayerRequest = () => {
    const team = LEAGUE_TEAMS.find(t => t.id === selectedLeagueTeamId);
    setSuccessText(`Your request to join ${team?.name ?? 'the team'} has been sent.`);
    setRegisterStep('success');
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

  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Banner + Logo ── */}
        <View style={styles.bannerWrap}>
          <Image source={{ uri: league.bannerUrl }} style={styles.banner} resizeMode="cover" />
          <View style={styles.bannerOverlay} />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <Icon type="materialCommunityIcons" name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Edit button */}
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation?.navigate('editLeague', { league })}>
            <Icon type="materialCommunityIcons" name="pencil" size={20} color={COLORS.white} />
          </TouchableOpacity>

          {/* Logo circle */}
          <View style={styles.logoRing}>
            <Image source={{ uri: league.logoUrl }} style={styles.logo} resizeMode="cover" />
          </View>
        </View>

        {/* ── League Name & Meta ── */}
        <View style={styles.heroSection}>
          <Text style={styles.leagueName}>{league.name}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: `${seasonColor}22`, borderColor: seasonColor }]}>
              <Icon
                type="materialCommunityIcons"
                name={SEASON_ICONS[league.season] as any}
                size={13}
                color={seasonColor}
              />
              <Text style={[styles.badgeText, { color: seasonColor }]}>
                {league.season.charAt(0).toUpperCase() + league.season.slice(1)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#E8F5E922', borderColor: '#4CAF50' }]}>
              <Icon type="materialCommunityIcons" name={VISIBILITY_ICONS[league.visibility] as any} size={13} color="#4CAF50" />
              <Text style={[styles.badgeText, { color: '#4CAF50' }]}>
                {league.visibility.charAt(0).toUpperCase() + league.visibility.slice(1)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${COLORS.primary}15`, borderColor: COLORS.primary }]}>
              <Icon type="materialCommunityIcons" name="run" size={13} color={COLORS.primary} />
              <Text style={[styles.badgeText, { color: COLORS.primary }]}>{league.sport}</Text>
            </View>
          </View>

          {/* ── Register CTA ── */}
          <TouchableOpacity style={styles.registerBtn} activeOpacity={0.85} onPress={openRegister}>
            <Icon type="materialCommunityIcons" name="clipboard-check-outline" size={18} color={COLORS.white} />
            <Text style={styles.registerBtnText}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>

          {/* ── Basic Info Cards ── */}
          <View style={styles.cardGrid}>
            <InfoCard icon="city" label="City" value={league.city} />
            <InfoCard icon="soccer-field" label="Sport" value={league.sport} accent />
          </View>

          {/* ── Description ── */}
          <View style={styles.descBlock}>
            <Text style={styles.descText}>{league.description}</Text>
          </View>

          {/* ── Registration ── */}
          <SectionHeader label="Registration" />
          <View style={styles.card}>
            <RegistrationRow label="Opens" value={league.registration.openDate} />
            <View style={styles.divider} />
            <RegistrationRow label="Closes" value={league.registration.closeDate} />
            <View style={styles.divider} />
            <RegistrationRow label="Max Teams" value={String(league.registration.maxTeams)} />
            <View style={styles.divider} />
            <RegistrationRow
              label="Min Players / Team"
              value={String(league.registration.minPlayersPerTeam)}
            />
            <View style={styles.divider} />
            <RegistrationRow
              label="Max Players / Team"
              value={String(league.registration.maxPlayersPerTeam)}
            />
          </View>

          {/* ── League Format ── */}
          <SectionHeader label="League Format" />
          <View style={styles.formatGrid}>
            {FORMAT_OPTIONS.map(opt => (
              <FormatOption
                key={opt.value}
                {...opt}
                active={league.format === opt.value}
              />
            ))}
          </View>

          {/* ── Points System ── */}
          <SectionHeader label="Points System" />
          <View style={styles.pointsRow}>
            <PointsBox label="Win" value={league.settings.pointsForWin} />
            <PointsBox label="Draw" value={league.settings.pointsForDraw} />
            <PointsBox label="Loss" value={league.settings.pointsForLoss} />
          </View>

          {/* ── Feature Toggles ── */}
          <SectionHeader label="Features" />
          <View style={styles.card}>
            <ToggleRow
              icon="whistle"
              label="Referees"
              description="Assign referees to matches"
              value={league.settings.refereesEnabled}
              onToggle={() => toggleSetting('refereesEnabled')}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="chart-bar"
              label="Statistics"
              description="Track detailed match stats"
              value={league.settings.statisticsEnabled}
              onToggle={() => toggleSetting('statisticsEnabled')}
            />
            <View style={styles.divider} /> 
            <ToggleRow
              icon="star-outline"
              label="Player Ratings"
              description="Allow post-match player ratings"
              value={league.settings.playerRatingsEnabled}
              onToggle={() => toggleSetting('playerRatingsEnabled')}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="broadcast"
              label="Live Scores"
              description="Publish scores in real time"
              value={league.settings.liveScoresEnabled}
              onToggle={() => toggleSetting('liveScoresEnabled')}
            />
          </View>

          <View style={styles.bottomPad} />
        </View>
      </ScrollView>

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
                <Text style={styles.modalSubtitle}>How would you like to register for {league.name}?</Text>

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
                <Text style={styles.modalSubtitle}>Select the team you want to register</Text>
                <FlatList
                  data={MY_TEAMS}
                  keyExtractor={item => item.id}
                  style={{ maxHeight: 260 }}
                  renderItem={({ item }) => (
                    <MyTeamRow
                      team={item}
                      selected={selectedMyTeamId === item.id}
                      onPress={() => setSelectedMyTeamId(item.id)}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />

                <TouchableOpacity
                  style={styles.createTeamLink}
                  onPress={() => navigation.navigate('addTeam', { leagueId: league.name })}
                >
                  <Icon type="materialCommunityIcons" name="plus-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.createTeamLinkText}>Create a new team instead</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryBtn, !selectedMyTeamId && styles.primaryBtnDisabled]}
                  disabled={!selectedMyTeamId}
                  onPress={confirmTeamRegistration}
                >
                  <Text style={styles.primaryBtnText}>Register Team</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step: teamCreate ── */}
            {registerStep === 'teamCreate' && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Give your new team a name to register it for {league.name}</Text>

                <View style={styles.inputWrap}>
                  <Icon type="materialCommunityIcons" name="account-group-outline" size={20} color={COLORS.gray3} />
                  <TextInput
                    style={styles.input}
                    placeholder="Team name"
                    placeholderTextColor={COLORS.gray3}
                    value={newTeamName}
                    onChangeText={setNewTeamName}
                  />
                </View>

                {MY_TEAMS.length > 0 && (
                  <TouchableOpacity
                    style={styles.createTeamLink}
                    onPress={() => setRegisterStep('teamPick')}
                  >
                    <Icon type="materialCommunityIcons" name="account-group" size={18} color={COLORS.primary} />
                    <Text style={styles.createTeamLinkText}>Use an existing team instead</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.primaryBtn, !newTeamName.trim() && styles.primaryBtnDisabled]}
                  disabled={!newTeamName.trim()}
                  onPress={confirmCreateAndRegister}
                >
                  <Text style={styles.primaryBtnText}>Create & Register</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step: playerPick ── */}
            {registerStep === 'playerPick' && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Choose a team to send a join request to</Text>
                <FlatList
                  data={LEAGUE_TEAMS}
                  keyExtractor={item => item.id}
                  style={{ maxHeight: 300 }}
                  renderItem={({ item }) => (
                    <LeagueTeamRow
                      team={item}
                      selected={selectedLeagueTeamId === item.id}
                      onPress={() => setSelectedLeagueTeamId(item.id)}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, !selectedLeagueTeamId && styles.primaryBtnDisabled]}
                  disabled={!selectedLeagueTeamId}
                  onPress={() => setRegisterStep('playerMessage')}
                >
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step: playerMessage ── */}
            {registerStep === 'playerMessage' && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  Send a message to{' '}
                  {LEAGUE_TEAMS.find(t => t.id === selectedLeagueTeamId)?.name ?? 'the team'} with your
                  request
                </Text>

                <View style={styles.textAreaWrap}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Introduce yourself — position, experience, availability..."
                    placeholderTextColor={COLORS.gray3}
                    value={joinMessage}
                    onChangeText={setJoinMessage}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={confirmPlayerRequest}>
                  <Text style={styles.primaryBtnText}>Send Request</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step: success ── */}
            {registerStep === 'success' && (
              <View style={styles.modalBody}>
                <View style={styles.successIconWrap}>
                  <Icon type="materialCommunityIcons" name="check-circle" size={56} color="#4CAF50" />
                </View>
                <Text style={styles.successText}>{successText}</Text>

                <TouchableOpacity style={styles.primaryBtn} onPress={closeRegister}>
                  <Text style={styles.primaryBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BANNER_H = 220;
const LOGO_SIZE = 88;
const LOGO_BORDER = 4;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Banner
  bannerWrap: {
    height: BANNER_H,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: BANNER_H,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    position: 'absolute',
    bottom: -(LOGO_SIZE / 2),
    alignSelf: 'center',
    width: LOGO_SIZE + LOGO_BORDER * 2,
    height: LOGO_SIZE + LOGO_BORDER * 2,
    borderRadius: (LOGO_SIZE + LOGO_BORDER * 2) / 2,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
  },

  // Hero
  heroSection: {
    marginTop: LOGO_SIZE / 2 + 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leagueName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Register CTA
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 99,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Body
  body: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  // Description
  descBlock: {
    backgroundColor: COLORS.grayscale100,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  descText: {
    fontSize: 14,
    color: COLORS.gray3,
    lineHeight: 21,
  },

  // Info cards (grid)
  cardGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.grayscale100,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  infoCardAccent: {
    backgroundColor: COLORS.primary,
  },
  infoCardLabel: {
    fontSize: 11,
    color: COLORS.gray3,
    fontWeight: '500',
    marginTop: 6,
  },
  infoCardLabelAccent: {
    color: 'rgba(255,255,255,0.75)',
  },
  infoCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  infoCardValueAccent: {
    color: COLORS.white,
  },

  // Section header
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },

  // Generic card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale100,
    marginHorizontal: 16,
  },

  // Registration rows
  regRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  regLabel: {
    fontSize: 14,
    color: COLORS.gray3,
  },
  regValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },

  // Format
  formatGrid: {
    gap: 8,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  formatOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  formatLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray3,
    fontWeight: '500',
  },
  formatLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  formatBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  formatBadgeText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },

  // Points
  pointsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pointsBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
    gap: 4,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pointsLabel: {
    fontSize: 12,
    color: COLORS.gray3,
    fontWeight: '500',
  },

  // Toggle rows
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  toggleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIconWrapActive: {
    backgroundColor: `${COLORS.primary}18`,
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  toggleDescription: {
    fontSize: 12,
    color: COLORS.gray3,
  },

  bottomPad: {
    height: 40,
  },

  // ── Registration Modal ──
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '85%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.grayscale300,
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  modalHeaderBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
  },
  modalBody: {
    paddingTop: 8,
    gap: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray3,
    marginBottom: 6,
    lineHeight: 20,
  },

  // Register option cards (choose step)
  registerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  registerOptionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerOptionText: {
    flex: 1,
    gap: 3,
  },
  registerOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  registerOptionDesc: {
    fontSize: 12,
    color: COLORS.gray3,
    lineHeight: 16,
  },

  // Team rows (shared: my teams + league teams)
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  teamRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  teamRowLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  teamRowInfo: {
    flex: 1,
    gap: 2,
  },
  teamRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  teamRowMeta: {
    fontSize: 12,
    color: COLORS.gray3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.grayscale300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  createTeamLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  createTeamLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Inputs
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    padding: 0,
  },
  textAreaWrap: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
    padding: 12,
  },
  textArea: {
    fontSize: 14,
    color: COLORS.black,
    minHeight: 100,
    padding: 0,
  },

  // Primary button (shared across modal steps)
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Success step
  successIconWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  successText: {
    fontSize: 15,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
});