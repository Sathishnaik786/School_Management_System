import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/ui/templates/ScreenWrapper';
import { Avatar } from '../../src/components/ui/atoms/Avatar';
import { Card } from '../../src/components/ui/organisms/Card';
import { Button } from '../../src/components/ui/atoms/Button';
import { useAuthStore } from '../../src/stores/auth.store';
import { AuthService } from '../../src/core/auth/auth.service';
import { ROUTES } from '../../src/constants/routes';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await AuthService.logout();
    router.replace(ROUTES.AUTH.LOGIN as any);
  };

  return (
    <ScreenWrapper scrollable padded>
      <View className="items-center py-6">
        <Avatar name={user?.fullName || 'User'} size="xl" />
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-3">
          {user?.fullName || 'User Name'}
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">{user?.email || 'email@school.edu'}</Text>
      </View>

      <Card title="Account Details">
        <Text className="text-sm text-slate-600 dark:text-slate-300 my-1">
          Role: <Text className="font-semibold">{user?.role || 'N/A'}</Text>
        </Text>
        <Text className="text-sm text-slate-600 dark:text-slate-300 my-1">
          Status: <Text className="font-semibold text-emerald-500">Active</Text>
        </Text>
      </Card>

      <View className="my-6">
        <Button title="Sign Out" variant="danger" onPress={handleLogout} />
      </View>
    </ScreenWrapper>
  );
}
