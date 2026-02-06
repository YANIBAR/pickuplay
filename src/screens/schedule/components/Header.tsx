import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import styles from '../styles';

interface HeaderProps {
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export default function Header({
  weekStart,
  onPreviousWeek,
  onNextWeek,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onPreviousWeek} style={styles.headerButton}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {weekStart.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity onPress={onNextWeek} style={styles.headerButton}>
          <ChevronRight size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}