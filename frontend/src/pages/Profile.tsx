import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Building, Calendar, Hash, FileText } from 'lucide-react';

export const Profile = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header / Cover */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6 translate-y-1/2">
                    <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-xl">
                        <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-4xl font-black">
                            {user.full_name?.charAt(0)}
                        </div>
                    </div>
                    <div className="mb-4">
                        <h1 className="text-3xl font-black text-white shadow-sm">{user.full_name}</h1>
                        <p className="text-blue-100 font-medium flex items-center gap-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                                {user.roles?.[0]}
                            </span>
                            <span className="text-sm opacity-90">{user.email}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-16 grid md:grid-cols-3 gap-8">
                {/* Left Column: Personal Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Details
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                <div className="font-semibold text-gray-700">{user.full_name}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                                <div className="font-semibold text-gray-700">{user.email}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</label>
                                <div className="font-semibold text-gray-700">{user.phone_number || 'Not provided'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Date of Birth</label>
                                <div className="font-semibold text-gray-700">Jan 01, 2000</div>
                                {/* Placeholder - would come from extended profile API */}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-600" />
                            Academic Info
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Admission No</label>
                                <div className="font-semibold text-gray-700 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    ADM-2023-001
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Class & Section</label>
                                <div className="font-semibold text-gray-700">Class 10 - A</div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Roll Number</label>
                                <div className="font-semibold text-gray-700">24</div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Academic Year</label>
                                <div className="font-semibold text-gray-700">2023-2026</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Documents */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Documents
                        </h2>

                        <div className="space-y-3">
                            {['Birth Certificate', 'Transfer Certificate', 'Aadhar Card', 'Previous Marksheet'].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="text-sm font-semibold text-gray-700">{doc}</div>
                                    </div>
                                    <div className="text-xs font-black text-gray-400 group-hover:text-blue-600">VIEW</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
