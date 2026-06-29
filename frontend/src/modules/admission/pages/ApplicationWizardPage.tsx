import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { Button } from '../../../components/ui/button';
import { ChevronRight, ChevronLeft, Save, FileText, Clock, RotateCcw, HelpCircle, History } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
    { title: 'Student Info', desc: 'Personal details' },
    { title: 'Parents', desc: 'Contact info' },
    { title: 'Academic', desc: 'Prior education' },
    { title: 'Medical', desc: 'Allergies & record' },
    { title: 'Transport', desc: 'Bus route options' },
    { title: 'Hostel', desc: 'Boarding details' },
    { title: 'Documents', desc: 'File uploads' },
    { title: 'Declaration', desc: 'Signature & submit' },
];

export function ApplicationWizardPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);

    const [formData, setFormData] = useState<any>({
        student_name: '',
        date_of_birth: '',
        gender: 'Male',
        grade_applied_for: 'Grade 1',
        admission_type: 'Regular',
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        previous_school: '',
        last_grade_completed: '',
        allergies: '',
        blood_group: 'A+',
        needs_bus: 'No',
        bus_route: '',
        needs_hostel: 'No',
        room_type: '',
    });

    const [draftHistory, setDraftHistory] = useState<any[]>([
        { id: 'v1', timestamp: '10 mins ago', name: 'Auto-saved Draft' },
        { id: 'v2', timestamp: '1 hour ago', name: 'Manual Saved Draft' },
    ]);

    // Handle autosave simulation every 45s
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Autosaving draft...', formData);
            // Simulate adding version
            setDraftHistory(prev => [
                { id: `v-${Date.now()}`, timestamp: 'Just now', name: 'Auto-saved Version' },
                ...prev.slice(0, 4),
            ]);
        }, 45_000);
        return () => clearInterval(interval);
    }, [formData]);

    const handleRestoreDraft = (version: any) => {
        alert(`Restoring version: ${version.name} (${version.id})`);
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(c => c + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    const handleSaveDraft = () => {
        alert('Draft saved successfully!');
    };

    const handleSubmit = () => {
        alert('Application submitted successfully!');
        navigate('/app/admissions/my');
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Application Wizard</h1>
                    <p className="text-sm text-gray-500 mt-1">Complete admission wizard application.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleSaveDraft} className="flex items-center gap-1">
                        <Save className="w-4 h-4" /> Save Draft
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Stepper Nav */}
                <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-wide">Steps Progress</h2>
                    <div className="space-y-3">
                        {STEPS.map((step, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all ${
                                    idx === currentStep ? 'bg-primary/5 text-primary' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                                    idx <= currentStep ? 'border-primary bg-primary text-white' : 'border-gray-200'
                                }`}>
                                    {idx + 1}
                                </span>
                                <div>
                                    <p className="text-xs font-bold">{step.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{step.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Panels */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <div className="pb-4 border-b border-gray-100">
                        <h2 className="text-sm font-black text-gray-900">{STEPS[currentStep].title}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{STEPS[currentStep].desc}</p>
                    </div>

                    <div className="space-y-4 min-h-[300px]">
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Student Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.student_name}
                                            onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Admission Type</label>
                                        <select
                                            id="wizard-admission-type"
                                            value={formData.admission_type}
                                            onChange={e => setFormData({ ...formData, admission_type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                        >
                                            <option value="Regular">Regular Admission</option>
                                            <option value="RTE">RTE Admission</option>
                                            <option value="Management">Management Quota</option>
                                            <option value="Sibling">Sibling Admission</option>
                                            <option value="Scholarship">Scholarship Admission</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Grade Applied For</label>
                                        <select
                                            id="wizard-grade"
                                            value={formData.grade_applied_for}
                                            onChange={e => setFormData({ ...formData, grade_applied_for: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                        >
                                            <option value="Grade 1">Grade 1</option>
                                            <option value="Grade 5">Grade 5</option>
                                            <option value="Grade 10">Grade 10</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Parent/Guardian Name</label>
                                    <input
                                        type="text"
                                        value={formData.parent_name}
                                        onChange={e => setFormData({ ...formData, parent_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Parent Email</label>
                                        <input
                                            type="email"
                                            value={formData.parent_email}
                                            onChange={e => setFormData({ ...formData, parent_email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Parent Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.parent_phone}
                                            onChange={e => setFormData({ ...formData, parent_phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep > 1 && (
                            <div className="py-16 text-center text-xs text-gray-400 font-bold">
                                Form inputs for Step {currentStep + 1} ({STEPS[currentStep].title})
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="flex items-center gap-1.5"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </Button>
                        {currentStep === STEPS.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                className="bg-primary text-white"
                            >
                                Submit Application
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="bg-primary text-white flex items-center gap-1.5"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Draft History sidebar */}
                <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-1.5">
                        <History className="w-4 h-4 text-gray-400" />
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wide">Draft Recovery</h2>
                    </div>
                    <div className="space-y-2">
                        {draftHistory.map(version => (
                            <div key={version.id} className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                                <div className="flex justify-between items-start gap-1">
                                    <p className="text-[10px] font-black text-gray-700 leading-tight">{version.name}</p>
                                    <span className="text-[8px] text-gray-400 font-bold shrink-0">{version.timestamp}</span>
                                </div>
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => handleRestoreDraft(version)}
                                        className="text-[9px] font-black text-primary hover:underline"
                                    >
                                        Restore
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationWizardPage;
