import { useState } from 'react';
import { Lock, Bell, Moon, Shield, Save } from 'lucide-react';

export const Settings = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    });

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>
                <p className="text-gray-500 mt-2">Manage your preferences and security capabilities.</p>
            </div>

            <div className="space-y-6">
                {/* Security Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Security
                    </h2>

                    <form className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Current Password</label>
                            <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">New Password</label>
                            <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Confirm New Password</label>
                            <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                        </div>
                        <div className="pt-2">
                            <button type="button" className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                                <Lock className="w-4 h-4" />
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notifications Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        Notification Preferences
                    </h2>

                    <div className="space-y-4">
                        {[
                            { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                            { id: 'push', label: 'Push Notifications', desc: 'Receive updates on your device' },
                            { id: 'sms', label: 'SMS Alerts', desc: 'Receive critical updates via SMS' }
                        ].map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div>
                                    <h3 className="font-bold text-sm text-gray-900">{item.label}</h3>
                                    <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifications[item.id as keyof typeof notifications]}
                                        onChange={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
