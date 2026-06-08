import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  PermissionsAndroid,
  Alert,
  Text,
  Button,
  Image,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import MapView, { Marker, Circle } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Slider from '@react-native-community/slider';
import { getDistance } from 'geolib'; // Import geolib to calculate distances
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { COLORS } from '@constants';
import { NavigationProp, useNavigation } from '@react-navigation/native';


const restaurantData = [
  { id: 27, img: 'https://wallpapers.com/images/hd/walmart-round-logo-7r8yqrjrr1e7nav1.jpg', name: 'Walmart', latitude: 39.25530249840238, longitude: -94.63054063660988, category:'groceries', deal_hours: 23 },
  { id: 2, img: 'https://seeklogo.com/images/B/burger-king-logo-C329670C79-seeklogo.com.png', name: 'Location 2', latitude: 31.05312688007599, longitude: -6.866603246219162, category:'meals', deal_hours: 11 },
  { id: 3, img: 'https://image.pngaaa.com/354/1610354-middle.png', name: 'Location 3', latitude: 39.26301162319819, longitude: -94.65148332439928, category:'sandwish', deal_hours: 22 },
  { id: 4, img: 'https://image.pngaaa.com/354/1610354-middle.png', name: 'Restaurant Trebbiano', latitude: 45.5392108, longitude: -73.6576139, category:'meals', deal_hours: 11 },
  { id: 5, img: 'https://seeklogo.com/images/B/burger-king-logo-C329670C79-seeklogo.com.png', name: 'Burger King', latitude: 39.2130201635996, longitude: -94.65114000164864, category:'meals', deal_hours: 11 },
  { id: 6, img: 'https://image.pngaaa.com/354/1610354-middle.png', name: 'Yama Sushi Boucherville', latitude: 45.5797417, longitude: -73.4840244, category:'meals', deal_hours: 11 },
  { id: 7, img: 'https://image.pngaaa.com/354/1610354-middle.png', name: 'Burger King', latitude: 39.16858298529683, longitude: -94.57560899650647, category:'meals', deal_hours: 16 },
  { id: 8, img: 'https://seeklogo.com/images/B/burger-king-logo-C329670C79-seeklogo.com.png', name: 'dankin donut', latitude: 39.16405786451078, longitude: -94.54745653095347, category:'donut', deal_hours: 11 },
  { id: 9, img: 'https://image.pngaaa.com/354/1610354-middle.png', name: 'Location 9', latitude: 43.715833261841574, longitude: -79.3788146602603, category:'meals', deal_hours: 21 },
  { id: 10, img: 'https://image.pngaaa.com/354/1610354-middle.png', name: 'Costco', latitude: 45.5646656, longitude: -73.4227769, category:'meals', deal_hours: 20 },
  { id: 12, img: 'https://seeklogo.com/images/C/caseys-logo-F29CF6B484-seeklogo.com.png', name: 'Caseys', latitude: 39.28915327780724, longitude: -94.57415864858905, category:'pastries', deal_hours: 23 },
  { id: 13, img: 'https://image.shutterstock.com/image-photo/image-260nw-2289174933.jpg', name: 'Bâton Rouge Grillhouse & Bar', latitude: 45.5731294, longitude: -73.4398484, category:'drink', deal_hours: 23 },
];
type Nav = {
  navigate: (value: string) => void;
};
export default function App() {
  
  const navigation = useNavigation<NavigationProp<any>>();
  const { navigate } = useNavigation<Nav>();
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10000); // Default radius
  const [filteredRestaurants, setFilteredRestaurants] = useState([]); // Filtered restaurant list
  const mapRef = useRef(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categoryOptions = [
    { label: t('storeSignUp.categories.all'), value: 'all'},
    { label: t('storeSignUp.categories.meals'), value: 'meals'},
    { label: t('storeSignUp.categories.sandwich'), value: 'sandwich'},
    { label: t('storeSignUp.categories.pastries'), value: 'pastries'},
    { label: t('storeSignUp.categories.snack'), value: 'snack'},
    { label: t('storeSignUp.categories.bread'), value: 'bread'},
    { label: t('storeSignUp.categories.groceries'), value: 'groceries'},
    { label: t('storeSignUp.categories.drinks'), value: 'drink'}
  ];
  const handleCategoryChange = (value: any) => {
    setSelectedCategory(value);
  };
  const handleMarkerPress = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };
  const closeDetails = () => {
    console.log("-73.6576139");
    setSelectedRestaurant(null);
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.9,
          longitudeDelta: 0.5,
        };
        setLocation(currentLocation);
        filterRestaurants(currentLocation); // Find nearby restaurants after getting location
      },
      (error) => {
        Alert.alert(
          'Error',
          `Failed to get your location: ${error.message}. Make sure your location is enabled.`
        );
      }
    );
  };

  const filterRestaurants = (currentLocation) => {
    const nearbyRestaurants = restaurantData.filter((restaurant) => {
      const distance = getDistance(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: restaurant.latitude, longitude: restaurant.longitude }
      );
      return (distance <= radius) && (selectedCategory === 'All' || restaurant.category === selectedCategory);

    });

    setFilteredRestaurants(nearbyRestaurants);
  };

  // Recalculate filtered restaurants when the radius changes
  useEffect(() => {
    if (location) {
      filterRestaurants(location);
    }
  }, [radius, location]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          } else {
            Alert.alert(
              'Permission Denied',
              'Location permission is required to show your current location on the map.'
            );
            setLocation(location); // Set default location if permission denied
            filterRestaurants(location); // Find restaurants using default location
          }
        } catch (err) {
          console.warn(err);
          setLocation(location); // Set default location on error
          filterRestaurants(location); // Find restaurants using default location
        }
      } else {
        getCurrentLocation();
      }
    };

    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        initialRegion={location}
        scrollEnabled={true}
      >
        {/* Only show markers for filtered restaurants */}
        {filteredRestaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            title={restaurant.name}
            onPress={() => handleMarkerPress(restaurant)} // Trigger when the marker is pressed
          >
            <Image
              source={{ uri: restaurant.img }}
              style={styles.customPin}
            />
          </Marker>
        ))}

        {location && (
          <Circle
            center={location}
            radius={radius} // Dynamic radius based on slider
            strokeColor="rgba(0, 150, 255, 0.5)"
            fillColor="rgba(0, 150, 255, 0.3)"
          />
        )}
        
      </MapView>
        
      {/* Slider to adjust the radius */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Radius: {radius} meters</Text>
        <Slider
          style={{ width: 300, height: 40 }}
          minimumValue={100}
          maximumValue={50000}
          step={100}
          value={radius}
          onValueChange={(value) => setRadius(value)} // Update radius
          minimumTrackTintColor="#1fb28a"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1fb28a"
        />
        
        {/* Store Category Dropdown */}
        <RNPickerSelect
          placeholder={{ label: 'Select', value: '' }}
          items={categoryOptions}
          onValueChange={(value) => handleCategoryChange(value)}
          value={selectedCategory}
          style={{
            inputIOS: {
              fontSize: 16,
              paddingHorizontal: 10,
              borderRadius: 4,
              paddingRight: 30,
              height: 52,
              alignItems: 'center',
            },
            inputAndroid: {
              fontSize: 16,
              paddingHorizontal: 10,
              borderRadius: 8,
              paddingRight: 30,
              height: 52,
              alignItems: 'center',
            },
          }}
        />
      </View>
      
      {/* Conditionally render the bottom info section when a marker is selected */}
      {selectedRestaurant && (
        <View style={styles.bottomInfo}>
          <Text style={styles.title}>{selectedRestaurant.name} - {selectedRestaurant.category}</Text>
          <Text style={styles.description}>{`Number of bags ${selectedRestaurant.id}`}</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              onPress={()=>navigation.navigate("reserveDeal", { deal: selectedRestaurant })}
              style={styles.reorderButton}>
              <Text style={styles.reorderButtonText}>Reserve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
            onPress={closeDetails} 
              style={styles.rateButton}>
              <Text style={styles.rateButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    top:120,
  },
  customPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  sliderContainer: {
    position: 'absolute',
    top:0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 16,
    marginTop: 10,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: "5%",
    right: 0,
    width: "90%",
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeBottomInfo: {
    position: 'absolute',
    right: 0,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  reorderButton: {
    height: 38,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  reorderButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: "regular",
  },
  rateButton: {
    height: 38,
    width: 140,
    left: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
  },
  rateButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: "regular",
  },
  locationButton: {
    position: 'absolute',
    backgroundColor: COLORS.white, // Adjust based on your theme
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonText: {
    fontWeight: 'bold',
  },
});
