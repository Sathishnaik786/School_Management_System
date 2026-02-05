import React, { useState, useEffect } from 'react';
import { StaffApi } from '../../../api/facultyStaff.api';
import { supabase } from '../../../lib/supabase';
import { ImportWizard } from '../../../components/import/ImportWizard';
import { DownloadCloud } from 'lucide-react';

interface StaffProfile {
    id: string;
    user_id: string;
    staff_type: string;
    joining_date: string;
    status: string;
    user?: { full_name: string; email: string };
    department?: { name: string };
}

interface UserSummary {
    id: string;
    full_name: string;
}

export const StaffListPage: React.FC = () => {
    const [profiles, setProfiles] = useState<StaffProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        user_id: '',
        staff_type: '',
        department_id: '',
        joining_date: ''
    });

    const [staffUsers, setStaffUsers] = useState<UserSummary[]>([]);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const data = await StaffApi.getAllProfiles({ limit: 100 });
            setProfiles(data.data || []);
        } catch (error) {
            console.error('Error fetching staff profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffUsers = async () => {
        // Find users with role STAFF
        // Assuming 'STAFF' role exists or reusing general users for now and admin ensures role correctness
        // Ideally we filter by user role via query
        const { data } = await supabase
            .from('users')
            .select(`id, full_name, user_roles!inner(role:roles!inner(name))`)
            // .eq('user_roles.role.name', 'STAFF'); // Commented out in case STAFF role isn't strictly seeded yet; 
            // ideally uncomment if seeded. For demo, we might list all to allow flexibility or just check if user exists.
            // Let's assume strictness:
            .eq('user_roles.role.name', 'STAFF');

        if (data) {
            setStaffUsers(data.map((u: any) => ({ id: u.id, full_name: u.full_name })));
        }
    };

    const handleOpenCreate = () => {
        fetchStaffUsers();
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await StaffApi.createProfile(formData);
            setIsModalOpen(false);
            fetchProfiles();
            setFormData({
                user_id: '',
                staff_type: '',
                department_id: '',
                joining_date: ''
            });
        } catch (err: any) {
            alert('Error creating profile: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <DownloadCloud className="w-4 h-4" /> Import Staff
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        + Add Staff Profile
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {profiles.map((profile) => (
                                <tr key={profile.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{profile.user?.full_name || 'Unknown'}</div>
                                        <div className="text-gray-500 text-sm">{profile.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{profile.staff_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{profile.joining_date || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {profile.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {profiles.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No profiles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Create Staff Profile</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select User (Staff Role)</label>
                                    <select
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.user_id}
                                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                    >
                                        <option value="">-- Select User --</option>
                                        {staffUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Staff Type</label>
                                    <select
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.staff_type}
                                        onChange={e => setFormData({ ...formData, staff_type: e.target.value })}
                                    >
                                        <option value="">-- Select Type --</option>
                                        <option value="librarian">Librarian</option>
                                        <option value="accountant">Accountant</option>
                                        <option value="transport_manager">Transport Manager</option>
                                        <option value="clerk">Clerk</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={formData.joining_date}
                                        onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Import Wizard */}
            <ImportWizard
                isOpen={isImportOpen}
                onClose={() => {
                    setIsImportOpen(false);
                    fetchProfiles(); // Refresh after import
                }}
                entityType="STAFF_PROFILE"
                title="Staff Profiles"
            />
        </div>
    );
};
