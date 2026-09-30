import React, { useState, useRef, useEffect } from 'react';
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
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { COLORS, SIZES } from '@constants';
import { Icon } from '@components';
import { authCompetitionsdApi } from '@services/competitionApi';
import { useCompetition } from '@hooks/useCompetition';
import { SPORT_TYPES, GENDERS, FORMATS, TOGGLES } from '@constants/competitionOptions';
import publicApi from '@services/api';
import { Dropdown } from 'react-native-element-dropdown';
import { Controller, useForm } from 'react-hook-form';
import Control from '@components/Control';
import { CompetitionForm } from '@types/competition';
import { useTranslation } from 'react-i18next';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { formatDate, formatDateForAPI, formatDateLongg, formatDateShort } from '@utils/dateUtils';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a react-native-image-picker Asset into a { uri, name, type } object FormData can upload. */
const toUploadFile = (asset: Asset, prefix: string): PickedImage => ({
  uri: asset.uri ?? '',
  name: asset.fileName ?? `${prefix}-${Date.now()}.jpg`,
  type: asset.type ?? 'image/jpeg',
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface EditCompetitionScreenProps {
  navigation?: any;
}

export default function EditCompetitionScreen({ navigation, route }: EditCompetitionScreenProps) {
  
  const { t } = useTranslation();
  const { competitionId, initialCompetition, authToken = '' } = route?.params ?? {};
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { isSubmitting },
  } = useForm<CompetitionForm>({
    defaultValues: {
      name: '', city: '', address: '', sportTypeId: '',
      startDate: '', startRegistration: '', endRegistration: '',
      nbrOfTeams: '', teamSize: '', nbrOfSubs: '',
      format: 'RoundRobin', pricePlayer: '', gender: 'CoEd', minimumAge: '',
      teamNames: [], comment: '', logo: null, coverPhoto: null,
      pennies: false, prize: false, referee: false,
    },
  });

  const {
    data: competition,
    isLoading,
    isError,
    error,
  } = useCompetition(competitionId, initialCompetition);

  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [form, setForm] = useState<CompetitionForm>(competition);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [logoImage, setLogoImage] = useState<Asset | null>(null);
  const [bannerImage, setBannerImage] = useState<Asset | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  
  // Pickers visibility
  const [isStartDateVisible, setStartDateVisible] = useState(false);
  const [isRegOpenVisible, setRegOpenVisible] = useState(false);
  const [isRegCloseVisible, setRegCloseVisible] = useState(false);

  // ── helpers ──
  const set = <K extends keyof CompetitionForm>(field: K, value: CompetitionForm[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleSetting = (key: 'pennies' | 'prize' | 'referee') =>
    setForm(prev => ({ ...prev, [key]: !prev[key] }));

  
  // ── image pickers ──
  const pickImage = (type: 'logo' | 'banner') => {
    Alert.alert('Select Image', 'Choose source', [
      { text: 'Camera', onPress: () => launchCameraFor(type) },
      { text: 'Photo Library', onPress: () => launchGalleryFor(type) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const launchCameraFor = (type: 'logo' | 'banner') => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, res => {
      if (!res.didCancel && res.assets?.[0]) applyImage(type, res.assets[0]);
    });
  };

  const launchGalleryFor = (type: 'logo' | 'banner') => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, res => {
      if (!res.didCancel && res.assets?.[0]) applyImage(type, res.assets[0]);
    });
  };

  const applyImage = (type: 'logo' | 'banner', asset: Asset) => {
    const uploadFile = toUploadFile(asset, type);
    if (type === 'logo') {
      setLogoImage(asset);
      set('logo', uploadFile);
    } else {
      setBannerImage(asset);
      set('coverPhoto', uploadFile);
    }
  };

  const removeImage = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setLogoImage(null);
      set('logo', null);
    } else {
      setBannerImage(null);
      set('coverPhoto', null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    console.log(`competitions/${competition.id}`, form);
    try {
      const response = await authCompetitionsdApi.patch(`competitions/${competition.id}`, 
        form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status!=200) {
        console.log(response);
        const message = await response.text().catch(() => '');
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      Alert.alert('Saved', 'Competition updated successfully.');
      navigation?.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Update failed', error?.message ?? 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert('Discard Changes', 'All unsaved changes will be lost.', [
      { text: 'Keep Editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation?.goBack() },
    ]);
  };
  const getCities = async (): Promise<void> => {
    try {
      const response = await publicApi.get('cities');
      const cityList = response.result.data;
      setCities(
        cityList
          .map((city: any) => ({ label: city.name, value: city.name }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label))
      );
    } catch (error) {
      Alert.alert('Error', (error as any).response?.data?.message);
      setCities([]);
    }
  };

  useEffect(() => {
    getCities();
  }, []);

  const renderDateButton = (label: string, fieldName: keyof FormData, onPress: () => void) => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label} * </Text>
      <Controller
        name={fieldName}
        control={control}
        rules={{ required: `${label} is required` }}
        render={({ field: { value } }) => (
          <View>
            <TouchableOpacity
              style={[styles.dateButton, errors[fieldName] && styles.inputError]}
              onPress={onPress}
            >
              <Text style={{ color: form[fieldName] ? COLORS.black : COLORS.grayscale400, fontSize: 14 }}>
                {value ? formatDateLongg(value as string) : formatDateLongg(form[fieldName])}
              </Text>
              <Icon name="calendar-today" type="materialIcons" size={18} color={COLORS.grayscale400} />
            </TouchableOpacity>
            {errors[fieldName] && <Text style={styles.errorText}>{(errors[fieldName] as any)?.message}</Text>}
          </View>
        )}
      />
    </View>
  );
  // ── image picker UI ──
  const renderImagePicker = (type: 'logo' | 'banner', label: string) => {
    const image = type === 'logo' ? logoImage : bannerImage;
    return (
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{label}</Text>
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image.uri }}
              style={type === 'logo' ? styles.logoPreview : styles.bannerPreview}
            />
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageActionBtn} onPress={() => pickImage(type)}>
                <Icon type="materialIcons" name="edit" size={16} color={COLORS.primary} />
                <Text style={[styles.imageActionText, { color: COLORS.primary }]}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.imageActionBtn, styles.removeBtn]} onPress={() => removeImage(type)}>
                <Icon type="materialIcons" name="delete" size={16} color="#ef4444" />
                <Text style={[styles.imageActionText, { color: '#ef4444' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.imageUploadArea} onPress={() => pickImage(type)}>
            <Icon type="materialIcons" name="add-photo-alternate" size={32} color={COLORS.grayscale400 ?? COLORS.gray3} />
            <Text style={styles.imageUploadText}>Tap to {type === 'logo' ? 'upload logo' : 'add banner'}</Text>
            <Text style={styles.imageUploadHint}>
              {type === 'logo' ? 'Square image recommended' : 'Landscape image recommended'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
          <Text style={styles.headerTitle}>Edit Competition</Text>
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
          <View style={styles.body}>
            <SectionHeader label="Media" icon="image-multiple-outline" />
            <View style={styles.card}>
              {renderImagePicker('banner', 'Cover Photo')}
              <View style={styles.fieldDivider} />
              {renderImagePicker('logo', 'Logo')}
            </View>

          {/* ── Basic Information ── */}
            <SectionHeader label="Basic Information" icon="information-outline" />

            <View style={styles.card}>
              <View style={styles.fieldWrap}>
                <FieldLabel label="Competition Name" required />
                <StyledInput
                  value={form.name}
                  onChangeText={v => { set('name', v); setErrors(e => ({ ...e, name: '' })); }}
                  placeholder="e.g. Sunday Soccer League"
                  maxLength={60}
                  error={errors.name}
                />
              </View>

              <View style={styles.fieldDivider} />

              <View style={styles.fieldWrap}>
                <FieldLabel label="City" required />
                {/* City */}
                <Dropdown
                  data={cities}
                  search={true}
                  labelField="label"
                  valueField="value"
                  placeholder={t('Select city') }
                  value={form.city}
                  onChange={v => set('city', v)}
                  style={[styles.dropdown]}
                />

              </View>

              <View style={styles.fieldDivider} />

              <View style={styles.fieldWrap}>
                <FieldLabel label="Address" required />
                <StyledInput
                  value={form.address}
                  onChangeText={v => { set('address', v); setErrors(e => ({ ...e, address: '' })); }}
                  placeholder="e.g. 123 Main St"
                  error={errors.address}
                />
              </View>

              <View style={styles.fieldDivider} />

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Minimum Age" />
                  <StyledInput
                    value={String(form.minimumAge ?? '')}
                    onChangeText={v => set('minimumAge', v)}
                    placeholder="16"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.rowFieldGap} />
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Price / Player ($)" />
                  <StyledInput
                    value={String(form.pricePlayer ?? '')}
                    onChangeText={v => set('pricePlayer', v)}
                    placeholder="10"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.fieldDivider} />

              <View style={styles.fieldWrap}>
                <FieldLabel label="Comment" />
                <StyledInput
                  value={form.comment}
                  onChangeText={v => set('comment', v)}
                  placeholder="Anything players/teams should know…"
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                />
                <Text style={styles.charCount}>{form.comment.length}/300</Text>
              </View>
            </View>

            {/* ── Sport ── */}
            <SectionHeader label="Sport" icon="run" />
            <View style={styles.chipRow}>
              {SPORT_TYPES.map(s => {
                const active = form.sportType === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.seasonChip, active && { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}18` }]}
                    onPress={() => { set('sportTypeId', s.id); setErrors(e => ({ ...e, sportTypeId: '' })); }}
                  >
                    <Icon
                      type="materialCommunityIcons"
                      name={s.icon as any}
                      size={18}
                      color={active ? COLORS.primary : COLORS.gray3}
                    />
                    <Text style={[styles.chipLabel, active && { color: COLORS.primary, fontWeight: '700' }]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!!errors.sportTypeId && (
              <View style={[styles.errorRow, { marginTop: 6 }]}>
                <Icon type="materialCommunityIcons" name="alert-circle-outline" size={13} color="#E53935" />
                <Text style={styles.errorText}>{errors.sportTypeId}</Text>
              </View>
            )}

            {/* ── Gender ── */}
            <SectionHeader label="Gender" icon="account-group-outline" />
            <View style={styles.chipRow}>
              {GENDERS.map(g => {
                const active = form.gender === g.value;
                return (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.seasonChip, active && { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}18` }]}
                    onPress={() => set('gender', g.value)}
                  >
                    <Icon
                      type="materialCommunityIcons"
                      name={g.icon as any}
                      size={18}
                      color={active ? COLORS.primary : COLORS.gray3}
                    />
                    <Text style={[styles.chipLabel, active && { color: COLORS.primary, fontWeight: '700' }]}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Schedule ── */}
            <SectionHeader label="Schedule" icon="calendar-clock-outline" />
            <View style={styles.card}>
              {renderDateButton('Start Date', 'startDate', () => setStartDateVisible(true))}
              <DateTimePickerModal
                isVisible={isStartDateVisible}
                date={new Date()}
                mode="datetime" // use "datetime" since your format includes time
                minimumDate={new Date()}
                onConfirm={(date) => { setValue('startDate', formatDateForAPI(date)); trigger('startDate'); setStartDateVisible(false); }}
                onCancel={() => setStartDateVisible(false)}
              />

              {renderDateButton('Registration Opens', 'startRegistration', () => setRegOpenVisible(true))}
              <DateTimePickerModal
                isVisible={isRegOpenVisible}
                mode="datetime"
                minimumDate={new Date()}
                onConfirm={(date) => { setValue('startRegistration', formatDateForAPI(date)); trigger('startRegistration'); setRegOpenVisible(false); }}
                onCancel={() => setRegOpenVisible(false)}
              />

              {renderDateButton('Registration Closes', 'endRegistration', () => setRegCloseVisible(true))}
              <DateTimePickerModal
                isVisible={isRegCloseVisible}
                mode="datetime"
                minimumDate={new Date()}
                onConfirm={(date) => { setValue('endRegistration', formatDateForAPI(date)); trigger('endRegistration'); setRegCloseVisible(false); }}
                onCancel={() => setRegCloseVisible(false)}
              />
            </View>

            {/* ── Teams ── */}
            <SectionHeader label="Teams" icon="account-multiple-outline" />
            <View style={styles.card}>
              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Number of Teams" required />
                  <StyledInput
                    value={String(form.nbrOfSubs ?? '')}
                    onChangeText={v => { set('nbrOfTeams', v); setErrors(e => ({ ...e, nbrOfTeams: '' })); }}
                    placeholder="4"
                    keyboardType="number-pad"
                    error={errors.nbrOfTeams}
                  />
                </View>
                <View style={styles.rowFieldGap} />
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Team Size" required />
                  <StyledInput
                    value={String(form.teamSize ?? '')}
                    onChangeText={v => { set('teamSize', v); setErrors(e => ({ ...e, teamSize: '' })); }}
                    placeholder="5"
                    keyboardType="number-pad"
                    error={errors.teamSize}
                  />
                </View>
              </View>
              <View style={styles.fieldDivider} />
              <View style={styles.fieldWrap}>
                <FieldLabel label="Substitutes / Team" />
                <StyledInput
                  value={String(form.nbrOfSubs ?? '')}
                  onChangeText={v => set('nbrOfSubs', v)}
                  placeholder="2"
                  keyboardType="number-pad"
                />
              </View>
            </View>


            {/* ── Competition Format ── */}
            <SectionHeader label="Competition Format" icon="trophy-outline" />
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

            {/* ── Features ── */}
            <SectionHeader label="Features" icon="toggle-switch-outline" />
            <View style={styles.card}>
              {TOGGLES.map((t, i) => {
                const value = form[t.key];
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
                    'Delete Competition',
                    'This will permanently delete the competition and all its data. This cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => {} },
                    ],
                  )
                }
              >
                <Icon type="materialCommunityIcons" name="trash-can-outline" size={18} color="#E53935" />
                <Text style={styles.dangerText}>Delete Competition</Text>
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

  // Media / image pickers
  formGroup: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  imageUploadArea: {
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.grayscale300 ?? '#CCC',
    backgroundColor: COLORS.grayscale100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  imageUploadHint: {
    fontSize: 12,
    color: COLORS.gray3,
  },
  imagePreviewContainer: {
    gap: 10,
  },
  bannerPreview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale100,
  },
  logoPreview: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: COLORS.grayscale100,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
  },
  imageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: `${COLORS.primary}18`,
  },
  removeBtn: {
    backgroundColor: '#FFEBEE',
  },
  imageActionText: {
    fontSize: 13,
    fontWeight: '700',
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: 24,
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

  dropdown: {
      width: '100%',
      paddingHorizontal: SIZES.padding,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.grayscale300,
      marginVertical: 5,
      flexDirection: 'row',
      height: SIZES.InputHeight,
      alignItems: 'center',
    },
  input: {
    fontSize: 15,
    color: COLORS.black,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
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

  // Chips (sport / gender)
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

  // Radio rows (format)
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

  // Points stepper (kept for reuse elsewhere)
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

  // Team names
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  removeTeamBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTeamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  addTeamText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
// Date button
  dateButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: SIZES.InputHeight || 48,
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