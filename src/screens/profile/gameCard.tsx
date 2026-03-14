import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Icon } from '@components';
import { COLORS, SIZES } from '@constants';
import styles from './styles';
import { formatDateLong, formatTime } from '@utils/dateUtils';

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

  const getGameIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      1: 'soccer',
      2: 'basketball',
      3: 'volleyball',
      5: 'tennis',
      4: 'hockey-sticks',
      6: 'table-tennis',
      7: 'football'
    };
    return iconMap[type] || 'sports';
  };

  return (
    <TouchableOpacity onPress={() => navigation.navigate('detail', { gameId: game.id})} key={game.id} style={styles.gameCard}>
        <View style={styles.gameIconBg}>
          <Icon 
            type="materialCommunityIcons" 
            name={getGameIcon(game.sportType.id)} 
            size={24} 
            color={COLORS.primary}
          />
        </View>
        {/* Vertical divider */}
        <View style={styles.gameCardDivider} />
        <View style={styles.gameInfo}>
          <Text style={styles.gameName}>{game.title}</Text>
          <Text style={styles.gameSub}>
            <Icon  type="entypo" name="location-pin" size={16} color={COLORS.primary}/> {game.address }
          </Text>
          <Text style={styles.gameSub}>
            {formatDateLong(new Date(game.startTime))}, ({formatTime(game.startTime)} - {formatTime(game.endTime)})
          </Text>
        </View>
        <View style={styles.gameRight}>
          <Text style={styles.gamePlayers}>
            {game.participants ? game.participants.length : 0}/{game.nbrSpots}
          </Text>
          <Text style={styles.gamePlayersLabel}>{t('profile.players')}</Text>
        </View>
    </TouchableOpacity>
    
  );

  
}