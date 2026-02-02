import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../styles';
import { COLORS } from '@constants';
import { Button } from '@components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { JAVA_API } from '@env';
import { Image } from 'react-native-svg';


interface FormData {
  title: string;
  description: string;
  sportType: string;
  address: string;
  startTime: string;
  endTime: string;
  numPlayers: string;
  isFree: boolean;
  isPrivate: boolean
  pricePerPlayer: string;
}

const SportTypes = [
  { label: 'Soccer', value: 'Soccer' },
  { label: 'Basketball', value: 'Basketball' },
  { label: 'Volleyball', value: 'Volleyball' },
  { label: 'Hockey', value: 'Hockey' },
  { label: 'Tennis', value: 'Tennis' },
];

interface GameModalProps {
  visible: boolean;
  selectedDate: Date | null;
  onCreateGame: () => void;
  onClose: () => void;
}

export default function GameModal({
  visible,
  selectedDate,
  onCreateGame,
  onClose,
}: GameModalProps) {
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      sportType: '',
      address: '',
      startTime: '',
      endTime: '',
      numPlayers: '',
      isFree: true,
      isPrivate: true,
      pricePerPlayer: '',
    },
    mode: 'onBlur',
  });

  const isFree = watch('isFree');

  const isPrivate = watch('isPrivate');
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [token, setToken] = useState('');
  const [sportTypeFocus, setSportTypeFocus] = useState(false);

  // Fetch token on component mount
  useEffect(() => {
    const getToken = async () => {
      try {
        const stored_token = await AsyncStorage.getItem('access_token');
        if (stored_token) {
          setToken(stored_token);
        } else {
          console.warn('No access token found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };
    getToken();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      reset();
    }
  }, [visible, reset]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  };

  const formatTimeForAPI = (timeString: string): string => {
    if (!timeString || !timeString.includes(':')) {
      console.warn('Invalid time string:', timeString);
      return '00:00';
    }

    const [time, period] = timeString.split(' ');
    if (!time || !period) {
      console.warn('Time or period missing:', { time, period });
      return '00:00';
    }

    let [hours, minutes] = time.split(':');
    let hoursNum = parseInt(hours, 10);

    if (period === 'pm' && hoursNum !== 12) {
      hoursNum += 12;
    } else if (period === 'am' && hoursNum === 12) {
      hoursNum = 0;
    }

    return `${String(hoursNum).padStart(2, '0')}:${minutes}`;
  };

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const extractCityFromAddress = (address: string): string => {
    if (!address) return '';
    const parts = address.split(',');
    return parts[parts.length - 2]?.trim() || parts[0]?.trim() || '';
  };

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleStartTimeConfirm = async (selectedTime: Date) => {
    const formattedTime = formatTime(selectedTime);
    setValue('startTime', formattedTime);
    await trigger('startTime');
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = async (selectedTime: Date) => {
    const formattedTime = formatTime(selectedTime);
    setValue('endTime', formattedTime);
    await trigger('endTime');
    hideEndTimePicker();
  };

  const onSubmit = async (data: FormData) => {
    console.log('====== FORM DATA RECEIVED ======');
    console.log(JSON.stringify(data, null, 2));
    console.log('================================');

    if (!selectedDate) {
      Alert.alert('Validation Error', 'Please select a date');
      return;
    }

      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        return;
      }

      // Validate required fields
      if (!data.title || !data.title.trim()) {
        Alert.alert('Validation Error', 'Title is required');
        return;
      }
      if (!data.sportType || !data.sportType.trim()) {
        Alert.alert('Validation Error', 'Sport type is required');
        return;
      }
      if (!data.address || !data.address.trim()) {
        Alert.alert('Validation Error', 'Address is required');
        return;
      }
      if (!data.startTime || !data.startTime.trim()) {
        Alert.alert('Validation Error', 'Start time is required');
        return;
      }
      if (!data.endTime || !data.endTime.trim()) {
        Alert.alert('Validation Error', 'End time is required');
        return;
      }
      if (!data.numPlayers || !data.numPlayers.trim()) {
        Alert.alert('Validation Error', 'Number of players is required');
        return;
      }
      if (!data.isFree && (!data.pricePerPlayer || !data.pricePerPlayer.trim())) {
        Alert.alert('Validation Error', 'Price per player is required');
        return;
      }

      const payload = {
        title: data.title.trim(),
        description: data.description,
        sportType: data.sportType.trim(),
        city: extractCityFromAddress(data.address),
        address: data.address.trim(),
        date: formatDateForAPI(selectedDate),
        startTime: formatTimeForAPI(data.startTime),
        endTime: formatTimeForAPI(data.endTime),
        nbrSpots: parseInt(data.numPlayers, 10),
      };
      const response = await fetch(`${JAVA_API}games/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response);
      console.log('Response headers:', response.headers);

      
      onCreateGame();
      onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Create Game {selectedDate && formatDate(selectedDate)}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
              disabled={isSubmitting}
            >
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <RNTextInput
                      value={value}
                      onBlur={async (e) => {
                        onBlur();
                        await trigger('title');
                      }}
                      onChangeText={(text) => {
                        onChange(text);
                      }}
                      placeholder="Enter game title"
                      placeholderTextColor={COLORS.black}
                      keyboardType="default"
                      style={[
                        styles.textInput,
                        errors?.title && { borderColor: 'red' },
                      ]}
                    />
                    {errors?.title && (
                      <Text style={styles.errorText}>{errors.title.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Sport Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Sport type *</Text>
              <Controller
                name="sportType"
                control={control}
                rules={{ required: 'Please select a sport type' }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Dropdown
                      style={[
                        styles.dropdown,
                        sportTypeFocus && { borderColor: 'blue' },
                        errors?.sportType && { borderColor: 'red' },
                      ]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={SportTypes}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!sportTypeFocus ? 'Select sport' : '...'}
                      searchPlaceholder="Search..."
                      value={value}
                      onFocus={() => setSportTypeFocus(true)}
                      onBlur={async () => {
                        setSportTypeFocus(false);
                        await trigger('sportType');
                      }}
                      onChange={(item) => {
                        onChange(item.value);
                      }}
                    />
                    {errors?.sportType && (
                      <Text style={styles.errorText}>
                        {errors.sportType.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address *</Text>
              <Controller
                name="address"
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <RNTextInput
                      value={value}
                      onBlur={async (e) => {
                        onBlur();
                        await trigger('address');
                      }}
                      onChangeText={(text) => {
                        onChange(text);
                      }}
                      placeholder="Enter game address"
                      placeholderTextColor={COLORS.black}
                      keyboardType="default"
                      style={[
                        styles.textInput,
                        errors?.address && { borderColor: 'red' },
                      ]}
                    />
                    {errors?.address && (
                      <Text style={styles.errorText}>{errors.address.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>
            {/* Start Time and End Time */}
            <View style={styles.container}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* Start Time */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Start Time *</Text>
                  <Controller
                    name="startTime"
                    control={control}
                    rules={{ required: 'Start time is required' }}
                    render={({ field: { value } }) => (
                      <View>
                        <Button
                          title={value || '00:00 AM'}
                          onPress={showStartTimePicker}
                          style={[
                            styles.inputContainer,
                            errors?.startTime && { borderColor: 'red' },
                          ]}
                        />
                        <DateTimePickerModal
                          isVisible={isStartTimePickerVisible}
                          mode="time"
                          onConfirm={handleStartTimeConfirm}
                          onCancel={hideStartTimePicker}
                        />
                        {errors?.startTime && (
                          <Text style={styles.errorText}>
                            {errors.startTime.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>
                {/* End Time */}
                <View  style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>End Time *</Text>
                  <Controller
                    name="endTime"
                    control={control}
                    rules={{ required: 'End time is required' }}
                    render={({ field: { value } }) => (
                      <View>
                        <Button
                          title={value || '01:00 AM'}
                          onPress={showEndTimePicker}
                          style={[
                            styles.inputContainer,
                            errors?.endTime && { borderColor: 'red' },
                          ]}
                        />
                        <DateTimePickerModal
                          isVisible={isEndTimePickerVisible}
                          mode="time"
                          onConfirm={handleEndTimeConfirm}
                          onCancel={hideEndTimePicker}
                        />
                        {errors?.endTime && (
                          <Text style={styles.errorText}>
                            {errors.endTime.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>
              </View>
            </View>
            {/* Number of Players */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Number of Players *</Text>
              <Controller
                name="numPlayers"
                control={control}
                rules={{
                  required: 'Number of players is required',
                  pattern: { value: /^\d+$/, message: 'Must be a valid number' },
                  min: { value: 1, message: 'Must be at least 1' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <RNTextInput
                      value={value}
                      onBlur={async (e) => {
                        onBlur();
                        await trigger('numPlayers');
                      }}
                      onChangeText={(text) => {
                        onChange(text);
                      }}
                      placeholder="Number of players"
                      placeholderTextColor={COLORS.black}
                      keyboardType="numeric"
                      style={[
                        styles.textInput,
                        errors?.numPlayers && { borderColor: 'red' },
                      ]}
                    />
                    {errors?.numPlayers && (
                      <Text style={styles.errorText}>{errors.numPlayers.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>
            {/* Private/Public Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Private</Text>
              <Controller
                name="isPrivate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#86efac', true: COLORS.primary }}
                    thumbColor={value ? '#86efac' : COLORS.primary}
                  />
                )}
              />
            </View>

            {/* Description Field (conditionally shown when private) */}
            {!isPrivate && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description *</Text>
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: isPrivate ? 'Description is required' : false,
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <RNTextInput
                        value={value}
                        onBlur={async (e) => {
                          onBlur();
                          await trigger('description');
                        }}
                        onChangeText={(text) => {
                          onChange(text);
                        }}
                        placeholder="Enter description..."
                        placeholderTextColor={COLORS.black}
                        multiline
                        numberOfLines={4}
                        style={[
                          styles.textInput,
                          errors?.description && { borderColor: 'red' },
                        ]}
                      />
                      {errors?.description && (
                        <Text style={styles.errorText}>
                          {errors.description.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>
            )}

            {/* Image Selection (conditionally shown when private) */}
            {!isPrivate && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Image *</Text>
                <Controller
                  name="image"
                  control={control}
                  rules={{
                    required: isPrivate ? 'Image is required' : false,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <TouchableOpacity
                        style={[
                          styles.imageButton,
                          errors?.image && { borderColor: 'red' },
                        ]}
                        onPress={() => {
                          // Add image picker logic here
                          // e.g., launchImageLibrary or launchCamera
                        }}
                      >
                        <Text style={styles.imageButtonText}>
                          {value ? 'Change Image' : 'Select Image'}
                        </Text>
                      </TouchableOpacity>
                      {value && (
                        <Image
                          source={{ uri: value }}
                          style={styles.imagePreview}
                        />
                      )}
                      {errors?.image && (
                        <Text style={styles.errorText}>
                          {errors.image.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>
            )}
            {/* Free/Paid Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Free Game</Text>
              <Controller
                name="isFree"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: '#86efac', true: COLORS.primary }}
                    thumbColor={value ? '#86efac' : COLORS.primary}
                  />
                )}
              />
            </View>

            {/* Price Per Player (conditionally shown) */}
            {!isFree && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price Per Player *</Text>
                <View style={styles.priceInputRow}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <Controller
                    name="pricePerPlayer"
                    control={control}
                    rules={{
                      required: !isFree ? 'Price is required' : false,
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Invalid price format',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={{ flex: 1 }}>
                        <RNTextInput
                          value={value}
                          onBlur={async (e) => {
                            onBlur();
                            await trigger('pricePerPlayer');
                          }}
                          onChangeText={(text) => {
                            onChange(text);
                          }}
                          placeholder="0.00"
                          placeholderTextColor={COLORS.black}
                          keyboardType="decimal-pad"
                          style={[
                            styles.textInput,
                            errors?.pricePerPlayer && { borderColor: 'red' },
                          ]}
                        />
                        {errors?.pricePerPlayer && (
                          <Text style={styles.errorText}>
                            {errors.pricePerPlayer.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                style={[styles.createButton, isSubmitting && { opacity: 0.5 }]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Game</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}