import { COLORS, images } from '@constants';
import { Header, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useRef, useState } from 'react';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { authenticatedApi, publicApi } from '@services/api';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from '@services/auth/auth.utils';


const getGameIcon = (type: string) => {
    const iconMap: Record<string, string> = {
        0: 'view-grid',
      1: 'soccer',
      2: 'basketball',
      3: 'volleyball',
      5: 'tennis',
      4: 'hockey-sticks',
      6: 'tennis',
      7: 'table-tennis',
      8: 'football',
      9: 'baseball-bat'
    };
    return iconMap[type] || 'sports';
  };
export default function NoCompetitionPage() {
  const { t } = useTranslation();
  const [role, setRole] = useState<string | null>(null);
  const { navigate } = useNavigation();
  const [location, setLocation] = useState<any>(null);
  const [fields, setFields] = useState<Fields[]>([]);
  const [selectedSport, setSelectedSport] = useState(0);

  const mapRef = useRef<any>(null);


  const getFields = async (): Promise<void> => {
    try {
      const response = await publicApi.get('fields');
      setFields(response.result.data.fields) 
      console.log('Fields state updasssted:', response.result.data.fields);
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message;
      Alert.alert('Error', errorMessage);
      console.error('field fetch failed:', error);
      setFields([]); // fallback to empty array
    }
  };
  useEffect(() => {
    const fetchRole = async () => {
      const token =  await AsyncStorage.getItem('access_token');
      const userInfo = decodeToken(token);
      setRole(userInfo.role); 
      return userInfo;
    };
    fetchRole();
    console.log('User role:', role);
    getFields();
  }, []);

  useFocusEffect(
      useCallback(() => {
        getFields();
      }, []) 
    ); 

  const filteredFields =
    selectedSport === 0
      ? fields
      : fields.filter(
          field => field.sportType.id === selectedSport,
        );

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('Sports Fields')} target="welcome">

        {(role === 'ADMIN') && (
          <TouchableOpacity
            onPress={() => navigate("addField")} 
            style={styles.iconBtn}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon type="feather" name="plus" />
          </TouchableOpacity>
      )}
      </Header>
      <View style={{ flex: 1 }}> 
        <MapView
          ref={mapRef}
          style={styles.map}
          followsUserLocation
          initialRegion={{
            latitude: 39.2553,
            longitude: -94.6305,
            latitudeDelta: 0.4,
            longitudeDelta: 0.4,
          }}>
          {filteredFields.map(field => (
            <Marker
              key={field.id}
              coordinate={{
                latitude: field.latitude,
                longitude: field.longitude,
              }}
            >
              <View style={styles.markerContainer}>
                <Icon
                  type="materialCommunityIcons"
                  name={getGameIcon(field.sportType.id)}
                  size={16}
                  color={COLORS.primary}
                />
              </View>
              <Callout
                tooltip={false}
                onPress={() => navigate('field', { field_id: field.id})}
              >
                <View style={{ minWidth: 180, padding: 8 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{field.name}</Text>
                  <Text style={{ color: '#666', marginBottom: 8 }}>{field.address}</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: COLORS.primary,
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      alignSelf: 'flex-start',
                    }}
                    onPress={() => navigate('field', { field_id: 3})}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
        ))}

          {location && (
            <Circle
              center={location}
              radius={600}
              strokeColor={COLORS.transparent}
              fillColor={COLORS.primary}
            />
          )}
        </MapView>

        {/* My Location Button */}
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={() => {
            mapRef.current.animateToRegion({
              latitude: 39.0997,
              longitude: -94.5786,
              latitudeDelta: 0.2,
              longitudeDelta: 0.2,
            });
          }}>
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Sports Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}>

          {[
            {key: 0, name: 'All'},
            {key: 1, name: 'soccer'},
            {key: 2, name: 'basketball'},
            {key: 3, name: 'volleyball'},
            {key: 5, name: 'tennis & pickle ball'},
            {key: 7, name: 'ping pong'},
            {key: 8, name: 'football'},
            {key: 9, name: 'baseball'}
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterButton,
                selectedSport === item.key && styles.activeFilter,
              ]}
              onPress={() => setSelectedSport(item.key)}>
                <Icon type="materialCommunityIcons" 
                    name={getGameIcon(item.key)}
                    size={16}
                    color={
                    selectedSport === item.key ? '#fff' : '#333'
                }
                />

              <Text
                style={[
                  styles.filterText,
                  selectedSport === item.key && {
                    color: '#fff',
                  },
                ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  map: {
    width: '100%',
    height: '100%',
  },
  iconBtn: {
    marginHorizontal: 8
  },
  markerContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 5,
  },

  myLocationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  filtersContainer: {
    position: 'absolute',
    top: 15,
    paddingLeft: 10,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    elevation: 4,
  },

  activeFilter: {
    backgroundColor: COLORS.primary,
  },

  filterText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
}); 