import { COLORS, images } from '@constants';
import { Header, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import { useEffect, useRef, useState } from 'react';
import MapView, { Circle, Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';

const fieldsData = [
  {
    id: 1,
    name: 'Swope Soccer Village',
    address: '6800 Swope Memorial Dr, Kansas City, MO 64132',
    latitude: 38.9922,
    longitude: -94.5506,
    sportType: 1, // Soccer
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    ],
    amenities: { goalies: true, parking: true, restroom: true },
    requiresBooking: true,
    isFree: false,
    pricePerHour: 40,
    hasLights: true,
    isIndoor: false,
    ground: 'turf',
  },
  {
    id: 2,
    name: 'Antioch Park Basketball Courts',
    address: '6501 Antioch Rd, Merriam, KS 66202',
    latitude: 39.0285,
    longitude: -94.6927,
    sportType: 2, // Basketball
    rating: 4.2,
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800',
    ],
    amenities: { goalies: false, parking: true, restroom: true },
    requiresBooking: false,
    isFree: true,
    pricePerHour: 0,
    hasLights: true,
    isIndoor: false,
    ground: 'hardcourt',
  },
  {
    id: 3,
    name: 'Minor Park Tennis Center',
    address: '11320 Holmes Rd, Kansas City, MO 64131',
    latitude: 38.9502,
    longitude: -94.5816,
    sportType: 3, // Tennis
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
    ],
    amenities: { goalies: false, parking: true, restroom: true },
    requiresBooking: true,
    isFree: false,
    pricePerHour: 15,
    hasLights: true,
    isIndoor: false,
    ground: 'clay',
  },
  {
    id: 4,
    name: 'Gorman Fields Baseball Complex',
    address: '7710 N Quincy Ave, Kansas City, MO 64119',
    latitude: 39.2301,
    longitude: -94.5534,
    sportType: 4, // Baseball
    rating: 4.3,
    images: [
      'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800',
      'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800',
    ],
    amenities: { goalies: false, parking: true, restroom: true },
    requiresBooking: true,
    isFree: false,
    pricePerHour: 30,
    hasLights: true,
    isIndoor: false,
    ground: 'grass',
  },
  {
    id: 5,
    name: 'The fieldhouse KC',
    address: '1144 Swift St, North Kansas City, MO 64116',
    latitude: 39.1378,
    longitude: -94.5700,
    sportType: 2, // Basketball
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800',
    ],
    amenities: { goalies: false, parking: true, restroom: true },
    requiresBooking: true,
    isFree: false,
    pricePerHour: 55,
    hasLights: true,
    isIndoor: true,
    ground: 'hardcourt',
  },
  {
    id: 6,
    name: 'Tiffany Springs Soccer Fields',
    address: '8000 NW Tiffany Springs Pkwy, Kansas City, MO 64153',
    latitude: 39.2801,
    longitude: -94.7234,
    sportType: 1, // Soccer
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
    ],
    amenities: { goalies: true, parking: true, restroom: true },
    requiresBooking: false,
    isFree: true,
    pricePerHour: 0,
    hasLights: false,
    isIndoor: false,
    ground: 'grass',
  },
  {
    id: 7,
    name: 'Johnson County Pickleball Center',
    address: '6501 Quivira Rd, Shawnee, KS 66216',
    latitude: 38.9912,
    longitude: -94.7701,
    sportType: 6, // Pickleball
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1625547904428-f97f6f462177?w=800',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    ],
    amenities: { goalies: false, parking: true, restroom: true },
    requiresBooking: true,
    isFree: false,
    pricePerHour: 12,
    hasLights: true,
    isIndoor: true,
    ground: 'hardcourt',
  },
  {
    id: 8,
    name: 'Loose Park Volleyball Courts',
    address: '5200 Pennsylvania Ave, Kansas City, MO 64112',
    latitude: 39.0301,
    longitude: -94.5912,
    sportType: 5, // Volleyball
    rating: 4.1,
    images: [
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800',
    ],
    amenities: { goalies: false, parking: true, restroom: false },
    requiresBooking: false,
    isFree: true,
    pricePerHour: 0,
    hasLights: false,
    isIndoor: false,
    ground: 'concrete',
  },
  {
    id: 9,
    name: 'Summit Sport Complex',
    address: '2201 SW Market St, Lee\'s Summit, MO 64081',
    latitude: 38.9101,
    longitude: -94.3823,
    sportType: 1, // Soccer
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800',
    ],
    amenities: { goalies: true, parking: true, restroom: true },
    requiresBooking: true,
    isFree: false,
    pricePerHour: 60,
    hasLights: true,
    isIndoor: true,
    ground: 'turf',
  },
  {
    id: 10,
    name: 'Berkley Riverfront Tennis Courts',
    address: '500 Berkley Pkwy, Kansas City, MO 64120',
    latitude: 39.1089,
    longitude: -94.5712,
    sportType: 3, // Tennis
    rating: 3.9,
    images: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    ],
    amenities: { goalies: false, parking: false, restroom: false },
    requiresBooking: false,
    isFree: true,
    pricePerHour: 0,
    hasLights: false,
    isIndoor: false,
    ground: 'hardcourt',
  },
];
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
export default function NoLeaguePage() {
  const { t } = useTranslation();

  const [location, setLocation] = useState<any>(null);
  const [selectedSport, setSelectedSport] = useState(0);

  const mapRef = useRef<any>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const currentLocation = {
          latitude: 39.25,
            longitude: -94.6,
            latitudeDelta: 0.9,
            longitudeDelta: 0.5,
        };

        setLocation(currentLocation);

        mapRef.current?.animateToRegion(currentLocation, 1000);
      },
      error => {
        Alert.alert(
          'Error',
          `Failed to get your location: ${error.message}`,
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const filteredFields =
    selectedSport === 0
      ? fieldsData
      : fieldsData.filter(
          field => field.sportType === selectedSport,
        );
const iconMap: Record<string, string> = {
      1: 'soccer',
      2: 'basketball',
      3: 'volleyball',
      5: 'tennis',
      4: 'hockey-sticks',
      6: 'table-tennis',
      7: 'table-tennis',
      8: 'football'
    };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Sports Fields" />

      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          followsUserLocation
          initialRegion={{
            latitude: 39.2553,
            longitude: -94.6305,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}>
          {filteredFields.map(field => (
            <Marker
                key={field.id}
                coordinate={{
                    latitude: field.latitude,
                    longitude: field.longitude,
                }}
                title={field.name}
                description={getGameIcon(field.sportType)}>
                
                <View style={styles.markerContainer}>
                    <Icon type="materialCommunityIcons" 
                    name={getGameIcon(field.sportType)}
                    size={16}
                    color={COLORS.primary}
                    />
                </View>
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
          onPress={getCurrentLocation}>
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
            {key: 5, name: 'tennis'},
            {key: 4, name: 'hockey-sticks'},
            {key: 6, name: 'tennis'},
            {key: 7, name: 'table-tennis'},
            {key: 8, name: 'football'},
            {key: 9, name: 'baseball-bat'}
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