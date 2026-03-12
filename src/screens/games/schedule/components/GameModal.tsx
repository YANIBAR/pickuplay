  import React, { useEffect, useState } from 'react';
  import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image as RNImage,
    Pressable,
  } from 'react-native';
  import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
  import { useForm, Controller } from 'react-hook-form';
  import DateTimePickerModal from 'react-native-modal-datetime-picker';
  import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
  import styles from '../styles';
  import { COLORS, SIZES } from '@constants';
  import { Button, Icon, Modal, NotSignedInView, TextInput } from '@components';
  import { Dropdown } from 'react-native-element-dropdown';
  import { authenticatedApi, publicApi } from '@services/api';


  import { parseTime } from '@utils/dateUtils';
  import { JAVA_API } from '@env';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import axios from 'axios';
import { isStoredTokenExpired } from '@utils/api/auth';


  interface FormData {
    title: string;
    description: string;
    sportType: string;
    address: string;
    startTime: string;
    endTime: string;
    numPlayers: string;
    isPrivate: boolean
    pricePerPlayer: string;
    image?: string;
  }

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
        description: '',
        sportType: '',
        address: '',
        startTime: '',
        endTime: '',
        numPlayers: '',
        isPrivate: true,
        pricePerPlayer: '',
        image: '',
      },
      mode: 'onBlur',
    });
  const [currentStep, setCurrentStep] = useState(1);
    const isPrivate = watch('isPrivate');
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
    const [sportTypeFocus, setSportTypeFocus] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [sports, setSports] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLogged, setIsLogged] = useState(false);
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
      const sportsList: Sport[] = response.result.data;
      setSports(sportsList.map((sport) => ({ label: sport.name, value: sport.id })).sort((a, b) => a.label.localeCompare(b.label)));
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message;
      Alert.alert('Error', errorMessage);
      console.error('sport type fetch failed:', error);
      setSports([]); // fallback to empty array
    }
  };
    // Reset form when modal opens
    useEffect(() => {
      const checkToken = async () => {
        const expired = await isStoredTokenExpired();
        setIsLogged(!expired); 
      };
  
      checkToken();
      getSports();
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

    const isGameDurationValid = (startTime: string, endTime: string) => {
      const startParsed = parseTime(startTime);
      const endParsed = parseTime(endTime);
      const start = new Date();
      start.setHours(startParsed.hours, startParsed.minutes, 0);

      const end = new Date();
      end.setHours(endParsed.hours, endParsed.minutes, 0);

      const diffInMs = end.getTime() - start.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      return diffInHours > 0 && diffInHours <= 3;
    };

    const isStartTimeValid = (date: string, startTime: string) => {
      const { hours, minutes } = parseTime(startTime);

      const gameStart = new Date(date);
      gameStart.setHours(hours, minutes, 0);

      const now = new Date();

      const diffInMs = gameStart.getTime() - now.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      return diffInHours >= 2;
    };

  const uploadImage = async (id,file) => {
      if (!file) {
        console.error('Invalid file selected');
        return;
      }
      console.log('Uploading file:', file);
      
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
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();
        Alert.alert('Success', data.message);
      } catch (error) {
        console.error('Upload failed:', error);
        Alert.alert('Error', 'Upload failed');
      }
    };


  const handleImagePicker = () => {
      Alert.alert(
        'Select Image',
        'Choose how to select an image',
        [
          {
            text: 'Camera',
            onPress: () => launchCameraForImage(),
          },
          {
            text: 'Photo Library',
            onPress: () => launchGalleryForImage(),
          },
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    };

    const launchCameraForImage = () => {
      launchCamera(
        {
          mediaType: 'photo',
          cameraType: 'back',
          quality: 0.8,
        },
        (response) => {
          if (response.didCancel) {
            console.log('User cancelled camera picker');
          } else if (response.errorCode) {
            Alert.alert('Error', `Camera error: ${response.errorMessage}`);
          } else if (response.assets && response.assets[0]) {
            const imageUri = response.assets[0].uri;
            setSelectedImage(response.assets[0]);
            setValue('image', imageUri);
            trigger('image');
          }
        }
      );
    };

    const launchGalleryForImage = () => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 1,
        },
        (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            Alert.alert('Error', `Gallery error: ${response.errorMessage}`);
          } else if (response.assets && response.assets[0]) {
            const imageUri = response.assets[0].uri;
            setSelectedImage(response.assets[0]);
            setValue('image', imageUri);
            trigger('image');
          }
        }
      );
    };

    const handleRemoveImage = () => {
      setValue('image', '');
      trigger('image');
    };


    const onSubmit = async (data: FormData) => {
      // Validation schema for cleaner, reusable validation
      const validationRules = [
        { field: 'selectedDate', condition: !selectedDate, message: 'Please select a date' },
        { field: 'title', condition: !data.title?.trim(), message: 'Title is required' },
        { field: 'address', condition: !data.address?.trim(), message: 'Address is required' },
        { field: 'startTime', condition: !data.startTime?.trim(), message: 'Start time is required' },
        { field: 'endTime', condition: !data.endTime?.trim(), message: 'End time is required' },
        { field: 'numPlayers', condition: !data.numPlayers?.trim(), message: 'Number of players is required' },
        { field: 'image', condition: !isPrivate && !data.image,  message: 'Image is required for public games',},
      ];

      if (!isGameDurationValid(data.startTime, data.endTime)) {
        Alert.alert('', 'Game duration cannot exceed 3 hours.');
        return;
      }

      if (!isStartTimeValid(selectedDate, data.startTime)) {
        Alert.alert('Error', 'Game must start at least 2 hours from now.');
        return;
      }

      // Check validations and return early if any fail
      const validationError = validationRules.find(rule => rule.condition);
      if (validationError) {
        Alert.alert('Validation Error', validationError.message);
        return;
      }

      const payload = {
        title: data.title.trim(),
        description: data.description,
        sportType: data.sportType,
        city: extractCityFromAddress(data.address),
        address: data.address.trim(),
        date: formatDateForAPI(selectedDate),
        startTime: formatTimeForAPI(data.startTime),
        endTime: formatTimeForAPI(data.endTime),
        nbrSpots: parseInt(data.numPlayers, 10),
        price: parseFloat(data.pricePerPlayer),
      };
      createGame(payload);
    };
    
    const createGame = async (payload) => { 
      try {
          const response = await authenticatedApi.post(`games/create`, payload);
          const game = response.result.data;
          uploadImage(game.id, selectedImage);
          onCreateGame(game);
          onClose();
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create game. Please try again.';
          Alert.alert('Error', errorMessage);
          console.error('Game creation failed:', error);
        }
      };
    // Validate step 1 fields
    const validateStep1 = async () => {
      const isValid = await trigger(['title', 'sportType', 'description', 'image']);
      return isValid;
    };



    const handleNextStep = async () => {
      if (await validateStep1()) {
        setCurrentStep(2);
      }
    };

    const handlePreviousStep = () => {
      setCurrentStep(1);
    };
    return (
      <Modal
        title={isLogged==false ? " "  : (`Create Game ${selectedDate ? formatDate(selectedDate) : ''}`)}
        visible={visible}
        animationType="slide"
        onClose={onClose}
      >
        <View style={styles.modalContent}>
        {isLogged==true ? (
          <>
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, currentStep === 1 && styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, currentStep === 2 && styles.stepDotActive]} />
            </View>
            {/* Action Buttons */}
              <View style={styles.buttonRow}>
                {currentStep === 2 && (
                  <TouchableOpacity
                    onPress={handlePreviousStep}
                    style={styles.backButton}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                )}

                {currentStep === 1 && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.cancelButton}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}

                {currentStep === 1 ? (
                  <TouchableOpacity
                    onPress={handleNextStep}
                    style={[styles.createButton, isSubmitting && { opacity: 0.5 }]}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.createButtonText}>Next</Text>
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
                      <Text style={styles.createButtonText}>Create Game</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            <View>
              {currentStep === 1 ? (
                // Step 1: Basic Info
                <View>
                  {/* Title */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Title *</Text>
                    <Controller
                      key="title"
                      name="title"
                      control={control}
                      rules={{
                        required: 'Title is required',
                        minLength: { value: 3, message: 'Title must be at least 3 characters' },
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                          <TextInput
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
                            data={sports}
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
                  
                  {/* Image Selection */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Select Image *</Text>
                    <Controller
                      name="image"
                      control={control}
                      rules={{
                        required: !isPrivate ? 'Image is required' : false,
                      }}
                      render={({ field: { onChange, value } }) => (
                        <View>
                          <TouchableOpacity
                            style={[
                              styles.imageButton,
                              errors?.image && { borderColor: 'red' },
                            ]}
                            onPress={handleImagePicker}
                          >
                            <Text style={styles.imageButtonText}>
                              {value ? 'Change Image' : 'Select Image'}
                            </Text>
                          </TouchableOpacity>
                          {value && (
                            <View style={styles.imagePreviewContainer}>
                              <RNImage
                                source={{ uri: value }}
                                style={styles.imagePreview}
                              />
                              <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={handleRemoveImage}
                              >
                                <Text style={styles.removeImageButtonText}>Remove</Text>
                              </TouchableOpacity>
                            </View>
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

                  {/* Description */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description *</Text>
                    <Controller
                      name="description"
                      control={control}
                      rules={{
                        required: 'Description is required',
                        minLength: {
                          value: 10,
                          message: 'Description must be at least 10 characters',
                        },
                      }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                          <TextInput
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
                            numberOfLines={10}
                            textAlignVertical="top"
                            style={[
                              styles.textInput,
                              styles.descriptionInput,
                              {
                                minHeight: 150, // adjust height as needed
                                paddingVertical: 12,
                              },
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
                </View>
              ) : (
                // Step 2: Details & Media
                <View>

                  {/* Address */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Address *</Text>
                    <Controller
                      key="address"
                      name="address"
                      control={control}
                      rules={{ required: 'Address is required' }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                          <TextInput
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
                                textSize={14}
                                textColor={COLORS.grayscale400}
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
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formLabel}>End Time *</Text>
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

                  {/* Number of Players and Price */}
                  <View style={styles.container}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {/* Number of Players */}
                      <View style={{ flex: 1 }}>
                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Number of Players *</Text>
                          <Controller
                            name="numPlayers"
                            control={control}
                            rules={{
                              required: 'Number of players is required',
                            }}
                            render={({ field: { onChange, value } }) => (
                              <View>
                                <TouchableOpacity
                                  style={[
                                    styles.dropdown,
                                    errors?.numPlayers && { borderColor: 'red' },
                                  ]}
                                  onPress={() => setDropdownOpen(!dropdownOpen)}
                                >
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: value ? COLORS.black : COLORS.gray }}>
                                      {PLAYER_OPTIONS.find(opt => opt.value === value)?.label || 'Select players'}
                                    </Text>
                                    <Icon
                                      size={20}
                                      name={dropdownOpen ? 'expand-less' : 'expand-more'}
                                      type="materialIcons"
                                    />
                                  </View>
                                </TouchableOpacity>

                                {dropdownOpen && (
                                  <View style={{
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
                                  }}>
                                    <ScrollView>
                                      {PLAYER_OPTIONS.map((option) => (
                                        <TouchableOpacity
                                          key={option.value}
                                          style={{
                                            paddingVertical: 12,
                                            paddingHorizontal: 15,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#f0f0f0',
                                          }}
                                          onPress={() => {
                                            onChange(option.value);
                                            setDropdownOpen(false);
                                          }}
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

                                {errors?.numPlayers && (
                                  <Text style={styles.errorText}>{errors.numPlayers.message}</Text>
                                )}
                              </View>
                            )}
                          />
                        </View>
                      </View>

                      {/* Price Per Player */}
                      <View style={{ flex: 1 }}>
                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Price Per Player *</Text>
                          <Controller
                            name="pricePerPlayer"
                            control={control}
                            rules={{
                              required: false,
                              pattern: {
                                value: /^\d+(\.\d{1,2})?$/,
                                message: 'Invalid price format',
                              },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <View>
                                <TextInput
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
                    </View>
                  </View>
                </View>
              )}
            </View>
              </>
            ) : (
              <>
              
                <NotSignedInView
                  heading="Sign in to join game"
                  description="Access your upcoming and past sessions when signed in."
                  containerStyle={{ flex: 1 }}
                />
              </>
            )}
        
        </View>
      </Modal>
    );
  }