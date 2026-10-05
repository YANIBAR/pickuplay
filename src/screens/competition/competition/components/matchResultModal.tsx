import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { COLORS } from '@constants';
import { Icon } from '@components';
import { authCompetitionsdApi } from '@services/competitionApi';
import { CompetitionTeam } from '../../../types';

type Slot = 'A' | 'B';

interface Props {
  visible: boolean;
  onClose: () => void;
  competitionId: string | number;
  teams: CompetitionTeam[];
  getTeamColor: (teamName: string) => string;
  /** Called after a result is saved successfully (e.g. to refetch standings). */
  onSaved?: () => void;
}

const MatchResultModal = ({ visible, onClose, competitionId, teams, getTeamColor, onSaved }: Props) => {
  const [teamAId, setTeamAId] = useState<string | null>(null);
  const [teamBId, setTeamBId] = useState<string | null>(null);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [openSlot, setOpenSlot] = useState<Slot | null>(null);
  const [saving, setSaving] = useState(false);

  const teamA = useMemo(() => teams.find(t => t.id === teamAId) ?? null, [teams, teamAId]);
  const teamB = useMemo(() => teams.find(t => t.id === teamBId) ?? null, [teams, teamBId]);

  const canSave = !!teamAId && !!teamBId && teamAId !== teamBId && scoreA !== '' && scoreB !== '' && !saving;

  const reset = () => {
    setTeamAId(null);
    setTeamBId(null);
    setScoreA('');
    setScoreB('');
    setOpenSlot(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onlyDigits = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 3);

  const handleSave = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      // ASSUMPTION: adjust the endpoint / payload to match your backend.
      await authCompetitionsdApi.post(`competitions/${competitionId}/results`, {
        competitionId,
        teamAId,
        teamBId,
        teamAScore: Number(scoreA),
        teamBScore: Number(scoreB),
      });
      onSaved?.();
      handleClose();
    } catch (e) {
      const msg = axios.isAxiosError(e) ? e.response?.data?.message : undefined;
      Alert.alert('Could not save result', msg ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (slot: Slot) => {
    const isA = slot === 'A';
    const selected = isA ? teamA : teamB;
    const otherId = isA ? teamBId : teamAId;
    const score = isA ? scoreA : scoreB;
    const setScore = isA ? setScoreA : setScoreB;
    const setTeam = isA ? setTeamAId : setTeamBId;
    const open = openSlot === slot;
    const options = teams.filter(t => t.id !== otherId);

    return (
      <View style={{ zIndex: open ? 10 : 1 }}>
        <View style={styles.row}>
          {/* Team dropdown */}
          <TouchableOpacity
            style={[styles.dropdown, open && styles.dropdownOpen]}
            activeOpacity={0.8}
            onPress={() => setOpenSlot(open ? null : slot)}
          >
            {selected ? (
              <>
                <View style={[styles.dot, { backgroundColor: getTeamColor(selected.color) }]} />
                <Text style={styles.dropdownText} numberOfLines={1}>{selected.name}</Text>
              </>
            ) : (
              <Text style={[styles.dropdownText, styles.placeholder]} numberOfLines={1}>
                Select team {slot}
              </Text>
            )}
            <Icon
              type="materialCommunityIcons"
              name={open ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.gray3}
            />
          </TouchableOpacity>

          {/* Score */}
          <TextInput
            style={styles.scoreInput}
            value={score}
            onChangeText={v => setScore(onlyDigits(v))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={COLORS.gray3}
            maxLength={3}
            selectTextOnFocus
          />
        </View>

        {/* Inline dropdown list (avoids a nested Modal, which is flaky on iOS) */}
        {open && (
          <View style={styles.list}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
              {options.length === 0 ? (
                <Text style={styles.emptyText}>No teams available</Text>
              ) : (
                options.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.listItem}
                    onPress={() => {
                      setTeam(t.id);
                      setOpenSlot(null);
                    }}
                  >
                    <View style={[styles.dot, { backgroundColor: getTeamColor(t.color) }]} />
                    <Text style={styles.listItemText}>{t.name}</Text>
                    {t.id === (isA ? teamAId : teamBId) && (
                      <Icon type="materialCommunityIcons" name="check" size={18} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerBtn} />
            <Text style={styles.title}>Add Match Result</Text>
            <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
              <Icon type="materialCommunityIcons" name="close" size={22} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Pick the two teams and enter the final score.</Text>

          {renderRow('A')}
          <Text style={styles.vs}>VS</Text>
          {renderRow('B')}

          {teamAId && teamAId === teamBId && (
            <Text style={styles.errorText}>A team can't play against itself.</Text>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            disabled={!canSave}
            activeOpacity={0.85}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Result</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const BORDER = '#E5E7EB';

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    marginTop: 10,
    marginBottom: 6,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.gray3, marginBottom: 16, textAlign: 'center' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  dropdownOpen: { borderColor: COLORS.primary },
  dropdownText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.black },
  placeholder: { fontWeight: '400', color: COLORS.gray3 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  scoreInput: {
    width: 64,
    height: 52,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
  },

  list: {
    marginTop: 6,
    marginRight: 76, // keep the list under the dropdown, not under the score box
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  listItemText: { flex: 1, fontSize: 15, color: COLORS.black },
  emptyText: { padding: 14, color: COLORS.gray3 },

  vs: { textAlign: 'center', marginVertical: 10, fontSize: 12, fontWeight: '700', color: COLORS.gray3, letterSpacing: 1 },
  errorText: { marginTop: 10, color: COLORS.red, fontSize: 13, textAlign: 'center' },

  saveBtn: {
    marginTop: 22,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

export default MatchResultModal;