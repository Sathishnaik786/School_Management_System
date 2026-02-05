import React, { useEffect, useState } from 'react';
import { admissionApi } from '../admission.api';
import { Admission } from '../admission.types';
import { Plus, FileText, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyApplications = () => {
    const [applications, setApplications] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const { data } = await admissionApi.list({ limit: 50 });
            setApplications(data.data || []);
        } catch (error) {
            console.error('Failed to fetch applications', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'submitted': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'under_review': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'recommended': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'approved': return 'bg-green-50 text-green-600 border-green-200';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
            case 'enrolled': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return <FileText className="w-4 h-4" />;
            case 'submitted': return <Clock className="w-4 h-4" />;
            case 'under_review': return <AlertCircle className="w-4 h-4" />;
            case 'recommended': return <AlertCircle className="w-4 h-4" />;
            case 'approved': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'under_review':
            case 'recommended':
                return 'Under Review';
            case 'submitted':
                return 'Submitted';
            case 'draft':
                return 'Draft';
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'enrolled':
                return 'Enrolled';
            default:
                return status.replace('_', ' ');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading applications...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        My Admission Applications
                    </h1>
                    <p className="text-gray-500 mt-1">Track and manage your child's school admissions</p>
                </div>
                <Link
                    to="/app/admissions/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-200 font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Application
                </Link>
            </div>

            {applications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">No Applications Yet</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">Start your child's journey today. Click the 'New Application' button to begin.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-default"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl">
                                    {app.student_name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{app.student_name}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span>Grade: {app.grade_applied_for}</span>
                                        <span>•</span>
                                        <span>{app.academic_years?.year_label || '2026-25'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-6">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                        {getStatusIcon(app.status)}
                                        {getStatusLabel(app.status)}
                                    </div>

                                    <Link
                                        to={`/app/admissions/${app.id}`}
                                        className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </Link>
                                </div>
                                {app.status === 'approved' && (
                                    <p className="text-xs text-green-600 font-medium text-right">
                                        Your application has been approved. Please wait for further instructions.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
