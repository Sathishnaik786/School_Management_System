import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfileStore } from '../store/profile.store';
import { useSettingsStore } from '../store/settings.store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileService } from '../services/auth/ProfileService';
import { ChangePasswordForm } from '../features/auth/ChangePasswordPage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Building, FileText, Shield, Bell, Palette,
    Monitor, Globe, Save, Edit2, CheckCircle2, Clock, LogOut, Hash
} from 'lucide-react';
import { QUERY_KEYS } from '../lib/queryKeys';

type Tab = 'overview' | 'edit' | 'security' | 'preferences';

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'edit', label: 'Edit Profile', icon: Edit2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
];

// ─── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab() {
    const { user } = useAuth();
    if (!user) return null;

    const fields = [
        { icon: User, label: 'Full Name', value: user.full_name },
        { icon: Mail, label: 'Email Address', value: user.email },
        { icon: Phone, label: 'Phone Number', value: user.phone_number || 'Not provided' },
        { icon: Building, label: 'Role', value: user.roles?.join(', ') || 'No role assigned' },
        { icon: Hash, label: 'User ID', value: user.id?.slice(0, 16) + '...' },
    ];

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Avatar & Role Card */}
            <div className="space-y-6">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/30">
                        {user.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900">{user.full_name}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {user.roles?.map(role => (
                                <span key={role} className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                {user.permissions && user.permissions.length > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Permissions ({user.permissions.length})</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {user.permissions.slice(0, 12).map(perm => (
                                <span key={perm} className="bg-white border border-gray-200 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                    {perm}
                                </span>
                            ))}
                            {user.permissions.length > 12 && (
                                <span className="bg-gray-200 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                    +{user.permissions.length - 12} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
                {fields.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                            <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{label}</p>
                            <p className="text-sm font-bold text-gray-800 mt-0.5">{value || '—'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Tab: Edit Profile ────────────────────────────────────────────────────────
function EditProfileTab() {
    const { user, refreshProfile } = useAuth();
    const queryClient = useQueryClient();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone_number || '');
    const [saved, setSaved] = useState(false);

    const mutation = useMutation({
        mutationFn: () => ProfileService.updateProfile({ full_name: fullName, phone_number: phone }),
        onSuccess: async () => {
            setSaved(true);
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER });
            setTimeout(() => setSaved(false), 3000);
        },
    });

    return (
        <div className="max-w-md space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
                <input
                    id="profile-full-name"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number</label>
                <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed. Contact admin.</p>
            </div>
            <button
                id="profile-save"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60"
            >
                {mutation.isPending ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : saved ? (
                    <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                )}
            </button>
        </div>
    );
}

// ─── Tab: Preferences ─────────────────────────────────────────────────────────
function PreferencesTab() {
    const { theme, setTheme, language, setLanguage, notifications, setNotificationPref } = useSettingsStore();

    return (
        <div className="space-y-6">
            {/* Theme */}
            <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5" /> Appearance
                </label>
                <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${theme === t ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Language */}
            <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Language
                </label>
                <div className="flex gap-2">
                    {[{ id: 'en', label: '🇬🇧 English' }, { id: 'te', label: '🇮🇳 Telugu' }].map(l => (
                        <button
                            key={l.id}
                            onClick={() => setLanguage(l.id as 'en' | 'te')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${language === l.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5" /> Notification Preferences
                </label>
                <div className="space-y-3">
                    {[
                        { id: 'email' as const, label: 'Email Notifications' },
                        { id: 'push' as const, label: 'Push Notifications' },
                        { id: 'sms' as const, label: 'SMS Alerts' },
                    ].map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="text-sm font-bold text-gray-700">{item.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    id={`notif-${item.id}`}
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications[item.id]}
                                    onChange={e => setNotificationPref(item.id, e.target.checked)}
                                />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    if (!user) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Cover Banner */}
            <div className="relative h-40 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 rounded-2xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                <div className="absolute bottom-0 left-0 p-6 flex items-end gap-5 translate-y-1/2">
                    <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-xl shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white text-3xl font-black">
                            {user.full_name?.charAt(0) || '?'}
                        </div>
                    </div>
                    <div className="pb-1">
                        <h1 className="text-xl font-black text-white">{user.full_name}</h1>
                        <p className="text-blue-100 text-xs font-medium">{user.email}</p>
                    </div>
                </div>
            </div>

            <div className="pt-14">
                {/* Tab Navigation */}
                <div className="flex gap-1 border-b border-gray-200 mb-6">
                    {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            id={`profile-tab-${id}`}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && <OverviewTab />}
                        {activeTab === 'edit' && <EditProfileTab />}
                        {activeTab === 'security' && (
                            <div className="max-w-md">
                                <h2 className="text-sm font-black text-gray-900 mb-5 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" /> Change Password
                                </h2>
                                <ChangePasswordForm onSuccess={() => setActiveTab('overview')} />
                            </div>
                        )}
                        {activeTab === 'preferences' && <PreferencesTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
