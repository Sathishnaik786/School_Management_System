import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/ui/templates/ScreenWrapper';
import { Card } from '../../src/components/ui/organisms/Card';
import { Badge } from '../../src/components/ui/atoms/Badge';
import { SectionHeader } from '../../src/components/ui/molecules/SectionHeader';
import { useAuthStore } from '../../src/stores/auth.store';
import { useTenantStore } from '../../src/stores/tenant.store';
import { ROUTES } from '../../src/constants/routes';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const tenantInfo = useTenantStore((state) => state.tenantInfo);

  const modules = [
    { name: 'Admission', icon: '📝', route: ROUTES.MODULES.ADMISSION, count: '24 New' },
    { name: 'Students', icon: '🎓', route: ROUTES.MODULES.STUDENT, count: '1,240 Total' },
    { name: 'Teachers', icon: '👩‍🏫', route: ROUTES.MODULES.TEACHER, count: '86 Active' },
    { name: 'Parent Portal', icon: '👪', route: ROUTES.MODULES.PARENT, count: '980 Connected' },
  ];

  return (
    <ScreenWrapper scrollable padded>
      {/* Header */}
      <View className="flex-row items-center justify-between my-4">
        <View>
          <Text className="text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider">
            {tenantInfo?.schoolName || 'EduTrack ERP'}
          </Text>
          <Text className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Welcome, {user?.firstName || 'User'}
          </Text>
        </View>
        <Badge label={user?.role || 'ROLE'} variant="info" />
      </View>

      {/* Metrics Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-2">
        <Card title="1,240" subtitle="Total Students" className="w-36 mr-3 bg-sky-500/10 border-sky-500/20" />
        <Card title="94.2%" subtitle="Attendance Today" className="w-36 mr-3 bg-emerald-500/10 border-emerald-500/20" />
        <Card title="$48,200" subtitle="Fee Collected" className="w-36 mr-3 bg-amber-500/10 border-amber-500/20" />
      </ScrollView>

      <SectionHeader title="ERP Modules" subtitle="Quick access to school management services" />

      {/* Module Grid */}
      <View className="flex-row flex-wrap justify-between my-2">
        {modules.map((m) => (
          <TouchableOpacity
            key={m.name}
            onPress={() => router.push(m.route as any)}
            className="w-[48%] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-3 shadow-sm"
          >
            <Text className="text-3xl mb-2">{m.icon}</Text>
            <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{m.name}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}
