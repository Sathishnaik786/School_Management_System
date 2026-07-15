import React, { useEffect, useRef, useState } from 'react';
import { useExamOperationsStore } from '../store/examination-operations.store';
import type { AttendanceStatus } from '../types';

const STATUS_COLORS: Record<AttendanceStatus, string> = {
    REGISTERED: 'bg-gray-100 text-gray-600',
    CHECKED_IN: 'bg-blue-100 text-blue-700',
    PRESENT: 'bg-green-100 text-green-700',
    LATE: 'bg-amber-100 text-amber-700',
    ABSENT: 'bg-red-100 text-red-700',
    MALPRACTICE: 'bg-red-200 text-red-800',
    CANCELLED: 'bg-gray-200 text-gray-500',
};

const ALL_STATUSES: AttendanceStatus[] = ['REGISTERED', 'CHECKED_IN', 'PRESENT', 'LATE', 'ABSENT', 'MALPRACTICE', 'CANCELLED'];

export const AttendancePage: React.FC = () => {
    const {
        attendance, loading, error,
        fetchAttendance, markAttendance, scanQR, bulkMarkAttendance, clearError
    } = useExamOperationsStore();

    const [examScheduleId, setExamScheduleId] = useState('');
    const [activeMode, setActiveMode] = useState<'list' | 'qr'>('list');
    const [qrInput, setQrInput] = useState('');
    const [qrResult, setQrResult] = useState<{ success: boolean; message: string } | null>(null);
    const qrRef = useRef<HTMLInputElement>(null);

    const summaryByStatus = ALL_STATUSES.reduce((acc, s) => {
        acc[s] = attendance.filter(a => a.status === s).length;
        return acc;
    }, {} as Record<AttendanceStatus, number>);

    const handleLoad = () => { if (examScheduleId) fetchAttendance(examScheduleId); };

    const handleQRScan = async () => {
        if (!qrInput || !examScheduleId) return;
        const result = await scanQR({ ticket_code: qrInput, exam_schedule_id: examScheduleId });
        setQrResult({ success: !error, message: result.message });
        setQrInput('');
        qrRef.current?.focus();
    };

    const handleMarkStatus = async (studentId: string, status: string) => {
        await markAttendance({ exam_schedule_id: examScheduleId, student_id: studentId, status, verified_via: 'MANUAL' });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Day Attendance</h1>
                    <p className="text-sm text-gray-500 mt-1">Track candidate check-in and attendance status</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveMode('list')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeMode === 'list' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        📋 List View
                    </button>
                    <button onClick={() => { setActiveMode('qr'); setTimeout(() => qrRef.current?.focus(), 100); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeMode === 'qr' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        📷 QR Scanner
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-red-500 font-bold text-xl leading-none">×</button>
                </div>
            )}

            {/* Schedule Selector */}
            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Exam Schedule ID"
                    value={examScheduleId}
                    onChange={e => setExamScheduleId(e.target.value)}
                    className="flex-1 max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button onClick={handleLoad} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    Load Attendance
                </button>
            </div>

            {/* Summary Cards */}
            {attendance.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                    {ALL_STATUSES.map(s => (
                        <div key={s} className={`rounded-xl px-3 py-2 text-center ${STATUS_COLORS[s]}`}>
                            <div className="text-2xl font-bold">{summaryByStatus[s]}</div>
                            <div className="text-xs font-medium mt-0.5">{s.replace(/_/g, ' ')}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR SCANNER MODE */}
            {activeMode === 'qr' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
                    <div className="text-6xl">📷</div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">QR Code Scanner</h2>
                        <p className="text-sm text-gray-500 mt-1">Scan or type the hall ticket code to check in a candidate</p>
                    </div>
                    {!examScheduleId && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
                            ⚠️ Please enter an Exam Schedule ID above before scanning.
                        </div>
                    )}
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input
                            ref={qrRef}
                            type="text"
                            placeholder="Scan QR / Enter ticket code…"
                            value={qrInput}
                            onChange={e => setQrInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleQRScan(); }}
                            className="flex-1 border-2 border-indigo-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                            disabled={!examScheduleId}
                        />
                        <button
                            onClick={handleQRScan}
                            disabled={!qrInput || !examScheduleId || loading}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            Check In
                        </button>
                    </div>
                    {qrResult && (
                        <div className={`max-w-md mx-auto px-4 py-3 rounded-lg text-sm font-medium ${qrResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {qrResult.success ? '✅' : '❌'} {qrResult.message}
                        </div>
                    )}
                    <p className="text-xs text-gray-400">Press Enter after scanning to auto-submit</p>
                </div>
            )}

            {/* LIST VIEW */}
            {activeMode === 'list' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold text-gray-600">Student</th>
                                <th className="text-left px-6 py-4 font-semibold text-gray-600">Roll No.</th>
                                <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 font-semibold text-gray-600">Entry Time</th>
                                <th className="text-left px-6 py-4 font-semibold text-gray-600">Via</th>
                                <th className="text-right px-6 py-4 font-semibold text-gray-600">Mark As</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>}
                            {!loading && attendance.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                                    <div className="text-4xl mb-2">📋</div>
                                    <p>Load an exam schedule to view attendance.</p>
                                </td></tr>
                            )}
                            {attendance.map(att => (
                                <tr key={att.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-gray-800">
                                        {att.students ? `${att.students.first_name} ${att.students.last_name}` : att.student_id.slice(0, 8) + '…'}
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{att.students?.roll_number || '—'}</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[att.status]}`}>
                                            {att.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500 text-xs">{att.entry_time ? new Date(att.entry_time).toLocaleTimeString() : '—'}</td>
                                    <td className="px-6 py-3">
                                        {att.verified_via && (
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${att.verified_via === 'QR_CODE' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {att.verified_via.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex gap-1 justify-end">
                                            {(['PRESENT', 'LATE', 'ABSENT', 'MALPRACTICE'] as const).map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleMarkStatus(att.student_id, s)}
                                                    disabled={att.status === s}
                                                    className={`text-xs px-2 py-1 rounded font-medium transition-all ${att.status === s ? 'bg-gray-200 text-gray-400 cursor-default' : `${STATUS_COLORS[s]} hover:opacity-80`}`}
                                                >
                                                    {s.charAt(0)}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;
