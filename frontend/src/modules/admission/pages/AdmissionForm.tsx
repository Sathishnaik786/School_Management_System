import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { admissionApi } from '../admission.api';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { ArrowLeft, Save, Send, User, Phone, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export const AdmissionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('draft');
    const [submitted, setSubmitted] = useState(false);
    const location = useLocation();
    const isPublicRoute = location.pathname.includes('/admissions/apply');
    const [formData, setFormData] = useState<any>({
        student_name: '',
        date_of_birth: '',
        gender: 'Male',
        grade_applied_for: '',
        academic_year_id: '',
        school_id: '',
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        mother_name: '',
        mother_email: '',
        mother_phone: '',
        father_name: '',
        father_email: '',
        father_phone: '',
        address: '',
        previous_school: '',
        last_grade_completed: '',
        parent_password: ''
    });

    const [regData, setRegData] = useState({
        confirmPassword: ''
    });

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'confirmPassword') {
            setRegData({ ...regData, confirmPassword: e.target.value });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    useEffect(() => {
        // Don't initialize if auth is still loading
        if (authLoading) return;

        const initializeForm = async () => {
            setLoading(true);
            try {
                // 1. Fetch existing data if editing (requires auth)
                if (id && user) {
                    const { data } = await admissionApi.getById(id);
                    setStatus(data.status);
                    setFormData({
                        ...data,
                        parent_password: '' // Don't show password even if it exists in DB
                    });
                } else if (user) {
                    // Fetch context for logged in user
                    const yearRes = await apiClient.get('/academic-years/current').catch(() => null);
                    setFormData((prev: any) => ({
                        ...prev,
                        school_id: user?.school_id || '',
                        academic_year_id: yearRes?.data?.id || ''
                    }));
                } else {
                    // Public view fallbacks
                    const schools = await apiClient.get('/schools').catch(() => null);
                    if (schools?.data?.length > 0) {
                        setFormData((prev: any) => ({ ...prev, school_id: schools?.data[0].id }));
                    }
                    const yearRes = await apiClient.get('/public/academic-year').catch(() => null);
                    if (yearRes?.data?.id) {
                        setFormData((prev: any) => ({ ...prev, academic_year_id: yearRes?.data?.id }));
                    }
                }
            } catch (error) {
                console.error('Failed to initialize form', error);
            } finally {
                setLoading(false);
            }
        };

        initializeForm();
    }, [id, user, authLoading]);

    const isReadOnly = status !== 'draft';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (isReadOnly) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (isSubmit = false) => {
        if (isReadOnly) return;

        // AUTH GATE: If no user OR if on public route and user is not a parent (staff testing)
        const treatAsGuest = !isAuthenticated || (isPublicRoute && !user?.roles?.includes('PARENT'));

        console.log('[ADMISSION] Attempting save...', { isSubmit, treatAsGuest, isPublicRoute });

        if (treatAsGuest) {
            // 1. FRONTEND VALIDATION
            // Require at least one parent contact (mother or father)
            const hasMotherContact = formData.mother_name && formData.mother_email;
            const hasFatherContact = formData.father_name && formData.father_email;

            if (!formData.student_name || !formData.grade_applied_for) {
                alert('Please fill in Student Name and Grade Applied For.');
                return;
            }

            if (!hasMotherContact && !hasFatherContact) {
                alert('Please provide at least one parent contact (Mother or Father with Name and Email).');
                return;
            }

            if (!formData.parent_password || formData.parent_password !== regData.confirmPassword) {
                alert('Passwords must match for account registration.');
                return;
            }

            setLoading(true);
            try {
                // Populate parent_email and parent_name for backend compatibility
                // Prefer mother's contact, fallback to father's
                const parent_email = formData.mother_email || formData.father_email;
                const parent_name = formData.mother_name || formData.father_name;
                const parent_phone = formData.mother_phone || formData.father_phone;

                const finalData = {
                    ...formData,
                    parent_email,
                    parent_name,
                    parent_phone,
                    // Use fallback IDs if still empty
                    school_id: formData.school_id || '457bbda3-f542-47dc-9d41-3d7729226f86',
                    academic_year_id: formData.academic_year_id || '8db7f474-3252-475a-bc84-9092be0f8f12'
                };

                console.log('[ADMISSION] Calling publicApply...', finalData);
                await admissionApi.publicApply(finalData);
                console.log('[ADMISSION] publicApply Success!');
                setSubmitted(true);
            } catch (error: any) {
                console.error('[ADMISSION] Public application failed:', error);
                const errorMsg = error.response?.data?.error || error.message || 'Failed to submit application';
                alert(errorMsg);
            } finally {
                setLoading(false);
            }
            return;
        }

        // Authenticated user path
        setLoading(true);
        try {
            console.log('[ADMISSION] Calling internal save/update...', formData);
            let res;
            if (id) {
                res = await admissionApi.update(id, formData);
            } else {
                const finalData = {
                    ...formData,
                    school_id: (formData.school_id && formData.school_id !== '') ? formData.school_id : (user?.school_id || ''),
                    academic_year_id: (formData.academic_year_id && formData.academic_year_id !== '') ? formData.academic_year_id : null
                };

                // Fallback for missing academic year
                if (!finalData.academic_year_id) {
                    const yearRes = await apiClient.get('/academic-years/current').catch(() => null);
                    finalData.academic_year_id = yearRes?.data?.id || '8db7f474-3252-475a-bc84-9092be0f8f12';
                }

                res = await admissionApi.create(finalData);
            }

            if (isSubmit) {
                console.log('[ADMISSION] Triggering immediate submission...');
                await admissionApi.submit(res.data.id);
            }

            console.log('[ADMISSION] Save successful, navigating...');
            navigate('/app/admissions/my');
        } catch (error: any) {
            console.error('[ADMISSION] Save failed:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Failed to save application';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-blue-100 p-10 text-center transform animate-in fade-in zoom-in duration-700">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 animate-bounce">
                        <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Application Received!
                    </h2>
                    <div className="space-y-4 text-gray-600 mb-10">
                        <p className="text-lg font-semibold text-green-600">✅ Successfully Submitted</p>
                        <p className="leading-relaxed">Our admissions team will review your application. If shortlisted, we'll contact you via Email/SMS.</p>
                        <p className="font-medium text-blue-600 bg-blue-50 py-2 px-4 rounded-lg">
                            Check your email regularly for updates
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                        Go to Login Portal
                    </button>
                </div>
            </div>
        );
    }

    if (loading && !formData.student_name && id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading application...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-all duration-300 hover:gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center group-hover:shadow-lg transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Back</span>
                </button>

                {/* Read-Only Alert */}
                {isReadOnly && (
                    <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-amber-100 animate-in slide-in-from-top duration-500">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-bold text-amber-900">Application Locked</p>
                            <p className="text-sm text-amber-700">
                                This application is <strong className="uppercase">{status.replace('_', ' ')}</strong>. No further edits can be made.
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
                    {/* Header with Gradient */}
                    <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-10 text-white overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
                        <div className="relative z-10">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <User className="w-7 h-7" />
                                </div>
                                {id ? 'Edit' : 'New'} Admission Application
                            </h1>
                            <p className="text-blue-100 text-lg font-medium">Please fill in all the details carefully and accurately.</p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-8 sm:p-12 space-y-10">
                        {/* Student Information */}
                        <section className="transform transition-all duration-500 hover:translate-x-1">
                            <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-blue-100">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Student Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="student_name"
                                        value={formData.student_name}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 disabled:cursor-not-allowed hover:border-gray-300"
                                        placeholder="Enter student's full name"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 hover:border-gray-300"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700">Gender <span className="text-red-500">*</span></label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 hover:border-gray-300 cursor-pointer"
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700">Grade Applied For <span className="text-red-500">*</span></label>
                                    <input
                                        name="grade_applied_for"
                                        value={formData.grade_applied_for}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 hover:border-gray-300"
                                        placeholder="e.g., Grade 1, Grade 10"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Mother/Guardian Information */}
                        <section className="transform transition-all duration-500 hover:translate-x-1">
                            <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-pink-100">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Mother / Guardian Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700">Mother's Name</label>
                                    <input
                                        name="mother_name"
                                        value={formData.mother_name}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 disabled:bg-gray-50 hover:border-gray-300"
                                        placeholder="Enter mother's full name"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700">Mother's Email</label>
                                    <input
                                        type="email"
                                        name="mother_email"
                                        value={formData.mother_email}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 disabled:bg-gray-50 hover:border-gray-300"
                                        placeholder="mother@example.com"
                                    />
                                </div>
                                <div className="space-y-2 group md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Mother's Phone</label>
                                    <input
                                        name="mother_phone"
                                        value={formData.mother_phone}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 disabled:bg-gray-50 hover:border-gray-300"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Father/Guardian Information */}
                        <section className="transform transition-all duration-500 hover:translate-x-1">
                            <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-indigo-100">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Father / Guardian Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700">Father's Name</label>
                                    <input
                                        name="father_name"
                                        value={formData.father_name}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-50 hover:border-gray-300"
                                        placeholder="Enter father's full name"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-sm font-semibold text-gray-700">Father's Email</label>
                                    <input
                                        type="email"
                                        name="father_email"
                                        value={formData.father_email}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-50 hover:border-gray-300"
                                        placeholder="father@example.com"
                                    />
                                </div>
                                <div className="space-y-2 group md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Father's Phone</label>
                                    <input
                                        name="father_phone"
                                        value={formData.father_phone}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-50 hover:border-gray-300"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Account Registration */}
                        {!id && (
                            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-100 shadow-inner transform transition-all duration-500 hover:shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Account Registration</h2>
                                </div>

                                {(isAuthenticated && user && (!isPublicRoute || user.roles?.includes('PARENT'))) ? (
                                    <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-green-800 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold mb-1">Account Linked</p>
                                                <p className="text-sm">
                                                    You are logged in as <strong>{user.full_name || user.email}</strong>.
                                                    Your application will be linked to your existing account.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-6 p-4 bg-blue-100 border border-blue-200 rounded-xl">
                                            <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                {isPublicRoute && user && !user.roles?.includes('PARENT')
                                                    ? "Guest Mode: Create a password to register a new account."
                                                    : "Create a password to access your account after approval."}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                    Choose Password <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    name="parent_password"
                                                    value={formData.parent_password || ''}
                                                    onChange={handleRegChange}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 hover:border-blue-300"
                                                    placeholder="Enter secure password"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                    Confirm Password <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={regData.confirmPassword}
                                                    onChange={handleRegChange}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 hover:border-blue-300"
                                                    placeholder="Repeat password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {!isReadOnly && (
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-8 flex flex-col sm:flex-row justify-end gap-4 border-t-2 border-gray-100">
                            {isAuthenticated && !isPublicRoute && (
                                <button
                                    onClick={() => handleSave(false)}
                                    disabled={loading}
                                    className="group px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border-2 border-gray-200 font-bold transition-all duration-300 hover:border-gray-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Save Draft
                                </button>
                            )}
                            <button
                                onClick={() => handleSave(true)}
                                disabled={loading}
                                className="group px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        {(!isAuthenticated || (isPublicRoute && !user?.roles?.includes('PARENT'))) ? 'Apply for Admission' : 'Submit Application'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
