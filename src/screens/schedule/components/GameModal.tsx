import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../styles';
import Input from '@components/Input';
import { COLORS, SIZES } from '@constants';
import { Button } from '@components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { JAVA_API } from '@env';


interface FormData {
  title: string;
  sportType: string;
  address: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  numPlayers: string;
  isFree: boolean;
  pricePerPlayer: string;
}

const SportTypes = [
    { label: 'Soccer', value: '1' },
    { label: 'BasketBall', value: '2' },
    { label: 'VolleyBall', value: '3' },
    { label: 'Hockey', value: '4' },
    { label: 'Tennis', value: '5' },
  ];

interface GameModalProps {
  visible: boolean;
  selectedDate: Date | null;
  formData: FormData;
  startTimeDate: Date;
  endTimeDate: Date;
  onFormDataChange: (data: FormData) => void;
  onStartTimeDateChange: (date: Date) => void;
  onEndTimeDateChange: (date: Date) => void;
  onCreateGame: () => void;
  onClose: () => void;
}

export default function GameModal({
  visible,
  selectedDate,
  formData,
  startTimeDate,
  endTimeDate,
  onFormDataChange,
  onStartTimeDateChange,
  onEndTimeDateChange,
  onCreateGame,
  onClose,
}: GameModalProps) {
  const [isStartTimePickerVisible, setStartTimePickerVisibility] =
    useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sportType, setSportType] = useState('SOCCER');
  const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[styles.label, isFocus && { color: 'blue' }]}>
            Dropdown label
          </Text>
        );
      }
      return null;
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

  const handleStartTimeConfirm = (selectedTime: Date) => {
    onStartTimeDateChange(selectedTime);
    onFormDataChange({
      ...formData,
      startTime: formatTime(selectedTime),
    });
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (selectedTime: Date) => {
    onEndTimeDateChange(selectedTime);
    onFormDataChange({
      ...formData,
      endTime: formatTime(selectedTime),
    });
    hideEndTimePicker();
  };

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

  // Format time to HH:MM format (24-hour) for API
  const formatTimeForAPI = (timeString: string): string => {
    // timeString format: "02:30 pm"
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    let hoursNum = parseInt(hours, 10);

    if (period === 'pm' && hoursNum !== 12) {
      hoursNum += 12;
    } else if (period === 'am' && hoursNum === 12) {
      hoursNum = 0;
    }

    return `${String(hoursNum).padStart(2, '0')}:${minutes}`;
  };

  // Format date to YYYY-MM-DD format for API
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return false;
    }
    if (!formData.sportType.trim()) {
      Alert.alert('Validation Error', 'Please select a sport type');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validation Error', 'Please enter an address');
      return false;
    }
    if (!formData.startTime.trim()) {
      Alert.alert('Validation Error', 'Please select a start time');
      return false;
    }
    if (!formData.endTime.trim()) {
      Alert.alert('Validation Error', 'Please select an end time');
      return false;
    }
    if (!formData.numPlayers.trim()) {
      Alert.alert('Validation Error', 'Please enter number of players');
      return false;
    }
    if (!selectedDate) {
      Alert.alert('Validation Error', 'Please select a date');
      return false;
    }
    if (!formData.isFree && !formData.pricePerPlayer.trim()) {
      Alert.alert('Validation Error', 'Please enter price per player');
      return false;
    }
    return true;
  };

  // Create game and call API
  const handleCreateGame = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Get auth token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Prepare API payload
      const payload = {
        title: formData.title,
        description: `${formData.numPlayers} players`,
        sportType: formData.sportType,
        city: '', // Extract from address or make dynamic
        address: formData.address,
        date: formatDateForAPI(selectedDate),
        startTime: formatTimeForAPI(formData.startTime),
        endTime: formatTimeForAPI(formData.endTime),
        nbrSpots: parseInt(formData.numPlayers, 10),
      };

      // Make API call
      const response = await fetch(`${JAVA_API}pickups/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API Error: ${response.status}`
        );
      }

      const data = await response.json();
      Alert.alert('Success', 'Game created successfully!');
      
      // Call the original onCreateGame callback
      onCreateGame();
      onClose();
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to create game. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
              Create Game {'\n'}
              {selectedDate && formatDate(selectedDate)}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
              disabled={isLoading}
            >
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <Input
                id="title"
                onInputChanged={(text) =>
                  onFormDataChange({ ...formData, title: text })
                }
                placeholder="Enter game title"
                placeholderTextColor={COLORS.black}
                keyboardType="default"
              />
            </View>

            {/* Sport Type */}
           <View style={styles.formGroup}>

              <Text style={styles.formLabel}>Sport type *</Text>
            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={SportTypes}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Select item' : '...'}
              searchPlaceholder="Search..."
              value={value}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setValue(item.value);
                setIsFocus(false);
              }}
            />
          </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address *</Text>
              <Input
                id="address"
                onInputChanged={(text) =>
                  onFormDataChange({ ...formData, address: text })
                }
                placeholder="Enter address"
                placeholderTextColor={COLORS.black}
                keyboardType="default"
              />
            </View>

            {/* Start Time and End Time */}
            <View style={styles.container}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* Start Time */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Start Time *</Text>
                  <Button
                    title={
                      formData.startTime || formatTime(startTimeDate)
                    }
                    onPress={showStartTimePicker}
                    style={styles.inputContainer}
                  />
                  <DateTimePickerModal
                    isVisible={isStartTimePickerVisible}
                    mode="time"
                    onConfirm={handleStartTimeConfirm}
                    onCancel={hideStartTimePicker}
                  />
                </View>

                {/* End Time */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>End Time *</Text>
                  <Button
                    title={
                      formData.endTime || formatTime(endTimeDate)
                    }
                    onPress={showEndTimePicker}
                    style={styles.inputContainer}
                  />
                  <DateTimePickerModal
                    isVisible={isEndTimePickerVisible}
                    mode="time"
                    onConfirm={handleEndTimeConfirm}
                    onCancel={hideEndTimePicker}
                  />
                </View>
              </View>
            </View>

            {/* Number of Players */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Number of Players *</Text>
              <Input
                id="numPlayers"
                onInputChanged={(text) =>
                  onFormDataChange({ ...formData, numPlayers: text })
                }
                placeholder="Number of Players"
                placeholderTextColor={COLORS.black}
                keyboardType="numeric"
              />
            </View>

            {/* Free/Paid Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Free Game</Text>
              <Switch
                value={formData.isFree}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, isFree: value })
                }
                trackColor={{ false: '#86efac', true: COLORS.primary }}
                thumbColor={formData.isFree ? '#86efac' : COLORS.primary}
              />
            </View>

            {/* Price Per Player (conditionally shown) */}
            {!formData.isFree && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price Per Player *</Text>
                <View style={styles.priceInputRow}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <Input
                    id="priceInput"
                    onInputChanged={(text) =>
                      onFormDataChange({
                        ...formData,
                        pricePerPlayer: text,
                      })
                    }
                    placeholder="0.00"
                    placeholderTextColor={COLORS.black}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateGame}
                style={[styles.createButton, isLoading && { opacity: 0.5 }]}
                disabled={isLoading}
              >
                {isLoading ? (
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