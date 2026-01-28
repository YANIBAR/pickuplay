import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import styles from '../styles';

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
  onPress: () => void;
  onCancelGame: (gameId: number) => void;
}

export default function DayCard({
  date,
  games,
  cancelledGames,
  onPress,
  onCancelGame,
}: DayCardProps) {
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

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

  const isCancelled = (gameId: number) => cancelledGames.includes(gameId);

  return (
    <View style={styles.dayCard}>
      <Text style={styles.dayCardTitle}>{formatDate(date)}</Text>

      {games.length === 0 ? (
        <Text style={styles.emptyText}>No games scheduled</Text>
      ) : (
        games.map((game) => (
          <TouchableOpacity
            key={game.id}
            onPress={() => handleGamePress(game)}
            style={[
              styles.gameItem,
              isCancelled(game.id) && {
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
              Players: {game.numPlayers}{' '}
              {game.isFree ? '(Free)' : `($${game.pricePerPlayer}/player)`}
            </Text>
            {isCancelled(game.id) && (
              <Text style={{ color: '#dc2626', fontWeight: 'bold', marginTop: 8 }}>
                Cancelled
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.addGameText}>+ Add Game</Text>
      </TouchableOpacity>

      {/* Cancel Game Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelModalClose}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingVertical: 24, paddingHorizontal: 20 },
            ]}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 16,
                color: '#1f2937',
              }}
            >
              Cancel Game?
            </Text>

            {selectedGame && (
              <View style={{ marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                <Text style={{ color: '#6b7280', marginBottom: 8 }}>
                  {selectedGame.address}
                </Text>
                <Text style={{ color: '#6b7280' }}>
                  {selectedGame.startTime} - {selectedGame.endTime}
                </Text>
              </View>
            )}

            <Text
              style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              Are you sure you want to cancel this game? This action cannot be
              undone.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleCancelModalClose}
                style={[
                  styles.cancelButton,
                  {
                    flex: 1,
                    backgroundColor: '#f3f4f6',
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: '#1f2937' },
                  ]}
                >
                  Keep Game
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmCancel}
                style={[
                  styles.createButton,
                  {
                    flex: 1,
                    backgroundColor: '#dc2626',
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.createButtonText,
                    { color: '#fff' },
                  ]}
                >
                  Cancel Game
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}