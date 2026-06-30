import React, { useState } from 'react';
import { 
    SlidersHorizontal, Eye, RefreshCw, Pin, 
    ChevronDown, LayoutGrid, CheckSquare, Settings2 
} from 'lucide-react';

interface ColumnConfig {
    key: string;
    label: string;
    resizable?: boolean;
    sortable?: boolean;
}

interface EnterpriseDataGridProps {
    columns: ColumnConfig[];
    data: any[];
    onRowClick?: (row: any) => void;
    renderCell?: (key: string, value: any, row: any) => React.ReactNode;
}

export function EnterpriseDataGrid({ columns, data, onRowClick, renderCell }: EnterpriseDataGridProps) {
    const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
    const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
    const [groupBy, setGroupBy] = useState<string>('none');
    
    // Simple column pinning toggle
    const togglePinColumn = (key: string) => {
        setPinnedColumns(prev => 
            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
        );
    };

    // Rearrange columns such that pinned columns are placed first
    const orderedColumns = [
        ...columns.filter(col => pinnedColumns.includes(col.key)),
        ...columns.filter(col => !pinnedColumns.includes(col.key))
    ];

    const paddingClasses = density === 'comfortable' ? 'px-6 py-4' : 'px-4 py-2';

    return (
        <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 rounded-2xl shadow-sm overflow-hidden flex flex-col font-sans">
            {/* Grid Utility Toolbar */}
            <div className="p-4 border-b border-gray-100 dark:border-border/10 bg-gray-50/50 dark:bg-muted/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Saved Filters */}
                    <div className="relative">
                        <select 
                            className="bg-white border rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                            defaultValue="all"
                        >
                            <option value="all">Saved Views: All Applicants</option>
                            <option value="flagged">Saved Views: Breached SLAs</option>
                            <option value="docs">Saved Views: Document Pending</option>
                        </select>
                    </div>

                    {/* Group By selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-400 font-bold uppercase text-[10px]">Group By:</span>
                        <select 
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className="bg-white border rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                        >
                            <option value="none">None</option>
                            <option value="grade">Grade</option>
                            <option value="status">Status Stage</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Density mode */}
                    <button 
                        onClick={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
                        className="p-1.5 rounded-lg border bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-200 text-xs font-bold flex items-center gap-1"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span className="capitalize">{density}</span>
                    </button>

                    <button className="p-1.5 rounded-lg border bg-white text-gray-500 hover:text-indigo-600">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-muted/10 border-b border-gray-100 dark:border-border/10">
                            {orderedColumns.map(col => {
                                const isPinned = pinnedColumns.includes(col.key);
                                return (
                                    <th 
                                        key={col.key} 
                                        className={`font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[10px] ${paddingClasses} relative group`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{col.label}</span>
                                            
                                            <button 
                                                onClick={() => togglePinColumn(col.key)}
                                                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 ${
                                                    isPinned ? 'opacity-100 text-indigo-600' : 'text-gray-400'
                                                }`}
                                            >
                                                <Pin className="w-3 h-3 rotate-45" />
                                            </button>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-border/10 font-medium text-gray-700 dark:text-gray-300">
                        {data.map((row, idx) => (
                            <tr 
                                key={idx}
                                onClick={() => onRowClick && onRowClick(row)}
                                className="hover:bg-gray-50/50 dark:hover:bg-muted/5 transition-colors cursor-pointer"
                            >
                                {orderedColumns.map(col => (
                                    <td 
                                        key={col.key} 
                                        className={`${paddingClasses} ${pinnedColumns.includes(col.key) ? 'bg-indigo-50/10 font-bold' : ''}`}
                                    >
                                        {renderCell 
                                            ? renderCell(col.key, row[col.key], row) 
                                            : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EnterpriseDataGrid;
