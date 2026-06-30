import React from 'react';
import Applicant360Profile from '../../components/profile360/Applicant360Profile';

export function Applicant360Page() {
    // Demonstration mock data for Applicant 360 view
    const mockApplicant = {
        id: '123',
        code: 'APP00124',
        name: 'Rohan Sharma',
        email: 'rohan.parent@gmail.com',
        phone: '+91 98765 43210',
        grade: 'Grade 5',
        status: 'DOCUMENT_CHECK',
        submittedAt: 'June 28, 2026',
        counselor: 'Nancy Gates',
        candidateScore: 89,
        slaRemainingHours: 12,
        slaTotalHours: 24,
        documentChecklist: [
            { name: 'Birth Certificate', verified: true },
            { name: 'Previous Grade Marksheets', verified: true },
            { name: 'Address Proof Certificate', verified: false }
        ],
        crmLeadTemp: 'HOT' as const,
        crmLeadScore: 92,
        examStatus: 'PASSED' as const,
        examScore: 88,
        interviewStatus: 'RECOMMENDED' as const,
        feeStatus: 'PENDING' as const,
        auditLogs: [
            { action: 'Application Form Submitted', created_at: '2026-06-28T10:00:00Z', operator_name: 'Parent Self-service', remarks: 'Submitted via parent portal' },
            { action: 'Birth Certificate Verified', created_at: '2026-06-29T11:30:00Z', operator_name: 'Nancy Gates', remarks: 'Matching name and birth details' },
            { action: 'Previous Marksheets Verified', created_at: '2026-06-29T11:45:00Z', operator_name: 'Nancy Gates', remarks: 'Grade 4 reports confirmed' }
        ]
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                        Applicant 360° Profile
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold uppercase">
                        Comprehensive lead detail, timeline audits, and evaluation metrics
                    </p>
                </div>
            </div>

            <Applicant360Profile applicant={mockApplicant} />
        </div>
    );
}

export default Applicant360Page;
