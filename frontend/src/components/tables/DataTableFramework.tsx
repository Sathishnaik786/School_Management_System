import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Download, Search, Settings } from 'lucide-react';

export interface ColumnDefinition<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: ColumnDefinition<T>[];
    data: T[];
    loading?: boolean;
    onExportCSV?: () => void;
    bulkActions?: {
        label: string;
        onClick: (selectedRows: T[]) => void;
    }[];
}

export function DataTableFramework<T extends { id?: string | number }>({
    columns,
    data,
    loading = false,
    onExportCSV,
    bulkActions
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Record<string | number, boolean>>({});
    const pageSize = 10;

    // Search filter
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(row => {
            return Object.values(row).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [data, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    const handleSelectAll = (checked: boolean) => {
        const next: Record<string | number, boolean> = {};
        if (checked) {
            paginatedData.forEach(row => {
                if (row.id) next[row.id] = true;
            });
        }
        setSelectedRows(next);
    };

    const handleSelectRow = (id: string | number, checked: boolean) => {
        setSelectedRows(prev => ({ ...prev, [id]: checked }));
    };

    const selectedList = useMemo(() => {
        return data.filter(row => row.id && selectedRows[row.id]);
    }, [data, selectedRows]);

    return (
        <div className="space-y-4 w-full bg-white rounded-2xl border border-gray-100 p-6">
            {/* Header controls: Search & Export */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search grid data..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 text-xs font-semibold rounded-xl focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {selectedList.length > 0 && bulkActions && (
                        <div className="flex items-center gap-2">
                            {bulkActions.map(action => (
                                <Button
                                    key={action.label}
                                    onClick={() => action.onClick(selectedList)}
                                    size="sm"
                                    className="text-xs rounded-xl"
                                >
                                    {action.label} ({selectedList.length})
                                </Button>
                            ))}
                        </div>
                    )}
                    {onExportCSV && (
                        <Button
                            variant="ghost"
                            onClick={onExportCSV}
                            size="sm"
                            className="text-xs rounded-xl border border-gray-200 gap-2 h-9"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid Table */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            {bulkActions && (
                                <TableHead className="w-12 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </TableHead>
                            )}
                            {columns.map(col => (
                                <TableHead key={col.key} className="text-xs font-bold text-gray-700">
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (bulkActions ? 1 : 0)} className="text-center py-8 text-xs text-gray-500">
                                    Fetching table records...
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (bulkActions ? 1 : 0)} className="text-center py-8 text-xs text-gray-500">
                                    No records match search criterion.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row) => (
                                <TableRow key={row.id}>
                                    {bulkActions && row.id && (
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedRows[row.id]}
                                                onChange={(e) => handleSelectRow(row.id!, e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map(col => (
                                        <TableCell key={col.key} className="text-xs font-semibold text-gray-600 py-3.5">
                                            {col.render ? col.render(row) : (row as any)[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mt-4">
                <span>
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="rounded-xl w-8 h-8"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-3 py-1.5 bg-gray-50 rounded-lg text-gray-700">
                        {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="rounded-xl w-8 h-8"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
