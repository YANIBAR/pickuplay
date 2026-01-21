import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, Alert, Platform, PermissionsAndroid, TextInput, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ConfirmModal, ErrorModal, Text, View } from '@components';
import { icons } from '@constants';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BACKEND_URL } from '@env';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const ScanQrCode = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [gameId, setgameId] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualMembershipId, setManualMembershipId] = useState('');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const device = useCameraDevice("back");
  // State management
  const [modalVisible, setModalVisible] = useState({
    success: false,
    error: false,
    confirm: false
  });
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const fetchRequests = async () => {
    const game_Id = await AsyncStorage.getItem('gameId');
    setgameId(game_Id);
  }

  useEffect(() => {
    fetchRequests();
  
    const requestCameraPermission = async () => {
      if (Platform.OS === 'ios') {
        try {
          const result = await request(PERMISSIONS.IOS.CAMERA);
          
          if (result === RESULTS.GRANTED) {
            setCameraPermissionGranted(true);
          } else if (result === RESULTS.DENIED) {
            // Permission denied, show alert
            Alert.alert(
              'Camera Permission Required',
              'Camera access is required to scan QR codes. Please enable it in Settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => {
                    Linking.openURL('app-settings:');
                  }
                }
              ]
            );
          } else if (result === RESULTS.BLOCKED) {
            // Permission blocked, show alert to go to settings
            Alert.alert(
              'Camera Permission Blocked',
              'Camera access has been blocked. Please enable it in Settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => {
                    Linking.openURL('app-settings:');
                  }
                }
              ]
            );
          }
        } catch (error) {
          console.error('Error requesting camera permission:', error);
        }
      } else if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs access to your camera to scan QR codes',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setCameraPermissionGranted(true);
          } else {
            Alert.alert('Camera permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
  
    requestCameraPermission();
  }, []);

  // Check permissions before starting scanner
  const checkAndRequestPermissions = async () => {
    if (Platform.OS === 'ios') {
      try {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        return result === RESULTS.GRANTED;
      } catch (error) {
        console.error('Error checking camera permission:', error);
        return false;
      }
    } else if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted) {
          return true;
        } else {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs access to your camera to scan QR codes',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return false;
  };

  // API Calls
  const checkgame = async (membershipIdToCheck = membershipId) => {
    try {
      const response = await axios.get(`${API_BACKEND_URL}/redemptions/check`, {
        params: { membershipId: membershipIdToCheck, gameId }
      });
      
      const redemptionCountInfo = response.data.redemptionCount;
      if (redemptionCountInfo.eligible) {
        // Show confirmation modal before redeeming
        setModalContent({
          title: 'Confirm Redemption',
          message: redemptionCountInfo.message,
          confirmText: 'Confirm',
          cancelText: 'Cancel'
        });
        setModalVisible({ ...modalVisible, confirm: true });
      } else {
        // Show error/info modal
        setModalContent({
          title: 'Information',
          message: redemptionCountInfo.message,
          confirmText: 'OK'
        });
        setModalVisible({ 
          ...modalVisible, 
          error: true 
        });
      }
    } catch (error) {
      console.error('Error checking game:', error);
      setModalContent({
        title: 'Error',
        message: 'Failed to check game eligibility',
        confirmText: 'OK'
      });
      setModalVisible({ ...modalVisible, error: true });
    }
  };

  const validateMembershipId = (id) => {
    // Add your validation logic here
    // For example, check if it's a valid format, length, etc.
    if (!id || id.trim().length === 0) {
      return { valid: false, message: 'Membership ID cannot be empty' };
    }
    
    // Add more validation rules as needed
    if (id.length < 3) {
      return { valid: false, message: 'Membership ID must be at least 3 characters long' };
    }
    
    return { valid: true, message: '' };
  };
  
  const confirmRedemption = async () => {
    try {
      const response = await axios.post(`${API_BACKEND_URL}/redemptions/create`, {
        membershipId,
        gameId
      });
      
      setModalContent({
        title: 'Success',
        message: response.data.message || 'Redemption created successfully',
        confirmText: 'OK'
      });
      setModalVisible({ success: true, error: false, confirm: false });
    } catch (error) {
      console.error('Redemption error:', error);
      setModalContent({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create redemption',
        confirmText: 'OK'
      });
      setModalVisible({ success: false, error: true, confirm: false });
    }
  };

  // Modal handlers
  const handleConfirm = () => {
    setModalVisible({ ...modalVisible, confirm: false });
    confirmRedemption();
  };

  const closeAllModals = () => {
    setModalVisible({ success: false, error: false, confirm: false });
  };
  
  const startScanner = async () => {
    const hasPermission = await checkAndRequestPermissions();
    if (hasPermission) {
      setScannerActive(true);
      setShowManualInput(false);
    } else {
      Alert.alert(
        'Camera Permission Required',
        'Camera access is required to scan QR codes. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
    }
  };
  
  const closeScanner = () => {
    setScannerActive(false);
  };

  const showManualInputForm = () => {
    setShowManualInput(true);
    setScannerActive(false);
  };

  const handleManualSubmit = async () => {
    const validation = validateMembershipId(manualMembershipId);
    
    if (!validation.valid) {
      setModalContent({
        title: 'Invalid Input',
        message: validation.message,
        confirmText: 'OK'
      });
      setModalVisible({ ...modalVisible, error: true });
      return;
    }
  
    try {
      // First, get membership by code
      const membershipResponse = await axios.get(`${API_BACKEND_URL}/memberships/getMembershipByCode/${manualMembershipId}`);
      if (!membershipResponse.data || membershipResponse.data.length === 0) {
        setModalContent({
          title: 'Membership Not Found',
          message: 'No membership found with this code. Please check and try again.',
          confirmText: 'OK'
        });
        setModalVisible({ ...modalVisible, error: true });
        return;
      }
  
      // Get the membership ID from the response (assuming it's the first item)
      const membership = membershipResponse.data[0];
      const membershipId = membership._id; // or whatever the ID field is called
      // Set the membership ID for later use
      setMembershipId(membershipId);
      
      // Now check the game with the membership ID
      checkgame(membershipId);
      
    } catch (error) {
      console.error('Error getting membership by code:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 404) {
        setModalContent({
          title: 'Membership Not Found',
          message: 'No membership found with this code. Please check and try again.',
          confirmText: 'OK'
        });
      } else {
        setModalContent({
          title: 'Error',
          message: 'Failed to verify membership code. Please try again.',
          confirmText: 'OK'
        });
      }
      
      setModalVisible({ ...modalVisible, error: true });
    }
  };

  const handleTextChange = useCallback((text) => {
    setManualMembershipId(text);
  }, []);

  const resetToMainView = () => {
    setScannerActive(false);
    setShowManualInput(false);
    setManualMembershipId('');
  };
useEffect(() => {
    // exception case
  }, [device]);

  const codeScanner = useCodeScanner({
      codeTypes: ["qr"],
      onCodeScanned: (codes) => {
        try {
          
        const scannedData = JSON.parse(codes[0].value);
          // Compare game IDs - show error if they DON'T match
          if (scannedData.gameId !== gameId) {
              // Close scanner and return to default view
              setScannerActive(false);
              
              // Show error message for incorrect game QR code
              setModalContent({
                  title: 'Wrong QR Code',
                  message: 'This QR code is not for the correct game.\nPlease scan the right QR code.',
                  confirmText: 'OK'
              });
              setModalVisible({ ...modalVisible, error: true });
              return;
          }
          
          // If game ID matches, proceed with the original logic
          setMembershipId(scannedData.membershipId);
          setScannerActive(false);
          
          // Automatically check the game after successful scan
          setTimeout(() => {
              checkgame(scannedData.membershipId);
          }, 300);
          
      } catch (error) {
          console.error('Error parsing QR code data:', error);
          
  
      }
      },
    });

    if (device == null) {
        return (
          <View style={styles.page2}>
            <Text style={{ backgroundColor: "white" }}>
              Camera not available or not permitted
            </Text>
          </View>
        );
      }
  // Render platform-specific scanner
  const renderScanner = () => {

      return (
        <>
          <View style={styles.scannerContainer}>
                <Camera
                  codeScanner={codeScanner}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={true}
                />
          </View>
          <TouchableOpacity
            onPress={closeScanner}
            style={[styles.button, styles.closeScanner]}
          >
            <Text style={styles.closeScannerText}>
              {t('scanQRCode.buttons.closeScanner')}
            </Text>
          </TouchableOpacity>
        </>
      );
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={icons.back} resizeMode="contain" style={styles.backIcon} />
        </TouchableOpacity>
        
        <View style={styles.scanView}>
          {scannerActive ? (
            renderScanner()
          ) : showManualInput ? (
            <View style={styles.manualInputContainer}>
              <Text style={styles.manualInputTitle}>
                {t('scanQRCode.manualInput.title')}
              </Text>
              <Text style={styles.manualInputSubtitle}>
                {t('scanQRCode.manualInput.subtitle')}
              </Text>
              
              <TextInput
                style={styles.manualInput}
                placeholder={t('scanQRCode.manualInput.placeholder')}
                value={manualMembershipId}                 
                onChangeText={handleTextChange}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              
              <View style={styles.manualInputButtons}>
                <TouchableOpacity 
                  onPress={handleManualSubmit} 
                  style={[styles.button, styles.submitButton]}
                  disabled={!manualMembershipId.trim()}
                >
                  <Text style={styles.submitButtonText}>
                    {t('scanQRCode.manualInput.submit')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={resetToMainView} 
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>
                    {t('scanQRCode.manualInput.backToScanner')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.scanContainer}>
                <TouchableOpacity onPress={startScanner} style={styles.scanButton}>
                  <Text style={styles.scanText}>{t('scanQRCode.scan.tapToScan')}</Text>
                  <Image source={icons.scan2} resizeMode="contain" style={styles.scanPlaceholderIcon} />
                </TouchableOpacity>
              </View>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('scanQRCode.divider')}</Text>
                <View style={styles.dividerLine} />
              </View>
                
              <TouchableOpacity 
                onPress={showManualInputForm} 
                style={styles.manualButton}
              >
                <Text style={styles.manualButtonText}>
                  {t('scanQRCode.buttons.manualInput')}
                </Text>
                <Text style={styles.manualButtonSubtext}>
                  {t('scanQRCode.buttons.manualInputSubtext')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Update modal content to use translations */}
      <ConfirmModal
        visible={modalVisible.success}
        title={t('scanQRCode.modals.success')}
        message={modalContent.message}
        confirmText={modalContent.confirmText || t('common.ok')}
        onConfirm={closeAllModals}
        onCancel={closeAllModals}
      />

      <ErrorModal
        visible={modalVisible.error}
        title={t('scanQRCode.modals.error')}
        message={modalContent.message}
        onClose={closeAllModals}
      />

      <ConfirmModal
        visible={modalVisible.confirm}
        title={t('scanQRCode.modals.confirmRedemption')}
        message={modalContent.message}
        confirmText={modalContent.confirmText || t('common.confirm')}
        cancelText={modalContent.cancelText || t('common.cancel')}
        onConfirm={handleConfirm}
        onCancel={closeAllModals}
      />
    </>
  );
};

export default ScanQrCode;