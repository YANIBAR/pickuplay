import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Icon } from '@components';
import { COLORS, SIZES } from '@constants';
import { authenticatedApi } from '@services/api';
import { useRef, useState } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { formatDateLong, formatTime, parseTime } from '@utils/dateUtils';

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
      7: 'football'
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
    <TouchableOpacity
      style={[styles.card, isGameFull && styles.usedCard]}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.gameIcon}>
            <Icon 
              type="materialCommunityIcons" 
              name={getGameIcon(game.sportType.id)} 
              size={24} 
              color={COLORS.primary}
            />
          </View>
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

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailText, isGameFull && styles.usedText]}>
             {formatDateLong(new Date(game.startTime))}, ({formatTime(game.startTime)} - {formatTime(game.endTime)})
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
            {game.participants ? game.participants.length : 0}/{game.nbrSpots}
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
              ? t('myGames.full')
              : t('myGames.spotsAvailable', { count: game.availableSpots })}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {Editable ? (
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('detail', { game })}>
            <Icon type="materialCommunityIcons" name="pencil" size={18} color="#fff" />
            <Text style={styles.editButtonText}>{t('common.view')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Icon type="materialCommunityIcons" name="pencil" size={18} color="#fff" />
            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
          </TouchableOpacity>
        )}
        {gameStatus === 'ACTIVE' ? (
          <TouchableOpacity style={styles.cancelButton} onPress={() => refRBSheet.current?.open()}>
            <Icon type="materialCommunityIcons" name="close" size={18} color="#fff" />
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={handleActivate}>
            <Icon type="materialCommunityIcons" name="check" size={18} color="#fff" />
            <Text style={styles.editButtonText}>{t('common.activate')}</Text>
          </TouchableOpacity>
        )}
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
    gap: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

      bottomContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 12,
        paddingHorizontal: 16
      },
      confirmCancelButton: {
        width: (SIZES.width - 32) / 2 - 8,
        backgroundColor: COLORS.primary,
        borderRadius: 32
      },
      bottomTitle: {
        fontSize: 24,
        fontFamily: "semiBold",
        color: COLORS.primary,
        textAlign: "center",
        marginTop: 12
      },
      bottomSubtitle: {
        fontSize: 20,
        fontFamily: "semiBold",
        color: COLORS.grayscale900,
        textAlign: "center",
        marginVertical: 28
      },
      separateLine: {
        width: SIZES.width,
        height: 1,
        backgroundColor: COLORS.grayscale200,
        marginTop: 12
      }
});