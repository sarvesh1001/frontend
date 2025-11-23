import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('Error storing data:', error);
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

export const clearStorage = async (): Promise<void> => {
  try {
    const keys = [
      'access_token',
      'refresh_token',
      'admin_id',
      'user_id',
      'user_type',
      'company_context',
      'device_id'
    ];

    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
