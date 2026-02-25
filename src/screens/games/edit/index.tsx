import { COLORS, SIZES } from '@constants';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image as RNImage, } from 'react-native';
import { Button,  Header } from '@components';
import { useTranslation } from 'react-i18next';
import { authenticatedApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { formatDateShort, formatTime } from '@utils/dateUtils';
import { Controller, useForm } from 'react-hook-form';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAVA_API } from '@env';
import { useNavigation } from '@react-navigation/native';

const EditGameScreen = ({ route }) => {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const { game } = route.params || {};
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);
  const [gameDate, setGameDate] = useState(formatDateShort(new Date(game?.startTime)));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
  const [formData, setFormData] = useState({
    id: game?.id || '',
    title: game?.title || '',
    sportType: game?.sportType || '',
    city: game?.city || '',
    availableSpots: game?.availableSpots || '',
    nbrSpots: game?.nbrSpots || '',
    description: game?.description || '',
    address: game?.address || '',
    startTime: new Date(game?.startTime) || '',
    endTime: new Date(game?.endTime) || '',
    imageUrl: game?.imageUrl || '',
    isPrivate: game?.isPrivate || '',
    price: game?.price || ''
  });
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

  const city = [
    { label: 'Kansas City', value: 'kansas_city' },
    { label: 'St. Louis', value: 'st_louis' },
    { label: 'Springfield', value: 'springfield' },
    { label: 'Columbia', value: 'columbia' },
    { label: 'Independence', value: 'independence' },
    { label: 'Lee\'s Summit', value: 'lees_summit' },
    { label: 'Olathe', value: 'olathe' },
    { label: 'Overland Park', value: 'overland_park' },
    { label: 'Blue Springs', value: 'blue_springs' },
    { label: 'Liberty', value: 'liberty' },  
  ];
  const SportTypes = [
    { value: '1', label: 'Soccer' },
    { value: '2', label: 'Basketball' },
    { value: '3', label: 'Volleyball' },
    { value: '4', label: 'Hockey' },
    { value: '5', label: 'Tennis' },
    { value: '6', label: 'Pickle ball' },
    { value: '7', label: 'Ping Pong' },
    { value: '8', label: 'Football' },
  ];
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save the game
  const handleSave = async () => {
    try {
      const gameData = {
        ...formData,
        date: gameDate, // Placeholder date, replace with actual date if needed
        startTime: (formData.startTime.getHours().toString().padStart(2, "0")) + ":" + formData.startTime.getMinutes().toString().padStart(2, "0"),
        endTime: (formData.endTime.getHours().toString().padStart(2, "0")) + ":" + formData.endTime.getMinutes().toString().padStart(2, "0"),
      };
      const gameId = formData.id;
      const response = await authenticatedApi.patch(`games/${gameId}`, gameData);
      uploadImage(game.id, selectedImage);
      Alert.alert(t('common.success'), t('edit_game.game_updated'));
      navigate("detail", { game: game });
    } catch (error) {
      console.error('Error saving game:', error);
      const status = error?.response?.status;

      if (status === 400) {
        const validationErrors = error?.response?.data?.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          const messages = Object.values(validationErrors).flat().join('\n');
          Alert.alert(t('edit_game.validation_error'), messages);
        } else {
          const message = error?.response?.data?.message || t('edit_game.invalid_data');
          Alert.alert(t('edit_game.validation_error'), message);
        }
      } else if (status === 403) {
        Alert.alert(t('edit_game.error'), t('edit_game.forbidden'));
      } else if (status === 404) {
        Alert.alert(t('edit_game.error'), t('edit_game.not_found'));
      } else {
        Alert.alert(t('edit_game.error'), t('edit_game.server_error'));
      }
    }
  }; 
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };

  const fieldsDisabled = (() => {
    if (!formData.startTime) return false;
    const start = new Date(formData.startTime);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    return diffMs > 0 && diffMs < 12 * 60 * 60 * 1000 && !formData.isPrivate;
  })();
  const uploadImage = async (id,file) => {
      if (!file) {
        console.error('Invalid file selected');
        return;
      }
      console.log('Uploading file:', file);
      
      const formImage = new FormData();
      
      formImage.append('image', {
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
          body: formImage,
        });
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();
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

  useEffect(() => {
    console.log('Initial game data:', game);
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      
      <ScrollView style={styles.container}>
        <Header title={t('edit_game.edit_game')} />
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_game.game_title')}</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleChange('title', text)}
              placeholder={t('edit_game.enter_game_title')}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_game.price')}</Text>
            <TextInput
              style={styles.input}
              value={formData.price ? formData.price.toString() : ''}
              onChangeText={(text) => handleChange('price', text)}
              placeholder={t('edit_game.enter_price')}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_game.city')}</Text>
            <Dropdown
              data={city}
              labelField="label"
              valueField="value"
              placeholder={t('edit_game.select_city') }
              value={formData.city}
              onChange={item => handleChange('city', item.value)}
              style={[styles.dropdown, fieldsDisabled && styles.disabledDropdown]}
              disable={fieldsDisabled}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_game.address')}</Text>
            <TextInput
              style={[styles.input, fieldsDisabled && styles.disabledInput]}
              value={formData.address}
              onChangeText={(text) => handleChange('address', text)}
              placeholder={t('edit_game.enter_address')}
              editable={!fieldsDisabled}
            />
          </View>

          {/* Image Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Image *</Text>
            <Controller
              name="image"
              control={control}
              rules={{
                required: !game.isPrivate ? 'Image is required' : false,
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_game.sportType')}</Text>
            <Dropdown
              data={SportTypes}
              search={true}
              labelField="label"
              valueField="value"
              placeholder={t('edit_game.select_sport_type') }
              value={formData.sportType}
              onChange={item => handleChange('sportType', item.value)}
              style={styles.dropdown}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_game.availableSpots')}</Text>
            <Dropdown
              data={PLAYER_OPTIONS}
              labelField="label"
              valueField="value"
              placeholder={t('edit_game.select_available_spots') }
              value={formData.nbrSpots.toString()}
              onChange={item => handleChange('nbrSpots', item.value)}
              style={styles.dropdown}
            />
          </View>

          <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('edit_game.date')}</Text>
          <Button
            title={gameDate}
            onPress={() => !fieldsDisabled && setDatePickerVisibility(true)}
            disabled={fieldsDisabled}
          />
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(date: Date) => {
              const formatted = formatDateShort(date); 
              setGameDate(formatted );
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />
        </View>
          
          
          {/* Start Time and End Time */}
          <View style={styles.container}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Start Time */}
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Start Time *</Text>
                <Button title={formatTime(formData.startTime)} onPress={() => !fieldsDisabled && setStartPickerVisible(true)} disabled={fieldsDisabled} />
                <DateTimePickerModal
                  isVisible={isStartPickerVisible}
                  mode="time"
                  onConfirm={(text) => {
                    handleChange('startTime', text);
                    setStartPickerVisible(false);
                  }}
                  onCancel={() => setStartPickerVisible(false)}
                />
              </View>

              {/* End Time */}
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End Time *</Text>
                <Button title={formatTime(formData.endTime)} onPress={() => !fieldsDisabled && setEndPickerVisible(true)} disabled={fieldsDisabled} />
                <DateTimePickerModal
                  isVisible={isEndPickerVisible}
                  mode="time"
                  onConfirm={(text) => {
                    handleChange('endTime', text);
                    setEndPickerVisible(false);
                  }}
                  onCancel={() => setEndPickerVisible(false)}
                />
              </View>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_game.description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              placeholder={t('edit_game.enter_description')}
              multiline
              numberOfLines={4}
            />
          </View>
  
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>{t('edit_game.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: COLORS.primary,
  },
  dayTimeContainer: {
    marginBottom: 12,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 90,
  },
  dayTimeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 30,
    marginTop: 4,
  },
  timeButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  toText: {
    marginHorizontal: 10,
    color: '#666',
    fontWeight: '500',
  },
  dropdown: {
      width: '100%',
      paddingHorizontal: SIZES.padding,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.greyscale300,
      marginVertical: 5,
      flexDirection: 'row',
      height: SIZES.InputHeight,
      alignItems: 'center',
    },
    icon: {
      marginRight: 10,
      height: 20,
      width: 20,
      tintColor: '#BCBCBC',
    },
    placeholderStyle: {
      color: '#9ca3af',
      fontSize: 14,
    },
    selectedTextStyle: {
      fontSize: 14,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 30,
      fontSize: 16,
    },
  inputContainer: {
    width: '100%',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.grayscale200,
    marginVertical: 5,
    flexDirection: 'row',
    height: SIZES.InputHeight,
    alignItems: 'center',
  },

  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    color: '#aaa',
  },
  disabledDropdown: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  lockedBanner: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    borderRadius: 6,
  },
  lockedBannerText: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '500',
  },
  lockedHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#f59e0b',
    fontStyle: 'italic',
  },
  imageButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginVertical: 8,
  },

  imageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  imagePreviewContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },

  removeImageButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});


export default EditGameScreen;