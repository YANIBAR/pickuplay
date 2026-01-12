import { API_BACKEND_URL } from '@env';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export type Event = {
  id: string;
  name: string;
  description: string;
  image: string;
  eventCount: number;
  numberOfEvent: number;
};

type EventCardProps = {
  event: Event;
  onPress: (event: Event) => void;
};

export default function EventCard({ event, onPress }: EventCardProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const handleEventPress = (event: Event) => {
      navigation.navigate('eventDetail', { event: event });
    };
  return (
    <TouchableOpacity style={styles.card} 
    onPress={() => handleEventPress(event)}
    >
      <Image 
        source={{ uri: `${API_BACKEND_URL}/events/${event.image || 'placeholder.png'}` }}
        style={styles.image} 
      />
      <View style={styles.content}>
        <Text style={styles.name}>{event.eventName}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
        <View style={styles.activitiesContainer}>
          <Text style={styles.eventCount}>
            {t('event.occurrence', { count: event.eventCount })}
          </Text>
          <Text style={styles.numberOfEvent}>
            {t('event.eventsPerYear', { count: event.numberOfEvent })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 120,
    height: '100%',
    marginRight: 16,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  content: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventCount: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    marginRight: 10,
  },
  numberOfEvent: {
    borderLeftWidth: 1,
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    paddingLeft: 10
  },
});