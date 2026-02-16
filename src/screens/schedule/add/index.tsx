import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
//import DateTimePicker from '@react-native-community/datetimepicker';
import { Header, Icon } from '@components';
import { COLORS, icons } from '@constants';
import { useTranslation } from 'react-i18next';

interface MemberData {
  memberName: string;
  membershipType: 'adult' | 'kids' | '';
  membershipCity: string;
  expireDate: Date;
  status: 'actif' | 'inactif' | '';
  gender: 'male' | 'female' | '';
  birthDate: Date;
}

export default function HomeScreen() {
  const [memberData, setMemberData] = useState<MemberData>({
    memberName: '',
    membershipType: '',
    membershipCity: '',
    expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    status: 'actif',
    gender: '',
    birthDate: new Date(),
  });
  const { t } = useTranslation();

  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);

  const cities = ['Casablanca', 'Fes', 'Rabat', 'Tangier', 'Agadir', 'Marrakesh'];

  const handleInputChange = (field: keyof MemberData, value: any) => {
    setMemberData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!memberData.memberName.trim()) {
      console.log('Please enter member name');
      return false;
    }
    if (!memberData.membershipType) {
      console.log('Please select membership type');
      return false;
    }
    if (!memberData.membershipCity) {
      console.log('Please select a city');
      return false;
    }
    if (!memberData.gender) {
      console.log('Please select gender');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log('Member Data:', memberData);
      console.log('Membership added successfully!');
      
      // Reset form
      setMemberData({
        memberName: '',
        membershipType: '',
        membershipCity: '',
        expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'actif',
        gender: '',
        birthDate: new Date(),
      });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header title={t('add_membership.addMembership')} />
      <View style={styles.form}>
        {/* Member Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_membership.memberName')}</Text>
          <TextInput
            style={styles.textInput}
            value={memberData.memberName}
            onChangeText={(text) => handleInputChange('memberName', text)}
            placeholder={t('add_membership.enterFullName')}
            placeholderTextColor="#9ca3af"
          />
        </View>
  
        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_membership.gender')}</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                memberData.gender === 'male' && styles.radioOptionSelected
              ]}
              onPress={() => handleInputChange('gender', 'male')}
            >
              <View style={[
                styles.radioCircle,
                memberData.gender === 'male' && styles.radioCircleSelected
              ]}>
                {memberData.gender === 'male' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>{t('add_membership.male')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.radioOption,
                memberData.gender === 'female' && styles.radioOptionSelected
              ]}
              onPress={() => handleInputChange('gender', 'female')}
            >
              <View style={[
                styles.radioCircle,
                memberData.gender === 'female' && styles.radioCircleSelected
              ]}>
                {memberData.gender === 'female' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>{t('add_membership.female')}</Text>
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Birth Date 
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_membership.birthDate')}</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowBirthDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(memberData.birthDate)}</Text>
            <Icon type="ionicons" name="calendar-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          {showBirthDatePicker && (
            <DateTimePicker
              value={memberData.birthDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowBirthDatePicker(false);
                if (selectedDate) {
                  handleInputChange('birthDate', selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </View>   */}
  
        {/* City */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_membership.city')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={memberData.membershipCity}
              onValueChange={(itemValue) => handleInputChange('membershipCity', itemValue)}
              style={styles.picker}
            >
              <Picker.Item label={t('add_membership.selectCity')} value="" />
              {cities.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>
        </View>     
  
        {/* Membership Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_membership.membershipType')}</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                memberData.membershipType === 'adult' && styles.radioOptionSelected
              ]}
              onPress={() => handleInputChange('membershipType', 'adult')}
            >
              <View style={[
                styles.radioCircle,
                memberData.membershipType === 'adult' && styles.radioCircleSelected
              ]}>
                {memberData.membershipType === 'adult' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>{t('add_membership.adult')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.radioOption,
                memberData.membershipType === 'kids' && styles.radioOptionSelected
              ]}
              onPress={() => handleInputChange('membershipType', 'kids')}
            >
              <View style={[
                styles.radioCircle,
                memberData.membershipType === 'kids' && styles.radioCircleSelected
              ]}>
                {memberData.membershipType === 'kids' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>{t('add_membership.kids')}</Text>
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Expire Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_membership.startDate')}</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowExpireDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(memberData.expireDate)}</Text>
            <Icon type="ionicons" name="calendar-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          {showExpireDatePicker && (
            <DateTimePicker
              value={memberData.expireDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowExpireDatePicker(false);
                if (selectedDate) {
                  handleInputChange('expireDate', selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}
        </View>
  
        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Icon type="ionicons" name="checkmark-circle" size={24} color="white" />
          <Text style={styles.submitButtonText}>{t('add_membership.submitButton')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1f2937',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flex: 1,
  },
  radioOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#eff6ff',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    marginTop: 20,
    gap: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});