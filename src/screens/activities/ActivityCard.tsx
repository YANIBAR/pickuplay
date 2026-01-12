import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Icon } from '@components';
import { API_BACKEND_URL } from '@env';
import { COLORS, FONTS, SIZES } from '@constants';
import { useNavigation } from '@react-navigation/native';

export type Activity = {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  isUsed: boolean;
  partnerId: string;
};

type ActivityCardProps = {
  activity: Activity;
  membershipId?: string;
};

// Get screen width to calculate card width
const { width } = Dimensions.get('window');
// Calculate card width: (screen width - padding on both sides - gap between cards) / 2
const cardWidth = (width - 32 - 8) / 2;

export default function ActivityCard({ activity, membershipId }: ActivityCardProps) {
  const navigation = useNavigation();
  const handleActivityPress = (activity: Activity, membershipId: membershipId) => {
    navigation.navigate('detail', { activity: activity, membershipId: membershipId });
  };
  return (
    <TouchableOpacity 
      style={[styles.card, (activity.remainingVisits > 0 ? false : true) && styles.usedCard ]} 
      onPress={() => handleActivityPress(activity, membershipId)}
    >
      <Image 
        source={{ uri: `${API_BACKEND_URL}` + (`/matches/` + activity.image || 'placeholder.png') }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {activity.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {activity.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
            <Text style={styles.originalPrice}>{activity.originalPrice}</Text>
              {' '}
              <Text style={styles.discountPrice}>{activity.discountPrice}</Text>
            </Text>
          </View>
          <View style={(activity.remainingVisits > 0 ? styles.leftBadge : styles.fullBadge) }>
            <Text style={styles.usedText}>{activity.redemptionCount}/{activity.allowedVisits}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 4,
    //width: cardWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    elevation: 1,
    overflow: 'hidden',
    borderWidth:0.1,
    marginBottom:15
  },
  usedCard: {
    opacity: 0.5
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: 6,
    color: COLORS.primary
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#e74c3c', // Gray color for old price
    fontSize: 12,
  },
  discountPrice: {
    color: '#999', // Red color for discount price
    fontWeight: 'bold',
    fontSize: 14,
  }
});