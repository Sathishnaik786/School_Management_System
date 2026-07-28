import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/ui/templates/ScreenWrapper';
import { Input } from '../../src/components/ui/atoms/Input';
import { PasswordInput } from '../../src/components/ui/molecules/PasswordInput';
import { Button } from '../../src/components/ui/atoms/Button';
import { ROUTES } from '../../src/constants/routes';
import { AuthService } from '../../src/core/auth/auth.service';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate authentication success
    setTimeout(async () => {
      await AuthService.loginSuccess(
        {
          id: 'usr_1',
          email,
          firstName: 'Admin',
          lastName: 'User',
          fullName: 'Admin User',
          role: 'SCHOOL_ADMIN',
          permissions: [],
          isActive: true,
          tenantId: 'tnt_1',
          schoolId: 'sch_1',
        },
        { accessToken: 'mock_access_token', refreshToken: 'mock_refresh_token', expiresIn: 3600 },
      );
      setIsLoading(false);
      router.push(ROUTES.AUTH.WORKSPACE as any);
    }, 1000);
  };

  return (
    <ScreenWrapper scrollable padded>
      <View className="py-8">
        <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome Back</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Sign in to access EduTrack ERP Platform
        </Text>

        <Input
          label="Email Address"
          placeholder="admin@school.edu"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD as any)}
          className="align-self-end mb-6"
        >
          <Text className="text-xs font-semibold text-sky-600 dark:text-sky-400 text-right">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button title="Sign In" size="lg" isLoading={isLoading} onPress={handleLogin} />
      </View>
    </ScreenWrapper>
  );
}
