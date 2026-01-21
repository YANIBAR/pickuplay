import { COLORS } from '@constants';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BACKEND_URL } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const gameModal = ({ visible, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    type: '',
    city: '',
    allowedVisits: '',
    description: '',
    location: '',
  });
  const [game, setgame] = useState(false);

  useEffect(() => {
    const getgame = async () => {
      try {
        const gameId = await AsyncStorage.getItem('gameId');
        const response = await axios.get(API_BACKEND_URL + '/games/' + gameId);
        console.log(API_BACKEND_URL + '/games/' + gameId);
        setgame(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user profile data');
      }
    };

    getgame();
  }, []);
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
    },
  });

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || '',
        city: initialData.city || '',
        allowedVisits: initialData.allowedVisits?.toString() || '',
        description: initialData.description || '',
        location: initialData.location || '',
      });

      if (initialData.activeDays) {
        const updatedActiveDays = { ...activeDays };
        Object.keys(initialData.activeDays).forEach(day => {
          if (initialData.activeDays[day]) {
            updatedActiveDays[day] = {
              active: initialData.activeDays[day].active || false,
              startTime: initialData.activeDays[day].startTime 
                ? new Date(initialData.activeDays[day].startTime) 
                : new Date(),
              endTime: initialData.activeDays[day].endTime 
                ? new Date(initialData.activeDays[day].endTime) 
                : new Date()
            };
          }
        });
        setActiveDays(updatedActiveDays);
      }
    }
  }, [initialData, visible]);

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

  // Save the game
  const handleSave = () => {
    const gameData = {
      ...formData,
      allowedVisits: parseInt(formData.allowedVisits, 10) || 0,
      activeDays: activeDays,
    };
    
    onSave(gameData);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Edit game</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>game Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Enter game name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type</Text>
              <RNPickerSelect
                onValueChange={(value) => handleChange('type', value)}
                value={formData.type}
                items={[
                  { label: 'Fitness', value: 'fitness' },
                  { label: 'Sports', value: 'sports' },
                  { label: 'Wellness', value: 'wellness' },
                  { label: 'Pool', value: 'pool' },
                  { label: 'Museum', value: 'museum' },
                  { label: 'Cinema', value: 'cinema' },
                  { label: 'Park', value: 'park' },
                  { label: 'Theater', value: 'theater' },
                  { label: 'Restaurant', value: 'restaurant' },
                ]}
                style={pickerSelectStyles}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <RNPickerSelect
                onValueChange={(value) => handleChange('city', value)}
                value={formData.city}
                items={[
                  { label: 'Casablanca', value: 'casablanca' },
                  { label: 'Marrakesh', value: 'marrakesh' },
                  { label: 'Tanger', value: 'tanger' },
                  { label: 'Fes', value: 'fes' },
                  { label: 'Agadir', value: 'agadir' },
                  { label: 'Rabat', value: 'rabat' },
                ]}
                style={pickerSelectStyles}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => handleChange('location', text)}
                placeholder="Enter location"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Allowed Visits</Text>
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
              <Text style={styles.label}>Active Days & Hours</Text>
              
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
                      {day.charAt(0).toUpperCase() + day.slice(1)}
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
                      
                      <Text style={styles.toText}>to</Text>
                      
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
              
              {timePickerState.visible && (
                <DateTimePicker
                  value={timePickerState.isStartTime 
                    ? activeDays[timePickerState.day].startTime 
                    : activeDays[timePickerState.day].endTime
                  }
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => handleChange('description', text)}
                placeholder="Enter description"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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

export default gameModal;