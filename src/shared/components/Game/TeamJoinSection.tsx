import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { COLORS, SIZES, FONTS, images } from '@constants';
import { Icon } from '@components';
import { JAVA_API } from '@env';
import { toTitleCase } from '@utils/helpers';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface Participant {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  userPhone?: string | null;
  status?: string;
  number_guest?: number;
  hasBall?: boolean;
  joinedAt?: string;
}

export interface Team {
  id: number;
  name: string;
  participants: Participant[];
}

// Teams are dynamic (e.g. "skin", "white"), so this is just a string.
export type TeamColor = string;

const TEAM_COLOR_MAP: Record<string, string> = {
  yellow: COLORS.yellow,
  red: COLORS.red,
  green: COLORS.green,
  blue: COLORS.blue,
  orange: COLORS.orange,
  purple: COLORS.purple,
  pink: COLORS.pink,
  black: COLORS.black,
  gray: COLORS.gray,
  skin: COLORS.skin,
  white: COLORS.white,
};
const FALLBACK_TEAM_COLOR = COLORS.secondary;

export function getTeamColor(teamName: string): string {
  return TEAM_COLOR_MAP[teamName?.toLowerCase()] ?? FALLBACK_TEAM_COLOR;
}

// Readable text on any bib color: dark on light bibs (white, skin, yellow), white on the rest.
function getContrastText(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return COLORS.white;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? COLORS.black2 : COLORS.white;
}

interface Props {
  teams: Team[];
  maxPerTeam?: number;
  // Kept optional so existing callers don't break; no longer used here.
  canJoin?: boolean;
  isJoined?: boolean;
  isJoining?: boolean;
  onJoinTeam?: (color: TeamColor, teamId: number) => void;
}

