import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, Pressable, TextInput, Alert } from 'react-native';
import { Icon } from '@components';
import { API_BACKEND_URL } from '@env';
import { COLORS, FONTS, SIZES } from '@constants';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedApi } from '@services/api';


export type Game = {
  id: string;
  title: string;
  description: string;
  city: string;
  //imageUrl: string;
  isPrivate: boolean;
  creatorId: string;
  sportType: 'Soccer' | 'basketball' | 'volleyball' | 'tennis' | 'hockey-sticks' | 'table-tennis' | 'football';
  //originalPrice: number;
  //discountPrice: number;
  maxPlayers: number;
  currentParticipants: number;
  endTime?: string; // ISO format date string
  startTime?: string; // HH:mm format
};

type GameCardProps = {
  game: Game;
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 32 - 8) / 2;

const getGameIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    soccer: 'soccer',
    basketball: 'basketball',
    volleyball: 'volleyball',
    tennis: 'tennis',
    hockey: 'hockey-sticks',
    pingPong: 'table-tennis',
    football: 'football'

  };
  return iconMap[type] || 'sports';
};

export function extractCity(location: string): string {
  // Extracts city from full address (e.g., "New York" from "1100 Avenue of the Americas, New York")
  const parts = location.split(',').map(p => p.trim());
  return parts[parts.length - 1] || location;
}
const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return token;
    } catch (e) {
      console.error('Failed to fetch the token', e);
      return null;
    }
  };
