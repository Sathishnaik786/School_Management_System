import React from 'react';
import { View, Text, Image } from 'react-native';

export interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ source, name = 'U', size = 'md' }) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-14 h-14 text-xl';
      case 'xl':
        return 'w-20 h-20 text-2xl';
      case 'md':
      default:
        return 'w-10 h-10 text-base';
    }
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <View
      className={`rounded-full bg-sky-600 items-center justify-center overflow-hidden ${getSizeStyle()}`}
    >
      {source ? (
        <Image source={{ uri: source }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <Text className="font-bold text-white">{initials}</Text>
      )}
    </View>
  );
};
