import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, Checkbox, ConfirmModal, Icon, NotSignedInView, SuccessModal } from '@components';
import NumericInput from '@components/NumericInput';
import { COLORS, SIZES } from '@constants';
import type { Game } from './types';
import type { GameJoinState } from './useGame';
import { getTeamColor } from '@utils/teamColors';

// ─── Team helpers ───────────────────────────────────────────────────────────

interface Participant {
  status: string;
  number_guest?: number;
}

interface TeamOption {
  id: number;
  name: string;
  color?: string;
  capacity?: number;          // use this if the backend ever sends it
  participants?: Participant[];
}

// Each joined participant takes 1 spot, plus their guests
const getTeamOccupied = (team: TeamOption) =>
  (team.participants ?? [])
    .filter(p => p.status === 'JOINED')
    .reduce((sum, p) => sum + 1 + (p.number_guest ?? 0), 0);
const resolveTeamColor = (team: TeamOption) =>
  team.color || getTeamColor(team.name);
const ColorDot = ({ color, size = 18 }: { color: string; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      borderWidth: 1,
      borderColor: '#cfcfcf', // keeps white visible
    }}
  />
);

// ─── Small layout pieces ────────────────────────────────────────────────────

/** A labelled setting row: text on the left, control on the right. */
const SettingRow = ({
  label,
  hint,
  children,
  onPress,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  onPress?: () => void;
}) => {
  const content = (
    <>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>
      {children}
    </>
  );

  // When onPress is given the whole row is tappable (bigger touch target).
  return onPress ? (
    <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={onPress}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={styles.row}>{content}</View>
  );
};

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  game: Partial<Game>;
  join: GameJoinState;
}

