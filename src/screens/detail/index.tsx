import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageSlider from './ImageSlider';
import InfoRow from './InfoRow';
import { Header, Icon } from '@components';
import { COLORS, icons } from '@constants';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

export default function ActivityDetailsScreen({ route }) {
  const { t } = useTranslation();
  const { activity, membershipId} = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);
  // Generate multiple images for the slider using our AI API
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };
const venueData = {
    name: "Central Park",
    type: "Park",
    description: "A sprawling urban oasis with lush lawns, scenic lakes, and winding paths perfect for relaxation and recreation in the heart of the city.",
    address: "59th to 110th St., Manhattan, New York, NY",
    activeDays: [
      { day: "Monday", isOpen: true, hours: "9am to 19pm" },
      { day: "Tuesday", isOpen: true, hours: "9am to 19pm" },
      { day: "Wednesday", isOpen: false, hours: "" },
      { day: "Thursday", isOpen: false, hours: "" },
      { day: "Friday", isOpen: false, hours: "" },
      { day: "Saturday", isOpen: true, hours: "11am to 22pm" },
      { day: "Sunday", isOpen: false, hours: "" },
    ],
    allowedVisits: 2,
    imageUrl: "https://api.a0.dev/assets/image?text=Central%20Park&aspect=16:9&seed=123"
  };
  // Filter to show only open days for the summary view
  const openDays = venueData.activeDays
    .filter(day => day.isOpen)
    .map(day => day.day)
    .join(', ');
  
  const activityData = {
    name: activity.name,
    type: activity.type,
    description: activity.description,
    city: activity.city,
    location: activity.location,
    allowedVisits: activity.allowedVisits,
    activeDays: activity.activeDays,
    MemberShipType: activity.MemberShipType,
    isActive: activity.isActive
  };

  useEffect(() => {
    console.log(activityData);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('activity.activity_details')} />
      <ScrollView bounces={false}>
        <ImageSlider images={activity.cover_images} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{activityData.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t(`${activityData.type.toLowerCase()}`)}</Text>
            </View>
          </View>

          <Text style={styles.description}>{activityData.description}</Text>

          <View style={styles.infoContainer}>
            <InfoRow 
              icon="map-marker" 
              label={t('activity.location')} 
              value={activityData.location} 
            />
            {/* Active Days */}
            <View style={styles.section}>
              <Icon type="materialCommunityIcons" name="calendar-range" size={24} color="#666" />
              <View style={styles.textContainer}>
                <Text style={styles.label}>Active Days</Text>
                <View style={styles.activeDaysRow}>
                  <Text style={styles.openDaysText}>
                    {Object.entries(activityData.activeDays || {})
                      .filter(([day, info]) => {
                        // Skip the _id field and only process day objects
                        if (day === '_id') return false;
                        return info.active; // Changed from info.isOpen to info.active
                      })
                      .map(([day, info]) => day.charAt(0).toUpperCase() + day.slice(1))
                      .join(', ') || 'No active days'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setExpandedDay(expandedDay ? null : 'all')}
                    style={styles.expandAllButton}
                  >
                    <Icon
                      type="feather" 
                      name={expandedDay ? "chevron-up" : "chevron-down"} 
                      size={22} 
                      color="#1976D2"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Expandable schedule details */}
            {expandedDay && (
              <View style={styles.daysContainer}>
                {Object.entries(activityData.activeDays || {})
                  .filter(([day, info]) => {
                    // Skip the _id field and only process day objects
                    if (day === '_id') return false;
                    return info.active; // Changed from info.isOpen to info.active
                  })
                  .map(([day, info]) => {
                    // Format the time display
                    const formatTime = (timeString) => {
                      if (!timeString) return 'Not specified';
                      const date = new Date(timeString);
                      return date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      });
                    };

                    const startTime = formatTime(info.startTime);
                    const endTime = formatTime(info.endTime);
                    const hours = `${startTime} - ${endTime}`;

                    return (
                      <View key={day} style={styles.daySchedule}>
                        <View style={styles.dayNameContainer}>
                          <View style={[styles.dayDot, {backgroundColor: '#4CAF50'}]} />
                          <Text style={styles.dayName}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </Text>
                        </View>
                        <Text style={styles.hoursText}>{hours}</Text>
                      </View>
                    );
                  })}
              </View>
            )}
            <InfoRow 
              icon="ticket-confirmation" 
              label={t('activity.allowedVisits')} 
              value={activityData.allowedVisits + t(activityData.allowedVisits == 1 ? 'activity.visitCount_one' : 'activity.visitCount_plural')} 
            />
            <InfoRow 
              icon="account-group" 
              label={t('activity.membershipTypes')} 
              value={activityData.MemberShipType.join(", ")} 
            />
          </View>
          {activity.remainingVisits > 0 && (
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setModalVisible(true)}
            >
              <Icon type="materialCommunityIcons" name="qrcode-scan" size={24} color="white" />
              <Text style={styles.buttonText}>{t('activity.scanButton')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('activity.qrModal.title')}</Text>
              <Pressable 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
              </Pressable>
            </View>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={JSON.stringify({
                  membershipId: membershipId,
                  activityId: activity._id
                })}
                size={200}
              />
            </View>
            
            <Text style={styles.qrInstructions}>
              {t('activity.qrModal.instructions')}
            </Text>
            
            <Text style={styles.activityName}>{activityData.name}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 10,
  },
  infoContainer: {
    marginBottom: 6,
  },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    // Add a subtle border
    borderWidth: 1,
    borderColor: '#eee',
  },
  qrInstructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginTop: 2,
  },
  
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  openDaysSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  openDaysText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  expandAllButton: {
    padding: 5,
  },
  daysContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  daySchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dayName: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
    minWidth: 80,
  },
  hoursText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
  }
});