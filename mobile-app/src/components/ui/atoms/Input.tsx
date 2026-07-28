import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border rounded-lg px-3 py-2.5 bg-white dark:bg-slate-800 ${
          error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          placeholderTextColor="#94a3b8"
          className="flex-1 text-slate-900 dark:text-slate-100 text-base"
          style={style}
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error ? (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</Text>
      ) : null}
    </View>
  );
};