/** Join modal + unjoin confirmation + success modal, shared by GameCard and the details screen. */
export default function GameJoinModals({ game, join }: Props) {
  const { t } = useTranslation();
  const { breakdown, players, isJoining } = join;

  const gameTeams: TeamOption[] = game.teams ?? [];
  const needsTeam = gameTeams.length > 0;

  const capacityKnown = game.availableSpots != null;
  const totalOccupied = gameTeams.reduce((sum, team) => sum + getTeamOccupied(team), 0);
  const perTeamCapacity = Math.floor(
    (totalOccupied + (game.availableSpots ?? 0)) / Math.max(gameTeams.length, 1),
  );

  const teamsWithState = gameTeams.map(team => {
    const capacity = team.capacity ?? perTeamCapacity;
    const spotsLeft = Math.max(capacity - getTeamOccupied(team), 0);
    return {
      ...team,
      spotsLeft,
      // only disable when we actually know the capacity
      disabled: capacityKnown && spotsLeft < join.numPlayers,
    };
  });

  const selectedTeam = teamsWithState.find(team => team.id === join.selectedTeamId);
  const allTeamsFull = teamsWithState.length > 0 && teamsWithState.every(team => team.disabled);
  const canJoin = !isJoining && (!needsTeam || (selectedTeam != null && !selectedTeam.disabled));

  const pricePerPlayer = game.price || 0;
  const spotsLeft = game.availableSpots;
  const isFree = breakdown.total <= 0;

  const ctaLabel = isJoining
    ? 'Processing...'
    : isFree
      ? 'Join game'
      : `Join · $${breakdown.total.toFixed(2)}`;

  useEffect(() => {
    if (selectedTeam?.disabled) join.setSelectedTeamId(null);
  }, [selectedTeam?.disabled]);
  return (
    <>
      {/* Join Game Modal (bottom sheet) */}
      <Modal
        animationType="slide"
        transparent
        visible={join.joinModalVisible}
        onRequestClose={join.closeJoinModal}
      >
        <View style={styles.modalOverlay}>
          {/* Tap outside the sheet to dismiss */}
          <Pressable style={StyleSheet.absoluteFill} onPress={join.closeJoinModal} />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            {join.isLogged ? (
              <>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>{t('games.joinGameTitle')}</Text>
                  <Pressable
                    onPress={join.closeJoinModal}
                    style={styles.closeButton}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Icon type="materialCommunityIcons" name="close" size={18} color="#444" />
                  </Pressable>
                </View>

                {/* Game summary */}
                <View style={styles.gameCard}>
                  <View style={styles.gameIcon}>
                    <Icon
                      type="materialCommunityIcons"
                      name="trophy-outline"
                      size={22}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gameName} numberOfLines={2}>
                      {game.title}
                    </Text>
                    {!!game.sportType?.name && (
                      <Text style={styles.gameType}>{game.sportType.name}</Text>
                    )}
                  </View>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                  <SettingRow
                    label={t('schedule.numberOfPlayers')}
                    hint={spotsLeft != null ? `${spotsLeft} spots left` : undefined}
                  >
                    <NumericInput
                      value={join.numPlayers}
                      onChange={join.setNumPlayers}
                      min={1}
                      max={spotsLeft}
                    />
                  </SettingRow>

                  <View style={styles.rowDivider} />

                  <SettingRow label={t('games.hasBall')} onPress={() => join.setHasBall(prev => !prev)}>
                    <Checkbox
                      style={styles.checkbox}
                      checked={join.hasBall}
                      onValueChange={() => join.setHasBall(prev => !prev)}
                    />
                  </SettingRow>
                </View>

                {/* Team selection (required when the game has teams) */}
                {needsTeam && (
                  <View style={styles.teamSection}>
                    <Text style={styles.fieldLabel}>
                      {t('games.chooseTeam')} <Text style={styles.required}>*</Text>
                    </Text>

                    <Dropdown
                      data={teamsWithState}
                      labelField="name"
                      valueField="id"
                      placeholder={allTeamsFull ? 'All teams are full' : t('games.chooseTeam')}
                      value={join.selectedTeamId}
                      onChange={item => {
                        if (item.disabled) return; // ignore taps on full teams
                        join.setSelectedTeamId(item.id);
                      }}
                      disable={allTeamsFull}
                      style={[styles.dropdown, selectedTeam && styles.dropdownSelected]}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      containerStyle={styles.dropdownMenu}
                      maxHeight={220}
                      renderLeftIcon={() =>
                        selectedTeam ? (
                          <View style={{ marginRight: 10 }}>
                            <ColorDot color={resolveTeamColor(selectedTeam)} size={16} />
                          </View>
                        ) : null
                      }
                      renderItem={(item, selected) => (
                        <View
                          style={[
                            styles.dropdownItem,
                            selected && styles.dropdownItemSelected,
                            item.disabled && styles.dropdownItemDisabled,
                          ]}
                        >
                          <ColorDot color={resolveTeamColor(item)} size={16} />
                          <Text style={[styles.teamLabel, selected && styles.teamLabelSelected]}>
                            {item.name}
                          </Text>
                          <Text style={[styles.teamSpots, item.disabled && styles.teamSpotsFull]}>
                            {item.spotsLeft === 0 ? 'Full' : `${item.spotsLeft} left`}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                )}

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

                {/* Price summary */}
                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Price per player</Text>
                    <Text style={styles.summaryValue}>${pricePerPlayer.toFixed(2)}</Text>
                  </View>

                  {players > 1 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Players</Text>
                      <Text style={styles.summaryValue}>× {players}</Text>
                    </View>
                  )}

                  {breakdown.discountAmount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount ({breakdown.promoCode})</Text>
                      <Text style={[styles.summaryValue, styles.discount]}>
                        -${breakdown.discountAmount.toFixed(2)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      {isFree ? 'Free' : `$${breakdown.total.toFixed(2)}`}
                    </Text>
                  </View>
                </View>

                {/* CTA */}
                <Button
                  title={ctaLabel}
                  filled
                  disabled={!canJoin}
                  style={[styles.cta, { opacity: canJoin ? 1 : 0.5 }]}
                  onPress={() => join.confirmJoin(isFree ? undefined : 'stripe')}
                />

                {needsTeam && join.selectedTeamId == null && (
                  <Text style={styles.ctaHint}>Choose a team to continue</Text>
                )}
              </>
            ) : (
              <>
                <View style={styles.header}>
                  <View />
                  <Pressable
                    onPress={join.closeJoinModal}
                    style={styles.closeButton}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Icon type="materialCommunityIcons" name="close" size={18} color="#444" />
                  </Pressable>
                </View>

                <NotSignedInView
                  heading="Sign in to join game"
                  description="Access your upcoming and past sessions when signed in."
                  containerStyle={{ minHeight: 260 }}
                  onNavigate={join.closeJoinModal}
                />
              </>
            )}
          </View>
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

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 12,
  },

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // game summary
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f6f8fb',
    marginBottom: 16,
  },
  gameIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  gameType: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  // settings rows
  section: {
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 60,
    paddingVertical: 10,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#222' },
  rowHint: { fontSize: 12, color: '#888', marginTop: 2 },
  rowDivider: { height: 1, backgroundColor: '#f0f0f0' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // team dropdown
  teamSection: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  required: { color: '#E53935' },
  dropdown: {
    width: '100%',
    height: SIZES.InputHeight,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale300,
    backgroundColor: '#fff',
  },
  dropdownSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f7faff',
  },
  dropdownPlaceholder: { fontSize: 15, color: '#999' },
  dropdownSelectedText: { fontSize: 15, color: '#222', fontWeight: '600' },
  dropdownMenu: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownItemSelected: { backgroundColor: '#f3f8ff' },
  teamLabel: { fontSize: 15, color: '#333' },
  teamLabelSelected: { color: COLORS.primary, fontWeight: '600' },

  // price summary
  summary: {
    paddingHorizontal: 2,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#222', fontWeight: '600' },
  discount: { color: '#2E7D32' },
  summaryDivider: {
    height: 1,
    backgroundColor: '#ececec',
    marginTop: 4,
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  // CTA
  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: 32,
  },
  ctaHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },

  // kept for the promo code block above
  fieldContainer: { marginBottom: 16 },
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
  dropdownItemDisabled: { opacity: 0.4 },
  teamSpots: { marginLeft: 'auto', fontSize: 12, color: COLORS.secondary, fontWeight: '500' },
  teamSpotsFull: { color: COLORS.error, fontWeight: '600' },
});