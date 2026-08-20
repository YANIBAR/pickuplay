import { images } from '@constants';
import { Header, Button, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { publicApi, authenticatedApi } from '@services/api';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const PRIMARY = '#19C2A0';
const PRIMARY_LIGHT = '#E8FFFA';
const DARK = '#111';
const MUTED = '#777';
const BORDER = '#E5E5E5';

const teams = [
  {
    id: 1,
    name: 'Brooklyn Tigers',
    sport: 'Soccer',
    location: 'Brooklyn, NY',
    players: '12 / 15 Players',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Queens Hoopers',
    sport: 'Basketball',
    location: 'Queens, NY',
    players: '8 / 10 Players',
    image:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Central Smashers',
    sport: 'Tennis',
    location: 'Manhattan, NY',
    players: '6 / 8 Players',
    image:
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop',
  },
];

const EMPTY_SLOT = { date: '', time: '' };

function MatchupModal({ visible, team, onClose, onSubmit }) {
  const [slots, setSlots] = useState([
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
    { ...EMPTY_SLOT },
  ]);
  const [location, setLocation] = useState('');
  const [numPlayers, setNumPlayers] = useState('');
  const [message, setMessage] = useState('');

  const updateSlot = (index, field, value) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  };

  const handleSubmit = () => {
    onSubmit({ slots, location, numPlayers, message, team });
    onClose();
  };

  const isValid =
    slots.some((s) => s.date && s.time) && location.trim() && numPlayers.trim();

  if (!team) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kvContainer}
        >
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Challenge</Text>
                <Text style={styles.modalSubtitle}>{team.name}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Time Slots */}
              <SectionLabel label="Suggested Time Slots" hint="Pick at least 1" />
              {slots.map((slot, index) => (
                <View key={index} style={styles.slotRow}>
                  <View style={styles.slotIndex}>
                    <Text style={styles.slotIndexText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.slotInput]}
                    placeholder="Date (e.g. Jul 10)"
                    placeholderTextColor="#BBB"
                    value={slot.date}
                    onChangeText={(v) => updateSlot(index, 'date', v)}
                  />
                  <TextInput
                    style={[styles.input, styles.slotInput]}
                    placeholder="Time (e.g. 6:00 PM)"
                    placeholderTextColor="#BBB"
                    value={slot.time}
                    onChangeText={(v) => updateSlot(index, 'time', v)}
                  />
                </View>
              ))}

              {/* Location */}
              <SectionLabel label="Location" />
              <TextInput
                style={styles.input}
                placeholder="e.g. Prospect Park Field 3"
                placeholderTextColor="#BBB"
                value={location}
                onChangeText={setLocation}
              />

              {/* Number of Players */}
              <SectionLabel label="Number of Players" />
              <TextInput
                style={styles.input}
                placeholder="e.g. 11"
                placeholderTextColor="#BBB"
                keyboardType="number-pad"
                value={numPlayers}
                onChangeText={setNumPlayers}
              />

              {/* Message */}
              <SectionLabel label="Message" hint="Optional" />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Say something to the other team…"
                placeholderTextColor="#BBB"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!isValid}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>Send Challenge ⚡</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function SectionLabel({ label, hint }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

export default function NoCompetitionPage() {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const openMatchup = (team) => {
    setSelectedTeam(team);
    setModalVisible(true);
  };

  const handleSubmitChallenge = (data) => {
    console.log('Challenge submitted:', data);
    // TODO: wire to API
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('menu.matchups')} />
<Button
                        filled
                        style={styles.joinButton}
                        title={t('Matchup')}
                        onPress={() => navigate('addTeam')}
                      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Banner */}
        <View style={styles.header}>
          <Image
            source={images.matchups}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>

        {teams.length === 0 ? (
          <View style={styles.content}>
            <Text style={styles.mainTitle}>{t('teams.title')}</Text>
            <Text style={styles.subtitle}>{t('teams.noTeams')}</Text>
            <Text style={styles.description}>{t('teams.description')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>Find Teams</Text>
              <Text style={styles.subtitle}>
                Join teams or challenge them to a matchup
              </Text>
            </View>

            <View style={styles.teamList}>
              {teams.map((team) => (
                <TouchableOpacity key={team.id} style={styles.teamCard} onPress={() => navigate('teamDetail', { teamId: team.id })}>
                  <Image
                    source={{ uri: team.image }}
                    style={styles.teamImage}
                  />

                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamSport}>{team.sport}</Text>
                    <Text style={styles.teamLocation}>{team.location}</Text>
                    <Text style={styles.teamPlayers}>{team.players}</Text>

                    <View style={styles.buttonRow}>
                      <Button
                        filled
                        style={styles.joinButton}
                        title={t('Matchup')}
                        onPress={() => openMatchup(team)}
                      />
                      <Button
                        style={styles.matchupButton}
                        title={t('Join')}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <MatchupModal
        visible={modalVisible}
        team={selectedTeam}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitChallenge}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  logo: {
    width: '100%',
    height: 270,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  teamList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  teamCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  teamImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#ddd',
  },
  teamInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  teamName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  teamSport: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '600',
    marginTop: 2,
  },
  teamLocation: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  teamPlayers: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  joinButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
  },
  matchupButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  // ── Modal ──────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kvContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '700',
  },

  // ── Form ──────────────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionHint: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '400',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  slotIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  slotInput: {
    flex: 1,
    marginBottom: 0,
  },
  input: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: DARK,
    backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
  textArea: {
    height: 90,
    paddingTop: 11,
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: {
    backgroundColor: '#B2EBE3',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});