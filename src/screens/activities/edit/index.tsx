import { COLORS } from '@constants';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
//import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BACKEND_URL } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '@components';
import { useTranslation } from 'react-i18next';

const ActivityModal = ({ visible, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    type: '',
    city: '',
    allowedVisits: '',
    description: '',
    location: '',
  });
  const { t } = useTranslation();

  // Active days state with time ranges
  const [activeDays, setActiveDays] = useState({
    monday: {
      active: false,
      startTime: new Date(),
      endTime: new Date()
    },
    tuesday: {
      active: false,
      startTime: new Date(),
      endTime: new Date()
    },
    wednesday: {
      active: false,
      startTime: new Date(),
      endTime: new Date()
    },
    thursday: {
      active: false,
      startTime: new Date(),
      endTime: new Date()
    },
    friday: {
      active: false,
      startTime: new Date(),
      endTime: new Date()
    },
    saturday: {
      active: false,
      startTime: new Date(),
      endTime: new Date()
    },
    sunday: {
      active: false,
      startTime: new Date(),
      endTime: new Date()
    }
  });

  // Time picker visibility state
  const [timePickerState, setTimePickerState] = useState({
    visible: false,
    day: null,
    isStartTime: true,
  });

  // Toggle active days
  const toggleDay = (day) => {
    setActiveDays({
      ...activeDays,
      [day]: {
        ...activeDays[day],
        active: !activeDays[day].active,
      },
    });
  };

  // Handle time changes
  const onChangeTime = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setTimePickerState({
        visible: false,
        day: null,
        isStartTime: true,
      });
      return;
    }

    const { day, isStartTime } = timePickerState;
    const currentTime = selectedTime || (isStartTime ? activeDays[day].startTime : activeDays[day].endTime);

    setActiveDays({
      ...activeDays,
      [day]: {
        ...activeDays[day],
        [isStartTime ? 'startTime' : 'endTime']: currentTime,
      },
    });

    if (Platform.OS === 'android') {
      setTimePickerState({
        visible: false,
        day: null,
        isStartTime: true,
      });
    }
  };

  // Show time picker
  const showTimePicker = (day, isStartTime) => {
    setTimePickerState({
      visible: true,
      day,
      isStartTime,
    });
  };

  // Format time for display
  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save the activity
  const handleSave = async () => {
    try {
      const activityData = {
        ...formData,
        allowedVisits: parseInt(formData.allowedVisits, 10) || 0,
        activeDays: activeDays,
      };
      
      const activityId = await AsyncStorage.getItem('activityId');
      
      if (activityId) {
        // Edit existing activity
        const response = await axios.put(`${API_BACKEND_URL}/activities/${activityId}`, activityData);
        console.log('Activity updated:', response.data);
      } else {
        // Create new activity
        const response = await axios.post(`${API_BACKEND_URL}/activities`, activityData);
        console.log('Activity created:', response.data);
      }
      
    } catch (error) {
      console.error('Error saving activity:', error);
      // Alert.alert('edit_activity.Error', 'Failed to save activity');
    }
  }; 
  

  useEffect(() => {
    const getActivity = async () => {
      try {
        const activityId = await AsyncStorage.getItem('activityId');
        if (activityId && !initialData) { // Only fetch if no initialData provided
          const response = await axios.get(`${API_BACKEND_URL}/activities/${activityId}`);

          // Set form data from fetched activity
          setFormData({
            name: response.data.name || '',
            type: response.data.type || '',
            city: response.data.city || '',
            allowedVisits: response.data.allowedVisits?.toString() || '',
            description: response.data.description || '',
            location: response.data.location || '',
          });
          console.log(response.data);
          // Set active days if they exist
          if (response.data.activeDays) {
            const updatedActiveDays = { ...activeDays };
            
            // Get only the day names, excluding _id
            const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            
            dayNames.forEach(day => {
              if (response.data.activeDays[day]) {
                updatedActiveDays[day] = {
                  active: response.data.activeDays[day].active || false,
                  startTime: response.data.activeDays[day].startTime 
                    ? new Date(response.data.activeDays[day].startTime) 
                    : new Date(),
                  endTime: response.data.activeDays[day].endTime 
                    ? new Date(response.data.activeDays[day].endTime) 
                    : new Date()
                };
              }
            });
            
            setActiveDays(updatedActiveDays);
          }
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        // You'll need to import Alert
        // Alert.alert('edit_activity.Error', 'Failed to load activity data');
      }
    };
  
      getActivity();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header title={t('edit_activity.edit_activity')} />
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_activity.activity_name')}</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder={t('edit_activity.enter_activity_name')}
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_activity.type')}</Text>
            <RNPickerSelect
              onValueChange={(value) => handleChange('type', value)}
              value={formData.type}
              items={[
                { label: t('edit_activity.fitness'), value: 'fitness' },
                { label: t('edit_activity.sports'), value: 'sports' },
                { label: t('edit_activity.wellness'), value: 'wellness' },
                { label: t('edit_activity.pool'), value: 'pool' },
                { label: t('edit_activity.museum'), value: 'museum' },
                { label: t('edit_activity.cinema'), value: 'cinema' },
                { label: t('edit_activity.park'), value: 'park' },
                { label: t('edit_activity.theater'), value: 'theater' },
                { label: t('edit_activity.restaurant'), value: 'restaurant' },
              ]}
              style={pickerSelectStyles}
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_activity.city')}</Text>
            <RNPickerSelect
              onValueChange={(value) => handleChange('city', value)}
              value={formData.city}
              items={[
                { label: t('edit_activity.casablanca'), value: 'casablanca' },
                { label: t('edit_activity.marrakesh'), value: 'marrakesh' },
                { label: t('edit_activity.tanger'), value: 'tanger' },
                { label: t('edit_activity.fes'), value: 'fes' },
                { label: t('edit_activity.agadir'), value: 'agadir' },
                { label: t('edit_activity.rabat'), value: 'rabat' },
              ]}
              style={pickerSelectStyles}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_activity.location')}</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => handleChange('location', text)}
              placeholder={t('edit_activity.enter_location')}
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_activity.allowed_visits')}</Text>
            <RNPickerSelect
              onValueChange={(value) => handleChange('allowedVisits', value)}
              value={formData.allowedVisits}
              items={[
                { label: '1', value: '1' },
                { label: '2', value: '2' },
                { label: '3', value: '3' },
                { label: '5', value: '5' },
              ]}
              style={pickerSelectStyles}
            />
          </View>
  
          {/* Active Days with Time Ranges */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_activity.active_days_hours')}</Text>
            
            {Object.keys(activeDays).map((day) => (
              <View key={day} style={styles.dayTimeContainer}>
                <TouchableOpacity
                  style={styles.checkboxWrapper}
                  onPress={() => toggleDay(day)}
                >
                  <View style={[styles.checkbox, activeDays[day].active && styles.checkboxActive]}>
                    {activeDays[day].active && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {t(day.toLowerCase())}
                  </Text>
                </TouchableOpacity>
                
                {activeDays[day].active && (
                  <View style={styles.dayTimeRange}>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => showTimePicker(day, true)}
                    >
                      <Text>{formatTime(activeDays[day].startTime)}</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.toText}>{t('edit_activity.to')}</Text>
                    
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => showTimePicker(day, false)}
                    >
                      <Text>{formatTime(activeDays[day].endTime)}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            
            {/*{timePickerState.visible && (
              <DateTimePicker
                value={timePickerState.isStartTime 
                  ? activeDays[timePickerState.day].startTime 
                  : activeDays[timePickerState.day].endTime
                }
                mode="time"
                display="default"
                onChange={onChangeTime}
              />
            )}*/}
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('edit_activity.description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              placeholder={t('edit_activity.enter_description')}
              multiline
              numberOfLines={4}
            />
          </View>
  
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>{t('edit_activity.save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.cancelText]}>{t('edit_activity.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
  }
});

const pickerSelectStyles = {
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
};

export default ActivityModal;