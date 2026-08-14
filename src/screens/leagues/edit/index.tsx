import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SIZES } from '@constants';
import { Icon } from '@components';

// ─── Types ───────────────────────────────────────────────────────────────────

type Season = 'fall' | 'spring' | 'summer' | 'winter';
type Visibility = 'public' | 'private' | 'invite-only';
type Format = 'round_robin' | 'double_round_robin' | 'knockout' | 'group_stage' | 'custom';

interface LeagueForm {
  name: string;
  sport: string;
  description: string;
  season: Season;
  city: string;
  visibility: Visibility;
  bannerUrl: string;
  logoUrl: string;
  registration: {
    openDate: string;
    closeDate: string;
    maxTeams: string;
    minPlayersPerTeam: string;
    maxPlayersPerTeam: string;
  };
  format: Format;
  settings: {
    pointsForWin: string;
    pointsForDraw: string;
    pointsForLoss: string;
    refereesEnabled: boolean;
    statisticsEnabled: boolean;
    playerRatingsEnabled: boolean;
    liveScoresEnabled: boolean;
  };
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL: LeagueForm = {
  name: 'Premier City League',
  sport: 'Football',
  description:
    'The most competitive amateur football league in the city, bringing together top local talent every season.',
  season: 'fall',
  city: 'Kansas City',
  visibility: 'public',
  bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
  logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200',
  registration: {
    openDate: 'Aug 1, 2025',
    closeDate: 'Sep 15, 2025',
    maxTeams: '16',
    minPlayersPerTeam: '11',
    maxPlayersPerTeam: '22',
  },
  format: 'round_robin',
  settings: {
    pointsForWin: '3',
    pointsForDraw: '1',
    pointsForLoss: '0',
    refereesEnabled: true,
    statisticsEnabled: true,
    playerRatingsEnabled: false,
    liveScoresEnabled: true,
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SEASONS: { value: Season; label: string; icon: string; color: string }[] = [
  { value: 'spring', label: 'Spring', icon: 'flower', color: '#4CAF50' },
  { value: 'summer', label: 'Summer', icon: 'weather-sunny', color: '#F9A825' },
  { value: 'fall',   label: 'Fall',   icon: 'leaf',          color: '#E07B39' },
  { value: 'winter', label: 'Winter', icon: 'snowflake',     color: '#42A5F5' },
];

const VISIBILITIES: { value: Visibility; label: string; icon: string; sub: string }[] = [
  { value: 'public',      label: 'Public',      icon: 'earth',         sub: 'Anyone can find & join' },
  { value: 'private',     label: 'Private',     icon: 'lock',          sub: 'Hidden, link-only access' },
  { value: 'invite-only', label: 'Invite Only', icon: 'account-group', sub: 'Approved members only' },
];

const FORMATS: { value: Format; label: string; icon: string; sub: string }[] = [
  { value: 'round_robin',        label: 'Round Robin',        icon: 'rotate-right', sub: 'Every team plays each other once' },
  { value: 'double_round_robin', label: 'Double Round Robin', icon: 'sync',         sub: 'Every team plays each other twice' },
  { value: 'knockout',           label: 'Knockout',           icon: 'tournament',   sub: 'Single-elimination bracket' },
  { value: 'group_stage',        label: 'Group Stage',        icon: 'view-grid',    sub: 'Groups then knockout rounds' },
  { value: 'custom',             label: 'Custom',             icon: 'pencil-ruler', sub: 'Define your own structure' },
];

const TOGGLES: {
  key: keyof LeagueForm['settings'];
  label: string;
  sub: string;
  icon: string;
}[] = [
  { key: 'refereesEnabled',      label: 'Referees',      sub: 'Assign referees to matches',        icon: 'whistle'    },
  { key: 'statisticsEnabled',    label: 'Statistics',    sub: 'Track detailed match stats',         icon: 'chart-bar'  },
  { key: 'playerRatingsEnabled', label: 'Player Ratings',sub: 'Allow post-match player ratings',    icon: 'star-outline'},
  { key: 'liveScoresEnabled',    label: 'Live Scores',   sub: 'Publish scores in real time',        icon: 'broadcast'  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ label, icon }: { label: string; icon: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconWrap}>
      <Icon type="materialCommunityIcons" name={icon as any} size={16} color={COLORS.primary} />
    </View>
    <Text style={styles.sectionHeaderText}>{label}</Text>
  </View>
);

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <View style={styles.fieldLabelRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {required && <Text style={styles.fieldRequired}>*</Text>}
  </View>
);

const StyledInput = ({
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  maxLength,
  numberOfLines,
  error,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
  maxLength?: number;
  numberOfLines?: number;
  error?: string;
}) => (
  <View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.gray3}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType ?? 'default'}
      maxLength={maxLength}
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        !!error && styles.inputError,
      ]}
    />
    {!!error && (
      <View style={styles.errorRow}>
        <Icon type="materialCommunityIcons" name="alert-circle-outline" size={13} color="#E53935" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

const PointStepper = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const num = parseInt(value, 10) || 0;
  return (
    <View style={styles.stepperBox}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={[styles.stepperBtn, num <= 0 && styles.stepperBtnDisabled]}
          onPress={() => num > 0 && onChange(String(num - 1))}
          disabled={num <= 0}
        >
          <Icon type="materialCommunityIcons" name="minus" size={18} color={num <= 0 ? COLORS.gray3 : COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{num}</Text>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onChange(String(num + 1))}
        >
          <Icon type="materialCommunityIcons" name="plus" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EditLeagueScreen({ navigation }: any) {
  const [form, setForm] = useState<LeagueForm>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // ── helpers ──
  const set = (field: keyof LeagueForm, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const setReg = (field: keyof LeagueForm['registration'], value: string) =>
    setForm(prev => ({ ...prev, registration: { ...prev.registration, [field]: value } }));

  const setSetting = (field: keyof LeagueForm['settings'], value: any) =>
    setForm(prev => ({ ...prev, settings: { ...prev.settings, [field]: value } }));

  const toggleSetting = (key: keyof LeagueForm['settings']) =>
    setSetting(key, !form.settings[key]);

  // ── validation ──
  const validate = (): boolean => {
    const e: Partial<Record<string, string>> = {};
    if (!form.name.trim())        e.name = 'League name is required';
    if (!form.sport.trim())       e.sport = 'Sport is required';
    if (!form.city.trim())        e.city = 'City is required';
    if (!form.registration.openDate.trim())  e.openDate = 'Open date is required';
    if (!form.registration.closeDate.trim()) e.closeDate = 'Close date is required';
    const maxT = parseInt(form.registration.maxTeams, 10);
    if (!maxT || maxT < 2) e.maxTeams = 'Must be at least 2 teams';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setSaving(true);
    // simulate API call
    await new Promise(res => setTimeout(res, 1200));
    setSaving(false);
    Alert.alert('Saved', 'League updated successfully.');
    navigation?.goBack();
  };

  const handleDiscard = () => {
    Alert.alert('Discard Changes', 'All unsaved changes will be lost.', [
      { text: 'Keep Editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation?.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.screen}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleDiscard}>
            <Icon type="materialCommunityIcons" name="close" size={22} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit League</Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnLoading]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Media ── */}
          <View style={styles.mediaBlock}>
            {/* Banner */}
            <TouchableOpacity style={styles.bannerPicker} activeOpacity={0.8}>
              {form.bannerUrl ? (
                <Image source={{ uri: form.bannerUrl }} style={styles.bannerImage} resizeMode="cover" />
              ) : (
                <View style={styles.bannerPlaceholder}>
                  <Icon type="materialCommunityIcons" name="image-plus" size={32} color={COLORS.gray3} />
                  <Text style={styles.placeholderText}>Add Banner</Text>
                </View>
              )}
              <View style={styles.bannerOverlay} />
              <View style={styles.bannerEditChip}>
                <Icon type="materialCommunityIcons" name="camera" size={14} color={COLORS.white} />
                <Text style={styles.bannerEditText}>Edit Banner</Text>
              </View>

              {/* Logo picker on top of banner */}
              <TouchableOpacity style={styles.logoPicker} activeOpacity={0.85}>
                {form.logoUrl ? (
                  <Image source={{ uri: form.logoUrl }} style={styles.logoImage} resizeMode="cover" />
                ) : (
                  <Icon type="materialCommunityIcons" name="shield-plus" size={28} color={COLORS.gray3} />
                )}
                <View style={styles.logoBadge}>
                  <Icon type="materialCommunityIcons" name="camera" size={11} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* ── Basic Information ── */}
          <View style={styles.body}>
            <SectionHeader label="Basic Information" icon="information-outline" />

            <View style={styles.card}>
              <View style={styles.fieldWrap}>
                <FieldLabel label="League Name" required />
                <StyledInput
                  value={form.name}
                  onChangeText={v => { set('name', v); setErrors(e => ({ ...e, name: '' })); }}
                  placeholder="e.g. Premier City League"
                  maxLength={60}
                  error={errors.name}
                />
              </View>

              <View style={styles.fieldDivider} />

              <View style={styles.fieldWrap}>
                <FieldLabel label="Sport" required />
                <StyledInput
                  value={form.sport}
                  onChangeText={v => { set('sport', v); setErrors(e => ({ ...e, sport: '' })); }}
                  placeholder="e.g. Football, Basketball…"
                  error={errors.sport}
                />
              </View>

              <View style={styles.fieldDivider} />

              <View style={styles.fieldWrap}>
                <FieldLabel label="City" required />
                <StyledInput
                  value={form.city}
                  onChangeText={v => { set('city', v); setErrors(e => ({ ...e, city: '' })); }}
                  placeholder="e.g. Kansas City"
                  error={errors.city}
                />
              </View>

              <View style={styles.fieldDivider} />

              <View style={styles.fieldWrap}>
                <FieldLabel label="Description" />
                <StyledInput
                  value={form.description}
                  onChangeText={v => set('description', v)}
                  placeholder="Describe your league…"
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                />
                <Text style={styles.charCount}>{form.description.length}/300</Text>
              </View>
            </View>

            {/* ── Season ── */}
            <SectionHeader label="Season" icon="calendar-month-outline" />
            <View style={styles.chipRow}>
              {SEASONS.map(s => {
                const active = form.season === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      styles.seasonChip,
                      active && { borderColor: s.color, backgroundColor: `${s.color}18` },
                    ]}
                    onPress={() => set('season', s.value)}
                  >
                    <Icon
                      type="materialCommunityIcons"
                      name={s.icon as any}
                      size={18}
                      color={active ? s.color : COLORS.gray3}
                    />
                    <Text style={[styles.chipLabel, active && { color: s.color, fontWeight: '700' }]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Visibility ── */}
            <SectionHeader label="Visibility" icon="eye-outline" />
            <View style={styles.card}>
              {VISIBILITIES.map((v, i) => {
                const active = form.visibility === v.value;
                return (
                  <React.Fragment key={v.value}>
                    {i > 0 && <View style={styles.fieldDivider} />}
                    <TouchableOpacity
                      style={styles.radioRow}
                      onPress={() => set('visibility', v.value)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioIconWrap, active && styles.radioIconWrapActive]}>
                        <Icon
                          type="materialCommunityIcons"
                          name={v.icon as any}
                          size={19}
                          color={active ? COLORS.primary : COLORS.gray3}
                        />
                      </View>
                      <View style={styles.radioText}>
                        <Text style={[styles.radioLabel, active && styles.radioLabelActive]}>
                          {v.label}
                        </Text>
                        <Text style={styles.radioSub}>{v.sub}</Text>
                      </View>
                      <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                        {active && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>

            {/* ── Registration ── */}
            <SectionHeader label="Registration" icon="clipboard-text-outline" />
            <View style={styles.card}>
              <View style={styles.fieldWrap}>
                <FieldLabel label="Registration Opens" required />
                <StyledInput
                  value={form.registration.openDate}
                  onChangeText={v => { setReg('openDate', v); setErrors(e => ({ ...e, openDate: '' })); }}
                  placeholder="e.g. Aug 1, 2025"
                  error={errors.openDate}
                />
              </View>
              <View style={styles.fieldDivider} />
              <View style={styles.fieldWrap}>
                <FieldLabel label="Registration Closes" required />
                <StyledInput
                  value={form.registration.closeDate}
                  onChangeText={v => { setReg('closeDate', v); setErrors(e => ({ ...e, closeDate: '' })); }}
                  placeholder="e.g. Sep 15, 2025"
                  error={errors.closeDate}
                />
              </View>
              <View style={styles.fieldDivider} />
              <View style={styles.fieldWrap}>
                <FieldLabel label="Maximum Teams" required />
                <StyledInput
                  value={form.registration.maxTeams}
                  onChangeText={v => { setReg('maxTeams', v); setErrors(e => ({ ...e, maxTeams: '' })); }}
                  placeholder="e.g. 16"
                  keyboardType="number-pad"
                  error={errors.maxTeams}
                />
              </View>
              <View style={styles.fieldDivider} />
              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Min Players / Team" />
                  <StyledInput
                    value={form.registration.minPlayersPerTeam}
                    onChangeText={v => setReg('minPlayersPerTeam', v)}
                    placeholder="11"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.rowFieldGap} />
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Max Players / Team" />
                  <StyledInput
                    value={form.registration.maxPlayersPerTeam}
                    onChangeText={v => setReg('maxPlayersPerTeam', v)}
                    placeholder="22"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            {/* ── League Format ── */}
            <SectionHeader label="League Format" icon="trophy-outline" />
            <View style={styles.card}>
              {FORMATS.map((f, i) => {
                const active = form.format === f.value;
                return (
                  <React.Fragment key={f.value}>
                    {i > 0 && <View style={styles.fieldDivider} />}
                    <TouchableOpacity
                      style={styles.radioRow}
                      onPress={() => set('format', f.value)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioIconWrap, active && styles.radioIconWrapActive]}>
                        <Icon
                          type="materialCommunityIcons"
                          name={f.icon as any}
                          size={19}
                          color={active ? COLORS.primary : COLORS.gray3}
                        />
                      </View>
                      <View style={styles.radioText}>
                        <Text style={[styles.radioLabel, active && styles.radioLabelActive]}>
                          {f.label}
                        </Text>
                        <Text style={styles.radioSub}>{f.sub}</Text>
                      </View>
                      <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                        {active && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>

            {/* ── Points System ── */}
            <SectionHeader label="Points System" icon="counter" />
            <View style={styles.pointsRow}>
              <PointStepper
                label="Win"
                value={form.settings.pointsForWin}
                onChange={v => setSetting('pointsForWin', v)}
              />
              <PointStepper
                label="Draw"
                value={form.settings.pointsForDraw}
                onChange={v => setSetting('pointsForDraw', v)}
              />
              <PointStepper
                label="Loss"
                value={form.settings.pointsForLoss}
                onChange={v => setSetting('pointsForLoss', v)}
              />
            </View>

            {/* ── Features ── */}
            <SectionHeader label="Features" icon="toggle-switch-outline" />
            <View style={styles.card}>
              {TOGGLES.map((t, i) => {
                const value = form.settings[t.key] as boolean;
                return (
                  <React.Fragment key={t.key}>
                    {i > 0 && <View style={styles.fieldDivider} />}
                    <View style={styles.toggleRow}>
                      <View style={[styles.toggleIconWrap, value && styles.toggleIconWrapActive]}>
                        <Icon
                          type="materialCommunityIcons"
                          name={t.icon as any}
                          size={19}
                          color={value ? COLORS.primary : COLORS.gray3}
                        />
                      </View>
                      <View style={styles.toggleText}>
                        <Text style={styles.toggleLabel}>{t.label}</Text>
                        <Text style={styles.toggleSub}>{t.sub}</Text>
                      </View>
                      <Switch
                        value={value}
                        onValueChange={() => toggleSetting(t.key)}
                        trackColor={{ false: COLORS.grayscale300, true: `${COLORS.primary}55` }}
                        thumbColor={value ? COLORS.primary : COLORS.gray3}
                      />
                    </View>
                  </React.Fragment>
                );
              })}
            </View>

            {/* ── Danger zone ── */}
            <View style={styles.dangerBlock}>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={() =>
                  Alert.alert(
                    'Delete League',
                    'This will permanently delete the league and all its data. This cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => {} },
                    ],
                  )
                }
              >
                <Icon type="materialCommunityIcons" name="trash-can-outline" size={18} color="#E53935" />
                <Text style={styles.dangerText}>Delete League</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BANNER_H = 200;
const LOGO_SIZE = 84;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale100,
    backgroundColor: COLORS.white,
    zIndex: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.grayscale100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 99,
    backgroundColor: COLORS.primary,
    minWidth: 72,
    alignItems: 'center',
  },
  saveBtnLoading: {
    opacity: 0.75,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  scrollContent: {
    paddingBottom: 0,
  },

  // Media
  mediaBlock: {
    marginBottom: 8,
  },
  bannerPicker: {
    height: BANNER_H,
    backgroundColor: COLORS.grayscale100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: BANNER_H,
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  bannerPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.gray3,
  },
  bannerEditChip: {
    position: 'absolute',
    bottom: LOGO_SIZE / 2 + 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  bannerEditText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
  },
  logoPicker: {
    position: 'absolute',
    bottom: -(LOGO_SIZE / 2),
    alignSelf: 'center',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.grayscale100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: LOGO_SIZE - 8,
    height: LOGO_SIZE - 8,
    borderRadius: (LOGO_SIZE - 8) / 2,
  },
  logoBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: LOGO_SIZE / 2 + 16,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    overflow: 'hidden',
  },
  fieldDivider: {
    height: 1,
    backgroundColor: COLORS.grayscale100,
    marginHorizontal: 16,
  },
  fieldWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldRequired: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '700',
    marginTop: -2,
  },
  input: {
    fontSize: 15,
    color: COLORS.black,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.grayscale100,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#E53935',
    backgroundColor: '#FFEBEE',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#E53935',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.gray3,
    textAlign: 'right',
    marginTop: 4,
  },
  rowFields: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  rowFieldGap: {
    width: 10,
  },

  // Season chips
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  seasonChip: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray3,
  },

  // Radio rows (visibility + format)
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  radioIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIconWrapActive: {
    backgroundColor: `${COLORS.primary}18`,
  },
  radioText: {
    flex: 1,
    gap: 2,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  radioLabelActive: {
    color: COLORS.primary,
  },
  radioSub: {
    fontSize: 12,
    color: COLORS.gray3,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.grayscale300 ?? '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  // Points stepper
  pointsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stepperBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: COLORS.grayscale100,
  },
  stepperValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    minWidth: 24,
    textAlign: 'center',
  },

  // Toggle rows
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  toggleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIconWrapActive: {
    backgroundColor: `${COLORS.primary}18`,
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  toggleSub: {
    fontSize: 12,
    color: COLORS.gray3,
  },

  // Danger zone
  dangerBlock: {
    marginTop: 32,
    alignItems: 'center',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5393522',
    backgroundColor: '#FFEBEE',
  },
  dangerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
});