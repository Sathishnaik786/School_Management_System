import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { Button } from '../../../components/ui/button';
import { User, ShieldCheck, Calendar, Star } from 'lucide-react';

export function InterviewPage() {
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [recommendation, setRecommendation] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

    const scoreMutation = useMutation({
        mutationFn: admissionApi.recordInterviewScore,
        onSuccess: () => {
            alert('Feedback submitted successfully!');
            setSelectedId(null);
        },
    });

    const mockInterviews = [
        { id: 'i1', student_name: 'Anjali Shah', time: '11:00 AM', status: 'pending' },
        { id: 'i2', student_name: 'Vijay Kumar', time: '02:00 PM', status: 'pending' },
    ];

    const handleSubmitFeedback = () => {
        scoreMutation.mutate({
            applicationId: selectedId,
            score: rating * 20, // scale to 100
            remarks: feedback,
            decision: recommendation,
        });
    };

    return (
        <div className="space-y-6 pb-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Interview Desk</h1>
                <p className="text-sm text-gray-500 mt-1">Conduct committee evaluations and score candidates.</p>
            </div>

            {!selectedId ? (
                /* Scheduled Lists */
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-wide">Today's Interview Schedule</h2>
                    <div className="divide-y divide-gray-50">
                        {mockInterviews.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{item.student_name}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.time} · Admission Office</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => { setSelectedId(item.id); setRating(0); setFeedback(''); }}
                                    className="bg-gray-900 text-white text-xs font-bold"
                                >
                                    Evaluate
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Feedback Entry Rubric Form */
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 max-w-lg">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-sm font-black text-gray-900">Feedback Form</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Evaluating Anjali Shah</p>
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedId(null)}>Cancel</Button>
                    </div>

                    <div className="space-y-4">
                        {/* Rating */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Criteria Score Rating</label>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Recommendation Decision</label>
                            <div className="flex gap-2">
                                {(['APPROVED', 'REJECTED'] as const).map(dec => (
                                    <button
                                        key={dec}
                                        onClick={() => setRecommendation(dec)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                            recommendation === dec ? 'bg-primary text-white border-primary shadow-md' : 'bg-gray-50 border-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {dec}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Selection Board Comments</label>
                            <textarea
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary"
                                rows={4}
                                placeholder="State criteria checks and counselor feedback..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button
                            onClick={handleSubmitFeedback}
                            className="bg-primary text-white flex items-center gap-1.5"
                        >
                            <ShieldCheck className="w-4 h-4" /> Save Scorecard
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InterviewPage;
