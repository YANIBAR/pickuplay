import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, images } from '@constants';
import { Icon } from '@components';
import { JAVA_API, API_BASE_URL } from '@env';
import styles from '../styles';
import { CompetitionTeam, CompetitionPlayer } from '../../types';
import publicCompetitionApi, { authCompetitionsdApi } from '@services/competitionApi';

const TEAM_COLOR_MAP: Record<string, string> = {
  yellow: COLORS.yellow,
  red: COLORS.red,
  green: COLORS.green,
  blue: COLORS.blue,
  orange: COLORS.orange,
  purple: COLORS.purple,
  black: COLORS.black,
  gray: COLORS.gray,
};

const FALLBACK_TEAM_COLOR = COLORS.secondary;

export function getTeamColor(teamName: string): string {
  return TEAM_COLOR_MAP[teamName?.toLowerCase()] ?? FALLBACK_TEAM_COLOR;
}

// player.player, not player itself, holds the profile — this was typed as
// CompetitionPlayer before but used like a CompetitionPlayer. Fixed to match usage.
const PlayerRow = ({ player }: { player: CompetitionPlayer }) => {
  const imageUrl = `${JAVA_API}profile/${player.id}/image`;

  const [imageFailed, setImageFailed] = useState(false);
  return (
    <View style={styles.playerRow}>
      <Image
        source={imageFailed ? images.avatar : { uri: imageUrl }}
        onError={() => setImageFailed(true)}
        style={styles.playerAvatar}
      />
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {player.firstName} {player.lastName}
        </Text>
        {player.guestCount && (
          <Text style={styles.playerPosition}>+{player.guestCount} Guest</Text>
        )}
      </View>
    </View>
  );
};

interface TeamAccordionItemProps {
  team: CompetitionTeam;
  maxPlayers: number;
  joinedPlayersCount: number;
  expanded: boolean;
  onToggle: () => void;
}

export default function TeamAccordionItem({
  team,
  maxPlayers,
  joinedPlayersCount,
  expanded,
  onToggle,
}: TeamAccordionItemProps) {
  const [players, setPlayers] = useState<CompetitionPlayer[]>(team.players ?? []);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [hasFetchedPlayers, setHasFetchedPlayers] = useState(false);

  // Fetch the team's players from the API the first time the accordion is
  // expanded, rather than relying on whatever `team.players` came with the
  // competition payload (which may be empty/stale).
  useEffect(() => {
    if (!expanded || hasFetchedPlayers) return;

    let cancelled = false;

    const fetchTeamPlayers = async () => {
      try {
        setLoadingPlayers(true);
        setPlayersError(null);

        const response = await publicCompetitionApi.get(`teams/${team.id}`);
        

        if (response.status!=200) {
          throw new Error(`Failed to fetch team: ${response.status}`);
        }

        if (!cancelled) {
          setPlayers(response.result.data.players ?? []);
        }
        console.log(players);
      } catch (err) {
        console.error('Error fetching team players:', err);
        if (!cancelled) {
          setPlayersError('Unable to load players.');
        }
      } finally {
        if (!cancelled) {
          setLoadingPlayers(false);
          setHasFetchedPlayers(true);
        }
      }
    };

    fetchTeamPlayers();

    return () => {
      cancelled = true;
    };
  }, [expanded, hasFetchedPlayers, team.id]);

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionHeader} activeOpacity={0.8} onPress={onToggle}>
        <View style={[styles.teamRowLogo, { backgroundColor: getTeamColor(team.color) }]} />
        <View style={styles.teamRowInfo}>
          <Text style={styles.teamRowName}>
            {team.name.charAt(0).toUpperCase() + team.name.slice(1)}
          </Text>
          <Text style={styles.teamRowMeta}>
            {joinedPlayersCount}/{maxPlayers} players
          </Text>
        </View>
        <Icon
          type="materialCommunityIcons"
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={COLORS.gray3}
        />
      </TouchableOpacity>
 
      {expanded && (
        <View style={styles.accordionBody}>
          {loadingPlayers ? (
            <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 12 }} />
          ) : playersError ? (
            <Text style={styles.accordionEmptyText}>{playersError}</Text>
          ) : players.length > 0 ? (
            <View style={styles.accordionPlayersGrid}>
              {players.map(player => (
                <PlayerRow key={player.entryId} player={player} />
              ))}
            </View>
          ) : (
            <Text style={styles.accordionEmptyText}>No players listed yet</Text>
          )}
        </View>
      )}
    </View>
  );
}