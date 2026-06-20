import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header, Button, Icon } from '@components';
import { COLORS, screens } from '@constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedApi, publicApi } from '@services/api';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { JAVA_API } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';

type Nav = {
  navigate: (value: string, params?: any) => void;
};

const ProfileOnboarding = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const route = useRoute<any>();
  const [sportsList, setSportsList] = useState<{ label: string; value: string }[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [skillLevel, setSkillLevel] = useState<string>('beginner');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const res: any = await publicApi.get('games/sports');
      const list = res?.result?.data ?? res?.data ?? [];
      setSportsList(list.map((s: any) => ({ label: s.name, value: String(s.id) })));
    } catch (e) {
      setSportsList([]);
    }
  };

  const pickImage = () => {
    Alert.alert(
      t('profile.selectImageTitle') || 'Select image',
      '',
      [
        { text: t('profile.camera') || 'Camera', onPress: () => openCamera() },
        { text: t('profile.photoLibrary') || 'Photo Library', onPress: () => openGallery() },
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, (resp: any) => {
      if (resp?.assets?.[0]) {
        setSelectedImage(resp.assets[0]);
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, (resp: any) => {
      if (resp?.assets?.[0]) {
        setSelectedImage(resp.assets[0]);
      }
    });
  };

  const uploadImage = async (file: any) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('picture', {
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      name: file.fileName || 'avatar.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${JAVA_API}profile/upload-image`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch (err) {
      console.warn('Upload failed', err);
      return false;
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    const payload = { favoriteSportId: selectedSport || null, skillLevel: skillLevel || null };
    try {
      // Persist locally in case of offline or later sync
      await AsyncStorage.setItem('pending_profile_setup', JSON.stringify({ ...payload, avatarUri: selectedImage?.uri ?? null }));

      // Update profile on server
      await authenticatedApi.patch(`profile`, payload);

      // Upload image if present
      if (selectedImage) {
        await uploadImage(selectedImage);
      }
      console.log('Profile setup completed successfully');
      // Clear pending after success
      await AsyncStorage.removeItem('pending_profile_setup');

      navigate("welcome");
    } catch (err) {
      console.warn('Profile setup failed', err);
      Alert.alert(t('common.error') || 'Error', t('otpVerification.genericErrorMessage') || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Keep any pending data saved and move on
    navigate(screens.welcome);
  };

  return (
    <SafeAreaView style={localStyles.area}>
      <Header title={t('otpVerification.headerTitle') || 'Profile Setup'} />

      <ScrollView contentContainerStyle={localStyles.root} showsVerticalScrollIndicator={false}>
        <View style={localStyles.card}>
          <Text style={localStyles.heading}>{t('otpVerification.setupTitle') || 'Finish your profile'}</Text>
          <Text style={localStyles.subheading}>{t('otpVerification.setupDescription') || 'Add a photo and choose your sport & level'}</Text>

          <View style={localStyles.avatarRow}>
            <TouchableOpacity onPress={pickImage} accessible accessibilityLabel={t('profile.selectImageTitle') || 'Select image'}>
                <View style={localStyles.avatarShadow}>
                {selectedImage ? (
                    <Image source={{ uri: selectedImage.uri }} style={localStyles.avatar} />
                ) : (
                    <View style={localStyles.avatarPlaceholder}>
                    <Icon type="materialCommunityIcons" name="camera-plus" size={36} color={COLORS.primary} />
                    </View>
                )}
                </View>
            </TouchableOpacity>
          </View>

          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>{t('otpVerification.sportLabel') || 'Favorite sport'}</Text>
            <View style={localStyles.sportsContainer}>
                {sportsList.map(sport => (
                    <TouchableOpacity
                    key={sport.value}
                    onPress={() => setSelectedSport(sport.value)}
                    style={[
                        localStyles.sportChip,
                        selectedSport === sport.value && localStyles.sportChipSelected,
                    ]}
                    >
                    <Text
                        style={[
                        localStyles.sportChipText,
                        selectedSport === sport.value && localStyles.sportChipTextSelected,
                        ]}
                    >
                        {sport.label}
                    </Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>{t('otpVerification.levelLabel') || 'Skill level'}</Text>
            <View style={localStyles.levelRow}>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setSkillLevel(level)}
                  style={[localStyles.levelBtn, skillLevel === level && localStyles.levelBtnActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: skillLevel === level }}
                >
                  <Text style={[localStyles.levelText, skillLevel === level && localStyles.levelTextActive]}>
                    {t(`otpVerification.level${level.charAt(0).toUpperCase() + level.slice(1)}`) ?? level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={localStyles.actions}>
            <TouchableOpacity onPress={handleSkip} style={localStyles.skipBtn} accessibilityRole="button">
              <Text style={localStyles.skipText}>{t('common.skip') ?? 'Skip'}</Text>
            </TouchableOpacity>

            <View style={{ minWidth: 140 }}>
              <Button
                title={t('otpVerification.finishSetup') ?? 'Continue'}
                onPress={handleContinue}
                disabled={loading}
                style={localStyles.primaryBtn}
              >
                {loading && <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />}
              </Button>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  area: { flex: 1, backgroundColor: COLORS.white },
  root: { padding: 20, alignItems: 'center' },
  card: { width: '100%', maxWidth: 760, backgroundColor: COLORS.white, borderRadius: 14 },
  heading: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  subheading: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 16 },
  avatarRow: { alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative' },
  avatarShadow: { width: 140, height: 140, borderRadius: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 8 },
  avatar: { width: 140, height: 140, borderRadius: 100, resizeMode: 'cover' },
  avatarPlaceholder: { width: 140, height: 140, borderRadius: 100, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  editFab: { position: 'absolute', right: -6, bottom: -2, height: 40, width: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', elevation: 6 },
  section: { marginTop: 8 },

  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  sportsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 8,
},

sportChip: {
  paddingHorizontal: 18,
  paddingVertical: 12,
  borderRadius: 22,
  marginRight: 10,
  marginBottom: 10,
  backgroundColor: COLORS.grayscale100,
  borderWidth: 1,
  borderColor: COLORS.grayscale300,
},

sportChipSelected: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.primary,
},

sportChipText: { fontSize: 13, color: '#333', fontWeight: '600' },

sportChipTextSelected: {
  color: '#FFF',
},
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  levelBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: COLORS.grayscale300, marginRight: 8, backgroundColor: COLORS.grayscale100 },
  levelBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  levelText: { fontSize: 13, color: '#333', fontWeight: '600' },
  levelTextActive: { color: '#fff' },
  actions: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  skipText: { color: COLORS.primary, fontWeight: '600' },
  primaryBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
});

export default ProfileOnboarding;
