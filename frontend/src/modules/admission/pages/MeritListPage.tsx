import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { Button } from '../../../components/ui/button';
import { DataTableFramework, ColumnDefinition } from '../../../components/tables/DataTableFramework';
import { Play, Download, Award, ShieldAlert } from 'lucide-react';

export function MeritListPage() {
    const [selectedCycle, setSelectedCycle] = useState('cycle-1');
    const [meritList, setMeritList] = useState<any[]>([
        { id: 'm1', rank: 1, name: 'Suhail Khan', score: 98, status: 'Selected', tieBreaker: 'None' },
        { id: 'm2', rank: 2, name: 'Tanya Dixit', score: 95, status: 'Selected', tieBreaker: 'Age older' },
        { id: 'm3', rank: 3, name: 'Abhinav Sen', score: 95, status: 'Waiting', tieBreaker: 'Age younger' },
    ]);

    const generateMutation = useMutation({
        mutationFn: admissionApi.generateMeritList,
        onSuccess: (res: any) => {
            alert('Merit list generated successfully!');
            if (res.data) setMeritList(res.data);
        },
    });

    const columns: ColumnDefinition<any>[] = [
        { key: 'rank', header: 'Merit Rank' },
        { key: 'name', header: 'Student Name' },
        { key: 'score', header: 'Entrance Score %' },
        { key: 'tieBreaker', header: 'Tie-break Rule Applied' },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => (
                <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                    row.status === 'Selected' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                }`}>
                    {row.status}
                </span>
            ),
        },
    ];

    const handleGenerate = () => {
        generateMutation.mutate({ cycle: selectedCycle });
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Merit Desk</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure criteria formulas, trigger rank calculations, and manage selected lists.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleGenerate}
                        disabled={generateMutation.isPending}
                        className="bg-primary text-white flex items-center gap-1.5"
                    >
                        <Play className="w-4 h-4" /> Run Merit Engine
                    </Button>
                </div>
            </div>

            {/* Config Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid md:grid-cols-3 gap-6 items-center">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Target Cycle</label>
                    <select
                        id="merit-cycle"
                        value={selectedCycle}
                        onChange={e => setSelectedCycle(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                        <option value="cycle-1">Entrance Merit Index - Cycle A</option>
                        <option value="cycle-2">Quota Balance Index - Cycle B</option>
                    </select>
                </div>
                <div className="md:col-span-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-black text-gray-900">Tie-Breaking Rules Priority</p>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                            1. Mathematics Marks $\rightarrow$ 2. English Marks $\rightarrow$ 3. Age criteria (Older first).
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div>
                <DataTableFramework
                    columns={columns}
                    data={meritList}
                />
            </div>
        </div>
    );
}

export default MeritListPage;
