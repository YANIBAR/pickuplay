import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Button, Icon, Text } from '@components';
import { COLORS, screens } from '@constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BACKEND_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { logout } from 'src/app/slices/auth';
import { useTranslation } from 'react-i18next';

const EditProfileForm = ({ onShowgame }) => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  useEffect(() => {
    const getUser = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        const response = await axios.get(API_BACKEND_URL + '/user/getUser/?email=' + email);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user profile data');
      }
    };

    getUser();
  }, []);

  const handleChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

const handleDeleteAccount = async () => {
  Alert.alert(
    "Confirm Account Deletion",
    "Are you sure you want to permanently delete your account?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          console.log("Deleting account for user ID:", user._id);
          try {
            console.log(API_BACKEND_URL+`/user/delete/${user._id}`);
            const response = await axios.post(API_BACKEND_URL+`/user/deleteMyAccount/${user._id}`);
            // Logout user
            const keysToRemove = [
              'access_token',
              'id',
              'firstName',
              'lastName',
              'email',
              'phone',
              'role',
              'preferredLanguage',
              'profileImage',
              'gameId',
            ];
            await AsyncStorage.multiRemove(keysToRemove);
            //setUser(null); // Reset user state
                navigate("login");
          } catch (err) {
            Alert.alert("Error", "Failed to delete account.");
          }
        },
      },
    ]
  );
};



  const handleUpdateUser = async () => {
    try {     
      // Format birthday properly if needed
      const formattedData = {
        ...user,
        birthday: user.birthday instanceof Date ? user.birthday.toISOString() : user.birthday,
      };
       const response = await axios.post(
        `${API_BACKEND_URL}/user/edit/${formattedData._id}`, 
        formattedData
      );
      await AsyncStorage.setItem("firstName", formattedData.firstName);
      await AsyncStorage.setItem("lastName", formattedData.lastName);
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
          <RNPickerSelect
            onValueChange={(value) => handleChange('city', value)}
            value={user.city}
            items={[
              { label: 'Casablanca', value: 'casablanca' },
              { label: 'Fes', value: 'fes' },
              { label: 'Rabat', value: 'rabat' },
              { label: 'Tangier', value: 'tangier' },
              { label: 'Marrakesh', value: 'marrakesh' },
              { label: 'Agadir', value: 'agadir' },
            ]}
            style={{
              viewContainer: {
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                backgroundColor: 'white',
              },
              inputIOS: {
                padding: 12,
                fontSize: 16,
                color: '#333',
              },
              inputAndroid: {
                padding: 12,
                fontSize: 16,
                color: '#333',
              }
            }}
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
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('editProfile.updating') : t('editProfile.deleteMyAccount')}
          </Text>
        </TouchableOpacity>

        {user.role === 'Partner' && (
          <TouchableOpacity 
            style={[styles.button, { marginTop: 12, backgroundColor: COLORS.secondary }]}
            onPress={() => navigate("editgame")}
          >
            <Text style={styles.buttonText}> t('edit_game.edit_game')</Text>
          </TouchableOpacity>
        )}

        {/*user.role === 'Customer' && (
          <TouchableOpacity 
            style={[styles.button, { marginTop: 12, backgroundColor: '#5856D6' }]}
            onPress={() => navigation.navigate("addMembership")}
          >
            <Text style={styles.buttonText}>Add New Membership</Text>
          </TouchableOpacity>
        )*/}
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
});

export default EditProfileForm;