import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { X } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../styles';
import Input from '@components/Input';
import { COLORS } from '@constants';
import { Button } from '@components';

interface FormData {
  address: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  numPlayers: string;
  isFree: boolean;
  pricePerPlayer: string;
}

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
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
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
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onCreateGame}
                style={styles.createButton}
              >
                <Text style={styles.createButtonText}>Create Game</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}