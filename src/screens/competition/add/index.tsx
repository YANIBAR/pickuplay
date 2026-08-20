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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Header, Icon, TextInput } from '@components';
import { useTranslation } from 'react-i18next';
import { authenticatedApi, publicApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAVA_API } from '@env';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Basic Info
  competitionName: string;
  sport: number;
  description: string;
  logo?: string;
  banner?: string;
  // Season
  seasonName: string;
  startDate: string;
  endDate: string;
  // Location
  city: string;
  country: string;
  defaultVenue?: string;
  // Visibility
  visibility: 'public' | 'private' | 'invite_only';
  // Registration
  registrationOpen: string;
  registrationClose: string;
  teamsNumber: string;
  minPlayersPerTeam: string;
  maxPlayersPerTeam: string;
  // How teams will be labeled/displayed, e.g. "Team A" vs "Team 1" vs "Yellow Team"
  teamNamingScheme: 'alphabet' | 'number' | 'color';
  // Format
  format: 'round_robin' | 'double_round_robin' | 'knockout' | 'group_stage' | 'custom';
  // Only used when format === 'custom'
  customFormatExplanation: string;
  // Settings
  pointsWin: string;
  pointsDraw: string;
  pointsLoss: string;
  enableReferees: boolean;
  enableStatistics: boolean;
  enablePlayerRatings: boolean;
  enableLiveScores: boolean;
}

type StepKey = 'basic' | 'season' | 'location' | 'visibility' | 'registration' | 'format' | 'settings';

const STEPS: { key: StepKey; label: string; icon: string }[] = [
  { key: 'basic',        label: 'Basic Info',    icon: 'info' },
  { key: 'season',       label: 'Season',        icon: 'event' },
  { key: 'location',     label: 'Location',      icon: 'place' },
  { key: 'visibility',   label: 'Visibility',    icon: 'lock' },
  { key: 'registration', label: 'Registration',  icon: 'group-add' },
  { key: 'format',       label: 'Format',        icon: 'sports' },
  { key: 'settings',     label: 'Settings',      icon: 'settings' },
];

const TOTAL_STEPS = STEPS.length;

// ─── Component ────────────────────────────────────────────────────────────────