export default function TeamJoinSection({ teams = [], maxPerTeam }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const { navigate } = useNavigation();
  const toggle = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));
    setExpanded(prev => (prev === id ? null : id));
  };

  const getHeadcount = (players: Participant[]) =>
  players.reduce((sum, p) => sum + 1 + (p.number_guest && p.number_guest > 0 ? p.number_guest : 0), 0);

  return (
    <View style={s.wrapper}>
      {teams.map(team => {
        const players = team.participants ?? [];
        const headcount = getHeadcount(players);
        const isFull = !!maxPerTeam && headcount >= maxPerTeam;
        const isOpen = expanded === team.id;
        const color = getTeamColor(team.name);
        const onColor = getContrastText(color);
        const fill = maxPerTeam ? Math.min(headcount / maxPerTeam, 1) : 0;

        return (
          <View key={team.id} style={[s.item, isOpen && s.itemOpen]}>
            <TouchableOpacity
              style={s.header}
              activeOpacity={0.7}
              onPress={() => toggle(team.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              accessibilityLabel={`${toTitleCase(team.name)} team, ${headcount} players`}
            >
              {/* Bib swatch with the player count inside */}
              <View style={[s.badge, { backgroundColor: color }]}>
                <Text style={[s.badgeCount, { color: onColor }]}>{headcount}</Text>
              </View>

              <View style={s.info}>
                <Text style={s.name}>{toTitleCase(team.name)}</Text>
                {maxPerTeam ? (
                  <View style={s.capacityRow}>
                    <View style={s.track}>
                      <View
                        style={[
                          s.fill,
                          {
                            width: `${fill * 100}%`,
                            backgroundColor: isFull ? COLORS.red : color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[s.meta, isFull && s.metaFull]}>
                      {isFull ? 'Full' : `${headcount}/${maxPerTeam}`}
                    </Text>
                  </View>
                ) : (
                  <Text style={s.meta}>
                    {headcount} {headcount === 1 ? 'player' : 'players'}
                  </Text>
                )}
              </View>

              <Icon
                type="materialCommunityIcons"
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={COLORS.gray3}
              />
            </TouchableOpacity>

            {isOpen && (
                <View style={s.body}>
                    {headcount === 0 ? (
                    <Text style={s.empty}>No players yet.</Text>
                    ) : (
                    players.map(p => {
                      const isPending = p.status === 'PENDING_APPROVAL';

                      return (
                        <View key={p.id} style={s.playerRow}>
                          <TouchableOpacity
                            onPress={() => navigate('profile', { userId: p.userId })}
                            style={[s.avatarWrap, isPending && s.pending]}
                          >
                            <Image
                              source={
                                failedImages[p.userId]
                                  ? images.avatar
                                  : { uri: `${JAVA_API}profile/${p.userId}/image` }
                              }
                              onError={() => setFailedImages(prev => ({ ...prev, [p.userId]: true }))}
                              style={s.avatar}
                            />
                            {!!p.hasBall && (
                              <View style={s.ballBadge} accessibilityLabel="Has the ball">
                                <Icon
                                  type="materialCommunityIcons"
                                  name="soccer"
                                  size={14}
                                  color={COLORS.grayscale900}
                                />
                              </View>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => navigate('profile', { userId: p.userId })}
                            style={[s.playerInfo, isPending && s.pending]}
                          >
                            <Text style={s.playerName} numberOfLines={1}>
                              {toTitleCase(p.userName)}
                            </Text>
                            {!!p.number_guest && p.number_guest > 0 && (
                              <Text style={s.guestText}>
                                +{p.number_guest} {p.number_guest === 1 ? 'guest' : 'guests'}
                              </Text>
                            )}
                          </TouchableOpacity>

                          {isPending && (
                            <View style={s.unpaidBadge} accessibilityLabel="Hasn't paid yet">
                              <Icon
                                type="materialCommunityIcons"
                                name="cash-remove"
                                size={20}
                                color={COLORS.red}
                              />
                            </View>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginTop: SIZES.base, marginBottom: 90 },
  item: {
    borderWidth: 1,
    borderColor: COLORS.grayscale200,
    borderRadius: 16,
    marginBottom: SIZES.padding2,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  itemOpen: {
    borderColor: COLORS.grayscale300,
    shadowColor: COLORS.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryWhite,
    paddingVertical: SIZES.padding3 - 2,
    paddingHorizontal: SIZES.padding3 - 2,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale300, // keeps white / light bibs visible on a white card
  },
  badgeCount: { ...FONTS.h3, textTransform: 'none' },
  info: { flex: 1, marginLeft: SIZES.padding3 - 2 },
  name: { ...FONTS.h3, color: COLORS.grayscale900 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  track: {
    flex: 1,
    maxWidth: 110,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.grayscale200,
    overflow: 'hidden',
    marginRight: SIZES.base,
  },
  fill: { height: '100%', borderRadius: 3 },
  meta: { ...FONTS.body4, fontSize: 13, color: COLORS.grayscale600 },
  metaFull: { ...FONTS.h5, color: COLORS.red, textTransform: 'none' },
  body: {
  paddingHorizontal: SIZES.padding3 - 2,
  paddingVertical: SIZES.base,
},
empty: {
  ...FONTS.body4,
  color: COLORS.gray3,
  paddingVertical: SIZES.padding3 - 2,
},
playerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: SIZES.padding2,
},
avatarWrap: {
  width: 60,
  height: 60,
},
avatar: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: COLORS.grayscale300,
},
ballBadge: {
  position: 'absolute',
  right: -4,
  bottom: -4,
  width: 24,
  height: 24,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: COLORS.white,
  borderWidth: 1,
  borderColor: COLORS.grayscale300,
},
playerInfo: {
  flex: 1,
  marginLeft: SIZES.padding3,
  justifyContent: 'center',
},
playerName: {
  ...FONTS.h3,
  textTransform: 'none',
  color: COLORS.grayscale900,
},
guestText: {
  ...FONTS.body4,
  color: COLORS.grayscale600,
  marginTop: 4,
},
pending: { opacity: 0.5 },
unpaidBadge: {
  marginLeft: SIZES.base,
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: COLORS.white,
  borderWidth: 1,
  borderColor: COLORS.red,
},
});