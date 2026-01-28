import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageSlider from './ImageSlider';
import InfoRow from './InfoRow';
import { Header, Icon } from '@components';
import { COLORS, FONTS, icons } from '@constants';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

export default function gameDetailsScreen({ route }) {
  const { t } = useTranslation();
  const { game, membershipId} = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);
  // Generate multiple images for the slider using our AI API
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };
  const playersData = [
  { name: "alloudi", image: "https://pbs.twimg.com/media/F8-YPTEWIAEtdou.jpg" },
  { name: "zidan", image: "https://cdn.artphotolimited.com/images/59888232b0ba742a2efde168/1000x1000/zinedine-zidane-france-ukraine.jpg"},
  { name: "Maradona", image: "https://fcb-abj-pre.s3.amazonaws.com/img/jugadors/501_maradona.jpg" },
  { name: "Messi", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrrZKlZldiLM3-HD7SkznJ3TUpdF5AqiDOkQ&s" },
  { name: "Ronaldinho", image: "https://assets.goal.com/images/v3/blt4df7329019456080/b5216132b85c9f8120a989382bc204ebdc69067e.jpg?auto=webp&format=pjpg&width=3840&quality=60" },
  { name: "Ronaldo", image: "https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-2234200789.jpg?c=original" },
  { name: "jwi3a", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXt1UN6HL4_qlijjO-6jcBgA72g12giqFpGg&s" },
  { name: "yasser zabiri", image: "https://assets-us-01.kc-usercontent.com/31dbcbc6-da4c-0033-328a-d7621d0fa726/670ff2f1-261d-4378-b23c-9d1e85e8c59a/2025-10-20T023019Z_262015936_UP1ELAK06YI9L_RTRMADP_3_SOCCER-WORLDCUPU-20-ARG-MRC-REPORT.JPG?ver=03-06-2025?w=3840&q=75" },
];
  const gameData = {
    name: game.name,
    type: game.type,
    description: game.description,
    city: game.city,
    location: game.location,
    allowedVisits: game.allowedVisits,
    activeDays: game.activeDays,
    MemberShipType: game.MemberShipType,
    isActive: game.isActive
  };

  useEffect(() => {
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('game.game_details')} />
      <ScrollView bounces={false}>
        <ImageSlider images={game.cover_images} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {gameData.name}
              
            </Text>
                <Text style={styles.originalPrice}>$12.99</Text>
                {' '}
                <Text style={styles.discountPrice}>$8.99</Text>

          </View>
          <Text style={styles.description}>{gameData.description}</Text>
          

          <View style={styles.infoContainer}>
            <InfoRow 
              icon="map-marker" 
              label={t('game.location')} 
              value={gameData.location} 
            />

            <InfoRow 
              icon="clock" 
              label={t('game.time')} 
              value="Wed Nov 9, 2pm - 3pm"
            />
          </View>
            
            {/* Players Section */}
            <View style={styles.section}>
              <Icon type="materialCommunityIcons" name="account-multiple" size={24} color="#666" />
              <View style={styles.textContainer}>
                <Text style={styles.label}>Players 10/12</Text>
                <TouchableOpacity 
                  onPress={() => setExpandedDay(expandedDay ? null : 'all')}
                  style={styles.expandAllButton}
                >
                  <Icon
                    type="feather" 
                    name={expandedDay ? "chevron-down" : "chevron-up"} 
                    size={22} 
                    color="#1976D2"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Players Grid */}
            {expandedDay && (
              <View style={styles.playersContainer}>
                <View style={styles.playersGrid}>
                  {playersData.map((player, index) => (
                    <View key={index} style={styles.playerCard}>
                      <Image
                        source={{ uri: player.image || 'https://via.placeholder.com/150' }}
                        style={styles.playerImage}
                      />
                      <Text style={styles.playerName} numberOfLines={2}>
                        {player.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {game.remainingVisits > 0 && (
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setModalVisible(true)}
            >
              <Icon type="materialCommunityIcons" name="qrcode-scan" size={24} color="white" />
              <Text style={styles.buttonText}>{t('game.scanButton')}</Text>
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
              <Text style={styles.modalTitle}>{t('game.qrModal.title')}</Text>
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
                  gameId: game._id
                })}
                size={200}
              />
            </View>
            
            <Text style={styles.qrInstructions}>
              {t('game.qrModal.instructions')}
            </Text>
            
            <Text style={styles.gameName}>{gameData.name}</Text>
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
  gameName: {
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
    originalPrice: {
      textDecorationLine: 'line-through',
      color: COLORS.error,
      fontSize: FONTS.h5.fontSize,
    },
    discountPrice: {
      color: COLORS.primary,
      fontWeight: 'bold',
      fontSize: FONTS.h3.fontSize,
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
  },
  playersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playerCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  playerImage: {
    width: 64,
    height: 64,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
});