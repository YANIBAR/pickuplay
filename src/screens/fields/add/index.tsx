import { COLORS, SIZES } from '@constants';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image as RNImage,
} from 'react-native';
import { Button, Header } from '@components';
import { useTranslation } from 'react-i18next';
import { authenticatedApi, publicApi } from '@services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { Controller, useForm } from 'react-hook-form';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAVA_API } from '@env';
import { useNavigation } from '@react-navigation/native';

type FormData = {
  name: string;
  latitude: string;
  longitude: string;
  city: string;
  address: string;
  sportTypeId: string;
  isIndoor: boolean;
  accessType: string;
  image: string;
};

const ACCESS_TYPE_OPTIONS = [
  { label: 'Free', value: 'FREE' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Private', value: 'PRIVATE' },
];

const AddSportFieldScreen = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation();

  const [selectedImage, setSelectedImage] = useState<any>(null);
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
      latitude: '',
      longitude: '',
      city: '',
      address: '',
      sportTypeId: '',
      isIndoor: false,
      accessType: 'FREE',
      image: '',
    },
    mode: 'onBlur',
  });

  const isIndoorValue = watch('isIndoor');
  const imageValue = watch('image');

  // ─── API Fetches ───────────────────────────────────────────────────────────

  const getSports = async (): Promise<void> => {
    try {
      const response = await publicApi.get('games/sports');
      const sportsList = response.result.data;
      setSports(
        sportsList
          .map((sport: any) => ({ label: sport.name, value: String(sport.id) }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load sport types');
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
      Alert.alert('Error', 'Failed to load cities');
      setCities([]);
    }
  };

  useEffect(() => {
    getSports();
    getCities();
  }, []);

  // ─── Image Handlers ────────────────────────────────────────────────────────

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how to select an image',
      [
        { text: 'Camera', onPress: () => launchCameraForImage() },
        { text: 'Photo Library', onPress: () => launchGalleryForImage() },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const launchCameraForImage = () => {
    launchCamera({ mediaType: 'photo', cameraType: 'back', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', `Camera error: ${response.errorMessage}`);
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
        setValue('image', response.assets[0].uri!);
        trigger('image');
      }
    });
  };

  const launchGalleryForImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', `Gallery error: ${response.errorMessage}`);
        return;
      }
      if (response.assets && response.assets[0]) {
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

  // ─── Upload Image ──────────────────────────────────────────────────────────

  const uploadImage = async (fieldId: number, file: any) => {
    if (!file) return;

    const formImage = new FormData();
    formImage.append('image', {
      uri: file.uri,
      name: file.fileName || 'field-image.jpg',
      type: file.type || 'image/jpeg',
    });

    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${JAVA_API}sport-fields/${fieldId}/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formImage,
      });

      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
    } catch (error) {
      console.error('Image upload failed:', error);
      Alert.alert('Warning', 'Field created but image upload failed.');
    }
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
  const payload = {
    name: data.name,
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    city: data.city,
    address: data.address,
    sportTypeId: Number(data.sportTypeId),
    is_indoor: data.isIndoor,
    access_type: data.accessType,
  };

  const formData = new FormData();

  // Append field as a plain JSON string
  formData.append('field', JSON.stringify(payload));

  // Append the picture file
  if (data.image) {
    formData.append('image', {
      uri: data.image.uri,
      type: data.image.type ?? 'image/jpeg',
      name: data.image.name ?? 'picture.jpg',
    } as any);
  }

  const response = await authenticatedApi.post('fields', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  Alert.alert('Success', 'Sport field created successfully!');
  // navigate('sportFields' as never);
};

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView style={styles.container}>
        <Header title="Add Sport Field" />

        <View style={styles.form}>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Field Name *</Text>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Field name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Arena Park"
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <Controller
              name="city"
              control={control}
              rules={{ required: 'City is required' }}
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  data={cities}
                  labelField="label"
                  valueField="value"
                  placeholder="Select a city"
                  value={value}
                  onChange={(item) => onChange(item.value)}
                  search
                  style={[styles.dropdown, errors.city && styles.inputError]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                />
              )}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <Controller
              name="address"
              control={control}
              rules={{ required: 'Address is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. 123 Av X"
                />
              )}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
          </View>

          {/* Latitude & Longitude */}
          <View style={styles.rowGroup}>
            <View style={styles.halfGroup}>
              <Text style={styles.label}>Latitude *</Text>
              <Controller
                name="latitude"
                control={control}
                rules={{
                  required: 'Required',
                  pattern: { value: /^-?\d+(\.\d+)?$/, message: 'Invalid number' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.latitude && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. 33.5"
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.latitude && <Text style={styles.errorText}>{errors.latitude.message}</Text>}
            </View>

            <View style={styles.halfGroup}>
              <Text style={styles.label}>Longitude *</Text>
              <Controller
                name="longitude"
                control={control}
                rules={{
                  required: 'Required',
                  pattern: { value: /^-?\d+(\.\d+)?$/, message: 'Invalid number' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.longitude && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. -7.6"
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.longitude && <Text style={styles.errorText}>{errors.longitude.message}</Text>}
            </View>
          </View>

          {/* Sport Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sport Type *</Text>
            <Controller
              name="sportTypeId"
              control={control}
              rules={{ required: 'Sport type is required' }}
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  data={sports}
                  labelField="label"
                  valueField="value"
                  placeholder="Select a sport type"
                  value={value}
                  onChange={(item) => onChange(item.value)}
                  search
                  style={[styles.dropdown, errors.sportTypeId && styles.inputError]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                />
              )}
            />
            {errors.sportTypeId && <Text style={styles.errorText}>{errors.sportTypeId.message}</Text>}
          </View>

          {/* Access Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Access Type *</Text>
            <Controller
              name="accessType"
              control={control}
              rules={{ required: 'Access type is required' }}
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  data={ACCESS_TYPE_OPTIONS}
                  labelField="label"
                  valueField="value"
                  placeholder="Select access type"
                  value={value}
                  onChange={(item) => onChange(item.value)}
                  style={[styles.dropdown, errors.accessType && styles.inputError]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                />
              )}
            />
            {errors.accessType && <Text style={styles.errorText}>{errors.accessType.message}</Text>}
          </View>

          {/* Is Indoor Toggle */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location Type</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleOption, !isIndoorValue && styles.toggleOptionActive]}
                onPress={() => setValue('isIndoor', false)}
              >
                <Text style={[styles.toggleOptionText, !isIndoorValue && styles.toggleOptionTextActive]}>
                  🌤  Outdoor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleOption, isIndoorValue && styles.toggleOptionActive]}
                onPress={() => setValue('isIndoor', true)}
              >
                <Text style={[styles.toggleOptionText, isIndoorValue && styles.toggleOptionTextActive]}>
                  🏠  Indoor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Image */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Field Image</Text>
            <Controller
              name="image"
              control={control}
              render={({ field: { value } }) => (
                <View>
                  <TouchableOpacity
                    style={[styles.imageButton, errors.image && { borderColor: 'red' }]}
                    onPress={handleImagePicker}
                  >
                    <Text style={styles.imageButtonText}>
                      {value ? 'Change Image' : 'Select Image'}
                    </Text>
                  </TouchableOpacity>

                  {value ? (
                    <View style={styles.imagePreviewContainer}>
                      <RNImage source={{ uri: value }} style={styles.imagePreview} />
                      <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                        <Text style={styles.removeImageButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {errors.image && (
                    <Text style={styles.errorText}>{errors.image.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Submit */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Saving…' : 'Add Sport Field'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

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
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfGroup: {
    flex: 1,
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
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
  placeholderStyle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  inputSearchStyle: {
    height: 30,
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale300,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  toggleOptionActive: {
    backgroundColor: COLORS.primary,
  },
  toggleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  toggleOptionTextActive: {
    color: 'white',
    fontWeight: '700',
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
    marginTop: 8,
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
  removeImageButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddSportFieldScreen;