import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Image, Share, Alert, Clipboard, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageSlider from './ImageSlider';
import InfoRow from './InfoRow';
import { Header, Icon } from '@components';
import { COLORS, FONTS, icons, images, SIZES } from '@constants';
import { useTranslation } from 'react-i18next';
import { JAVA_API } from '@env';
import { publicApi } from '@services/api';
import { useNavigation } from '@react-navigation/native';
import { formatDateLong, formatTime } from '@utils/dateUtils';
import { useUserData } from '@services/useUserData';
import { isStoredTokenExpired } from '@utils/api/auth';
import { toTitleCase } from '@utils/helpers';
import { Linking, Platform } from 'react-native';

interface Game {
  id: number;
  title: string;
  description: string;
  sportType: { id: number; name: string }[];
  city: string;
  address: string;
  startTime: string;
  endTime: string;
  nbrSpots: number;
  availableSpot: number;
  imageUrl: string;
  creatorId: number;
  creatorName: string;
  price: number;
  isPrivate: boolean;
  status: string;
  participants: {
    id: number,
    userId: number,
    userName: string,
    userEmail: string,
    userPhone: string,
    status: string,
    joinedAt: string
  }[];
  createdAt: string;
  updatedAt: string;
  canceledAt: string;
}
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
export default function GameDetailsScreen({ route }: { route: any }) {
    const { t } = useTranslation();
  const { gameId } = route.params || {};
  const { navigate } = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [sportType, setSportType] = useState();
  const [participants, setParticipants] = useState([]);
  const [game, setGame] = useState([]);
  const [isLogged, setIsLogged] = useState(false);
  const { userData, error, refreshUserData } = useUserData(); 
  // Generate multiple images for the slider using our AI API
  const [expandedDay, setExpandedDay] = useState<string | null>('all');

  // Generate multiple images for the slider using our AI API
  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };



  useEffect(() => {
    const checkToken = async () => {
      const expired = await isStoredTokenExpired();
      setIsLogged(!expired); // ← also note the `!` — logged = NOT expired
    };

    checkToken();
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const response = await publicApi.get(`games/${gameId}`);
      setGame(response.result.data);
      setSportType(response.result.data.sportType.name);
      setParticipants(response.result.data.participants);
    } catch (error) {
      console.error('Error fetching game:', error);
    } 
  };

  // Generate deep link for sharing
  const generateDeepLink = () => {
    return`pickuplay://game/${game.id}`;

  };

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
  const link = generateDeepLink();
  Clipboard.setString(link);
  Alert.alert(t('common.copied'), t('game.shareModal.linkCopied'));
};
const handleGetDirections = () => {
  const address = encodeURIComponent(game.address);
  const url = Platform.OS === 'ios'
    ? `maps://app?daddr=${address}`
    : `google.navigation:q=${address}`;

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      // Fallback to Google Maps in browser
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${address}`);
    }
  });
};
  return (
    <SafeAreaView style={styles.area}>
      <ScrollView style={[styles.container, { backgroundColor: COLORS.white }]}>
       <View style={styles.wrapper}>
        {/* Back + Title */}
        <TouchableOpacity
          onPress={() => navigate("welcome")}
          style={styles.backGroup}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
              source={icons.back as ImageSourcePropType}
              resizeMode="contain"
              style={styles.backIcon}
            />

          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: COLORS.grayscale900 }]}>{t('game.details.title')}</Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => setShareModalVisible(true)}
            style={styles.iconBtn}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon type="materialCommunityIcons" name="share-variant" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        {(userData?.id == game?.creatorId && isLogged) && (
          <TouchableOpacity
            onPress={() => navigate("editGame", { game })}
            style={styles.iconBtn}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon type="feather" name="edit" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
          
        </View>
      </View>
        <ImageSlider images={[`${JAVA_API}games/${game.id}/image`]} />
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={FONTS.title}>
              {toTitleCase(game?.title ?? '')}
            </Text>
            <Text style={[FONTS.originalPrice]}>${game.price ? game.price.toFixed(2) : 'Free'}</Text>
            <Text style={{ fontSize: 12, color: COLORS.secondary}}>/ player</Text>
          
            {game.discount && (
              <Text style={FONTS.originalPrice}>${(game.price - game.discount).toFixed(2)}</Text>
            )}
          </View>

          <Text style={styles.description}>{game.description}</Text>

          <View style={styles.infoContainer}>
            <InfoRow 
              icon="account" 
              label={t('game.Orginazer')} 
              value={game.creatorName} 
            />
            <InfoRow
              icon="map-marker"
              label={t('game.location')}
              value={game.address}
              isAddress
            />
            <InfoRow 
              icon="lock" 
              label={t('game.isprivate')} 
              value={game.isprivate ? t('game.private') : t('game.public')} 
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
              <Icon type="materialCommunityIcons" name="account-multiple" size={24} color={COLORS.secondary}/>
              <View style={styles.textContainer}>
                <Text style={styles.label}>{t('game.players')} {participants.length}/{game.nbrSpots}</Text>
                <TouchableOpacity 
                  onPress={() => setExpandedDay(expandedDay ? null : 'all')}
                  style={styles.expandAllButton}
                >
                </TouchableOpacity>
              </View>
            </View>
              <View style={styles.playersContainer}>
                <View style={styles.playersGrid}>
                  {game?.participants?.map((player, index) => (
                    <View key={index} style={styles.playerCard}>
                      <Image
                        source={{ uri: `${JAVA_API}profile/${player?.userId}/image` }}
                        style={styles.playerImage}
                      />
                      <Text style={styles.playerName} numberOfLines={2}>
                        {toTitleCase(player.userName)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

        </View>
      </ScrollView>


      {/* Share Game Modal */}
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
              <Text style={styles.shareDescription}>
                {game.title}
              </Text>
              
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
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
    minHeight: SIZES.height
  },
  container: {
      flex: 1,
      backgroundColor: COLORS.white,
  },
  content: {
    paddingHorizontal: 16,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.transparentPrimary,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  // ── Left side ──────────────────────────────────────────────────────────────
  backGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  logo: {
    height: 32,
    width: 32
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "bold",
    color: COLORS.grayscale900,
    marginLeft: 12
  },
  backIcon: {
    width: 28,
    height: 28,
    marginRight: 16,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)', // optional, helps define edge

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,

    // Android shadow
    elevation: 5,

    // CRITICAL: background color required for shadow to show
    backgroundColor: '#fff', // or whatever your icon background should be
  },
  titleBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: COLORS.grayscale500,
    fontWeight: "700",
    marginBottom: 1,
  },

  // ── Right side ─────────────────────────────────────────────────────────────
  actions: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal Styles
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  qrInstructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  openDaysSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  openDaysText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  expandAllButton: {
    padding: 5,
    tintColor: COLORS.primary
  },
  daysContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  daySchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dayName: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
    minWidth: 80,
  },
  hoursText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
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
  // Share Modal Styles
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
});