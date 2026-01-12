import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { COLORS, icons } from '@constants';
import MembershipCard from './MembershipCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BACKEND_URL } from '@env';
import { useTranslation } from 'react-i18next';

export default function HomeScreen({ route }) {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const id = await AsyncStorage.getItem('id');
      const response = await axios.get(`${API_BACKEND_URL}/memberships/user/${id}`);
      const data = response.data;
      let newItems = [];
      if (Array.isArray(data.data)) {
        // API returns paginated format with data property
        newItems = data.data;
      } else if (Array.isArray(data)) {
        // API returns direct array of requests
        newItems = data;
      }
      setMemberships(newItems);
      console.log(memberships);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      // Fallback to empty array if API call fails
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
    console.log("memberships", memberships);
  }, []); 
  
  const handleUpgrade = () => {
    console.log('Please contact our support to upgrade your membership!');
  };

  const handleNewMembership = () => {
    Linking.openURL('https://pickuplay.com/'); // Assuming you have a screen for this
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Image
          source={icons.emptyState}
          style={styles.emptyStateImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyStateTitle}>{t('membership.memberships.emptyState.title')}</Text>
        <Text style={styles.emptyStateSubtitle}>
          {t('membership.memberships.emptyState.subtitle')}
        </Text>
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={handleNewMembership}
        >
          <Text style={styles.emptyStateButtonText}>
            {t('membership.memberships.emptyState.button')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={icons.back}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('membership.memberships.header')}</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('membership.common.loading')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {memberships.length > 0 ? (
            memberships.map((membership) => (
              
              <MembershipCard 
              key={membership._id}
                membership={membership}
                onUpgrade={handleUpgrade} 
              />
            ))
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      )}
      
      {memberships.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleNewMembership}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginVertical: 22,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 3,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary || '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary || '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
});