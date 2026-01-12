import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventCard from './EventCard';
import { useNavigation } from '@react-navigation/native';
import { Icon, LoadingSpinner } from '@components';
import { API_BACKEND_URL } from '@env';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useUserData } from '@services/useUserData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

// Mock data
const mockPartners: Event[] = [
  {
    id: '1',
    name: 'soccer game',
    description: 'Premium movie experience provider',
    image: 'soccer_game.jpg',
    eventCount: 2,
    numberOfEvent: 120,
  },
  {
    id: '2',
    name: 'Book',
    description: 'Family entertainment center',
    image: 'book.png',
    eventCount: 1,
    numberOfEvent: 5,
  },
  {
    id: '3',
    name: 'cine drive in',
    description: 'Cultural heritage and modern art',
    image: 'cinema_drive.webp',
    eventCount: 1,
    numberOfEvent: 4,
  },
  {
    id: '4',
    name: 'Basket Ball game',
    description: 'Cultural heritage and modern art',
    image: 'basket_ball.jpg',
    eventCount: 2,
    numberOfEvent: 30,
  },
];
 
export default function HomeScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Option 1: Get all events
      console.log(`${API_BACKEND_URL}/events`);
      const response = await axios.get(`${API_BACKEND_URL}/events`);
      
      // Option 2: Get only upcoming events (uncomment to use)
      // const response = await axios.get(`${API_BACKEND_URL}/events/upcoming`);
      
      // Option 3: Get eligible events for logged-in user (uncomment to use)
      // if (userData?.membershipId && userData?.membershipType) {
      //   const response = await axios.get(
      //     `${API_BACKEND_URL}/events/eligible/${userData.membershipId}?membershipType=${userData.membershipType}`
      //   );
      // }

      // Transform the API response to match your Event type
      const transformedEvents: Event[] = response.data.map((event: any) => ({
        id: event._id,
        name: event.eventName,
        description: event.eventDescription,
        image: event.image,
        eventCount: event.registrationCount || 0,
        numberOfEvent: event.numberOfVisits,
        // Additional fields you might need
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        location: event.location,
        city: event.city,
        dateRegistrationBefore: event.dateRegistrationBefore,
        howItWorks: event.howItWorks,
        available: event.available !== undefined ? event.available : true,
        remainingVisits: event.remainingVisits || event.numberOfVisits,
      }));

      setEvents(transformedEvents);
      console.log('Fetched events:', transformedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEventPress = (partneventer: Event) => {
    //navigation.navigate('EventDetail', { partnerId: partner.id });
  };
useEffect(() => {
    fetchEvents();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('event.eventTitle')}</Text>
      </View>
      
      <View style={styles.content}>
      <ScrollView>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={handleEventPress}
          />
        ))}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});