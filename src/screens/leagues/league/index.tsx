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
  customFormat?: {
    summary: string;
    stages: string[]; // ordered list of stage descriptions
  };
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
  format: 'custom',
  customFormat: {
    summary:
      'Teams are split into 4 groups of 4. Group winners and runners-up cross over into a knockout bracket, ending in a semifinal and final.',
    stages: [
      '4 groups of 4 teams play round robin within their group',
      '1st in Group A vs 2nd in Group B',
      '1st in Group B vs 2nd in Group C',
      '1st in Group C vs 2nd in Group D',
      '1st in Group D vs 2nd in Group A',
      'Winners advance to the Semifinals',
      'Semifinal winners meet in the Final',
    ],
  },
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

const CustomFormatExplainer = ({ summary, stages }: { summary: string; stages: string[] }) => (
  <View style={styles.customFormatCard}>
    <View style={styles.customFormatHeader}>
      <Icon type="materialCommunityIcons" name="information-outline" size={18} color={COLORS.primary} />
      <Text style={styles.customFormatTitle}>How this format works</Text>
    </View>
    <Text style={styles.customFormatSummary}>{summary}</Text>
    <View style={styles.customFormatSteps}>
      {stages.map((stage, i) => (
        <View key={i} style={styles.customFormatStepRow}>
          <View style={styles.customFormatStepDot}>
            <Text style={styles.customFormatStepNum}>{i + 1}</Text>
          </View>
          <Text style={styles.customFormatStepText}>{stage}</Text>
        </View>
      ))}
    </View>
  </View>
);
const FormatOption = ({
  label,
  icon,
}: {
  label: string;
  icon: string;
}) => (
  <View style={[styles.formatOption, styles.formatOptionActive]}>
    <Icon
      type="materialCommunityIcons"
      name={icon as any}
      size={22}
      color={COLORS.primary}
    />
    <Text style={[styles.formatLabel, styles.formatLabelActive]}>{label}</Text>
    <View style={styles.formatBadge}>
      <Text style={styles.formatBadgeText}>Active</Text>
    </View>
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
}: {
  icon: string;
  label: string;
  description: string;
  value: boolean;
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
  </View>
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
  { value: 'custom', label: 'Custom', icon: 'pencil-ruler' },
  { value: 'round_robin', label: 'Round Robin', icon: 'rotate-right' },
  { value: 'double_round_robin', label: 'Double Round Robin', icon: 'sync' },
  { value: 'knockout', label: 'Knockout', icon: 'tournament' },
  { value: 'group_stage', label: 'Group Stage', icon: 'view-grid' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LeagueDetailScreen({ navigation }: any) {
  const [league, setLeague] = useState<LeagueDetail>(LEAGUE);

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
            {(() => {
              const activeFormat = FORMAT_OPTIONS.find(opt => opt.value === league.format);
              return activeFormat ? (
                <FormatOption label={activeFormat.label} icon={activeFormat.icon} />
              ) : null;
            })()}
          </View>
          {league.format === 'custom' && league.customFormat && (
            <CustomFormatExplainer
              summary={league.customFormat.summary}
              stages={league.customFormat.stages}
            />
          )}

          {/* ── Points System ── */}
          <SectionHeader label="Points System" />
          <View style={styles.pointsRow}>
            <PointsBox label="Win" value={league.settings.pointsForWin} />
            <PointsBox label="Draw" value={league.settings.pointsForDraw} />
            <PointsBox label="Loss" value={league.settings.pointsForLoss} />
          </View>

          {/* ── Feature Toggles ── */}
          {/*<SectionHeader label="Features" />
          <View style={styles.card}>
            <ToggleRow
              icon="whistle"
              label="Referees"
              description="Assign referees to matches"
              value={league.settings.refereesEnabled}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="tshirt-crew"
              label="jersey"
              description=""
              value={true}
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
          </View>*/}

          <View style={styles.bottomPad} />
        </View>
      </ScrollView>
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
  customFormatCard: {
  marginTop: 12,
  backgroundColor: `${COLORS.primary}08`,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: `${COLORS.primary}30`,
  padding: 14,
},
customFormatHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 8,
},
customFormatTitle: {
  fontSize: 13,
  fontWeight: '700',
  color: COLORS.primary,
},
customFormatSummary: {
  fontSize: 13,
  color: COLORS.gray3,
  lineHeight: 19,
  marginBottom: 12,
},
customFormatSteps: {
  gap: 8,
},
customFormatStepRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 8,
},
customFormatStepDot: {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: COLORS.primary,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 1,
},
customFormatStepNum: {
  fontSize: 10,
  fontWeight: '700',
  color: COLORS.white,
},
customFormatStepText: {
  flex: 1,
  fontSize: 13,
  color: COLORS.black,
  lineHeight: 18,
},
});