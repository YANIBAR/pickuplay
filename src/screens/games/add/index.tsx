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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Header, Icon, TextInput } from '@components';
import { useTranslation } from 'react-i18next';
import { authenticatedApi, publicApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { parseTime } from '@utils/dateUtils';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAVA_API } from '@env';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

interface FormData {
  title: string;
  description: string;
  sportType: string;
  address: string;
  city: string;
  startTime: string;
  endTime: string;
  numPlayers: string;
  isPrivate: boolean;
  pricePerPlayer: string;
  image?: string;
}

const AddGameScreen = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const [step, setStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sportTypeFocus, setSportTypeFocus] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [sports, setSports] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      sportType: undefined,
      address: '',
      city: undefined,
      startTime: '',
      endTime: '',
      numPlayers: '',
      isPrivate: true,
      pricePerPlayer: '',
      image: '',
    },
    mode: 'onBlur',
  });

  const isPrivate = watch('isPrivate');

  const PLAYER_OPTIONS = [
    { label: '2v2', value: '4' },
    { label: '3v3', value: '6' },
    { label: '4v4', value: '8' },
    { label: '5v5', value: '10' },
    { label: '6v6', value: '12' },
    { label: '7v7', value: '14' },
    { label: '8v8', value: '16' },
    { label: '9v9', value: '18' },
    { label: '10v10', value: '20' },
    { label: '11v11', value: '22' },
  ];

  const getSports = async (): Promise<void> => {
    try {
      const response = await publicApi.get('games/sports');
      const sportsList = response.result.data;
      setSports(
        sportsList
          .map((sport: any) => ({ label: sport.name, value: sport.id }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label))
      );
    } catch (error) {
      Alert.alert('Error', (error as any).response?.data?.message);
      setSports([]);
    }
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
    getSports();
    getCities();
  }, []);

  // ─── Formatters ───────────────────────────────────────────────────────────

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  };

  const formatTimeForAPI = (timeString: string): string => {
    if (!timeString || !timeString.includes(':')) return '00:00';
    const [time, period] = timeString.split(' ');
    if (!time || !period) return '00:00';
    let [hours, minutes] = time.split(':');
    let hoursNum = parseInt(hours, 10);
    if (period === 'pm' && hoursNum !== 12) hoursNum += 12;
    else if (period === 'am' && hoursNum === 12) hoursNum = 0;
    return `${String(hoursNum).padStart(2, '0')}:${minutes}`;
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ─── Validation ───────────────────────────────────────────────────────────

  const isGameDurationValid = (startTime: string, endTime: string) => {
    const startParsed = parseTime(startTime);
    const endParsed = parseTime(endTime);
    const start = new Date();
    start.setHours(startParsed.hours, startParsed.minutes, 0);
    const end = new Date();
    end.setHours(endParsed.hours, endParsed.minutes, 0);
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diffInHours > 0 && diffInHours <= 3;
  };

  const isStartTimeValid = (date: Date, startTime: string) => {
    const { hours, minutes } = parseTime(startTime);
    const gameStart = new Date(date);
    gameStart.setHours(hours, minutes, 0);
    const diffInHours = (gameStart.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return diffInHours >= 2;
  };

  // ─── Image ────────────────────────────────────────────────────────────────

  const uploadImage = async (id: number, file: any) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', {
      uri: file.uri,
      name: file.fileName || 'default-image.jpg',
      type: file.type || 'image/jpeg',
    });
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${JAVA_API}games/${id}/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Image upload failed');
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how to select an image',
      [
        { text: 'Camera', onPress: launchCameraForImage },
        { text: 'Photo Library', onPress: launchGalleryForImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const launchCameraForImage = () => {
    launchCamera({ mediaType: 'photo', cameraType: 'back', quality: 0.8 }, response => {
      if (!response.didCancel && !response.errorCode && response.assets?.[0]) {
        setSelectedImage(response.assets[0]);
        setValue('image', response.assets[0].uri!);
        trigger('image');
      }
    });
  };

  const launchGalleryForImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, response => {
      if (!response.didCancel && !response.errorCode && response.assets?.[0]) {
        setSelectedImage(response.assets[0]);
        setValue('image', response.assets[0].uri!);
        trigger('image');
      }
    });
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setValue('image', '');
    trigger('image');
  };

  // ─── Steps ────────────────────────────────────────────────────────────────

  const validateStep1 = async () => {
    return await trigger(['title', 'sportType', 'description', 'image']);
  };

  const handleNextStep = async () => {
    if (await validateStep1()) {
      setCurrentStep(2);
      setStep(2);
    }
  };

  const handlePreviousStep = () => setCurrentStep(1);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    console.log('Form Data:', data);
    data.sportType = "1";
    const validationRules = [
      { condition: !data.title?.trim(), message: 'Title is required' },
      { condition: !data.city?.trim(), message: 'City is required' },
      { condition: !data.city?.trim(), message: 'City is required' },
      { condition: !data.address?.trim(), message: 'Address is required' },
      { condition: !data.startTime?.trim(), message: 'Start time is required' },
      { condition: !data.endTime?.trim(), message: 'End time is required' },
      { condition: !data.numPlayers?.trim(), message: 'Number of players is required' },
      { condition: !isPrivate && !data.image, message: 'Image is required for public games' },
    ];

    const validationError = validationRules.find(r => r.condition);
    if (validationError) {
      Alert.alert('Validation Error', validationError.message);
      return;
    }

    if (!isGameDurationValid(data.startTime, data.endTime)) {
      Alert.alert('', 'Game duration cannot exceed 3 hours.');
      return;
    }

    if (!isStartTimeValid(selectedDate, data.startTime)) {
      Alert.alert('Error', 'Game must start at least 2 hours from now.');
      return;
    }

    const payload = {
      title: data.title.trim(),
      description: data.description,
      sportType: data.sportType,
      city: data.city,
      address: data.address.trim(),
      date: formatDateForAPI(selectedDate),
      startTime: formatTimeForAPI(data.startTime),
      endTime: formatTimeForAPI(data.endTime),
      nbrSpots: parseInt(data.numPlayers, 10),
      price: parseFloat(data.pricePerPlayer) || 0,
    };

    try {
      const response = await authenticatedApi.post('games/create', payload);
      const game = response.result.data;
      await uploadImage(game.id, selectedImage);
      Alert.alert(t('common.success'), t('add_game.game_created'));
      navigate('game', { game_id: game.id });
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.message || 'Failed to create game. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header title={`${t('schedule.createGame')} — ${formatDate(selectedDate)}`} />

      {/* Step Indicator */}
      
      {/* Step Indicator */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepText}>Step {step} of 2</Text>
        <Text style={styles.stepTitle}>
          {step === 1 ? "Game Info" : "Location & Time"}
        </Text>
      </View>

      {/* Progress Bar (optional but nice UX) */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progress,
            { width: step === 1 ? "50%" : "100%" },
          ]}
        />
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {currentStep === 1 ? (
            // ── Step 1: Basic Info ──────────────────────────────────────────
            <View>
              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('schedule.title')} *</Text>
                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: t('schedule.enterTitle'),
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        value={value}
                        onBlur={async () => { onBlur(); await trigger('title'); }}
                        onChangeText={onChange}
                        placeholder={t('schedule.enterTitle')}
                        placeholderTextColor={COLORS.black}
                        style={[styles.textInput, errors?.title && { borderColor: 'red' }]}
                      />
                      {errors?.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                    </View>
                  )}
                />
              </View>
                  {/* City */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('add_game.sportType')} eee*</Text>
                <Controller
                  name="sportType"
                  control={control}
                  rules={{ required: 'sportType is required' }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Dropdown
                        style={[styles.dropdown, errors?.sportType && { borderColor: 'red' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={sports}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={t('add_game.select_sport')}
                        searchPlaceholder={t('schedule.search')}
                        value={value}
                        onBlur={async () => await trigger('sportType')}
                        onChange={item => onChange(item.value)}
                      />
                      {errors?.sportType && <Text style={styles.errorText}>{errors.sportType.message}</Text>}
                    </View>
                  )}
                />
              </View>

              {/* Players & Price */}
              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {/* Number of Players */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>{t('schedule.numberOfPlayers')} *</Text>
                    <Controller
                      name="numPlayers"
                      control={control}
                      rules={{ required: 'Number of players is required' }}
                      render={({ field: { onChange, value } }) => (
                        <View>
                          <TouchableOpacity
                            style={[styles.dropdown, errors?.numPlayers && { borderColor: 'red' }]}
                            onPress={() => setDropdownOpen(!dropdownOpen)}
                          >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ color: value ? COLORS.black : COLORS.gray }}>
                                {PLAYER_OPTIONS.find(opt => opt.value === value)?.label || t('schedule.selectPlayers')}
                              </Text>
                              <Icon
                                size={20}
                                name={dropdownOpen ? 'expand-less' : 'expand-more'}
                                type="materialIcons"
                              />
                            </View>
                          </TouchableOpacity>

                          {dropdownOpen && (
                            <View style={styles.dropdownMenu}>
                              <ScrollView>
                                {PLAYER_OPTIONS.map(option => (
                                  <TouchableOpacity
                                    key={option.value}
                                    style={styles.dropdownItem}
                                    onPress={() => { onChange(option.value); setDropdownOpen(false); }}
                                  >
                                    <Text style={{
                                      color: value === option.value ? COLORS.primary : COLORS.black,
                                      fontWeight: value === option.value ? '600' : '400',
                                    }}>
                                      {option.label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                          {errors?.numPlayers && <Text style={styles.errorText}>{errors.numPlayers.message}</Text>}
                        </View>
                      )}
                    />
                  </View>

                  {/* Price Per Player */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>{t('schedule.pricePerPlayer')}</Text>
                    <Controller
                      name="pricePerPlayer"
                      control={control}
                      rules={{
                        pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Invalid price format' },
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                          <TextInput
                            value={value}
                            onBlur={async () => { onBlur(); await trigger('pricePerPlayer'); }}
                            onChangeText={onChange}
                            placeholder="0.00"
                            placeholderTextColor={COLORS.black}
                            keyboardType="decimal-pad"
                            style={[styles.textInput, errors?.pricePerPlayer && { borderColor: 'red' }]}
                          />
                          {errors?.pricePerPlayer && <Text style={styles.errorText}>{errors.pricePerPlayer.message}</Text>}
                        </View>
                      )}
                    />
                  </View>
                </View>
              </View>

              {/* Image */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('schedule.selectImage')} *</Text>
                <Controller
                  name="image"
                  control={control}
                  rules={{ required: !isPrivate ? 'Image is required' : false }}
                  render={({ field: { value } }) => (
                    <View>
                      <TouchableOpacity
                        style={[styles.imageButton, errors?.image && { borderColor: 'red' }]}
                        onPress={handleImagePicker}
                      >
                        <Text style={styles.imageButtonText}>
                          {value ? t('schedule.changeImage') : t('schedule.selectImage')}
                        </Text>
                      </TouchableOpacity>
                      {value && (
                        <View style={styles.imagePreviewContainer}>
                          <RNImage source={{ uri: value }} style={styles.imagePreview} />
                          <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                            <Text style={styles.removeImageButtonText}>{t('schedule.removeImage')}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {errors?.image && <Text style={styles.errorText}>{errors.image.message}</Text>}
                    </View>
                  )}
                />
              </View>


              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('schedule.description')} *</Text>
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: t('schedule.enterDescription'),
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        value={value}
                        onBlur={async () => { onBlur(); await trigger('description'); }}
                        onChangeText={onChange}
                        placeholder={t('schedule.enterDescription')}
                        placeholderTextColor={COLORS.black}
                        multiline
                        numberOfLines={10}
                        textAlignVertical="top"
                        style={[
                          styles.textInput,
                          { minHeight: 150, paddingVertical: 12 },
                          errors?.description && { borderColor: 'red' },
                        ]}
                      />
                      {errors?.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
                    </View>
                  )}
                />
              </View>

            </View>
          ) : (
            // ── Step 2: Location, Date, Time & Players ─────────────────────
            <View>
              {/* Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('add_game.date')} *</Text>
                <Button
                  title={formatDate(selectedDate)}
                  onPress={() => setDatePickerVisibility(true)}
                  style={styles.inputContainer}
                />
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  minimumDate={new Date()}
                  onConfirm={(date: Date) => {
                    setSelectedDate(date);
                    setDatePickerVisibility(false);
                  }}
                  onCancel={() => setDatePickerVisibility(false)}
                />
              </View>

              {/* City */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('add_game.city')} *</Text>
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: 'City is required' }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Dropdown
                        style={[styles.dropdown, errors?.city && { borderColor: 'red' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={cities}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={t('add_game.select_city')}
                        searchPlaceholder={t('schedule.search')}
                        value={value}
                        onBlur={async () => await trigger('city')}
                        onChange={item => onChange(item.value)}
                      />
                      {errors?.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
                    </View>
                  )}
                />
              </View>

              {/* Address */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('schedule.address')} *</Text>
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: 'Address is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        value={value}
                        onBlur={async () => { onBlur(); await trigger('address'); }}
                        onChangeText={onChange}
                        placeholder={t('schedule.enterAddress')}
                        placeholderTextColor={COLORS.black}
                        style={[styles.textInput, errors?.address && { borderColor: 'red' }]}
                      />
                      {errors?.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
                    </View>
                  )}
                />
              </View>

              {/* Start & End Time */}
              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>{t('schedule.startTime')} *</Text>
                    <Controller
                      name="startTime"
                      control={control}
                      rules={{ required: 'Start time is required' }}
                      render={({ field: { value } }) => (
                        <View>
                          <Button
                            title={value || '00:00 AM'}
                            textSize={14}
                            textColor={COLORS.grayscale400}
                            onPress={() => setStartTimePickerVisibility(true)}
                            style={[styles.inputContainer, errors?.startTime && { borderColor: 'red' }]}
                          />
                          <DateTimePickerModal
                            isVisible={isStartTimePickerVisible}
                            mode="time"
                            onConfirm={async (time) => {
                              setValue('startTime', formatTime(time));
                              await trigger('startTime');
                              setStartTimePickerVisibility(false);
                            }}
                            onCancel={() => setStartTimePickerVisibility(false)}
                          />
                          {errors?.startTime && <Text style={styles.errorText}>{errors.startTime.message}</Text>}
                        </View>
                      )}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>{t('schedule.endTime')} *</Text>
                    <Controller
                      name="endTime"
                      control={control}
                      rules={{ required: 'End time is required' }}
                      render={({ field: { value } }) => (
                        <View>
                          <Button
                            title={value || '01:00 AM'}
                            textSize={14}
                            textColor={COLORS.grayscale400}
                            onPress={() => setEndTimePickerVisibility(true)}
                            style={[styles.inputContainer, errors?.endTime && { borderColor: 'red' }]}
                          />
                          <DateTimePickerModal
                            isVisible={isEndTimePickerVisible}
                            mode="time"
                            onConfirm={async (time) => {
                              setValue('endTime', formatTime(time));
                              await trigger('endTime');
                              setEndTimePickerVisibility(false);
                            }}
                            onCancel={() => setEndTimePickerVisibility(false)}
                          />
                          {errors?.endTime && <Text style={styles.errorText}>{errors.endTime.message}</Text>}
                        </View>
                      )}
                    />
                  </View>
                </View>
              </View>

            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.buttonRow}>
        {currentStep === 2 && (
          <TouchableOpacity onPress={handlePreviousStep} style={styles.backButton}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        )}
        {currentStep === 1 ? (
          <TouchableOpacity onPress={handleNextStep} style={styles.createButton}>
            <Text style={styles.createButtonText}>{t('common.next')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={[styles.createButton, isSubmitting && { opacity: 0.5 }]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>{t('schedule.createGame')}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  textInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  dropdown: {
    width: '100%',
    paddingHorizontal: SIZES.padding,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale300,
    marginVertical: 5,
    height: SIZES.InputHeight,
    justifyContent: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: SIZES.InputHeight,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1000,
    maxHeight: SIZES.InputHeight * 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: SIZES.padding,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale200,
    marginVertical: 5,
    height: SIZES.InputHeight,
    justifyContent: 'center',
  },
  placeholderStyle: { color: '#9ca3af', fontSize: 14 },
  selectedTextStyle: { fontSize: 14 },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 30, fontSize: 16 },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.grayscale300,
  },
  stepHeader: {
    margin: 20,
  },

  stepText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },

  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },

  progressBar: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 25,
  },

  progress: {
    height: "100%",
    backgroundColor: COLORS.primary, // your app color
  },

  stepDotActive: { backgroundColor: COLORS.primary },
  stepLine: { width: 60, height: 2, backgroundColor: COLORS.grayscale300, marginHorizontal: 6 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  createButtonText: { color: 'white', fontWeight: '600', fontSize: 15 },
  backButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  backButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  imageButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  imageButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  imagePreviewContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePreview: { width: '100%', height: 200, resizeMode: 'cover' },
  removeImageButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  removeImageButtonText: { color: 'white', fontWeight: '600' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
});

export default AddGameScreen;