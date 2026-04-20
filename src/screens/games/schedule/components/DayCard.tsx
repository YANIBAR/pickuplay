import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import { useTranslation } from 'react-i18next';
import { formatTime } from '@utils/dateUtils';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from '@services/auth/auth.utils';

interface Game {
  id: number;
  date: Date;
  address: string;
  startTime: string;
  endTime: string;
  numPlayers: string;
  isFree: boolean;
  pricePerPlayer: string;
}

interface DayCardProps {
  date: Date;
  games: Game[];
  cancelledGames: number[]; // Array of cancelled game IDs
  isPastDay: boolean; // New prop to check if day is in the past
  onPress: () => void;
  onCancelGame: (id: number) => void;
}

export default function DayCard({
  date,
  games,
  cancelledGames,
  isPastDay,
  onPress,
  onCancelGame,
}: DayCardProps) {
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleGamePress = (game: Game) => {
    navigation.navigate('game', { game_id: game.id});
    setSelectedGame(game);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = () => {
    if (selectedGame) {
      onCancelGame(selectedGame.id);
      setCancelModalVisible(false);
      setSelectedGame(null);
    }
  };

  const handleCancelModalClose = () => {
    setCancelModalVisible(false);
    setSelectedGame(null);
  };

  const isCancelled = (id: number) => cancelledGames.includes(id) || id==1;

  const handleAddGamePress = () => {
    if (!isPastDay) {
      onPress();
    }
  };
  
  useEffect(() => {
    const fetchRole = async () => {
      const token =  await AsyncStorage.getItem('access_token');
      const userInfo = decodeToken(token);
      setRole(userInfo.role);
      return userInfo;
    };
    fetchRole();
  }, []);
  return (
    <View style={styles.dayCard}>
      <Text style={styles.dayCardTitle}>{formatDate(date)}</Text>

      {games.length === 0 ? (
        <Text style={styles.emptyText}>
          {t('schedule.noGamesScheduled')}
        </Text>
      ) : (
        games.map((game) => (
          <TouchableOpacity
            key={game.id}
            onPress={() => handleGamePress(game)}
            style={[
              styles.gameItem,
              game.status == "CANCELED" && {
                backgroundColor: '#fee2e2',
                borderLeftColor: '#dc2626',
                borderLeftWidth: 4,
                opacity: 0.7,
              },
            ]}
          >
            <Text
              style={[
                styles.gameAddress,
                isCancelled(game.id) && {
                  textDecorationLine: 'line-through',
                  color: '#991b1b',
                },
              ]}
            >
              {game.title}
            </Text>

            <Text
              style={[
                styles.gameAddress,
                isCancelled(game.id) && {
                  textDecorationLine: 'line-through',
                  color: '#991b1b',
                },
              ]}
            >
              {game.address}, {game.city}
            </Text>

            <Text
              style={[
                styles.gameTime,
                isCancelled(game.id) && {
                  textDecorationLine: 'line-through',
                  color: '#991b1b',
                },
              ]}
            >
              {formatTime(game.startTime)} - {formatTime(game.endTime)}
            </Text>

            {isCancelled(game.id) && (
              <Text style={{ color: '#dc2626', fontWeight: 'bold', marginTop: 8 }}>
                {t('schedule.cancelled')}
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}

      {role === 'ORGANIZER' && (
        <TouchableOpacity onPress={handleAddGamePress}>
          <Text style={styles.addGameText}>
            + {t('schedule.addGame')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}