import { COLORS, SIZES } from '@constants';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image as RNImage,
  Switch,
  StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Header, Icon, TextInput } from '@components';
import { useTranslation } from 'react-i18next';
import { authenticatedApi, publicApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAVA_API } from '@env';
import { useNavigation } from '@react-navigation/native';

// ─── Types ────────────────────────────────────────────────────────────────────

type TeamType = 'co_ed' | 'youth' | 'over_30' | 'men' | 'women';
type TeamFormat = '5' | '7' | '11';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'competitive';

interface FormData {
  name: string;
  sport_id: number;
  description: string;
  logo?: string;
  team_type: TeamType;
  team_format: TeamFormat;
  skill_level: SkillLevel;
  max_players: string;
  city: string;
  owner_id: string;
  is_public: boolean;
}

type StepKey = 'basic' | 'details' | 'settings';

const STEPS: { key: StepKey; label: string; icon: string }[] = [
  { key: 'basic',    label: 'Basic Info',    icon: 'info' },
  { key: 'details',  label: 'Team Details',  icon: 'sports' },
  { key: 'settings', label: 'Settings',      icon: 'settings' },
];

const TOTAL_STEPS = STEPS.length;

// ─── Component ────────────────────────────────────────────────────────────────

const AddTeamScreen = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);

  // Images
  const [logoImage, setLogoImage] = useState<any>(null);

  // Dropdown data
  const [sports, setSports] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      sport_id: 0,
      description: '',
      logo: '',
      team_type: 'men',
      team_format: '11',
      skill_level: 'intermediate',
      max_players: '',
      city: '',
      owner_id: '',
      is_public: true,
    },
    mode: 'onBlur',
  });

  // ─── Fetch data ──────────────────────────────────────────────────────────────

  const getSports = async () => {
    try {
      const response = await publicApi.get('games/sports');
      const list = response.result.data;
      setSports(
        list
          .map((s: any) => ({ label: s.name, value: s.id }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label)),
      );
    } catch {
      setSports([]);
    }
  };

  const getCities = async () => {
    try {
      const response = await publicApi.get('cities');
      const list = response.result.data;
      setCities(
        list
          .map((c: any) => ({ label: c.name, value: c.name }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label)),
      );
    } catch {
      setCities([]);
    }
  };

  useEffect(() => {
    getSports();
    getCities();
  }, []);

  // ─── Step validation ─────────────────────────────────────────────────────────

  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    0: ['name', 'sport_id', 'description'],
    1: ['team_type', 'team_format', 'skill_level', 'max_players'],
    2: ['city', 'owner_id'],
  };

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = await trigger(fields);
    if (valid) setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleBack = () => setCurrentStep(s => Math.max(s - 1, 0));

  // ─── Image helpers ───────────────────────────────────────────────────────────

  const pickImage = () => {
    Alert.alert('Select Image', 'Choose source', [
      { text: 'Camera', onPress: launchCameraForLogo },
      { text: 'Photo Library', onPress: launchGalleryForLogo },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const launchCameraForLogo = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, res => {
      if (!res.didCancel && res.assets?.[0]) applyLogo(res.assets[0]);
    });
  };

  const launchGalleryForLogo = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, res => {
      if (!res.didCancel && res.assets?.[0]) applyLogo(res.assets[0]);
    });
  };

  const applyLogo = (asset: any) => {
    setLogoImage(asset);
    setValue('logo', asset.uri);
  };

  const removeLogo = () => {
    setLogoImage(null);
    setValue('logo', '');
  };

  const uploadLogo = async (teamId: number, file: any) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', {
      uri: file.uri,
      name: file.fileName || 'logo.jpg',
      type: file.type || 'image/jpeg',
    });
    const token = await AsyncStorage.getItem('access_token');
    await fetch(`${JAVA_API}teams/${teamId}/upload-logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      body: formData,
    });
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name.trim(),
      sportId: data.sport_id,
      description: data.description,
      teamType: data.team_type,
      teamFormat: parseInt(data.team_format, 10),
      skillLevel: data.skill_level,
      maxPlayers: parseInt(data.max_players, 10),
      city: data.city,
      ownerId: data.owner_id,
      isPublic: data.is_public,
    };
    try {
      const response = await authenticatedApi.post('teams/create', payload);
      const team = response.result.data;
      await uploadLogo(team.id, logoImage);
      Alert.alert('Success', 'Team created successfully!');
      navigate('team', { team_id: team.id });
    } catch (error) {
      Alert.alert('Error', (error as any).response?.data?.message || 'Failed to create team.');
    }
  };

  // ─── Shared render helpers ───────────────────────────────────────────────────

  const renderTextInput = (
    fieldName: keyof FormData,
    label: string,
    placeholder: string,
    rules: object = {},
    extra: object = {},
  ) => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      <Controller
        name={fieldName}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              value={value as string}
              onBlur={async () => { onBlur(); await trigger(fieldName); }}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={COLORS.grayscale400}
              style={[styles.textInput, errors[fieldName] && styles.inputError]}
              {...extra}
            />
            {errors[fieldName] && (
              <Text style={styles.errorText}>{(errors[fieldName] as any)?.message}</Text>
            )}
          </View>
        )}
      />
    </View>
  );

  const renderToggle = (fieldName: keyof FormData, label: string, sublabel?: string) => (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sublabel && <Text style={styles.toggleSublabel}>{sublabel}</Text>}
      </View>
      <Controller
        name={fieldName}
        control={control}
        render={({ field: { value, onChange } }) => (
          <Switch
            value={value as boolean}
            onValueChange={onChange}
            trackColor={{ false: COLORS.grayscale300, true: COLORS.primary }}
            thumbColor="#fff"
          />
        )}
      />
    </View>
  );

  // ─── Step renderers ──────────────────────────────────────────────────────────

  // Step 0 — Basic Info
  const renderStep0 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="info" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Basic Information</Text>
      </View>

      {renderTextInput('name', 'Team Name *', 'Enter team name', {
        required: 'Team name is required',
        minLength: { value: 3, message: 'At least 3 characters' },
      })}

      {/* Sport */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Sport *</Text>
        <Controller
          name="sport_id"
          control={control}
          rules={{ required: 'Sport is required' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <Dropdown
                style={[styles.dropdown, errors.sport_id && styles.inputError]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={sports}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select a sport"
                searchPlaceholder="Search..."
                value={value || ''}
                onBlur={async () => await trigger('sport_id')}
                onChange={item => { onChange(item.value); trigger('sport_id'); }}
              />
              {errors.sport_id && (
                <Text style={styles.errorText}>{errors.sport_id.message}</Text>
              )}
            </View>
          )}
        />
      </View>

      {/* Logo */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Team Logo</Text>
        {logoImage ? (
          <View style={styles.imagePreviewContainer}>
            <RNImage source={{ uri: logoImage.uri }} style={styles.logoPreview} />
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageActionBtn} onPress={pickImage}>
                <Icon name="edit" type="materialIcons" size={16} color={COLORS.primary} />
                <Text style={[styles.imageActionText, { color: COLORS.primary }]}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.imageActionBtn, styles.removeBtn]} onPress={removeLogo}>
                <Icon name="delete" type="materialIcons" size={16} color="#ef4444" />
                <Text style={[styles.imageActionText, { color: '#ef4444' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.imageUploadArea} onPress={pickImage}>
            <Icon name="add-photo-alternate" type="materialIcons" size={32} color={COLORS.grayscale400} />
            <Text style={styles.imageUploadText}>Tap to upload logo</Text>
            <Text style={styles.imageUploadHint}>Square image recommended</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderTextInput(
        'description',
        'Description *',
        'Describe your team...',
        {
          required: 'Description is required',
          minLength: { value: 10, message: 'At least 10 characters' },
        },
        { multiline: true, numberOfLines: 5, textAlignVertical: 'top', style: { minHeight: 110 } },
      )}
    </View>
  );

  // Step 1 — Team Details
  const TEAM_TYPE_OPTIONS: { value: TeamType; label: string; desc: string; icon: string }[] = [
    { value: 'men',    label: 'Men',    desc: 'Open to male players',          icon: 'man' },
    { value: 'women',  label: 'Women',  desc: 'Open to female players',        icon: 'woman' },
    { value: 'co_ed',  label: 'Co-Ed',  desc: 'Mixed gender team',             icon: 'people' },
    { value: 'youth',  label: 'Youth',  desc: 'Players under 18',              icon: 'child-care' },
    { value: 'over_30',label: 'Over 30',desc: 'Players aged 30 and above',     icon: 'elderly' },
  ];

  const FORMAT_OPTIONS: { value: TeamFormat; label: string; desc: string }[] = [
    { value: '5',  label: '5-a-side',  desc: 'Small-sided game, fast-paced'  },
    { value: '7',  label: '7-a-side',  desc: 'Mid-sized format, great for parks' },
    { value: '11', label: '11-a-side', desc: 'Full-pitch, standard match format' },
  ];

  const SKILL_OPTIONS: { value: SkillLevel; label: string; desc: string; icon: string }[] = [
    { value: 'beginner',     label: 'Beginner',     desc: 'Just starting out',           icon: 'star-outline' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Some experience',              icon: 'star-half' },
    { value: 'advanced',     label: 'Advanced',     desc: 'Highly skilled players',       icon: 'star' },
    { value: 'competitive',  label: 'Competitive',  desc: 'Tournament-level competition', icon: 'emoji-events' },
  ];

  const renderStep1 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="sports" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Team Details</Text>
      </View>

      {/* Team Type */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Team Type *</Text>
        <Controller
          name="team_type"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipGrid}>
              {TEAM_TYPE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, value === opt.value && styles.chipActive]}
                  onPress={() => onChange(opt.value)}
                >
                  <Icon
                    name={opt.icon}
                    type="materialIcons"
                    size={18}
                    color={value === opt.value ? '#fff' : COLORS.grayscale400}
                  />
                  <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Team Format */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Team Format *</Text>
        <Controller
          name="team_format"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={{ gap: 10 }}>
              {FORMAT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.formatCard, value === opt.value && styles.formatCardActive]}
                  onPress={() => onChange(opt.value)}
                >
                  <View style={styles.formatBadge}>
                    <Text style={[styles.formatBadgeNum, value === opt.value && { color: COLORS.primary }]}>
                      {opt.value}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.formatLabel, value === opt.value && styles.formatLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.formatDesc}>{opt.desc}</Text>
                  </View>
                  <View style={[styles.radio, value === opt.value && styles.radioActive]}>
                    {value === opt.value && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Skill Level */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Skill Level *</Text>
        <Controller
          name="skill_level"
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={styles.optionGrid}>
              {SKILL_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionCard, value === opt.value && styles.optionCardActive]}
                  onPress={() => onChange(opt.value)}
                >
                  <View style={[styles.optionIconWrap, value === opt.value && styles.optionIconWrapActive]}>
                    <Icon
                      name={opt.icon}
                      type="materialIcons"
                      size={22}
                      color={value === opt.value ? '#fff' : COLORS.grayscale400}
                    />
                  </View>
                  <Text style={[styles.optionLabel, value === opt.value && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                  {value === opt.value && (
                    <View style={styles.optionCheck}>
                      <Icon name="check-circle" type="materialIcons" size={16} color={COLORS.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {renderTextInput(
        'max_players',
        'Max Players *',
        'e.g. 20',
        {
          required: 'Max players is required',
          pattern: { value: /^\d+$/, message: 'Numbers only' },
          min: { value: 1, message: 'Must be at least 1' },
        },
        { keyboardType: 'numeric' },
      )}
    </View>
  );

  // Step 2 — Settings
  const renderStep2 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="settings" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>

      {/* City */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>City *</Text>
        <Controller
          name="city"
          control={control}
          rules={{ required: 'City is required' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <Dropdown
                style={[styles.dropdown, errors.city && styles.inputError]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={cities}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select a city"
                searchPlaceholder="Search..."
                value={value || ''}
                onBlur={async () => await trigger('city')}
                onChange={item => { onChange(item.value); trigger('city'); }}
              />
              {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
            </View>
          )}
        />
      </View>

      {renderTextInput('owner_id', 'Owner ID *', 'Enter owner user ID', {
        required: 'Owner ID is required',
      })}

      {/* Visibility */}
      <View style={styles.subsectionCard}>
        <Text style={styles.subsectionTitle}>Visibility</Text>
        {renderToggle('is_public', 'Public Team', 'Anyone can find and request to join')}
      </View>
    </View>
  );

  // ─── Step renderer map ───────────────────────────────────────────────────────

  const STEP_RENDERERS = [renderStep0, renderStep1, renderStep2];

  const stepInfo = STEPS[currentStep];
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Header title="Create Team" />

      {/* Step header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepMeta}>
          <Text style={styles.stepCounter}>Step {currentStep + 1} of {TOTAL_STEPS}</Text>
          <View style={styles.stepBadge}>
            <Icon name={stepInfo.icon} type="materialIcons" size={14} color={COLORS.primary} />
            <Text style={styles.stepBadgeText}>{stepInfo.label}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.stepDots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i < currentStep && styles.stepDotDone,
                i === currentStep && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {STEP_RENDERERS[currentStep]()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" type="materialIcons" size={16} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {isLastStep ? (
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={[styles.primaryButton, isSubmitting && { opacity: 0.6 }]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="check" type="materialIcons" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Create Team</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleNext} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Next</Text>
            <Icon name="arrow-forward" type="materialIcons" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },

  // Step header
  stepHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stepCounter: { fontSize: 12, color: '#999', fontWeight: '500' },
  stepBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0f4ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  stepBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: '#eee', borderRadius: 10, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 10 },
  stepDots: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd' },
  stepDotActive: { backgroundColor: COLORS.primary, width: 18 },
  stepDotDone: { backgroundColor: COLORS.primary, opacity: 0.4 },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

  // Form
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  textInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 15,
    color: '#111',
  },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },

  // Dropdown
  dropdown: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: SIZES.InputHeight || 48,
    justifyContent: 'center',
  },
  placeholderStyle: { color: '#9ca3af', fontSize: 14 },
  selectedTextStyle: { fontSize: 14, color: '#111' },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 30, fontSize: 14 },

  // Image
  imageUploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fafafa',
  },
  imageUploadText: { fontSize: 14, color: '#666', fontWeight: '500' },
  imageUploadHint: { fontSize: 11, color: '#aaa' },
  imagePreviewContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0' },
  logoPreview: { width: '100%', height: 120, resizeMode: 'contain', backgroundColor: '#f5f5f5' },
  imageActions: { flexDirection: 'row' },
  imageActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, backgroundColor: '#fafafa', borderTopWidth: 1, borderTopColor: '#eee' },
  removeBtn: { borderLeftWidth: 1, borderLeftColor: '#eee' },
  imageActionText: { fontSize: 13, fontWeight: '600' },

  // Chip row (team type)
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  chipTextActive: { color: '#fff' },

  // Format cards
  formatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formatCardActive: { borderColor: COLORS.primary, backgroundColor: '#f0f4ff' },
  formatBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatBadgeNum: { fontSize: 16, fontWeight: '800', color: '#888' },
  formatLabel: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 2 },
  formatLabelActive: { color: COLORS.primary },
  formatDesc: { fontSize: 12, color: '#888' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // Option cards (skill level)
  optionGrid: { gap: 12 },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    padding: 16,
    position: 'relative',
  },
  optionCardActive: { borderColor: COLORS.primary, backgroundColor: '#f0f4ff' },
  optionIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  optionIconWrapActive: { backgroundColor: COLORS.primary },
  optionLabel: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 2 },
  optionLabelActive: { color: COLORS.primary },
  optionDesc: { fontSize: 12, color: '#888' },
  optionCheck: { position: 'absolute', top: 12, right: 12 },

  // Settings
  subsectionCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e8e8e8', padding: 16, marginBottom: 16 },
  subsectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#222' },
  toggleSublabel: { fontSize: 12, color: '#888', marginTop: 1 },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  backButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddTeamScreen;