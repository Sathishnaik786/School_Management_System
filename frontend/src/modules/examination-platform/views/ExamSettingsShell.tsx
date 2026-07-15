import React from 'react';
import { PageHeader } from '../shared/components/PageHeader';
import { InfoCard } from '../shared/components/InfoCard';
import { Button } from '@/components/ui/button';

export const ExamSettingsShell: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Portal Configuration Settings"
        description="Personalize your live proctor configurations, webcam parameters, and accessibility layouts."
      />

      <InfoCard
        title="Settings Policy Notice"
        description="Portal parameters are preconfigured by institutional security workflows. Individual modifications to proctor variables are locked."
        variant="warning"
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm space-y-6">
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none border-b border-slate-100 pb-3">
            Hardware Diagnostics Settings
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked disabled className="rounded text-blue-600 focus:ring-blue-500" />
              <span className="text-xs font-bold text-slate-700">Auto-detect Webcam Connection at Entrance</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked disabled className="rounded text-blue-600 focus:ring-blue-500" />
              <span className="text-xs font-bold text-slate-700">Real-time Audio Decibel Level Monitoring</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
              <span className="text-xs font-bold text-slate-700">Display Live Proctor Video Thumbnail in Corner</span>
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none border-b border-slate-100 pb-3">
            User Experience Prefs
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
              <span className="text-xs font-bold text-slate-700">Enable In-Test Shortcut Alerts</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
              <span className="text-xs font-bold text-slate-700">Compact Question Palette Grid</span>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamSettingsShell;
