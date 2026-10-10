import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, Pressable, TextInput, Alert } from 'react-native';
import { Button, ConfirmModal, Icon, NotSignedInView } from '@components';
import { JAVA_API } from '@env';
import { COLORS, FONTS, icons,SIZES } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { authenticatedApi } from '@services/api';
import { useTranslation } from 'react-i18next';
import { isStoredTokenExpired } from '@utils/api/auth';
import PriceTag from '@components/PriceTag';
import { useUserData } from '@services/useUserData';
import NumericInput from '@components/NumericInput';
import PaymentService, {
  buildPriceBreakdownSafe,
  PromoCodeError,
  type Competition,
  type PaymentMethod,
  type PromoCode,
} from '@services/payment';

  const getGameIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      1: 'soccer',
      2: 'basketball',
      3: 'volleyball',
      5: 'tennis',
      4: 'hockey-sticks',
      6: 'cricket',
      7: 'table-tennis',
      8: 'football',
      9: 'baseball',
    };
    return iconMap[type] || 'sports';
  };


  export function extractCity(location: string): string {
    // Extracts city from full address (e.g., "New York" from "1100 Avenue of the Americas, New York")
    const parts = location.split(',').map(p => p.trim());
    return parts[parts.length - 1] || location;
  }

  export default function GameCard({ game , onRefresh }: GameCardProps) {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [unjoinModalVisible, setUnjoinModalVisible] = useState(false);
    const [numPlayers, setNumPlayers] = useState(1);
    const [promoCode, setPromoCode] = useState('');
    const [isLogged, setIsLogged] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const { navigate } = useNavigation<Nav>();
    const { userData, error, refreshUserData } = useUserData(); 
    const players = Number(numPlayers) || 1;

    const competition = useMemo<Competition>(
      () => ({ id: String(game.id), name: game.title, entryFee: game.price || 0 }),
      [game.id, game.title, game.price]
    );

    // Derived from state, so it stays correct when the player count or promo changes.
    const breakdown = useMemo(
      () => buildPriceBreakdownSafe(competition.entryFee * players, appliedPromo),
      [competition.entryFee, players, appliedPromo]
    );

    const handleApplyPromo = async () => {
      try {
        setAppliedPromo(await PaymentService.validatePromoCode(promoCode, competition, players));
      } catch (error) {
        setAppliedPromo(null);
        Alert.alert(error instanceof PromoCodeError ? error.message : t('games.invalidPromoCode'));
      }
    };

    const handleGamePress = (gameId: gameId) => {
      navigation.navigate('game', { game_id: game.id});
    };

    const handleJoinGame = (e: any) => {
      e.stopPropagation();
      setJoinModalVisible(true);
    };

    const handleUnjoinGame = (e: any) => {
      e.stopPropagation();
      setUnjoinModalVisible(true);
    };
    const handleConfirmUnjoin = async () => {
      setIsJoining(true);
      try {
        const response = await authenticatedApi.post(`games/${game.id}/unjoin`);
        if (response.status === 200) {
          setIsLogged(true); // ✅ token worked → still logged in
          onRefresh?.();
        }
      } catch (error) {
        console.error('Error unjoining game:', error);
        setIsLogged(false); // ✅ 401 that couldn't refresh → logged out
      } finally {
        setIsJoining(false);
      }
    };

    const joinGame = async (paymentIntentId?: string) => {
      const response = await authenticatedApi.post(`games/${game.id}/join`, null, {
        params: { guestNumber: players - 1, paymentIntentId },
      });
      if (response.status === 200) {
        resetJoinForm();
        onRefresh?.();
        Alert.alert(t('games.successJoined'));
      }
    };

    const handleConfirmJoin = async (method?: PaymentMethod) => {
      if (isJoining) return;
      setIsJoining(true);
        let paymentIntentId: string | undefined;

        if (breakdown.total > 0) {
          if (!method) return;
          const result = await PaymentService.pay(method, breakdown.total, competition);
          
          if (!result.success) return; // canceled or failed (PaymentService already alerted)

          // TODO: Venmo/PayPal happen outside the app and can't be confirmed client-side.
          // Join once the backend confirms the payment (webhook / manual approval).
          if (method !== 'stripe') return;
          paymentIntentId = result.paymentIntentId;
        }

        //await joinGame(paymentIntentId);
      
    };
// Determine if join button should be hidden
  const isFull = game?.availableSpots == 0;
  const isCanceled = game?.status === 'CANCELED';
  const alreadyJoined = game?.participants?.some(
    (p) => String(p.userId) === String(userData?.id)
  );
  const shouldHideJoinButton = alreadyJoined || isFull || isCanceled;
    const resetJoinForm = () => {
      setJoinModalVisible(false);
      setNumPlayers(1);
      setPromoCode('');
      setAppliedPromo(null);
    };
 
    const handleRedirectModal = (authType: 'login' | 'register') => {
      resetJoinForm();
      navigate(authType);
    };

    const handleCloseModal = resetJoinForm;
    useEffect(() => {
      const checkToken = async () => {
        const expired = await isStoredTokenExpired();
        setIsLogged(!expired); // ← also note the `!` — logged = NOT expired
      };
  
      checkToken();
    }, []);
    return (
      <>
        <TouchableOpacity 
          style={[styles.card, (game.currentParticipants < 0 ? styles.usedCard : {})]} 
          onPress={() => handleGamePress(game.id)}
        >

          <View style={{ backgroundColor: COLORS.transparentPrimary }}>
            <Image 
              source={{ uri: `${JAVA_API}games/${game.id}/image` }}
              style={styles.image}
              />
            {game.nbrSpots !== 100 && (
              <View style={[styles.participantsBadgeBase, game.nbrSpots >= game.participants.length ? styles.participantsBadge : styles.participantsBadgeFull]}>
              
                <Text style={styles.usedText}>{game.nbrSpots-game.availableSpots} / {game.nbrSpots}</Text>
              </View>
            )}

          </View>
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={FONTS.h3} numberOfLines={1} ellipsizeMode="tail">
                {game.title.charAt(0).toUpperCase() + game.title.slice(1)}
              </Text>
              <Icon 
                type="materialCommunityIcons" 
                name={getGameIcon(game.sportType.id)} 
                size={24} 
                color={COLORS.secondary}
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.address} numberOfLines={1}>
                {game.address}
              </Text>
              <Text style={styles.time}>
                {(
                  new Date(game.startTime).toLocaleTimeString('en-US',
                  { hour: 'numeric', minute: '2-digit', hour12: true  }) || '10pm - 12pm')
                  + ' - ' + new Date(game.endTime).toLocaleTimeString('en-US',
                  { hour: 'numeric', minute: '2-digit', hour12: true  })
                  + ', ' + (game.startTime ? new Date(game.startTime).toLocaleDateString('en-US', { weekday: 'short' }) : 'Saturday')}
              </Text>
            </View>
            <View style={styles.footer}>
              <PriceTag game={game} />

              {shouldHideJoinButton ? (
                <Text style={styles.cannotJoinText}>
                  {alreadyJoined
                    ? (
                      
                      <TouchableOpacity
                        style={styles.unjoinButton}
                        onPress={handleUnjoinGame}
                      >
                        <Text style={styles.joinButtonText}>{t('games.unjoinButton')}</Text>
                      </TouchableOpacity>
                    )
                    : isCanceled
                    ? t('game.gameCanceled')    
                    : t('game.gameFull')}       
                </Text>
                
              ) : (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={handleJoinGame}
                >
                  <Text style={styles.joinButtonText}>{t('games.joinButton')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>

         {/* Join Game Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={joinModalVisible}
            onRequestClose={handleCloseModal}
          >
            <View style={styles.modalOverlay}>
              {isLogged==true ? (
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('games.joinGameTitle')}</Text>
                    <Pressable onPress={handleCloseModal} style={styles.closeButton}>
                      <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
                    </Pressable>
                  </View>
  
                  <View style={styles.gameInfoSection}>
                    <Text style={styles.gameNameModal}>{game.title} </Text>
                    <Text style={styles.gameType}>{game.sportType?.name?.toUpperCase() ?? ''}</Text>
                  </View>
  
                  <View style={styles.divider} />
  
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{t('schedule.numberOfPlayers')}</Text>
                    <View style={styles.playerCountContainer}>
                      <NumericInput
                        value={numPlayers}
                        onChange={setNumPlayers}
                        min={1}
                        max={game.availableSpots}
                      />
                    </View>
                  </View>
  
                  {/* Promo code UI: uncomment once the backend endpoint exists
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{t('games.promoCode')}</Text>
                    <View style={styles.inputWrapper}>
                      <Icon type="materialCommunityIcons" name="ticket-percent" size={20} color={COLORS.primary} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter promo code"
                        placeholderTextColor="#999"
                        value={promoCode}
                        onChangeText={setPromoCode}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity onPress={handleApplyPromo}>
                        <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </View> */}
  
                  <View style={styles.priceInfo}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Price per player:</Text>
                      <Text style={styles.discountedPriceText}>${(game.price || 0).toFixed(2)}</Text>
                    </View>
                    {breakdown.discountAmount > 0 && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Discount ({breakdown.promoCode}):</Text>
                        <Text style={styles.discountedPriceText}>-${breakdown.discountAmount.toFixed(2)}</Text>
                      </View>
                    )}
                    <View style={[styles.priceRow, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 }]}>
                      <Text style={[styles.priceLabel, { fontWeight: '700' }]}>
                        Total ({players} {players === 1 ? 'player' : 'players'}):
                      </Text>
                      <Text style={styles.discountedPriceText}>${breakdown.total.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View style={{ width: '100%', marginTop: 12, gap: 10 }}>
                    {breakdown.total > 0 ? (
                      <>
                        <Button
                          title={isJoining ? 'Processing...' : 'Pay with card'}
                          icon="card"
                          filled
                          disabled={isJoining}
                          style={{ backgroundColor: COLORS.primary, borderRadius: 32 }}
                          onPress={() => handleConfirmJoin('stripe')}
                        />
                        <Button
                          title="Pay with Venmo"
                          icon="logo-venmo"
                          filled
                          disabled={isJoining}
                          style={{ backgroundColor: '#3D95CE', borderRadius: 32 }}
                          onPress={() => handleConfirmJoin('venmo')}
                        />
                        <Button
                          title="Pay with PayPal"
                          icon="logo-paypal"
                          filled
                          disabled={isJoining}
                          style={{ backgroundColor: '#003087', borderRadius: 32 }}
                          onPress={() => handleConfirmJoin('paypal')}
                        />
                      </>
                    ) : (
                      <Button
                        title={isJoining ? 'Processing...' : 'Join for free'}
                        filled
                        disabled={isJoining}
                        style={{ backgroundColor: COLORS.primary, borderRadius: 32 }}
                        onPress={() => handleConfirmJoin()}
                      />
                    )}
                  </View>
                </View>
              ) : (
                
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}></Text>
                    <Pressable onPress={handleCloseModal} style={styles.closeButton}>
                      <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
                    </Pressable>
                  </View>
                
                  <NotSignedInView
                    heading="Sign in to join game"
                    description="Access your upcoming and past sessions when signed in."
                    containerStyle={{ flex: 1 }}
                    onNavigate={() => setJoinModalVisible(false)}  // or however you close your modal
                  />
                </View>
              )}
            </View>
          </Modal>

        <ConfirmModal
          visible={unjoinModalVisible}
          onConfirm={handleConfirmUnjoin}
          onCancel={() => setUnjoinModalVisible(false)}
          title="Unjoin Game"
          message="Are you sure you want to unjoin this game?"
        />
      </>
    );
  }
  

  const styles = StyleSheet.create({
    card: {
      backgroundColor: 'white',
      borderRadius: 12,
      margin: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      elevation: 1,
      overflow: 'hidden',
      borderWidth: 0.1,
      marginBottom: 5,
    },
    usedCard: {
      opacity: 0.5,
    },
    image: {
      width: '100%',
      height: 200
      
    },
    content: {
      paddingHorizontal: SIZES.padding2,
      paddingTop: SIZES.padding2
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoContainer: {
      marginBottom: 10,
      gap: 4,
    },
    address: {
      fontSize: 14,
      color: COLORS.secondary,
    },
    time: {
      fontSize: 14,
      color: COLORS.secondary,
      flex: 1,
    },
    description: {
      fontSize: FONTS.h3.fontSize,
      marginBottom: 10,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    location: {
      marginLeft: 4,
      fontSize: 12,
      color: '#666',
      flex: 1,
    },
    participantsBadgeBase: {
      position: 'absolute',
      right: 12,
      bottom: 12,
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 4,
      zIndex: 1,
    },
    participantsBadgeFull: {
      backgroundColor: COLORS.red,
    },
    participantsBadge: {
      backgroundColor: COLORS.transparentGray,
    },
    usedText: {
      color: 'white',
      fontSize: 12,
    },
    joinButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 10,
      paddingHorizontal: 37,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    joinButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    unjoinButton: {
      backgroundColor: COLORS.error,
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    closeButton: {
      padding: 4,
    },
    gameInfoSection: {
      marginBottom: 16,
      width: '85%',
    },
    gameNameModal: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.primary,
      marginBottom: 4,
    },
    gameType: {
      fontSize: 12,
      color: '#999',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    divider: {
      height: 1,
      backgroundColor: '#eee',
      marginBottom: 16,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: '#f9f9f9',
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      fontSize: 14,
      color: '#333',
    },
    priceInfo: {
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    priceLabel: {
      fontSize: 14,
      color: '#666',
      fontWeight: '500',
    },
    originalPriceText: {
      fontSize: 14,
      color: COLORS.error,
      fontWeight: '600',
      textDecorationLine: 'line-through',
    },
    discountedPriceText: {
      fontSize: 14,
      color: COLORS.primary,
      fontWeight: '700',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      width: (SIZES.width - 32) / 2 - 8,
      backgroundColor: COLORS.transparentPrimary,
      borderRadius: 32
    },
    confirmButton: {
      width: (SIZES.width) / 3,
      backgroundColor: COLORS.primary,
      borderRadius: 32
    },
    confirmButtonText: {
      fontSize: 14,
      fontWeight: '900',
      color: 'white',
    },
    playerCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    counterButton: {
      width: 32,
      height: 32,
      borderRadius: 25,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      elevation: 3,
    },
    playerCountDisplay: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 6,
      backgroundColor: COLORS.grayscale100,
      borderRadius: 8,
    },
    playerCountText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.grayTie,
    },
    cannotJoinText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.red,
      textAlign: 'right',
      flexShrink: 1,
      maxWidth: '55%',
    },
  });