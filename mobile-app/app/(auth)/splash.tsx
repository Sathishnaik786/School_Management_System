import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/ui/templates/ScreenWrapper';
import { Button } from '../../src/components/ui/atoms/Button';
import { ROUTES } from '../../src/constants/routes';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper scrollable={false} padded>
      <View className="flex-1 justify-center items-center px-4">
        <View className="w-24 h-24 bg-sky-600 rounded-3xl items-center justify-center mb-6 shadow-xl">
          <Text className="text-5xl font-black text-white">E</Text>
        </View>
        <Text className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 text-center mb-2">
          EduTrack ERP
        </Text>
        <Text className="text-base text-slate-500 dark:text-slate-400 text-center mb-10">
          Enterprise School Management System
        </Text>
        <View className="w-full space-y-3">
          <Button
            title="Get Started"
            size="lg"
            onPress={() => router.push(ROUTES.AUTH.LOGIN as any)}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
