// ----------------------------------------------------------------------
// DEPRECATED COMPONENT
// ----------------------------------------------------------------------
//
// REASON FOR DEPRECATION:
// This component lacked mandatory class-scoped scheduling context and
// server-side conflict validation. It has been replaced by the
// architecture-compliant `ExamTimetablePage.tsx`.
//
// DO NOT USE, IMPORT, OR MODIFY THIS FILE.
//
// SAFE REPLACEMENT:
// Use `ExamTimetablePage` found in `frontend/src/modules/exam/pages/ExamTimetablePage.tsx`.
//
// ----------------------------------------------------------------------

import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export const ExamTimeTable = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-6">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-amber-800 mb-2">Page Deprecated</h2>
                <p className="text-amber-700 mb-6">
                    This scheduling interface has been retired. Please use the new unified Exam Timetable page to manage exam schedules.
                </p>

                <Link
                    to="/app/admin/exams/timetable"
                    className="inline-block bg-amber-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-700 transition"
                >
                    Go to New Timetable
                </Link>
            </div>
        </div>
    );
};
