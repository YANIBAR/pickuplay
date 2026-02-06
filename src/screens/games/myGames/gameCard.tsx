import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';

export type Game = {
  id: number;
  title: string;
  description: string | null;
  sportType: string;
  city: string;
  address: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  currentParticipants: number;
  creatorId: number;
  creatorName: string;
  isPrivate: boolean;
  participants: null;
  createdAt: string;
  updatedAt: string;
};

type GameCardProps = {
  game: Game;
  onPress: (game: Game) => void;
};

export default function GameCard({ game, onPress }: GameCardProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleGamePress = (game: Game) => {
    navigation.navigate('gameDetail', { game });
  };

  const isGameFull = game.currentParticipants >= game.maxPlayers;
  const availableSlots = game.maxPlayers - game.currentParticipants;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSportIcon = (sportType: string) => {
    const iconMap: { [key: string]: string } = {
      basketball: 'basketball',
      soccer: 'soccer',
      pingPong: 'table-tennis',
      hockey: 'hockey-puck',
      tennis: 'tennis',
      volleyball: 'volleyball',
    };
    return iconMap[sportType] || 'dumbbell';
  };

  return (
    <TouchableOpacity
      style={[styles.card, isGameFull && styles.usedCard]}
      onPress={() => {
        handleGamePress(game);
        onPress(game);
      }}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isGameFull && styles.usedText]}>{game.title}</Text>
            <Text style={[styles.creator, isGameFull && styles.usedText]}>
              {t('game.by')} {game.creatorName}
            </Text>
          </View>
        </View>
        {game.isPrivate && (
          <View style={styles.privateBadge}>
            <Text style={styles.privateBadgeText}>Private</Text>
          </View>
        )}
      </View>

      {game.description && (
        <Text style={[styles.description, isGameFull && styles.usedText]} numberOfLines={1}>
          {game.description}
        </Text>
      )}

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          
          <Text style={[styles.detailText, isGameFull && styles.usedText]}>
            {formatDateTime(game.startTime)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          
          <Text style={[styles.detailText, isGameFull && styles.usedText]} numberOfLines={1}>
            {game.address}, {game.city}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.participantsInfo}>
          
          <Text style={[styles.participantsText, isGameFull && styles.usedText]}>
            {game.currentParticipants}/{game.maxPlayers}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isGameFull ? styles.fullBadge : styles.availableBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isGameFull ? styles.fullText : styles.availableText,
            ]}
          >
            {isGameFull
              ? t('game.full')
              : t('game.spotsAvailable', { count: availableSlots })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usedCard: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  creator: {
    fontSize: 12,
    color: '#666',
  },
  usedText: {
    color: '#999',
  },
  privateBadge: {
    backgroundColor: '#FFB74D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  privateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  availableBadge: {
    backgroundColor: '#E8F5E9',
  },
  fullBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableText: {
    color: '#4CAF50',
  },
  fullText: {
    color: '#F44336',
  },
});