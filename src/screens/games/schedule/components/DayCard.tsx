import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import { useTranslation } from 'react-i18next';

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
  onCancelGame: (gameId: number) => void;
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
  const { t } = useTranslation();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleGamePress = (game: Game) => {
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

  const isCancelled = (gameId: number) => cancelledGames.includes(gameId) || gameId==1;

  const handleAddGamePress = () => {
    if (!isPastDay) {
      onPress();
    }
  };

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
              {game.address}
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
              {game.startTime} - {game.endTime}
            </Text>

            <Text
              style={[
                styles.gamePlayers,
                isCancelled(game.id) && {
                  textDecorationLine: 'line-through',
                  color: '#991b1b',
                },
              ]}
            >
              {t('schedule.players')}: {/*game.participants.length*/}{' 2'}{" "}
              {game.isFree
                ? `(${t('schedule.free')})`
                : `($${game.price}/${t('schedule.player')})`}
            </Text>

            {isCancelled(game.id) && (
              <Text style={{ color: '#dc2626', fontWeight: 'bold', marginTop: 8 }}>
                {t('schedule.cancelled')}
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}

      {!isPastDay && (
        <TouchableOpacity onPress={handleAddGamePress}>
          <Text style={styles.addGameText}>
            + {t('schedule.addGame')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}