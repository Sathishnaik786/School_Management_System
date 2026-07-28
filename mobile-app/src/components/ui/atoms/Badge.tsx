import React from 'react';
import { View, Text } from 'react-native';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300';
      case 'info':
        return 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <View className={`px-2.5 py-0.5 rounded-full self-start ${getVariantStyles()}`}>
      <Text className="text-xs font-semibold">{label}</Text>
    </View>
  );
};
