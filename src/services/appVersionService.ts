
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import { publicApi } from './api'; // Use your existing Axios instance
import axios from 'axios';

export interface AppVersionData {
  minimumSupportedVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  updateRequired: boolean;
  message: string;
  storeUrl: string;
}

interface ApiResponse {
  type: string;
  message: string;
  data: AppVersionData;
}

export const checkAppVersion = async (): Promise<AppVersionData | null> => {
  try {
    const currentVersion = DeviceInfo.getVersion();

    const platform = Platform.OS;
    const response = await publicApi.get('app/version', {
      params: {
        platform,
        currentVersion,
      },
    });

    if (response.data.type !== 'success') {
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error('App version check failed:', error);
    return null;
  }
};
