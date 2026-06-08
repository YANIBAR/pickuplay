import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Clipboard,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Icon } from '@components';
import InfoRow from './InfoRow';
import { COLORS, FONTS, SIZES } from '@constants';
import { useTranslation } from 'react-i18next';
import { JAVA_API } from '@env';
import { publicApi } from '@services/api';
import { useNavigation } from '@react-navigation/native';
import { toTitleCase } from '@utils/helpers';

interface SportType {
  id: number;
  name: string;
  active: boolean;
}

interface Field {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  address: string;
  sportType: SportType;
  isIndoor: boolean;
  accessType: 'FREE' | 'PAID' | 'PRIVATE';
  imageUrl: string;
  createdAt: string;
}

const getSportIcon = (sportName: string): string => {
  const map: Record<string, string> = {
    soccer: 'soccer',
    football: 'soccer',
    basketball: 'basketball',
    volleyball: 'volleyball',
    tennis: 'tennis',
    hockey: 'hockey-sticks',
    'table tennis': 'table-tennis',
    pingpong: 'table-tennis',
    baseball: 'baseball',
    rugby: 'football',
  };
  return map[sportName?.toLowerCase()] || 'trophy-outline';
};

const getAccessTypeColor = (accessType: string) => {
  switch (accessType) {
    case 'FREE':
      return COLORS.green ?? '#22c55e';
    case 'PAID':
      return COLORS.primary;
    case 'PRIVATE':
      return COLORS.error ?? '#ef4444';
    default:
      return COLORS.gray3;
  }
};

const getAccessTypeLabel = (accessType: string, t: any): string => {
  switch (accessType) {
    case 'FREE':
      return t('field.accessType.free');
    case 'PAID':
      return t('field.accessType.paid');
    case 'PRIVATE':
      return t('field.accessType.private');
    default:
      return accessType;
  }
};

export default function FieldDetailsScreen({ route }: { route: any }) {
  const { t } = useTranslation();
  const fieldId = route.params?.field_id;
  const { navigate } = useNavigation();
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fieldId) {
      fetchField();
    }
  }, [fieldId]);

  const fetchField = async () => {
    try {
      setLoading(true);
      const response = await publicApi.get(`fields/${fieldId}`);
      setField(response.result.data);
    } catch (error) {
      console.error('Error fetching field:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = () => {
    if (!field) return;
    const address = encodeURIComponent(field.address);
    const url =
      Platform.OS === 'ios'
        ? `maps://app?daddr=${address}`
        : `google.navigation:q=${address}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${address}`
        );
      }
    });
  };

  const handleShareField = async () => {
    if (!field) return;
    try {
      const link = `http://pickuplay.com/?field_id=${field.id}`;
      const message =
        `🏟️ ${field.name}\n\n` +
        `📍 ${field.address}\n` +
        `🏃 ${field.sportType?.name}\n` +
        `🏠 ${field.isIndoor ? t('field.indoor') : t('field.outdoor')}\n` +
        `🎟️ ${getAccessTypeLabel(field.accessType, t)}\n\n` +
        `Check this field on Pickuplay 👇\n${link}`;

      await Share.share({
        message,
        title: `${field.name} on Pickuplay`,
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('field.shareError'));
    }
  };

  if (loading || !field) {
    return (
      <SafeAreaView style={styles.area}>
        <Header title={t('field.details.title')} target="welcome" />
        <View style={styles.loadingContainer}>
          <Icon
            type="materialCommunityIcons"
            name="loading"
            size={32}
            color={COLORS.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.area}>
      <ScrollView
        style={[styles.container, { backgroundColor: COLORS.white }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header title={t('field.details.title')}/>
        {/* Field Image */}
        <Image
          source={{ uri: `${JAVA_API}fields/${field.id}/image` }}
          style={styles.fieldImage}
          resizeMode="cover"
        />

        <View style={styles.content}>
          {/* Name + Access Badge */}
          <View style={styles.nameRow}>
            <Text style={[FONTS.h3, styles.fieldName]} numberOfLines={2}>
              {field.name}
            </Text>
            <View
              style={[
                styles.accessBadge,
                { backgroundColor: getAccessTypeColor(field.accessType) + '1A' },
              ]}
            >
              <Text
                style={[
                  styles.accessBadgeText,
                  { color: getAccessTypeColor(field.accessType) },
                ]}
              >
                {getAccessTypeLabel(field.accessType, t)}
              </Text>
            </View>
          </View>

          {/* Tags row: Sport + Indoor/Outdoor */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Icon
                type="materialCommunityIcons"
                name={getSportIcon(field.sportType?.name)}
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.tagText}>
                {toTitleCase(field.sportType?.name)}
              </Text>
            </View>
            <View style={styles.tag}>
              <Icon
                type="materialCommunityIcons"
                name={field.isIndoor ? 'home-roof' : 'weather-sunny'}
                size={14}
                color={COLORS.secondary}
              />
              <Text style={[styles.tagText, { color: COLORS.secondary }]}>
                {field.isIndoor ? t('field.indoor') : t('field.outdoor')}
              </Text>
            </View>
          </View>

          {/* Info Rows */}
          <View style={styles.infoContainer}>
            <InfoRow
              icon="map-marker"
              label={t('field.address')}
              value={field.address}
              isAddress
            />
            <InfoRow
              icon="city"
              label={t('field.city')}
              value={toTitleCase(field.city)}
            />
            <InfoRow
              icon={getSportIcon(field.sportType?.name)}
              label={t('field.sportType')}
              value={toTitleCase(field.sportType?.name)}
            />
            <InfoRow
              icon={field.isIndoor ? 'home-roof' : 'weather-sunny'}
              label={t('field.environment')}
              value={field.isIndoor ? t('field.indoor') : t('field.outdoor')}
            />
            <InfoRow
              icon="ticket-outline"
              label={t('field.access')}
              value={getAccessTypeLabel(field.accessType, t)}
            />
          </View>

          {/* Map Preview CTA */}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleGetDirections}
            activeOpacity={0.85}
          >
            <Icon
              type="materialCommunityIcons"
              name="directions"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.mapButtonText}>
              {t('field.getDirections')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    padding: 4,
    marginLeft: 8,
  },

  // Image
  fieldImage: {
    width: SIZES.width,
    height: 240,
    backgroundColor: COLORS.grayscale100,
  },

  // Content area
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Name + badge row
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  fieldName: {
    flex: 1,
    flexWrap: 'wrap',
  },
  accessBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  accessBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.grayscale100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
  },

  // Info rows container
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale100,
    marginBottom: 20,
  },

  // Map CTA Button
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  mapButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // Copy link
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
  },
  copyLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});