import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS,  icons, illustrations } from '@constants';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { launchCamera } from 'react-native-image-picker';
import { API_BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type Nav = {
  navigate: (value: string) => void
}


const PhotoIdCard = () => {
  const [userId, setUserId] = useState();

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      cameraType: 'front', // Use front camera for identity verification
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        console.log('Camera Error:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setImageUri(image.uri);
        console.log('Captured Image:', image.uri);
        uploadImage(image); // Pass the full file object, not just URI
      }
    });
  };

  const pickImage = () => {
    const options = { mediaType: 'photo' };
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setImageUri(image.uri);
        uploadImage(image);
      }
    });
  };

  const uploadImage = async (file) => {
    if (!file || !file.uri) {
      console.error('Invalid file selected');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.fileName || 'default-image.jpg',
      type: file.type || 'image/jpeg',
    });
    try {
      const response = await fetch(`${API_BACKEND_URL}/user/upload?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData, // ✅ Include formData with file and userId
      });
  
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Upload success:', data);
      Alert.alert('Success', data.message);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Upload failed');
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        const response = await axios.get(`${API_BACKEND_URL}/user/getUser?email=${email}`);
        setUserId(response.data._id);
        console.log(response.data);
        //setProfileImage(response.data.profileImage);
  
      } catch (error) {
        console.error('Error fetching the user:', error);
      }
    };
  
    fetchData();
  }, []);
  
  
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();

  return (
    <SafeAreaView style={[styles.area]}>
      <View style={[styles.container]}>
        <Header title="" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('Photo ID Card')}</Text>
          <Text style={styles.subtitle}>{t('Please point the camera at the ID card')}</Text>
          <View style={styles.scanView}>
            <View style={[styles.scanContainer, {
              backgroundColor: COLORS.white
            }]}>
              
                <Image source={{ uri: `${API_BACKEND_URL}/yazido.jpg` }} style={styles.cardImage} />
              
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          onPress={pickImage}
          style={styles.btn}>
          <Image
            source={icons.image2}
            style={styles.btnIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openCamera}
          style={styles.cameraBtn}>
          <Image
            source={icons.camera}
            style={styles.cameraIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => navigate("welcome")}>
          <Image
            source={icons.arrowRight}
            style={styles.btnIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
};

export default PhotoIdCard