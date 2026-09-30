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
import { Button, Header, Icon } from '@components';
import Input from '@components/Input';
import { useTranslation } from 'react-i18next';
import { publicApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import styles from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Basic Info
  LeagueName: string;
  competitionName: string;
  sport: number;
  description: string;
  logo?: string;
  banner?: string;
  // Season / Schedule
  seasonName: string;
  startDate: string;
  // Time of day the league kicks off, combined with startDate to build the API's `dateTime`
  eventTime: string;
  // Location
  city: string;
  address: string;
  // Visibility
  visibility: 'public' | 'private' | 'invite_only';
  // Registration
  registrationOpen: string;
  registrationClose: string;
  teamsNumber: string;
  teamSize: string;
  nbrOfSubs: string;
  // How teams will be labeled/displayed, e.g. "Team A" vs "Team 1" vs "Yellow Team"
  teamNamingScheme: 'alphabet' | 'number' | 'color';
  // Eligibility & pricing
  pricePlayer: string;
  gender: 'Men' | 'Women' | 'CoEd';
  minimumAge: string;
  // Format
  format: 'round_robin' | 'double_round_robin' | 'knockout' | 'group_stage' | 'custom';
  // Only used when format === 'custom'
  customFormatExplanation: string;
  enableReferees: boolean;
  enablePennies: boolean;
  enablePrize: boolean;
  // Extra note sent to the API as `comment`
  comment: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AddCompetitionScreen = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation();

  // Pickers visibility
  const [isStartDateVisible, setStartDateVisible] = useState(false);
  const [isRegOpenVisible, setRegOpenVisible] = useState(false);
  const [isRegCloseVisible, setRegCloseVisible] = useState(false);

  // Images
  const [logoImage, setLogoImage] = useState<any>(null);
  const [bannerImage, setBannerImage] = useState<any>(null);

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
    shouldUnregister: false,
    defaultValues: {
      LeagueName: "",
      competitionName: '',
      sport: 0,
      description: '',
      logo: '',
      banner: '',
      seasonName: '',
      startDate: '',
      eventTime: '10:00',
      city: '',
      address: '',
      visibility: 'public',
      registrationOpen: '',
      registrationClose: '',
      teamsNumber: '',
      teamSize: '',
      nbrOfSubs: '',
      teamNamingScheme: 'alphabet',
      pricePlayer: '',
      gender: 'CoEd',
      minimumAge: '',
      format: 'round_robin',
      customFormatExplanation: '',
      enableReferees: false,
      enablePennies: false,
      enablePrize: false,
      comment: '',
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

  useEffect(() => {
    getSports();
    getCities();
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

  // ─── League API helpers ─────────────────────────────────────────────────────

  // Maps the wizard's internal format keys to the values the /leagues endpoint expects
  const FORMAT_API_MAP: Record<FormData['format'], string> = {
    round_robin: 'RoundRobin',
    double_round_robin: 'DoubleRoundRobin',
    knockout: 'Knockout',
    group_stage: 'GroupStage',
    custom: 'Custom',
  };

  // Auto-generates the `teamNames` list the API expects, based on how many teams
  // were requested and the chosen naming scheme (color/number/alphabet)
  const buildTeamNames = (count: number, scheme: FormData['teamNamingScheme']): string[] => {
    const n = Math.max(0, count || 0);
    if (scheme === 'color') {
      const colors = ['Yellow', 'Red', 'Green', 'Blue', 'Orange', 'Purple', 'Black', 'White', 'Pink', 'Teal'];
      return Array.from({ length: n }, (_, i) => colors[i % colors.length]);
    }
    if (scheme === 'number') {
      return Array.from({ length: n }, (_, i) => `Team ${i + 1}`);
    }
    return Array.from({ length: n }, (_, i) => `Team ${String.fromCharCode(65 + (i % 26))}`);
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    const body = new FormData();
    body.append('name', data.competitionName);
    body.append('city', data.city);
    body.append('address', data.address);
    body.append('sportTypeId', data.sport);
    body.append('dateTime', data.startDate);
    body.append('startRegistration', data.registrationOpen);
    body.append('endRegistration', data.registrationClose);
    body.append('nbrOfTeams', data.teamsNumber);
    body.append('teamSize', data.teamSize);
    body.append('nbrOfSubs', data.nbrOfSubs);
    body.append('format', FORMAT_API_MAP[data.format]);
    body.append('pricePlayer', data.pricePlayer || '0');
    body.append('description', data.description);
    body.append('gender', data.gender);
    body.append('minimumAge', data.minimumAge || '0');
    body.append('referee', data.enableReferees ? 1 : 0);
    body.append('prize', data.enablePrize ? 1 : 0);
    body.append('pennies', data.enablePennies ? 1 : 0);
    body.append('organizerId', 1);
    body.append('teamNamingScheme', data.teamNamingScheme);

  if (logoImage) {
    body.append('logo', {
      uri: logoImage.uri,
      name: logoImage.fileName || 'logo.jpg',
      type: logoImage.type || 'image/jpeg',
    } as any);
  }
  if (bannerImage) {
    body.append('coverphoto', {
      uri: bannerImage.uri,
      name: bannerImage.fileName || 'coverphoto.jpg',
      type: bannerImage.type || 'image/jpeg',
    } as any);
  }
  try {

      const token = await AsyncStorage.getItem('access_token');
    const response = await fetch(`http://localhost:3000/competition/`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
            body: body,
          });

    const text = await response.data;
    console.log('raw response:', JSON.stringify(text));

    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    // Handle success responses with an empty body (e.g. 201/204, no JSON returned)
    const json = text.trim().length > 0 ? JSON.parse(text) : null;
    const league = json?.result?.data ?? json;

    Alert.alert('Success', 'League created successfully!');
    navigate('competition', { competition_id: league?.id });
  } catch (error) {
    console.log('CAUGHT ERROR:', error);
    Alert.alert('Error', (error as any).message || 'Failed to create league.');
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
          <Input
            id={fieldName as string}
            value={value as string}
            onInputChanged={(_id, text) => onChange(text)}
            onBlur={async () => { onBlur(); await trigger(fieldName); }}
            placeholder={placeholder}
            placeholderTextColor={COLORS.grayscale400}
            errorText={
              errors[fieldName]
                ? [(errors[fieldName] as any)?.message as string]
                : undefined
            }
            {...extra}
          />
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
      {renderImagePicker('banner', 'Cover Photo', bannerImage, 'banner')}

      {renderTextInput('description', 'Description *', 'Describe the competition...', {
        required: 'Description is required',
        minLength: { value: 10, message: 'At least 10 characters' },
      }, { multiline: true, numberOfLines: 5, textAlignVertical: 'top', style: { minHeight: 110 } })}

    </View>
  );

  const renderStep1 = () => (
    <View>
      <View style={styles.divider} />
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

      {renderTextInput('eventTime', 'Kickoff Time *', 'e.g. 10:00', {
        required: 'Kickoff time is required',
        pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Use 24h HH:mm format' },
      }, { keyboardType: 'numbers-and-punctuation' })}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <View style={styles.divider} />
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



      {renderTextInput('address', 'Address *', 'e.g. 123 Main St', {
        required: 'Address is required',
      })}

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
      <View style={styles.divider} />
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

  const GENDER_OPTIONS: { label: string; value: FormData['gender'] }[] = [
    { label: 'Co-Ed', value: 'CoEd' },
    { label: 'Men', value: 'Men' },
    { label: 'Women', value: 'Women' },
  ];

  const TEAM_NAMING_OPTIONS: { label: string; value: FormData['teamNamingScheme'] }[] = [
    { label: 'Alphabet (Team A, Team B...)', value: 'alphabet' },
    { label: 'Number (Team 1, Team 2...)',   value: 'number' },
    { label: 'Color (Yellow Team, Blue Team...)', value: 'color' },
  ];

  const renderStep4 = () => (
    <View>
      <View style={styles.divider} />
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
          {renderTextInput('teamSize', 'Min Players / Team *', 'e.g. 7', {
            required: 'Required',
            pattern: { value: /^\d+$/, message: 'Numbers only' },
          }, { keyboardType: 'numeric' })}
        </View>
        <View style={{ flex: 1 }}>
          {renderTextInput('nbrOfSubs', 'Max Players / Team *', 'e.g. 15', {
            required: 'Required',
            pattern: { value: /^\d+$/, message: 'Numbers only' },
          }, { keyboardType: 'numeric' })}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          {renderTextInput('pricePlayer', 'Price / Player *', 'e.g. 10', {
            required: 'Required',
            pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Enter a valid amount' },
          }, { keyboardType: 'decimal-pad' })}
        </View>
        <View style={{ flex: 1 }}>
          {renderTextInput('minimumAge', 'Minimum Age *', 'e.g. 16', {
            required: 'Required',
            pattern: { value: /^\d+$/, message: 'Numbers only' },
          }, { keyboardType: 'numeric' })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Gender *</Text>
        <Controller
          name="gender"
          control={control}
          rules={{ required: 'Gender is required' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <Dropdown
                style={[styles.dropdown, errors.gender && styles.inputError]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={GENDER_OPTIONS}
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder="Select gender eligibility"
                value={value}
                onBlur={async () => await trigger('gender')}
                onChange={item => { onChange(item.value); trigger('gender'); }}
              />
              {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}
            </View>
          )}
        />
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
      <View style={styles.divider} />
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
      <View style={styles.divider} />
      <View style={styles.sectionHeader}>
        <Icon name="settings" type="materialIcons" size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>



      {/* Feature toggles */}
      <View style={styles.subsectionCard}>
        <Text style={styles.subsectionTitle}>Enable Features</Text>
        {renderToggle('enableReferees', 'Referees', 'Assign referees to matches')}
        <View style={styles.divider} />
        {renderToggle('enablePennies', 'Pennies', 'Assign pennies to matches')}
        <View style={styles.divider} />
        {renderToggle('enablePrize', 'Prizes', 'Assign prizes to matches')}
        <View style={styles.divider} />
      </View>

      {renderTextInput(
        'comment',
        'Additional Comment (optional)',
        'Anything else players should know about this league...',
        {},
        { multiline: true, numberOfLines: 4, textAlignVertical: 'top', style: { minHeight: 90 } }
      )}
    </View>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Header title="Create Competition" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep0()}
        {renderStep1()}
        {renderStep2()}
        {renderStep3()}
        {renderStep4()}
        {renderStep5()}
        {renderStep6()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
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
      </View>
    </SafeAreaView>
  );
};

export default AddCompetitionScreen;