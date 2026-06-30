import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useInquiries, useConvertEnquiry, useLeads, useAssignLead, useCreateEnquiry } from '../hooks/useAdmission';
import { DataTableFramework, ColumnDefinition } from '../../../components/tables/DataTableFramework';
import { Button } from '../../../components/ui/button';
import { Plus, UserCheck, ArrowRight, PhoneCall, RefreshCw } from 'lucide-react';

export function InquiryListPage() {
    const location = useLocation();
    const isAssignRoute = location.pathname.endsWith('/assign');
    const [activeTab, setActiveTab] = useState<'enquiry' | 'lead'>(isAssignRoute ? 'lead' : 'enquiry');
    const { data: enquiries, isLoading: isEnquiriesLoading } = useInquiries(undefined, { enabled: !isAssignRoute });
    const { data: leads, isLoading: isLeadsLoading } = useLeads(undefined, { enabled: isAssignRoute });
    const convertMutation = useConvertEnquiry();
    const assignMutation = useAssignLead();
    const createMutation = useCreateEnquiry();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        student_name: '',
        parent_name: '',
        email: '',
        phone: '',
        grade_applied_for: 'Grade 1',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreateInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        
        // 1. Student Name validation
        const studentName = formData.student_name.trim();
        if (studentName.length < 2) {
            newErrors.student_name = 'Student Name must contain at least 2 characters';
        } else if (studentName.length > 100) {
            newErrors.student_name = 'Student Name must not exceed 100 characters';
        } else if (!/^[A-Za-z ]+$/.test(studentName)) {
            newErrors.student_name = 'Student Name must contain letters and spaces only';
        }

        // 2. Parent Name validation
        const parentName = formData.parent_name.trim();
        if (parentName.length < 2) {
            newErrors.parent_name = 'Parent name must contain at least 2 characters';
        }

        // 3. Phone validation
        const phone = formData.phone.trim();
        if (!/^\+?[0-9]{10,15}$/.test(phone)) {
            newErrors.phone = 'Please enter a valid phone number with country code (e.g. +919876543210, 10-15 digits, no spaces)';
        }

        // 4. Email validation
        const email = formData.email.trim();
        if (!email) {
            newErrors.email = 'Parent email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        try {
            await createMutation.mutateAsync({
                student_name: studentName,
                parent_name: parentName,
                parent_email: email,
                parent_phone: phone,
                grade_applied_for: formData.grade_applied_for,
                source: 'Phone',
            });
            setIsCreateOpen(false);
            setFormData({ student_name: '', parent_name: '', email: '', phone: '', grade_applied_for: 'Grade 1' });
        } catch (error: any) {
            console.error(error);
            const serverMsg = error.response?.data?.error || error.message || 'Failed to create inquiry';
            alert(serverMsg);
        }
    };

    const enquiryColumns: ColumnDefinition<any>[] = [
        { key: 'student_name', header: 'Student Name' },
        { key: 'parent_name', header: 'Parent Name' },
        { key: 'phone', header: 'Contact No' },
        { key: 'grade_applied_for', header: 'Grade' },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-50 text-blue-600 uppercase">
                    {row.status || 'Enquired'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: any) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => convertMutation.mutate(row.id)}
                        disabled={convertMutation.isPending}
                        className="text-xs text-primary font-bold flex items-center gap-1"
                    >
                        Convert <ArrowRight className="w-3 h-3" />
                    </Button>
                </div>
            ),
        },
    ];

    const leadColumns: ColumnDefinition<any>[] = [
        { key: 'student_name', header: 'Student Name' },
        { key: 'parent_name', header: 'Parent Name' },
        { key: 'counselor', header: 'Counselor', render: (row: any) => row.assigned_counselor || 'Unassigned' },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: any) => (
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        onClick={() => assignMutation.mutate({ id: row.id, counselorId: 'counselor-1' })}
                        disabled={assignMutation.isPending}
                        className="text-xs bg-gray-900 text-white flex items-center gap-1"
                    >
                        <UserCheck className="w-3 h-3" />
                        Assign Me
                    </Button>
                </div>
            ),
        },
    ];

    const mockEnquiries = (enquiries as any)?.data || [
        { id: '1', student_name: 'Aditya Sharma', parent_name: 'Rajesh Sharma', phone: '+91 98765 43210', grade_applied_for: 'Grade 5', status: 'new' },
        { id: '2', student_name: 'Anjali Varma', parent_name: 'Ketan Varma', phone: '+91 98123 45678', grade_applied_for: 'Grade 1', status: 'contacted' },
        { id: '3', student_name: 'Rohit Reddy', parent_name: 'Vijay Reddy', phone: '+91 90000 12345', grade_applied_for: 'Grade 10', status: 'converted' },
    ];

    const mockLeads = (leads as any)?.data || [
        { id: '1', student_name: 'Vikram Singh', parent_name: 'Satnam Singh', assigned_counselor: 'Unassigned' },
        { id: '2', student_name: 'Divya Nair', parent_name: 'Suresh Nair', assigned_counselor: 'Counselor Priya' },
    ];

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">
                        {isAssignRoute ? 'Counselor Assignment Desk' : 'CRM Inquiry Desk'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isAssignRoute 
                            ? 'Assign counselors to leads and manage pipeline.' 
                            : 'Manage leads, conversions, and parent inquiries.'}
                    </p>
                </div>
                {!isAssignRoute && (
                    <Button
                        onClick={() => { setErrors({}); setIsCreateOpen(true); }}
                        className="bg-primary text-white flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Add Inquiry
                    </Button>
                )}
            </div>

            {/* Create Inquiry Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <h2 className="text-sm font-black text-gray-900">New Inquiry Form</h2>
                        <form onSubmit={handleCreateInquiry} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Student Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.student_name}
                                    onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                                        errors.student_name ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                                    }`}
                                />
                                {errors.student_name && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1">{errors.student_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Parent Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.parent_name}
                                    onChange={e => setFormData({ ...formData, parent_name: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                                        errors.parent_name ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                                    }`}
                                />
                                {errors.parent_name && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1">{errors.parent_name}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                                            errors.phone ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                                        }`}
                                    />
                                    {errors.phone && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                                            errors.email ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                                        }`}
                                    />
                                    {errors.email && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => { setErrors({}); setIsCreateOpen(false); }}>Cancel</Button>
                                <Button type="submit" className="bg-primary text-white">Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs (only show on Inquiry CRM page, hide on Counselor Assignment page) */}
            {!isAssignRoute && (
                <div className="flex gap-1 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('enquiry')}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                            activeTab === 'enquiry' ? 'border-primary text-primary' : 'border-transparent text-gray-400'
                        }`}
                    >
                        Inquiries ({mockEnquiries.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('lead')}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                            activeTab === 'lead' ? 'border-primary text-primary' : 'border-transparent text-gray-400'
                        }`}
                    >
                        Counselor Leads ({mockLeads.length})
                    </button>
                </div>
            )}

            {/* List */}
            <div>
                {activeTab === 'enquiry' ? (
                    <DataTableFramework
                        columns={enquiryColumns}
                        data={mockEnquiries}
                        loading={isEnquiriesLoading}
                    />
                ) : (
                    <DataTableFramework
                        columns={leadColumns}
                        data={mockLeads}
                        loading={isLeadsLoading}
                    />
                )}
            </div>
        </div>
    );
}

export default InquiryListPage;
