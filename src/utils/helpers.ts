import moment from 'moment';
import i18next from 'i18next';
import { DATE_FORMAT_EN, DATE_FORMAT_FR } from '@constants';
import storage from './storage';
import { JAVA_API } from '@env';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import publicApi from '@services/api';

export const getLocale = () => i18next.language || storage.getItem('lng');

export const dateFormat = (date: any) => {
  return getLocale() === 'en'
    ? moment(date).format(DATE_FORMAT_EN)
    : moment(date).format(DATE_FORMAT_FR);
};

export const toTitleCase = (str: string) =>
  str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
export const imagePickerHelper = () => {};

export const getProfilePicture = async (userId: string) => {
  return `${JAVA_API}profile/${userId}/image`;
};

const requestPermission = async () => {
  if (Platform.OS === 'android') {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    // If already granted, don't ask again
    if (hasPermission) {
      return true;
    }

    // Otherwise request it
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true; // iOS handled via Info.plist
};

const US_STATE_CODES: Record<string, string> = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
};

export const getCurrentCity = async () => {
  let city = 'Kansas City'; // default fallback
  const hasPermission = await requestPermission();
  if (!hasPermission) {
    console.log('Permission denied');
    return city; // ← just return the string directly
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'pickuplay/1.0' } }
          );
          const data = await response.json();
          city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county;
          const state = data.address.state as string | undefined;

            const stateCode = state
              ? US_STATE_CODES[state] ?? null
              : null;

            const res = await publicApi.get('cities/search?name=' + city + '&stateCode=' + stateCode);
            let cityData = res.result.data[0];
          resolve(cityData);
        } catch (err) {
          reject(err);
        }
      },
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  });
};
