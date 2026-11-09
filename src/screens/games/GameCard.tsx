import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { Icon } from '@components';
import PriceTag from '@components/PriceTag';
import { JAVA_API } from '@env';
import { COLORS, FONTS, SIZES } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getGameIcon } from '@components/Game/gameUtils';
import { useGameJoin } from '@components/Game/useGame';
import GameJoinModals from '@components/Game/GameJoinModals';
import type { Game } from '@components/Game/types';

interface GameCardProps {
  game: Game;
  onRefresh?: () => void;
} 

export default function GameCard({ game, onRefresh }: GameCardProps) {
  const { navigate } = useNavigation<Nav>();
  const { t } = useTranslation();
  const join = useGameJoin(game, onRefresh);

  const handleGamePress = () => navigate('game', { game_id: game.id });

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
  return (
    <>
      <TouchableOpacity
        style={[styles.card, game.currentParticipants < 0 ? styles.usedCard : {}]}
        onPress={handleGamePress}
      >
        <View style={{ backgroundColor: COLORS.transparentPrimary }}>
          <Image
            source={{ uri: `${JAVA_API}games/${game.id}/image` }}
            style={styles.image}
          />
          {game.nbrSpots !== 100 && (
            <View
              style={[
                styles.participantsBadgeBase,
                game.availableSpots >= 0
                  ? styles.participantsBadge
                  : styles.participantsBadgeFull,
              ]}
            >
              <Text style={styles.usedText}>
                {game.nbrSpots - game.availableSpots} / {game.nbrSpots}
              </Text>
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
              {t('game.organizedBy')} {game.creatorName}
            </Text>
            <Text style={styles.time}>
              {(
                new Date(game.startTime).toLocaleTimeString('en-US',
                { hour: 'numeric', minute: '2-digit', hour12: true }) || '10pm - 12pm')
                + ' - ' + new Date(game.endTime).toLocaleTimeString('en-US',
                { hour: 'numeric', minute: '2-digit', hour12: true })
                + ', ' + (game.startTime ? new Date(game.startTime).toLocaleDateString('en-US', { weekday: 'short' }) : 'Saturday')}
            </Text>
          </View>

          <View style={styles.footer}>
            <PriceTag game={game} />
                  
            {join.isPendingPayment ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.joinButton, { paddingHorizontal: 24, backgroundColor: "#008CFF", borderColor: "#008CFF" }]}
                  onPress={handleGetVenmo}
                  disabled={join.isJoining}
                >
                  <Text style={styles.joinButtonText}>
                    {join.isJoining ? t('common.processing') : t('games.payWithVenmo')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.unjoinButton, { paddingHorizontal: 16 }]}
                  onPress={join.openUnjoin}
                >
                  <Text style={styles.joinButtonText}>{t('games.unjoinButton')}</Text>
                </TouchableOpacity>
              </View>
            ) : join.isParticipant ? (
              <TouchableOpacity style={styles.unjoinButton} onPress={join.openUnjoin}>
                <Text style={styles.joinButtonText}>{t('games.unjoinButton')}</Text>
              </TouchableOpacity>
            ) : join.isCanceled || join.isFull ? (
              <Text style={styles.cannotJoinText}>
                {join.isCanceled ? t('game.gameCanceled') : t('game.gameFull')}
              </Text>
            ) : (
              <TouchableOpacity style={styles.joinButton} onPress={join.openJoin}>
                <Text style={styles.joinButtonText}>{t('games.joinButton')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <GameJoinModals game={game} join={join} />
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
    height: 200,
  },
  content: {
    paddingHorizontal: SIZES.padding2,
    paddingTop: SIZES.padding2,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  cannotJoinText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.red,
    textAlign: 'right',
    flexShrink: 1,
    maxWidth: '55%',
  },
});