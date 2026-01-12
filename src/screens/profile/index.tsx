import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Button, Icon, MoreModal } from '@components';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BACKEND_URL } from '@env';
import axios from 'axios';
import { COLORS, icons } from '@constants';
import { FlatList } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export default function UserProfileScreen({ route }) {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const userId = route.params.userId;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownItems = [
    { label: t('Profile.report'), value: 'report', icon: icons.infoCircle },
  ];

  const handleDropdownSelect = (item: any) => {
    setSelectedItem(item.value);
    setModalVisible(false);

    // Perform actions based on the selected item
    switch (item.value) {
      case 'report':
        // Handle Share action
        //report();
        setModalVisible(false);
        break;
      case 'contact':
        // Handle Download E-Receipt action
        setModalVisible(false);
        navigate('Chat');
        break;
      
      case 'privacy':
        // Handle Download E-Receipt action
        setModalVisible(false);
        navigate('PrivacyPolicy');
        break;
      case 'terms':
        // Handle Print action
        setModalVisible(false);
        navigate('terms');
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setModalVisible(false)
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(`${API_BACKEND_URL}/user/${userId}/getUserById`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    getUser();
  }, [userId]); // Only depend on userId, not data

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Report Button */}
      <View style={styles.header}>
        <View style={styles.reportButton}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon type="feather" name="more-vertical" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: `${API_BACKEND_URL}/` + (data?.user?.profileImage || 'default.jpg') }}
          style={styles.profileImage}
        />
        <View style={styles.verifiedBadge}>
          <Icon type="materialIcons" name="verified" size={24} color="#4CAF50" />
        </View>
        <Text style={styles.name}>{`${data?.user?.firstName || ''} ${data?.user?.lastName || ''}`}</Text>
        <View style={styles.locationRow}>
          <Icon type="ionicons" name="location-outline" size={16} color="#666" />
          <Text style={styles.locationText}>{data?.user?.address || ''}</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          
          <Text style={styles.statNumber}>{data?.averageRating || 0}</Text>
          <Text style={styles.reviewRating}>
            {'★'.repeat(Math.floor(data?.averageRating || 0))}
            {'☆'.repeat(5 - Math.floor(data?.averageRating || 0))}
          </Text>
          <Text style={styles.statLabel}>{data?.ratingCount || 0} Reviews</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{data.tripCount ? data.tripCount : "0"}</Text>
          <Icon type="fontAwesome5" name="plane" size={16} color={COLORS.primary} />
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{data.shipmentCount}</Text>

          <Icon type="fontAwesome5" name="box" size={16} color={COLORS.secondary} />
          <Text style={styles.statLabel}>Shipments</Text>
        </View>
      </View>

      {/* Contact Information 
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoItem}>
          <Icon type="materialIcons" name="email" size={20} color="#666" />
          <Text style={styles.infoText}>{data.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon type="materialIcons" name="phone" size={20} color="#666" />
          <Text style={styles.infoText}>{data.phone}</Text>
        </View>
      </View>
      */}
      {/* Reviews Section */}<View style={styles.reviewsSection}>
  <Text style={styles.sectionTitle}>Recent Reviews</Text>
  {data?.ratings && data.ratings.length > 0 ? (
    data.ratings.map((rating, index) => (
      <View 
        key={rating._id || index}
        style={[
          styles.userHeader, 
          index % 2 === 0 ? styles.evenReview : styles.oddReview
        ]}
      >
        <Image 
          source={{ uri: `${API_BACKEND_URL}/` + rating.ratedBy.profileImage }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {rating.ratedBy.firstName} {rating.ratedBy.lastName}
            <View style={styles.ratingContainer}>
              <Icon 
                type="ionicons"
                name={"star"}
                size={16}
                color="#FFD700"
                style={{ marginRight: 2 }}
              />
              <Text style={styles.ratingText}>{rating.rating}</Text>
            </View>
          </Text>
          <Text style={styles.tripsText}>{rating.comment}</Text>
        </View>
      </View>
    ))
  ) : (
    <Text>No reviews yet</Text>
  )}
  <Button
    title="Show more reviews"
    filled
    onPress={() => navigate("writereview", {userRequested: data?.user?._id})}
  />
</View>
      
        {/* Modal for dropdown selection */}
        <MoreModal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onClose={handleClose}
      >
          <FlatList
            data={dropdownItems}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: 'center',
                  marginVertical: 12
                }}
                onPress={() => handleDropdownSelect(item)}>
                <Image
                  source={item.icon as ImageSourcePropType}
                  resizeMode='contain'
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 16,
                    tintColor: COLORS.black
                  }}
                />
                <Text style={{
                  fontSize: 14,
                  fontFamily: "semiBold",
                  color: COLORS.black
                }}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
      </MoreModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  reportButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 110,
    right: '38%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.transparentPrimary,
    paddingBottom: 10
  },
  evenReview: {
    backgroundColor: COLORS.transparentPrimary
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
  },
  tripsText: {
    color: '#666',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    height: '100%',
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    color: '#333',
  },
  reviewsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontWeight: 'bold',
  },
  reviewComment: {
    color: '#333',
    marginBottom: 4,
  },
  reviewDate: {
    color: '#666',
    fontSize: 12,
  },
  reviewRating: {
    color: 'orange',
  },
});