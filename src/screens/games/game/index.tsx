import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Image, Share, Alert, Clipboard, RefreshControl, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageSlider from './ImageSlider';
import InfoRow from './InfoRow';
import { Button, Header, Icon } from '@components';
import PriceTag from '@components/PriceTag';
import { COLORS, FONTS, images, SIZES } from '@constants';
import { useTranslation } from 'react-i18next';
import { JAVA_API } from '@env';
import { authenticatedApi, publicApi } from '@services/api';
import { useNavigation } from '@react-navigation/native';
import { formatDateLong, formatTime } from '@utils/dateUtils';
import { toTitleCase } from '@utils/helpers';
import { decodeToken } from '@services/auth/auth.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { getGameIcon } from '@components/Game/gameUtils';
import { useGameJoin } from '@components/Game/useGame';
import GameJoinModals from '@components/Game/GameJoinModals';
import type { Game } from '@components/Game/types';
import { isStoredTokenExpired } from '@utils/api/auth';
import TeamJoinSection from '@components/Game/TeamJoinSection';

export default function GameDetailsScreen({ route }: { route: any }) {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const gameId = route.params.game_id || {};

  const [game, setGame] = useState<Game>({} as Game);
  const [sportType, setSportType] = useState<string>();
  const [participants, setParticipants] = useState([]);
  const [role, setRole] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [expandedDay, setExpandedDay] = useState<string | null>('all');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ [date: string]: { selected: boolean } }>({});

  const fetchGame = async () => {
    try {
      const response = await publicApi.get(`games/${gameId}`);
      setGame(response.result.data);
      console.log('Fetched game:', response.result.data);
      setSportType(response.result.data.sportType.name);
      setParticipants(response.result.data.participants);
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  // join / unjoin / pay state + handlers, shared with GameCard
  const join = useGameJoin(game, fetchGame);

  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    const fetchRole = async () => {
      const token = await AsyncStorage.getItem('access_token');
      const userInfo = decodeToken(token);
      setRole(userInfo.role);
    };
    fetchRole();
    const checkToken = async () => {
        const expired = await isStoredTokenExpired();
        setIsLogged(!expired); // ← also note the `!` — logged = NOT expired
      };
  
      checkToken();
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGame();
    setRefreshing(false);
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Generate deep link for sharing
  const generateDeepLink = () => `http://pickuplay.com/redirect?game_id=${game.id}`;

  // Handle share button press
  const handleShareGame = async () => {
    try {
      const link = generateDeepLink();

      const message =
      `⚽ ${game.title}

    📍 ${game.address}
    🕒 ${new Date(game.startTime).toLocaleString()}
    💰 $${game.price}

    Join this game on Pickuplay 👇
    ${link}`;

      await Share.share({
        message,
        title: `Join ${game.title} on Pickuplay`,
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('game.shareModal.failedToShare'));
    }
  };

  // Copy deep link to clipboard
  const handleCopyDeepLink = () => {
    Clipboard.setString(generateDeepLink());
    Alert.alert(t('common.copied'), t('game.shareModal.linkCopied'));
  };

  const handleCloneGame = async () => {
    try {
      const dates = Object.keys(selectedDates);
      if (dates.length === 0) {
        Alert.alert(t('game.selectAtLeastOneDate'));
        return;
      }
      await authenticatedApi.post(`games/${game.id}/clone`, { dates });
      setCalendarModalVisible(false);
      Alert.alert(t('game.cloneSuccess'));
    } catch (error) {
      Alert.alert(t('game.cloneFailed'), error?.response?.data?.message || t('common.error'));
    }
  };
  const VENMO_APP_STORE_URL = 'https://apps.apple.com/app/venmo/id351727428';
    const VENMO_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.venmo';
    const handleGetVenmo = async () => {
      const phone = game.organizerPhoneNumber?.replace(/\D/g, '');
  
      if (!phone) {
        Alert.alert('No Venmo contact', "The organizer hasn't added a phone number yet.");
        return;
      }
  
      // Venmo's "note" is the payment memo, so use it instead of an unused message variable
      const note = encodeURIComponent(`${game.title} - pickup game`);
      const amount = game.price ? `&amount=${game.price}` : '';
  
      const appUrl = `venmo://paycharge?txn=pay&recipients=${phone}${amount}&note=${note}`;
      const storeUrl = Platform.OS === 'ios' ? VENMO_APP_STORE_URL : VENMO_PLAY_STORE_URL;
  
      try {
        const installed = await Linking.canOpenURL(appUrl);
  
        if (installed) {
          await Linking.openURL(appUrl);
          return;
        }
  
        Alert.alert(
          'Venmo not installed',
          'Install Venmo to pay the organizer, or send the payment manually.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Get Venmo', onPress: () => Linking.openURL(storeUrl) },
          ]
        );
      } catch (e) {
        console.warn('Could not open Venmo', e);
        Alert.alert("Couldn't open Venmo", 'Something went wrong. Please try again.');
      }
    };

  const handleInviteGame = async (e: any) => {
    e.stopPropagation();
    try {
      await authenticatedApi.post(`games/inviteToGame`, { gameId: game.id });
    } catch (error) {
      console.error('Failed to invite to game:', error);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.area}>
        <ScrollView
          style={[styles.container, { backgroundColor: COLORS.white }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Header title={t('game.details.title')} target="welcome">
            <TouchableOpacity
              onPress={() => setShareModalVisible(true)}
              style={styles.iconBtn}
              activeOpacity={0.75}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon type="materialCommunityIcons" name="share-variant" />
            </TouchableOpacity>
            {((join.userData?.id == game?.creatorId || role === 'ADMIN') && join.isLogged) && (
              <>
                <TouchableOpacity
                  onPress={() => setCalendarModalVisible(true)}
                  style={styles.iconBtn}
                  activeOpacity={0.75}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Icon type="feather" name="copy" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigate('editGame', { game })}
                  style={styles.iconBtn}
                  activeOpacity={0.75}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Icon type="feather" name="edit" />
                </TouchableOpacity>
              </>
            )}
          </Header>

          <ImageSlider images={[`${JAVA_API}games/${game.id}/image`]} />
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={FONTS.h3}>{game?.title ?? ''}</Text>
              <PriceTag game={game} />
            </View>

            <Text style={styles.description}>{game.description}</Text>

            <View style={styles.infoContainer}>
              <InfoRow
                icon="account"
                label={t('game.Organizer')}
                value={game.creatorName}
                isHost
                phoneNumber={game?.organizerPhoneNumber}
              />
              <InfoRow
                icon="map-marker"
                label="Location"
                value={game.address}
                isAddress
                isLoggedIn={isLogged}
                onLoginPress={() => navigate('login')}
              />
              <InfoRow
                icon="lock"
                label={t('game.isprivate')}
                value={game.isPrivate ? t('game.private') : t('game.public')}
              />
              <InfoRow
                icon="clock"
                label={t('game.time')}
                value={`${formatDateLong(new Date(game.startTime))}, (${formatTime(game.startTime)} - ${formatTime(game.endTime)})`}
              />
              <InfoRow
                icon={getGameIcon(game?.sportType?.id)}
                label={t('game.sportType')}
                value={sportType}
              />
            </View>

            {/* Players Section */}
          <View style={styles.section}>
            <Icon type="materialCommunityIcons" name="account-multiple" size={36} color={COLORS.secondary} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>
                {t('game.players')} {game?.nbrSpots - game?.availableSpots} /{game.nbrSpots}
              </Text>
            </View>
          </View>

          <TeamJoinSection
            teams={game?.teams ?? []}
            canJoin={!!join.canJoin}
            isJoined={!!join.isJoined}
            isJoining={join.isJoining}
            onJoinTeam={color => join.openJoin(color)}
          />
            <View style={styles.playersContainer}>
              <View style={styles.playersGrid}>
                {game?.participants?.map((player, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.playerCard, { opacity: player.status == 'PENDING_APPROVAL' ? 0.5 : 1 }]}
                    onPress={() => navigate('profile', { userId: player.userId })}
                  >
                    <Image
                      source={
                        imageErrors[player.userId]
                          ? images.avatar
                          : { uri: `${JAVA_API}profile/${player?.userId}/image` }
                      }
                      onError={() => handleImageError(player.userId)}
                      style={styles.playerImage}
                    />
                    <Text style={styles.playerName} numberOfLines={2}>
                      {toTitleCase(player.userName)}
                    </Text>
                    {(player.number_guest ?? 0) > 0 && (
                      <Text style={styles.playerName} numberOfLines={2}>
                        + {player.number_guest} guests
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {join.isPendingPayment ? (
          <View style={[styles.joinButton, { flexDirection: 'row', gap: 12 }]}>
            <Button
              title={join.isJoining ? t('common.processing') : t('games.payWithVenmo')}
              filled
              disabled={join.isJoining}
              onPress={handleGetVenmo}
              style={{ flex: 1, height: SIZES.InputHeight - 4, borderRadius: 32, backgroundColor: "#008CFF", borderColor: "#008CFF" }}
            />
            <Button
              title={t('games.unjoinButton')}
              filled
              disabled={join.isJoining}
              onPress={join.openUnjoin}
              style={{
                backgroundColor: COLORS.error,
                borderColor: COLORS.error,
                flex: 1,
                height: SIZES.InputHeight - 4,
                borderRadius: 32
              }}
            />
          </View>
        ) : join.isJoined ? (
          <View style={styles.joinButton}>
            <Button
              title={t('games.unjoinButton')}
              filled
              onPress={join.openUnjoin}
              style={{
                height: SIZES.InputHeight - 4,
                borderRadius: 32,
                borderColor: COLORS.error,
                backgroundColor: COLORS.error,
              }}
            />
          </View>
        ) : join.canJoin ? (
          <View style={styles.joinButton}>
            <Button
              title={t('games.joinGameTitle')}
              filled
              onPress={join.openJoin}
              style={{ height: SIZES.InputHeight - 4, borderRadius: 32 }}
            />
          </View>
        ) : null}

        {/** Share Game Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={shareModalVisible}
          onRequestClose={() => setShareModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('game.shareModal.title')}</Text>
                <Pressable
                  onPress={() => setShareModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <View style={styles.shareContent}>
                <Text style={styles.shareDescription}>{game.title}</Text>

                <TouchableOpacity
                  style={styles.shareOption}
                  onPress={() => {
                    handleShareGame();
                    setShareModalVisible(false);
                  }}
                >
                  <Icon type="materialCommunityIcons" name="share-variant" size={24} color={COLORS.primary} />
                  <Text style={styles.shareOptionText}>{t('game.shareModal.shareWithFriends')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareOption}
                  onPress={() => {
                    handleCopyDeepLink();
                    setShareModalVisible(false);
                  }}
                >
                  <Icon type="materialCommunityIcons" name="link-variant" size={24} color={COLORS.primary} />
                  <Text style={styles.shareOptionText}>{t('game.shareModal.copyDeepLink')}</Text>
                </TouchableOpacity>

                <View style={styles.deepLinkContainer}>
                  <Text style={styles.deepLinkLabel}>{t('game.shareModal.deepLinkLabel')}</Text>
                  <Text style={styles.deepLinkText} selectable>
                    {generateDeepLink()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>

      {/* Clone Game Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calendarModalVisible}
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('game.selectDatesToClone')}</Text>
            <Calendar
              markingType={'multi-dot'}
              markedDates={selectedDates}
              onDayPress={day => {
                setSelectedDates(prev => {
                  const newDates = { ...prev };
                  if (newDates[day.dateString]) {
                    delete newDates[day.dateString];
                  } else {
                    newDates[day.dateString] = { selected: true, selectedColor: COLORS.primary };
                  }
                  return newDates;
                });
              }}
            />
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <Button
                title={t('common.cancel')}
                style={{ flex: 1, marginRight: 8 }}
                onPress={() => setCalendarModalVisible(false)}
              />
              <Button
                title={t('game.clone')}
                filled
                style={{ flex: 1 }}
                onPress={handleCloneGame}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Join / unjoin / success modals, shared with GameCard */}
      <GameJoinModals game={game} join={join} />
    </>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
    minHeight: SIZES.height,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBtn: {
    marginHorizontal: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 6,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  // Share / clone modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...FONTS.h2,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  expandAllButton: {
    padding: 5,
    tintColor: COLORS.primary,
  },
  playersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playerCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  playerImage: {
    width: 96,
    height: 96,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  shareContent: {
    width: '100%',
    alignItems: 'center',
  },
  shareDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shareOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
  deepLinkContainer: {
    width: '100%',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deepLinkLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
  },
  deepLinkText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'Courier',
    lineHeight: 18,
  },
  joinButton: {
    marginHorizontal: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});