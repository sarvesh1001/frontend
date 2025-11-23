import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getItem, setItem } from '../services/storage';

export const getDeviceInfo = async (): Promise<{
  deviceId: string;
  deviceFingerprint: string;
}> => {
  let deviceId = await getItem('device_id');
  
  if (!deviceId) {
    deviceId = `${Device.modelName}-${Platform.OS}-${Date.now()}`;
    await setItem('device_id', deviceId);
  }

  const deviceFingerprint = `${Device.modelName}-${Device.osVersion}-${Platform.OS}-${Device.brand}`;

  return {
    deviceId,
    deviceFingerprint,
  };
};