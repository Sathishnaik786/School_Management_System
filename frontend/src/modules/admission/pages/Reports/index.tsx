import React from 'react';
import EnterpriseDataGrid from '../../components/datagrid/EnterpriseDataGrid';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export function ReportsPage() {
    const columns = [
        { key: 'code', label: 'App Code' },
        { key: 'name', label: 'Applicant Name' },
        { key: 'grade', label: 'Grade' },
        { key: 'score', label: 'Aggregated Score' },
        { key: 'status', label: 'Current Stage' },
        { key: 'updatedAt', label: 'Last Action' }
    ];

    const mockData = [
        { code: 'APP00124', name: 'Rohan Sharma', grade: 'Grade 5', score: '89/100', status: 'DOCUMENT_CHECK', updatedAt: '2 hours ago' },
        { code: 'APP00142', name: 'Preeti Deshmukh', grade: 'Grade 12', score: '94/100', status: 'INTERVIEW', updatedAt: '1 hour ago' },
        { code: 'APP00118', name: 'Amit Kumar', grade: 'Grade 5', score: '48/100', status: 'NEW', updatedAt: 'Just now' },
        { code: 'APP00155', name: 'Sagar Sen', grade: 'Grade 2', score: '76/100', status: 'NEW', updatedAt: '3 hours ago' },
        { code: 'APP00109', name: 'Karan Malhotra', grade: 'Grade 11', score: '92/100', status: 'MERIT_LIST', updatedAt: '4 hours ago' }
    ];

    const handleExport = (format: 'pdf' | 'csv') => {
        console.log(`Exporting reports in ${format} format...`);
    };

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                        Admissions Exports & Reports
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold uppercase">
                        Generate and download pipeline reports, merit summaries, and registry spreadsheets
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleExport('csv')}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Export CSV
                    </button>
                    <button 
                        onClick={() => handleExport('pdf')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <FileText className="w-4 h-4" /> Download PDF Summary
                    </button>
                </div>
            </div>

            <EnterpriseDataGrid 
                columns={columns}
                data={mockData}
                renderCell={(key, value, row) => {
                    if (key === 'status') {
                        return (
                            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                {value.replace('_', ' ')}
                            </span>
                        );
                    }
                    if (key === 'code') {
                        return (
                            <span className="text-[10px] font-black text-gray-400">
                                {value}
                            </span>
                        );
                    }
                    return value;
                }}
            />
        </div>
    );
}

export default ReportsPage;
