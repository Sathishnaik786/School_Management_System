import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../src/components/ui/templates/ScreenWrapper';
import { SectionHeader } from '../../src/components/ui/molecules/SectionHeader';
import { useThemeStore } from '../../src/stores/theme.store';

export default function SettingsScreen() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <ScreenWrapper scrollable padded>
      <SectionHeader title="Application Settings" subtitle="Configure preferences and themes" />

      <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-4 mb-2">
        Theme Appearance
      </Text>
      <View className="flex-row space-x-2">
        {(['light', 'dark', 'system'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            className={`flex-1 py-3 px-2 rounded-lg border items-center capitalize ${
              mode === m
                ? 'bg-sky-600 border-sky-600'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Text
              className={`font-semibold ${
                mode === m ? 'text-white' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}
