import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  onPress,
  headerAction,
  children,
  style,
  ...props
}) => {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 my-2 shadow-sm"
      style={style}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            {title && (
              <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
            )}
          </View>
          {headerAction && <View className="ml-2">{headerAction}</View>}
        </View>
      )}
      {children}
    </CardContainer>
  );
};
