import React from 'react';
import { View, Text } from 'react-native';
import { ScreenWrapper } from './ScreenWrapper';
import { SectionHeader } from '../molecules/SectionHeader';

export interface ModuleShellProps {
  moduleName: string;
  description: string;
  icon?: string;
  children?: React.ReactNode;
}

export const ModuleShell: React.FC<ModuleShellProps> = ({
  moduleName,
  description,
  icon = '📦',
  children,
}) => {
  return (
    <ScreenWrapper scrollable padded>
      <SectionHeader title={moduleName} subtitle={description} />
      <View className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 items-center justify-center my-4">
        <Text className="text-5xl mb-3">{icon}</Text>
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
          {moduleName} Module Active
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Architecture shell ready for enterprise expansion.
        </Text>
      </View>
      {children}
    </ScreenWrapper>
  );
};
