import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Icon } from '@components';
import { COLORS, SIZES } from '@constants';
import { authenticatedApi } from '@services/api';
import { useRef, useState } from 'react';
import { formatDateLong, formatTime, parseTime } from '@utils/dateUtils';
import RBSheet from 'react-native-raw-bottom-sheet';

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
  const [gameStatus, setGameStatus] = useState(game.status);
  const refRBSheet = useRef<any>(null);
  const handleGamePress = (game: Game) => {
    navigation.navigate('gameDetail', { game });
  };

  const handleCancel = async () => {
    try {
      await authenticatedApi.patch(`games/${game.id}`, JSON.stringify({ status: "CANCELED" }));
      setGameStatus("CANCELED");
      refRBSheet.current?.close();
      Alert.alert("Success", "Game cancelled successfully");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Something went wrong";
      Alert.alert("Cannot Cancel Game", message);
    }
  };

  const handleActivate = async () => {
    try {
      await authenticatedApi.patch(`games/${game.id}`, JSON.stringify({ status: "ACTIVE" }));
      setGameStatus("ACTIVE");
      Alert.alert("Success", "Game activated successfully");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Something went wrong";
      Alert.alert("Cannot Activate Game", message);
    }
  };

  const handleEdit = () => {
    // Add your edit logic here
    navigation.navigate('editGame', { game });
  };

  const isGameFull = game.currentParticipants >= game.maxPlayers;
  const availableSlots = game.maxPlayers - game.currentParticipants;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGameIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      1: 'soccer',
      2: 'basketball',
      3: 'volleyball',
      5: 'tennis',
      4: 'hockey-sticks',
      6: 'table-tennis',
      7: 'table-tennis',
      8: 'football'
    };
    return iconMap[type] || 'sports';
  };
  const Editable = (() => {
    if (!game.startTime) return false;
    const start = new Date(game.startTime);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    return diffMs > 0 && diffMs < 12 * 60 * 60 * 1000 && !game.isPrivate;
  })();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('game', { game_id: game.id})} key={game.id} style={styles.gameCard}>
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
              <View style={styles.buttonContainer}>
                {Editable ? (
                  <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('game', { game_id: game.id })}>
                    <Icon type="materialCommunityIcons" name="pencil" size={12} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <Icon type="materialCommunityIcons" name="pencil" size={12} color="#fff" />
                  </TouchableOpacity>
                )}
                {gameStatus === 'ACTIVE' ? (
                  <TouchableOpacity style={styles.cancelButton} onPress={() => refRBSheet.current?.open()}>
                    <Icon type="materialCommunityIcons" name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={handleActivate}>
                    <Icon type="materialCommunityIcons" name="check" size={12} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          <RBSheet
            ref={refRBSheet}
            closeOnPressMask={true}
            height={240}
            customStyles={{
              wrapper: {
                backgroundColor: "rgba(0,0,0,0.5)",
              },
              draggableIcon: {
                backgroundColor: COLORS.grayscale200,
                height: 4
              },
              container: {
                borderTopRightRadius: 32,
                borderTopLeftRadius: 32,
                height: 240,
                backgroundColor: COLORS.white
              }
            }}
          >
            <Text style={styles.bottomTitle}>Cancletion</Text>
            <View style={[styles.separateLine, {
              backgroundColor: COLORS.grayscale200,
            }]} />
            <Text style={[styles.bottomSubtitle, {
              color: COLORS.black
            }]}>
              Are you sure you want to cancel this game? This action cannot be undone.
            </Text>
            <View style={styles.bottomContainer}>
              <Button
                title={"Yes, cancel it"}
                filled
                style={styles.confirmCancelButton}
                onPress={handleCancel}
              />
              <Button
                title={"No, keep it"}
                style={{
                  width: (SIZES.width - 32) / 2 - 8,
                  backgroundColor: COLORS.transparentPrimary,
                  borderRadius: 32,
                  borderColor: COLORS.transparentPrimary
                }}
                textColor={COLORS.primary}
                onPress={() => refRBSheet.current?.close()}
              />
            </View>
          </RBSheet>
        </TouchableOpacity>
    
  );

  
}

const styles = StyleSheet.create({
  /* ── Game Cards ── */
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  gameIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.transparentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIconText: {
    fontSize: 22,
  },
  gameInfo: {
    flex: 1,
    gap: 3,
  },
  gameName: {
    fontSize: 15,
    fontFamily: 'bold',
    color: COLORS.secondary,
    fontWeight: "700"
  },
  gameSub: {
    fontSize: 10,
    fontFamily: 'regular',
    color: '#888',
  },
  gameRight: {
    alignItems: 'center',
  },
  gamePlayers: {
    fontSize: 15,
    fontFamily: 'bold',
    color: COLORS.secondary,
    fontWeight: "700"
  },
  gamePlayersLabel: {
    fontSize: 11,
    fontFamily: 'regular',
    color: '#999',
  },
  gameCardDivider: {
    width: 1,
    height: 46,
    backgroundColor: COLORS.transparentPrimary, // or '#E5E5E5' for neutral
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.red,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },

  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    paddingHorizontal: 16
  }
});