export default function GameCard({ game }: GameCardProps) {
  const navigation = useNavigation();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [numPlayers, setNumPlayers] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [token, setToken] = useState('');
  const { navigate } = useNavigation<Nav>();
  
  const handleGamePress = (game: Game) => {
    navigation.navigate('detail', { game: game });
  };

  const handleJoinGame = (e: any) => {
    e.stopPropagation();
    setJoinModalVisible(true);
  };

  const handleConfirmJoin = async () => {
  if (!numPlayers.trim()) {
    Alert.alert('Please enter number of players');
    return;
  }

  try {
    
    const response = await authenticatedApi.post(`games/${game.id}/join`, {
      numPlayers: parseInt(numPlayers),
      promoCode: promoCode || null,
    });

    if (response.status === 200) {
      // Success - clear form and close modal
      setJoinModalVisible(false);
      setNumPlayers('');
      setPromoCode('');
      
      // Optional: show success message or navigate
      Alert.alert('Successfully joined game!');
      
      // Optional: refresh game state or navigate
      // await fetchGameDetails(game.id);
    }
  } catch (error) {
    console.error('Failed to join game:', error);
    const errorMessage = error?.response?.data?.message || 'Failed to join game. Please try again.';
    Alert.alert(errorMessage);
  } 
};

  const handleRedirectModal = (authType: 'login' | 'register') => {
    setJoinModalVisible(false);
    setNumPlayers('');
    setPromoCode('');
    navigate(authType)
  };

  const handleCloseModal = () => {
    setJoinModalVisible(false);
    setNumPlayers('');
    setPromoCode('');
  };
   useEffect(() => {
    const tkn = getToken();
      setToken(tkn);
    }, []);
  return (
    <>
      <TouchableOpacity 
        style={[styles.card, (game.currentParticipants < 0 ? styles.usedCard : {})]} 
        onPress={() => handleGamePress(game)}
      >
        <Image 
          source={{ uri: `${API_BACKEND_URL}` + (`/matches/` + (game.imageUrl ? game.imageUrl : 'private.jpg')) }}
          style={styles.image}
        />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {game.title.charAt(0).toUpperCase() + game.title.slice(1)}
            </Text>
            <Icon 
              type="materialCommunityIcons" 
              name={getGameIcon(game.sportType)} 
              size={24} 
              color={COLORS.primary}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.address} numberOfLines={1}>
              <Icon type="materialCommunityIcons" name="map-marker" size={14} color="#666" />
              {' ' + game.city}
            </Text>
            
            <Text style={styles.time}>
              <Icon type="materialCommunityIcons" name="clock" size={14} color="#666" />
              {' ' + (
                new Date(game.startTime).toLocaleTimeString('en-US', 
                { hour: 'numeric', minute: '2-digit', hour12: true  }) || '10pm - 12pm') 
                + ' - ' + new Date(game.endTime).toLocaleTimeString('en-US', 
                { hour: 'numeric', minute: '2-digit', hour12: true  })
                + ', ' + (game.startTime ? new Date(game.startTime).toLocaleDateString('en-US', { weekday: 'short' }) : 'Saturday')}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                <Text style={styles.originalPrice}>$12</Text>
                {' '}
                <Text style={styles.discountPrice}>$7</Text>
              </Text>
            </View>
            <View style={game.nbrSpots >= game.participants.length ? styles.leftBadge : styles.fullBadge}>
              <Text style={styles.usedText}>{game.participants.length}/{game.nbrSpots}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.joinButton}
            onPress={handleJoinGame}
          >
            <Icon 
              type="materialCommunityIcons" 
              name="plus-circle" 
              size={18} 
              color="white"
            />
            <Text style={styles.joinButtonText}>Join our Game</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Join Game Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={joinModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          {token ? (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Join Game</Text>
                <Pressable 
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <View style={styles.gameInfoSection}>
                <Text style={styles.gameNameModal}>{game.name}</Text>
                <Text style={styles.gameType}>{game.sportType.toUpperCase()}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Number of Players</Text>
                <View style={styles.playerCountContainer}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => {
                      const current = parseInt(numPlayers) || 0;
                      if (current > 0) {
                        setNumPlayers((current - 1).toString());
                      }
                    }}
                  >
                    <Icon 
                      type="materialCommunityIcons" 
                      name="minus" 
                      size={24} 
                      color="white"
                    />
                  </TouchableOpacity>
                  <View style={styles.playerCountDisplay}>
                    <Icon 
                      type="materialCommunityIcons" 
                      name="account-multiple" 
                      size={16} 
                      color={COLORS.primary}
                    />
                    <Text style={styles.playerCountText}>
                      {numPlayers || '0'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => {
                      const current = parseInt(numPlayers) || 0;
                      setNumPlayers((current + 1).toString());
                    }}
                  >
                    <Icon 
                      type="materialCommunityIcons" 
                      name="plus" 
                      size={24} 
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Promo Code (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Icon 
                    type="materialCommunityIcons" 
                    name="ticket-percent" 
                    size={20} 
                    color={COLORS.primary}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter promo code"
                    placeholderTextColor="#999"
                    value={promoCode}
                    onChangeText={setPromoCode}
                  />
                </View>
              </View>

              <View style={styles.priceInfo}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Original Price:</Text>
                  <Text style={styles.originalPriceText}>${game.originalPrice}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Discounted Price:</Text>
                  <Text style={styles.discountedPriceText}>${game.discountPrice}</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleConfirmJoin}
                >
                  <Icon 
                    type="materialCommunityIcons" 
                    name="check-circle" 
                    size={20} 
                    color="white"
                  />
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Join Game</Text>
                <Pressable 
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  <Icon type="materialCommunityIcons" name="close" size={24} color="#333" />
                </Pressable>
              </View>
            <Text>Please connect before joining</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => handleRedirectModal('register')}
                >
                  <Text style={styles.cancelButtonText}>Sign-In</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={() => handleRedirectModal('login')}
                >
                  <Icon 
                    type="materialCommunityIcons" 
                    name="check-circle" 
                    size={20} 
                    color="white"
                  />
                  <Text style={styles.confirmButtonText}>Login </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 0.1,
    marginBottom: 15,
  },
  usedCard: {
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: SIZES.padding,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: 'bold',
    marginTop: 8,
    flex: 1,
  },
  infoContainer: {
    marginBottom: 10,
    gap: 4,
  },
  address: {
    fontSize: 12,
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: FONTS.h3.fontSize,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  fullBadge: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  leftBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  usedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: COLORS.error,
    fontSize: FONTS.h4.fontSize,
  },
  discountPrice: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: FONTS.h3.fontSize,
  },
  joinButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  gameInfoSection: {
    marginBottom: 16,
  },
  gameNameModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  gameType: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#333',
  },
  priceInfo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  originalPriceText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  discountedPriceText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  playerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  counterButton: {
    width: 24,
    height: 24,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    elevation: 3,
  },
  playerCountDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  playerCountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});