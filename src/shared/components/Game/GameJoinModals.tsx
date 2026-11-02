import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, ConfirmModal, Icon, NotSignedInView, SuccessModal } from '@components';
import NumericInput from '@components/NumericInput';
import { COLORS } from '@constants';
import type { Game } from './types';
import type { GameJoinState } from './useGame';

interface Props {
  game: Partial<Game>;
  join: GameJoinState;
}

/** Join modal + unjoin confirmation + success modal, shared by GameCard and the details screen. */
export default function GameJoinModals({ game, join }: Props) {
  const { t } = useTranslation();
  const { breakdown, players, isJoining } = join;

  return (
    <>
      {/* Join Game Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={join.joinModalVisible}
        onRequestClose={join.closeJoinModal}
      >
        <View style={styles.modalOverlay}>
          {join.isLogged ? (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('games.joinGameTitle')}</Text>
                <Pressable onPress={join.closeJoinModal} style={styles.closeButton}>
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
                    value={join.numPlayers}
                    onChange={join.setNumPlayers}
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
                    value={join.promoCode}
                    onChangeText={join.setPromoCode}
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
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={[styles.priceLabel, { fontWeight: '700' }]}>
                    Total ({players} {players === 1 ? 'player' : 'players'}):
                  </Text>
                  <Text style={styles.discountedPriceText}>${breakdown.total.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Button
                  title={isJoining ? 'Processing...' : 'Join'}
                  filled
                  disabled={isJoining}
                  style={{ backgroundColor: COLORS.primary, borderRadius: 32 }}
                  onPress={() => join.confirmJoin(breakdown.total > 0 ? 'stripe' : undefined)}
                />
              </View>
            </View>
          ) : (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} />
                <Pressable onPress={join.closeJoinModal} style={styles.closeButton}>
                  <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <NotSignedInView
                heading="Sign in to join game"
                description="Access your upcoming and past sessions when signed in."
                containerStyle={{ flex: 1 }}
                onNavigate={join.closeJoinModal}
              />
            </View>
          )}
        </View>
      </Modal>

      <ConfirmModal
        visible={join.unjoinModalVisible}
        onConfirm={join.confirmUnjoin}
        onCancel={join.closeUnjoin}
        title="Unjoin Game"
        message="Are you sure you want to unjoin this game?"
      />

      <SuccessModal
        visible={join.successVisible}
        onClose={join.closeSuccess}
        message="Successfully joined the game!"
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  playerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  // kept for the promo code block above
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  discountedPriceText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    marginTop: 12,
    gap: 10,
  },
});