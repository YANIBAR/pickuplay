import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Text } from '@components';
import { COLORS, SIZES } from '@constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import publicApi, { authenticatedApi } from '@services/api';
import { useUserData } from '@services/useUserData';
import { Dropdown } from 'react-native-element-dropdown';
import RBSheet from 'react-native-raw-bottom-sheet';

type UserForm = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityId: string;
  skillLevel: string;
};

const SKILL_LEVELS = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
  { label: 'Pro', value: 'PRO' },
];

const EditProfileForm = ({ route }: { route?: any }) => {
  // Route params hold the id; fall back to the logged-in user's id
  const { userData, refreshUserData } = useUserData();
  const userId = route?.params?.userId ?? userData?.id;

  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const refDeleteSheet = useRef<any>(null);
  const [user, setUser] = useState<UserForm>({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cityId: '',
    skillLevel: '',
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { navigate } = useNavigation<any>();

  const handleChange = (field: keyof UserForm, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const getCities = useCallback(async () => {
    try {
      const response = await publicApi.get('cities');
      const cityList = response.result.data;
      setCities(
        cityList
          .map((city: any) => ({ label: city.name, value: String(city.id) }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label))
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to load cities');
      setCities([]);
    }
  }, []);

  const getUser = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await authenticatedApi.get(`profile/${userId}`);
      const profile = response.result.data;
      setUser({
        userId: String(profile.id ?? ''),
        firstName: profile.firstname ?? '',
        lastName: profile.lastname ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        cityId: profile.city?.id != null ? String(profile.city.id) : '',
        skillLevel: profile.skillLevel ?? '',
      });
    } catch (e: any) {
      console.error('Failed to load profile', e);
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to load profile');
    }
  }, [userId]);

  useEffect(() => {
    getCities();
  }, [getCities]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      // Map to the field names the API uses (firstname / lastname)
      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        cityId: user.cityId,
        skillLevel: user.skillLevel,
      };
      console.log(payload);
      await authenticatedApi.patch('profile', payload);

      // Only cache locally after the update succeeded
      await AsyncStorage.multiSet([
        ['firstName', user.firstName],
        ['lastName', user.lastName],
        ['email', user.email],
        ['phone', user.phone],
        ['cityId', user.cityId],
      ]);
      await refreshUserData();

      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      console.error('Error updating user profile:', e);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authenticatedApi.delete('profile');

      await AsyncStorage.multiRemove([
        'access_token', 'refresh_token', 'id', 'firstName', 'lastName', 'email',
        'phone', 'cityId', 'role', 'preferredLanguage', 'profileImage', 'gameId',
      ]);
      await refreshUserData();
      refDeleteSheet.current?.close();
      navigate('welcome');
    } catch (e) {
      console.error('Failed to delete account', e);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={user.firstName}
            onChangeText={text => handleChange('firstName', text)}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={user.lastName}
            onChangeText={text => handleChange('lastName', text)}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user.email}
            placeholder="Enter email"
            keyboardType="email-address"
            editable={false} // Email is the identifier, so it isn't editable
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={user.phone}
            onChangeText={text => handleChange('phone', text)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <Dropdown
            data={cities}
            labelField="label"
            valueField="value"
            search
            placeholder={t('edit_game.select_city')}
            value={user.cityId}
            onChange={item => handleChange('cityId', String(item.value))}
            style={styles.dropdown}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Skill level</Text>
          <Dropdown
            data={SKILL_LEVELS}
            labelField="label"
            valueField="value"
            search
            placeholder={t('edit_game.select_skill')}
            value={user.skillLevel}
            onChange={item => handleChange('skillLevel', item.value)}
            style={styles.dropdown}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleUpdateUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('editProfile.updating') : t('editProfile.saveChanges')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.desactivateBotton, loading && styles.disabledButton]}
          onPress={() => refDeleteSheet.current?.open()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{t('editProfile.deleteMyAccount')}</Text>
        </TouchableOpacity>
      </View>

      <RBSheet
        ref={refDeleteSheet}
        closeOnPressMask
        height={260}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
          draggableIcon: { backgroundColor: COLORS.grayscale200, height: 4 },
          container: {
            borderTopRightRadius: 32,
            borderTopLeftRadius: 32,
            height: 260,
            backgroundColor: COLORS.white,
          },
        }}
      >
        <Text style={styles.bottomTitle}>Delete Account</Text>
        <View style={[styles.separateLine, { backgroundColor: COLORS.grayscale200 }]} />
        <Text style={[styles.bottomSubtitle, { color: COLORS.black }]}>
          {t(
            'settings.deleteAccountConfirmation',
            'This will permanently delete your account and all associated data. This action cannot be undone.'
          )}
        </Text>
        <View style={styles.bottomContainer}>
          <Button
            title={t('settings.deleteAccount', 'Delete Account')}
            filled
            style={[styles.confirmDelete, { backgroundColor: COLORS.red, borderColor: COLORS.error }]}
            onPress={handleDeleteAccount}
          />
          <Button
            title={t('c.cancel')}
            style={{
              width: (SIZES.width - 32) / 2 - 8,
              backgroundColor: COLORS.transparentPrimary,
              borderRadius: 32,
              borderColor: COLORS.transparentPrimary,
            }}
            textColor={COLORS.primary}
            onPress={() => refDeleteSheet.current?.close()}
          />
        </View>
      </RBSheet>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
  inputGroup: { marginBottom: 16 },
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  desactivateBotton: {
    backgroundColor: COLORS.red,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: { backgroundColor: '#aaa' },
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
  confirmDelete: {
    width: (SIZES.width - 32) / 2 - 8,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  bottomTitle: {
    fontSize: 24,
    fontFamily: 'semiBold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  bottomSubtitle: {
    fontSize: 20,
    fontFamily: 'semiBold',
    color: COLORS.grayscale900,
    textAlign: 'center',
    marginVertical: 28,
  },
  separateLine: {
    width: SIZES.width,
    height: 1,
    backgroundColor: COLORS.grayscale200,
    marginTop: 12,
  },
});

export default EditProfileForm;