const AddCompetitionScreen = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed

  // Pickers visibility
  const [isStartDateVisible, setStartDateVisible] = useState(false);
  const [isEndDateVisible, setEndDateVisible] = useState(false);
  const [isRegOpenVisible, setRegOpenVisible] = useState(false);
  const [isRegCloseVisible, setRegCloseVisible] = useState(false);

  // Images
  const [logoImage, setLogoImage] = useState<any>(null);
  const [bannerImage, setBannerImage] = useState<any>(null);

  // Dropdown data
  const [sports, setSports] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      competitionName: '',
      sport: 0,
      description: '',
      logo: '',
      banner: '',
      seasonName: '',
      startDate: '',
      endDate: '',
      city: '',
      country: '',
      defaultVenue: '',
      visibility: 'public',
      registrationOpen: '',
      registrationClose: '',
      teamsNumber: '',
      minPlayersPerTeam: '',
      maxPlayersPerTeam: '',
      teamNamingScheme: 'alphabet',
      format: 'round_robin',
      customFormatExplanation: '',
      pointsWin: '3',
      pointsDraw: '1',
      pointsLoss: '0',
      enableReferees: false,
      enableStatistics: true,
      enablePlayerRatings: false,
      enableLiveScores: false,
    },
    mode: 'onBlur',
  });

  const visibility = watch('visibility');
  const format = watch('format');
  const teamNamingScheme = watch('teamNamingScheme');

  // ─── Fetch data ─────────────────────────────────────────────────────────────

  const getSports = async () => {
    try {
      const response = await publicApi.get('games/sports');
      const list = response.result.data;
      setSports(list.map((s: any) => ({ label: s.name, value: s.id })).sort((a: any, b: any) => a.label.localeCompare(b.label)));
    } catch { setSports([]); }
  };

  const getCities = async () => {
    try {
      const response = await publicApi.get('cities');
      const list = response.result.data;
      setCities(list.map((c: any) => ({ label: c.name, value: c.name })).sort((a: any, b: any) => a.label.localeCompare(b.label)));
    } catch { setCities([]); }
  };

  const getCountries = async () => {
    try {
      const response = await publicApi.get('countries');
      const list = response.result.data;
      setCountries(list.map((c: any) => ({ label: c.name, value: c.code })).sort((a: any, b: any) => a.label.localeCompare(b.label)));
    } catch { setCountries([]); }
  };

  useEffect(() => {
    getSports();
    getCities();
    setCountries(["usa", "canada", "mexico"]); // Temporary until API is fixed
    getCountries();
  }, []);

  // ─── Formatters ─────────────────────────────────────────────────────────────

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateForAPI = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // ─── Image helpers ───────────────────────────────────────────────────────────

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

  const applyImage = (type: 'logo' | 'banner', asset: any) => {
    if (type === 'logo') { setLogoImage(asset); setValue('logo', asset.uri); }
    else { setBannerImage(asset); setValue('banner', asset.uri); }
  };

  const removeImage = (type: 'logo' | 'banner') => {
    if (type === 'logo') { setLogoImage(null); setValue('logo', ''); }
    else { setBannerImage(null); setValue('banner', ''); }
  };

  const uploadImage = async (id: number, file: any, endpoint: string) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', { uri: file.uri, name: file.fileName || 'image.jpg', type: file.type || 'image/jpeg' });
    const token = await AsyncStorage.getItem('access_token');
    await fetch(`${JAVA_API}competitions/${id}/${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      body: formData,
    });
  };

  // ─── Step validation ─────────────────────────────────────────────────────────

  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    0: ['competitionName', 'sport', 'description'],
    1: ['seasonName', 'startDate', 'endDate'],
    2: ['city', 'country'],
    3: ['visibility'],
    4: ['registrationOpen', 'registrationClose', 'teamsNumber', 'minPlayersPerTeam', 'maxPlayersPerTeam', 'teamNamingScheme'],
    5: ['format', 'customFormatExplanation'],
    6: ['pointsWin', 'pointsDraw', 'pointsLoss'],
  };

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = await trigger(fields);
    if (valid) setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleBack = () => setCurrentStep(s => Math.max(s - 1, 0));

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.competitionName.trim(),
      sportId: data.sport,
      description: data.description,
      seasonName: data.seasonName,
      startDate: data.startDate,
      endDate: data.endDate,
      city: data.city,
      country: data.country,
      defaultVenue: data.defaultVenue || null,
      visibility: data.visibility,
      registrationOpen: data.registrationOpen,
      registrationClose: data.registrationClose,
      teamsNumber: parseInt(data.teamsNumber, 10),
      minPlayersPerTeam: parseInt(data.minPlayersPerTeam, 10),
      maxPlayersPerTeam: parseInt(data.maxPlayersPerTeam, 10),
      teamNamingScheme: data.teamNamingScheme,
      format: data.format,
      customFormatExplanation: data.format === 'custom' ? data.customFormatExplanation : null,
      pointsWin: parseInt(data.pointsWin, 10),
      pointsDraw: parseInt(data.pointsDraw, 10),
      pointsLoss: parseInt(data.pointsLoss, 10),
      enableReferees: data.enableReferees,
      enableStatistics: data.enableStatistics,
      enablePlayerRatings: data.enablePlayerRatings,
      enableLiveScores: data.enableLiveScores,
    };
    try {
      const response = await authenticatedApi.post('competitions/create', payload);
      const competition = response.result.data;
      await Promise.all([
        uploadImage(competition.id, logoImage, 'upload-logo'),
        uploadImage(competition.id, bannerImage, 'upload-banner'),
      ]);
      Alert.alert('Success', 'Competition created successfully!');
      navigate('competition', { competition_id: competition.id });
    } catch (error) {
      Alert.alert('Error', (error as any).response?.data?.message || 'Failed to create competition.');
    }
  };

  // ─── Shared render helpers ───────────────────────────────────────────────────

  const renderDateButton = (label: string, fieldName: keyof FormData, onPress: () => void) => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label} *</Text>
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
              <Text style={{ color: value ? COLORS.black : COLORS.grayscale400, fontSize: 14 }}>
                {value ? formatDate(value as string) : `Select ${label}`}
              </Text>
              <Icon name="calendar-today" type="materialIcons" size={18} color={COLORS.grayscale400} />
            </TouchableOpacity>
            {errors[fieldName] && <Text style={styles.errorText}>{(errors[fieldName] as any)?.message}</Text>}
          </View>
        )}
      />
    </View>
  );

  const renderTextInput = (
    fieldName: keyof FormData,
    label: string,
    placeholder: string,
    rules: object = {},
    extra: object = {}
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
            {errors[fieldName] && <Text style={styles.errorText}>{(errors[fieldName] as any)?.message}</Text>}
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

  const renderImagePicker = (type: 'logo' | 'banner', label: string, image: any, fieldName: keyof FormData) => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      {image ? (
        <View style={styles.imagePreviewContainer}>
          <RNImage
            source={{ uri: image.uri }}
            style={type === 'logo' ? styles.logoPreview : styles.bannerPreview}
          />
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.imageActionBtn} onPress={() => pickImage(type)}>
              <Icon name="edit" type="materialIcons" size={16} color={COLORS.primary} />
              <Text style={[styles.imageActionText, { color: COLORS.primary }]}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.imageActionBtn, styles.removeBtn]} onPress={() => removeImage(type)}>
              <Icon name="delete" type="materialIcons" size={16} color="#ef4444" />
              <Text style={[styles.imageActionText, { color: '#ef4444' }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.imageUploadArea} onPress={() => pickImage(type)}>
          <Icon name="add-photo-alternate" type="materialIcons" size={32} color={COLORS.grayscale400} />
          <Text style={styles.imageUploadText}>Tap to {type === 'logo' ? 'upload logo' : 'add banner'}</Text>
          <Text style={styles.imageUploadHint}>{type === 'logo' ? 'Square image recommended' : 'Landscape image recommended'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ─── Step renderers ──────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="info" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Basic Information</Text>
      </View>

      {renderTextInput('competitionName', 'Competition Name *', 'Enter competition name', {
        required: 'Competition name is required',
        minLength: { value: 3, message: 'At least 3 characters' },
      })}

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Sport *</Text>
        <Controller
          name="sport"
          control={control}
          rules={{ required: 'Sport is required' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <Dropdown
                style={[styles.dropdown, errors.sport && styles.inputError]}
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
                onBlur={async () => await trigger('sport')}
                onChange={item => { onChange(item.value); trigger('sport'); }}
              />
              {errors.sport && <Text style={styles.errorText}>{errors.sport.message}</Text>}
            </View>
          )}
        />
      </View>

      {renderImagePicker('logo', 'Competition Logo', logoImage, 'logo')}
      {renderImagePicker('banner', 'Competition Banner', bannerImage, 'banner')}

      {renderTextInput('description', 'Description *', 'Describe the competition...', {
        required: 'Description is required',
        minLength: { value: 10, message: 'At least 10 characters' },
      }, { multiline: true, numberOfLines: 5, textAlignVertical: 'top', style: { minHeight: 110 } })}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="event" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Season</Text>
      </View>

      {renderTextInput('seasonName', 'Season Name *', 'e.g. Season 2025', {
        required: 'Season name is required',
      })}

      {renderDateButton('Start Date', 'startDate', () => setStartDateVisible(true))}
      <DateTimePickerModal
        isVisible={isStartDateVisible}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => { setValue('startDate', formatDateForAPI(date)); trigger('startDate'); setStartDateVisible(false); }}
        onCancel={() => setStartDateVisible(false)}
      />

      {renderDateButton('End Date', 'endDate', () => setEndDateVisible(true))}
      <DateTimePickerModal
        isVisible={isEndDateVisible}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => { setValue('endDate', formatDateForAPI(date)); trigger('endDate'); setEndDateVisible(false); }}
        onCancel={() => setEndDateVisible(false)}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="place" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Location</Text>
      </View>

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



      {renderTextInput('defaultVenue', 'Default Venue (optional)', 'e.g. City Sports Arena')}
    </View>
  );

  const VISIBILITY_OPTIONS: { value: FormData['visibility']; label: string; desc: string; icon: string }[] = [
    { value: 'public',      label: 'Public',      desc: 'Anyone can find and join',             icon: 'public' },
    { value: 'private',     label: 'Private',     desc: 'Only you and admins can see it',       icon: 'lock' },
    { value: 'invite_only', label: 'Invite Only', desc: 'Visible but join by invitation only',  icon: 'mail' },
  ];

  // TODO: revisit this step later — visibility settings currently only cover
  // the competition itself (public/private/invite_only). Still need to add
  // comment visibility controls (e.g. who can comment: everyone / members
  // only / off) once that's designed.
  const renderStep3 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="lock" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Visibility</Text>
      </View>

      <Controller
        name="visibility"
        control={control}
        render={({ field: { onChange, value } }) => (
          <View style={styles.optionGrid}>
            {VISIBILITY_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionCard, value === opt.value && styles.optionCardActive]}
                onPress={() => onChange(opt.value)}
              >
                <View style={[styles.optionIconWrap, value === opt.value && styles.optionIconWrapActive]}>
                  <Icon name={opt.icon} type="materialIcons" size={22} color={value === opt.value ? '#fff' : COLORS.grayscale400} />
                </View>
                <Text style={[styles.optionLabel, value === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
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
  );

  const TEAM_NAMING_OPTIONS: { label: string; value: FormData['teamNamingScheme'] }[] = [
    { label: 'Alphabet (Team A, Team B...)', value: 'alphabet' },
    { label: 'Number (Team 1, Team 2...)',   value: 'number' },
    { label: 'Color (Yellow Team, Blue Team...)', value: 'color' },
  ];

  const renderStep4 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="group-add" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Registration</Text>
      </View>

      {renderDateButton('Registration Opens', 'registrationOpen', () => setRegOpenVisible(true))}
      <DateTimePickerModal
        isVisible={isRegOpenVisible}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => { setValue('registrationOpen', formatDateForAPI(date)); trigger('registrationOpen'); setRegOpenVisible(false); }}
        onCancel={() => setRegOpenVisible(false)}
      />

      {renderDateButton('Registration Closes', 'registrationClose', () => setRegCloseVisible(true))}
      <DateTimePickerModal
        isVisible={isRegCloseVisible}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => { setValue('registrationClose', formatDateForAPI(date)); trigger('registrationClose'); setRegCloseVisible(false); }}
        onCancel={() => setRegCloseVisible(false)}
      />

      {renderTextInput('teamsNumber', 'Teams Number *', 'e.g. 16', {
        required: 'Required',
        pattern: { value: /^\d+$/, message: 'Numbers only' },
      }, { keyboardType: 'numeric' })}

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Team Naming *</Text>
        <Controller
          name="teamNamingScheme"
          control={control}
          rules={{ required: 'Team naming is required' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <Dropdown
                style={[styles.dropdown, errors.teamNamingScheme && styles.inputError]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={TEAM_NAMING_OPTIONS}
                maxHeight={250}
                labelField="label"
                valueField="value"
                placeholder="Select how teams are shown"
                value={value}
                onBlur={async () => await trigger('teamNamingScheme')}
                onChange={item => { onChange(item.value); trigger('teamNamingScheme'); }}
              />
              {errors.teamNamingScheme && <Text style={styles.errorText}>{errors.teamNamingScheme.message}</Text>}
            </View>
          )}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          {renderTextInput('minPlayersPerTeam', 'Min Players / Team *', 'e.g. 7', {
            required: 'Required',
            pattern: { value: /^\d+$/, message: 'Numbers only' },
          }, { keyboardType: 'numeric' })}
        </View>
        <View style={{ flex: 1 }}>
          {renderTextInput('maxPlayersPerTeam', 'Max Players / Team *', 'e.g. 15', {
            required: 'Required',
            pattern: { value: /^\d+$/, message: 'Numbers only' },
          }, { keyboardType: 'numeric' })}
        </View>
      </View>
    </View>
  );

  const FORMAT_OPTIONS: { value: FormData['format']; label: string; desc: string }[] = [
    { value: 'round_robin',        label: 'Round Robin',        desc: 'Everyone plays everyone once' },
    { value: 'double_round_robin', label: 'Double Round Robin', desc: 'Everyone plays everyone twice' },
    { value: 'knockout',           label: 'Knockout',           desc: 'Single-elimination brackets' },
    { value: 'group_stage',        label: 'Group Stage',        desc: 'Groups then knockout rounds' },
    { value: 'custom',             label: 'Custom',             desc: 'You define the structure' },
  ];

  const renderStep5 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="sports" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Competition Format</Text>
      </View>

      <Controller
        name="format"
        control={control}
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: 10 }}>
            {FORMAT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.formatCard, value === opt.value && styles.formatCardActive]}
                onPress={() => onChange(opt.value)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formatLabel, value === opt.value && styles.formatLabelActive]}>{opt.label}</Text>
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

      {format === 'custom' && (
        <View style={{ marginTop: 16 }}>
          {renderTextInput(
            'customFormatExplanation',
            'Explain how your custom format works *',
            'Describe how matches, standings, and progression work for this format...',
            {
              validate: (value: string) =>
                format !== 'custom' || !!value?.trim() || 'Please explain how your custom format works',
            },
            { multiline: true, numberOfLines: 5, textAlignVertical: 'top', style: { minHeight: 110 } }
          )}
        </View>
      )}
    </View>
  );

  const renderStep6 = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Icon name="settings" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>

      {/* Points */}
      <View style={styles.subsectionCard}>
        <Text style={styles.subsectionTitle}>Points System</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            {renderTextInput('pointsWin', 'Win', '3', {
              required: 'Required',
              pattern: { value: /^\d+$/, message: 'Numbers only' },
            }, { keyboardType: 'numeric' })}
          </View>
          <View style={{ flex: 1 }}>
            {renderTextInput('pointsDraw', 'Draw', '1', {
              required: 'Required',
              pattern: { value: /^\d+$/, message: 'Numbers only' },
            }, { keyboardType: 'numeric' })}
          </View>
          <View style={{ flex: 1 }}>
            {renderTextInput('pointsLoss', 'Loss', '0', {
              required: 'Required',
              pattern: { value: /^\d+$/, message: 'Numbers only' },
            }, { keyboardType: 'numeric' })}
          </View>
        </View>
      </View>

      {/* Feature toggles */}
      <View style={styles.subsectionCard}>
        <Text style={styles.subsectionTitle}>Enable Features</Text>
        {renderToggle('enableReferees', 'Referees', 'Assign referees to matches')}
        <View style={styles.divider} />
        {renderToggle('enableStatistics', 'Statistics', 'Track goals, assists, cards and more')}
        <View style={styles.divider} />
        {renderToggle('enablePlayerRatings', 'Player Ratings', 'Let fans rate player performances')}
        <View style={styles.divider} />
        {renderToggle('enableLiveScores', 'Live Scores', 'Broadcast scores in real-time')}
      </View>
    </View>
  );

  const STEP_RENDERERS = [
    renderStep0,
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
  ];

  const stepInfo = STEPS[currentStep];
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Header title="Create Competition" />

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
        {/* Mini step dots */}
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
                <Text style={styles.primaryButtonText}>Create Competition</Text>
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

  // Date button
  dateButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: SIZES.InputHeight || 48,
  },

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
  bannerPreview: { width: '100%', height: 160, resizeMode: 'cover' },
  imageActions: { flexDirection: 'row' },
  imageActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, backgroundColor: '#fafafa', borderTopWidth: 1, borderTopColor: '#eee' },
  removeBtn: { borderLeftWidth: 1, borderLeftColor: '#eee' },
  imageActionText: { fontSize: 13, fontWeight: '600' },

  // Visibility options
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

  // Format cards
  formatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatCardActive: { borderColor: COLORS.primary, backgroundColor: '#f0f4ff' },
  formatLabel: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 2 },
  formatLabelActive: { color: COLORS.primary },
  formatDesc: { fontSize: 12, color: '#888' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // Settings
  subsectionCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e8e8e8', padding: 16, marginBottom: 16 },
  subsectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#222' },
  toggleSublabel: { fontSize: 12, color: '#888', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },

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

export default AddCompetitionScreen;