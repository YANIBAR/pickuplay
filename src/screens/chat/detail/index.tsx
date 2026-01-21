import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageSlider from './ImageSlider';
import InfoRow from './InfoRow';
import { Header, Icon } from '@components';
import { COLORS } from '@constants';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

export default function EventDetailsScreen({ route }) {
  const { t } = useTranslation();
  const { event, membershipId } = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date for registration deadline
  const formatRegistrationDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      formatted: date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      isOpen: daysLeft > 0
    };
  };

  const eventData = {
    name: event.eventName,
    description: event.eventDescription,
    image: event.image,
    numberOfVisits: event.numberOfVisits,
    howItWorks: event.howItWorks,
    eventDate: event.eventDate,
    eventTime: event.eventTime,
    dateRegistrationBefore: event.dateRegistrationBefore,
    location: event.location,
    city: event.city,
    MemberShipType: event.MemberShipType || [],
    isActive: event.isActive,
    remainingVisits: event.remainingVisits || event.numberOfVisits,
    registrationCount: event.registrationCount || 0
  };

  const registrationInfo = formatRegistrationDeadline(eventData.dateRegistrationBefore);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('event.eventDetails')} />
      <ScrollView bounces={false}>
        <ImageSlider images={event.cover_images || [event.image]} />
        
        <View style={styles.content}>
          {/* Header with status badges */}
          <View style={styles.header}>
            <Text style={styles.title}>{eventData.name}</Text>
            <View style={styles.badgesContainer}>
              {registrationInfo.isOpen ? (
                <View style={[styles.badge, styles.openBadge]}>
                  <Text style={styles.badgeText}>
                    {t('event.registrationOpen')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.closedBadge]}>
                  <Text style={styles.badgeText}>
                    {t('event.registrationClosed')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Registration deadline alert */}
          {registrationInfo.isOpen && (
            <View style={styles.deadlineAlert}>
              <Icon type="materialCommunityIcons" name="clock-alert-outline" size={20} color="#FF6F00" />
              <Text style={styles.deadlineText}>
                {t('event.registerBefore', { 
                  days: registrationInfo.daysLeft,
                  date: registrationInfo.formatted 
                })}
              </Text>
            </View>
          )}

          <Text style={styles.description}>{eventData.description}</Text>

          {/* Event Information */}
          <View style={styles.infoContainer}>
            <InfoRow 
              icon="calendar" 
              label={t('event.eventDate')} 
              value={formatDate(eventData.eventDate)} 
            />
            
            <InfoRow 
              icon="clock-outline" 
              label={t('event.eventTime')} 
              value={eventData.eventTime} 
            />
            
            <InfoRow 
              icon="map-marker" 
              label={t('event.location')} 
              value={`${eventData.location}, ${eventData.city}`} 
            />
            
            <InfoRow 
              icon="ticket-confirmation" 
              label={t('event.availableSlots')} 
              value={`${eventData.remainingVisits} ${t('event.of')} ${eventData.numberOfVisits}`} 
            />
            
            {eventData.MemberShipType.length > 0 && (
              <InfoRow 
                icon="account-group" 
                label={t('event.membershipTypes')} 
                value={eventData.MemberShipType.join(", ")} 
              />
            )}
          </View>

          {/* How It Works Section */}
          {eventData.howItWorks && (
            <View style={styles.howItWorksContainer}>
              <View style={styles.sectionHeader}>
                <Icon type="materialCommunityIcons" name="information-outline" size={24} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{t('event.howItWorks')}</Text>
              </View>
              <View style={styles.howItWorksContent}>
                {eventData.howItWorks.split('\n').map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Registration Button */}
          {eventData.remainingVisits > 0 && registrationInfo.isOpen ? (
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setModalVisible(true)}
            >
              <Icon type="materialCommunityIcons" name="qrcode-scan" size={24} color="white" />
              <Text style={styles.buttonText}>{t('event.registerNow')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.disabledButton}>
              <Text style={styles.disabledButtonText}>
                {eventData.remainingVisits === 0 
                  ? t('event.eventFull')
                  : t('event.registrationClosed')}
              </Text>
            </View>
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
              <Text style={styles.modalTitle}>{t('event.qrModal.title')}</Text>
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
                  eventId: event._id,
                  eventName: eventData.name,
                  eventDate: eventData.eventDate
                })}
                size={200}
              />
            </View>
            
            <Text style={styles.qrInstructions}>
              {t('event.qrModal.instructions')}
            </Text>
            
            <View style={styles.eventInfo}>
              <Text style={styles.eventName}>{eventData.name}</Text>
              <Text style={styles.eventDateSmall}>
                {formatDate(eventData.eventDate)}
              </Text>
              <Text style={styles.eventTimeSmall}>{eventData.eventTime}</Text>
            </View>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  openBadge: {
    backgroundColor: '#4CAF50',
  },
  closedBadge: {
    backgroundColor: '#F44336',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deadlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  deadlineText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  howItWorksContainer: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  howItWorksContent: {
    gap: 12,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
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
    width: '85%',
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
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#eee',
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  eventInfo: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    width: '100%',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  eventDateSmall: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventTimeSmall: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});