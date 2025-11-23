import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '../styles/theme';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'large', 
  color = theme.colors.primary 
}) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default Loader;