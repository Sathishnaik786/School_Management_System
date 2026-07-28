import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/ui/templates/ScreenWrapper';
import { Button } from '../../src/components/ui/atoms/Button';
import { ROUTES } from '../../src/constants/routes';
import { TenantService } from '../../src/core/tenant/tenant.service';

const mockWorkspaces = [
  { id: 'tnt_1', name: 'Springfield High School', code: 'SFH-01', schoolId: 'sch_1', academicYearId: 'ay_2026' },
  { id: 'tnt_2', name: 'St. Jude International Academy', code: 'SJA-02', schoolId: 'sch_2', academicYearId: 'ay_2026' },
];

export default function WorkspaceSelectionScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(mockWorkspaces[0].id);

  const handleSelectWorkspace = async () => {
    const ws = mockWorkspaces.find((w) => w.id === selectedId) || mockWorkspaces[0];
    await TenantService.selectWorkspace(ws);
    router.replace(ROUTES.TABS.DASHBOARD as any);
  };

  return (
    <ScreenWrapper scrollable padded>
      <View className="py-8">
        <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Select Workspace
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Choose a school institution workspace to manage.
        </Text>

        {mockWorkspaces.map((ws) => (
          <TouchableOpacity
            key={ws.id}
            onPress={() => setSelectedId(ws.id)}
            className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${
              selectedId === ws.id
                ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/30'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800'
            }`}
          >
            <View>
              <Text className="font-bold text-base text-slate-900 dark:text-slate-100">
                {ws.name}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">Code: {ws.code}</Text>
            </View>
            {selectedId === ws.id && <Text className="text-sky-600 font-bold text-lg">✓</Text>}
          </TouchableOpacity>
        ))}

        <View className="mt-6">
          <Button title="Enter Workspace" size="lg" onPress={handleSelectWorkspace} />
        </View>
      </View>
    </ScreenWrapper>
  );
}
