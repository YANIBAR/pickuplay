import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  SafeAreaView,
  Dimensions,
  StyleSheet,
} from 'react-native';

import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import styles from './styles';
import Input from '@components/Input';
import { COLORS, icons } from '@constants';
export default function HomeScreen({ route }) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [games, setGames] = useState([]);

  const [formData, setFormData] = useState({
    address: '',
    startTime: '',
    endTime: '',
    numPlayers: '',
    isFree: true,
    pricePerPlayer: '',
  });

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const openModal = (date) => {
    setSelectedDate(date);
    setFormData({
      address: '',
      startTime: '',
      endTime: '',
      numPlayers: '',
      isFree: true,
      pricePerPlayer: '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  const handleCreateGame = () => {
    if (
      !formData.address ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.numPlayers
    ) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.isFree && !formData.pricePerPlayer) {
      alert('Please enter price per player');
      return;
    }

    const newGame = {
      id: Date.now(),
      date: selectedDate,
      ...formData,
    };

    setGames([...games, newGame]);
    closeModal();
  };

  const getGamesForDate = (date) => {
    return games.filter(
      (game) => game.date.toDateString() === date.toDateString()
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.headerButton}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {weekStart.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <TouchableOpacity onPress={goToNextWeek} style={styles.headerButton}>
            <ChevronRight size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {weekDays.map((date, index) => {
          const dayGames = getGamesForDate(date);
          return (
            <TouchableOpacity
              key={index}
              onPress={() => openModal(date)}
              style={styles.dayCard}
            >
              <Text style={styles.dayCardTitle}>{formatDate(date)}</Text>

              {dayGames.length === 0 ? (
                <Text style={styles.emptyText}>No games scheduled</Text>
              ) : (
                dayGames.map((game) => (
                  <View key={game.id} style={styles.gameItem}>
                    <Text style={styles.gameAddress}>{game.address}</Text>
                    <Text style={styles.gameTime}>
                      {game.startTime} - {game.endTime}
                    </Text>
                    <Text style={styles.gamePlayers}>
                      Players: {game.numPlayers}{' '}
                      {game.isFree
                        ? '(Free)'
                        : `($${game.pricePerPlayer}/player)`}
                    </Text>
                  </View>
                ))
              )}

              <Text style={styles.addGameText}>+ Add Game</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Create Game {'\n'}
                {selectedDate && formatDate(selectedDate)}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
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
                    setFormData({ ...formData, address: text })}
                  placeholder="Enter address"
                  placeholderTextColor={COLORS.black}
                  keyboardType="default"
                />
              </View>

              {/* Start Time */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Start Time *</Text>
                <Input
                  id="starTime"
                  placeholder="e.g., 2:00 PM"
                  placeholderTextColor={COLORS.black}
                  keyboardType="numeric"
                />
              </View>

              {/* End Time */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>End Time *</Text>
                <Input
                  id="endTime"
                  errorText={formData.endTime}
                  placeholder="e.g., 4:00 PM"
                  placeholderTextColor={COLORS.black}
                  keyboardType="numeric"
                />
              </View>

              {/* Number of Players */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Number of Players *</Text>
                <Input
                  id="numPlayers"
                  errorText={formData.numPlayers}
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
                    setFormData({ ...formData, isFree: value })
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
                  onPress={closeModal}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateGame}
                  style={styles.createButton}
                >
                  <Text style={styles.createButtonText}>Create Game</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
