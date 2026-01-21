import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ConfirmModal, ErrorModal } from "@components";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_BACKEND_URL } from "@env";
import { COLORS } from "@constants";

const QRScanner = (props) => {

  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const device = useCameraDevice("back");
  const [gameId, setgameId] = useState('6835ecc1e17e7ae06700a26f');
  const [scannerActive, setScannerActive] = useState(false);
  const [membershipId, setMembershipId] = useState('');

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

  const checkgame = async (membershipIdToCheck = membershipId) => {
  try {
    const response = await axios.get(`${API_BACKEND_URL}/redemptions/check`, {
      params: { membershipId: membershipIdToCheck, gameId }
    });
    
    const redemptionCountInfo = response.data.redemptionCount;
    
    if (redemptionCountInfo.eligible) {
      console.log("pppp:", redemptionCountInfo);
      setModalContent({
        title: 'Confirm Redemption',
        message: redemptionCountInfo.message,
        confirmText: 'Confirm',
        cancelText: 'Cancel'
      });
      // Use functional update here
      setModalVisible(prev => ({ ...prev, confirm: true }));
    } else {
      setModalContent({
        title: 'Information',
        message: redemptionCountInfo.message,
        confirmText: 'OK'
      });
      // Use functional update here
      setModalVisible(prev => ({ ...prev, error: true }));
    }
  } catch (error) {
    setModalContent({
      title: 'Error',
      message: 'Failed to check game eligibility',
      confirmText: 'OK'
    });
    // Use functional update here
    setModalVisible(prev => ({ ...prev, error: true }));
  }
};
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
      props.onRead(codes[0].value);
    },
  });
  // Modal handlers
  const handleConfirm = () => {
    setModalVisible({ ...modalVisible, confirm: false });
    //confirmRedemption();
  };
  const closeAllModals = () => {
    setModalVisible({ success: false, error: false, confirm: false });
  };
  useEffect(() => {
    // exception case
    setRefresh(!refresh);
  }, [device, hasPermission]);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      console.log("Camera.requestCameraPermission ", permission);
      setHasPermission(permission === "granted");
    };

    requestCameraPermission();

    //if it is idle for 15 secs, it will be closed
    setTimeout(() => {
      props.onRead(null);
    }, 15 * 1000);
  }, []);

  if (device == null || !hasPermission) {
    return (
      <View style={styles.page2}>
        <Text style={{ backgroundColor: "white" }}>
          Camera not available or not permitted
        </Text>
      </View>
    );
  }
  const closeScanner = () => {
    setScannerActive(false);
  };

  return (
    <>
    <View style={styles.page2}>
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

export default QRScanner;

const styles = StyleSheet.create({
  page2: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 350,
    overflow: 'hidden',
    borderRadius: 24
  },
  backHeader: {
    backgroundColor: "#00000090",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "2%",
    height: "5%",
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  footer: {
    backgroundColor: "#00000090",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "10%",
    height: "20%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  closeScanner: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10
  },
  closeScannerText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  }
});
