import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Icon, Text } from '@components';
import { COLORS, screens, SIZES } from '@constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { authenticatedApi } from '@services/api';
import { useUserData } from '@services/useUserData';
import { Dropdown } from 'react-native-element-dropdown';

const EditProfileForm = ({ onShowgame }) => {
  const { userData, error, refreshUserData } = useUserData();
  const [user, setUser] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { navigate } = useNavigation();


  const handleChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };
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
useEffect(() => {
  if (userData) {
    setUser({
      userId: userData.id ?? "",
      firstName: userData.firstName ?? "",
      lastName: userData.lastName ?? "",
      email: userData.email ?? "",
      phone: userData.phone ?? "",
      city: userData.city ?? "",
    });
  }
}, [userData]);

  const handleUpdateUser = async () => {
    try {     
      // Format birthday properly if needed
       const response = await authenticatedApi.patch(`profile`, user);
      await AsyncStorage.setItem("firstName", user.firstName);
      await AsyncStorage.setItem("lastName", user.lastName);
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
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
            onChangeText={(text) => handleChange('firstName', text)}
            placeholder="Enter first name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={user.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
            placeholder="Enter last name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Enter email"
            keyboardType="email-address"
            editable={false} // Email shouldn't be editable as it's the identifier
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={user.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <Dropdown
              data={city}
              labelField="label"
              valueField="value"
              search={true}
              placeholder={t('edit_game.select_city') }
              value={user.city}
              onChange={item => handleChange('city', item.value)}
              style={[styles.dropdown ]}
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

        {/*<TouchableOpacity 
          style={[styles.desactivateBotton, loading && styles.disabledButton]}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('editProfile.updating') : t('editProfile.deleteMyAccount')}
          </Text>
        </TouchableOpacity>*/}

      </View>
    </ScrollView>
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
    marginBottom: 16,
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
  dateButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  disabledButton: {
    backgroundColor: '#aaa',
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
  disabledDropdown: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  }
});

export default EditProfileForm;