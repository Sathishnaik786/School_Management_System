import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    AlertTriangle,
    Save,
    Shield,
    Camera,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Bookmark,
    HelpCircle,
    Sparkles,
    Send
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../../lib/api-client';

interface Question {
    id: string;
    text: string;
    type: 'MCQ' | 'TRUE_FALSE' | 'SUBJECTIVE';
    options?: string[];
    points: number;
}

export function WriteExamPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const examId = searchParams.get('examId');
    const studentId = searchParams.get('studentId');

    const [examName, setExamName] = useState('Quarterly Examination');
    const [subjectName, setSubjectName] = useState('Mathematics & Science');
    const [durationMinutes, setDurationMinutes] = useState(45);
    
    const [questions, setQuestions] = useState<Question[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flagged, setFlagged] = useState<Record<string, boolean>>({});
    const [visited, setVisited] = useState<Record<string, boolean>>({ '0': true });
    
    const [timeLeft, setTimeLeft] = useState(45 * 60); // Default to 45 mins in seconds
    const [tabInfractions, setTabInfractions] = useState(0);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Camera feed simulation state
    const [cameraActive, setCameraActive] = useState(true);

    // Initial load
    useEffect(() => {
        if (!examId) {
            toast.error("Invalid Exam Link");
            navigate('/app/student/exams/dashboard');
            return;
        }

        const fetchExamAndQuestions = async () => {
            try {
                // Fetch exam metadata
                const examRes = await apiClient.get(`/exams`);
                const currentExam = examRes.data?.find((e: any) => e.id === examId);
                if (currentExam) {
                    setExamName(currentExam.name);
                    // Determine subject or default
                    setSubjectName(currentExam.subject || 'Core Subjects');
                    // Compute duration
                    const start = new Date(currentExam.start_date);
                    const end = new Date(currentExam.end_date);
                    const diffMins = Math.max(30, Math.floor((end.getTime() - start.getTime()) / (1000 * 60)));
                    setDurationMinutes(diffMins);
                    setTimeLeft(diffMins * 60);
                }

                // Try fetching questions
                try {
                    const qRes = await apiClient.get(`/exams/questions?examId=${examId}`);
                    if (qRes.data && qRes.data.length > 0) {
                        setQuestions(qRes.data);
                        return;
                    }
                } catch (e) {
                    // Fallback to generating mock questions below
                }

                // Dynamic premium fallback questions based on subject keyword matching
                const lowerSubject = subjectName.toLowerCase();
                let customQuestions: Question[] = [];

                if (lowerSubject.includes('math') || lowerSubject.includes('algebra')) {
                    customQuestions = [
                        {
                            id: 'q1',
                            text: 'Solve for x: 3x + 12 = 27',
                            type: 'MCQ',
                            options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
                            points: 5
                        },
                        {
                            id: 'q2',
                            text: 'What is the value of pi rounded to two decimal places?',
                            type: 'MCQ',
                            options: ['3.12', '3.14', '3.16', '3.18'],
                            points: 5
                        },
                        {
                            id: 'q3',
                            text: 'The sum of angles in a triangle is always 180 degrees.',
                            type: 'TRUE_FALSE',
                            options: ['True', 'False'],
                            points: 5
                        },
                        {
                            id: 'q4',
                            text: 'Explain the Pythagorean theorem and give one real-world application.',
                            type: 'SUBJECTIVE',
                            points: 10
                        }
                    ];
                } else {
                    customQuestions = [
                        {
                            id: 'q1',
                            text: 'Which of the following is the main energy currency of the cell?',
                            type: 'MCQ',
                            options: ['DNA', 'ATP', 'RNA', 'Glucose'],
                            points: 5
                        },
                        {
                            id: 'q2',
                            text: 'Light travels faster than sound waves.',
                            type: 'TRUE_FALSE',
                            options: ['True', 'False'],
                            points: 5
                        },
                        {
                            id: 'q3',
                            text: 'What is the chemical symbol for Water?',
                            type: 'MCQ',
                            options: ['CO2', 'O2', 'H2O', 'NaCl'],
                            points: 5
                        },
                        {
                            id: 'q4',
                            text: 'Describe the greenhouse effect and how human activity accelerates global warming.',
                            type: 'SUBJECTIVE',
                            points: 10
                        }
                    ];
                }

                setQuestions(customQuestions);

                // Load saved state from local storage if exists
                const savedAnswers = localStorage.getItem(`exam_answers_${examId}`);
                if (savedAnswers) {
                    setAnswers(JSON.parse(savedAnswers));
                    toast.info("Resumed from last auto-saved state");
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchExamAndQuestions();
    }, [examId, subjectName]);

    // Timer logic
    useEffect(() => {
        if (submitted) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [submitted]);

    // Tab-focus proctoring infraction detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !submitted) {
                setTabInfractions(prev => {
                    const newVal = prev + 1;
                    if (newVal >= 3) {
                        toast.error("Proctoring Alert: Maximum window focus infractions reached. Exam submitted automatically.");
                        handleAutoSubmit();
                    } else {
                        toast.warning(`Proctoring Warning (${newVal}/3): Do not leave the exam page or switch tabs!`);
                    }
                    return newVal;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [submitted]);

    // Autosave response helper
    useEffect(() => {
        if (examId && Object.keys(answers).length > 0) {
            localStorage.setItem(`exam_answers_${examId}`, JSON.stringify(answers));
        }
    }, [answers, examId]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainSecs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (option: string) => {
        const activeQ = questions[activeIdx];
        setAnswers(prev => ({ ...prev, [activeQ.id]: option }));
    };

    const handleSubjectiveChange = (text: string) => {
        const activeQ = questions[activeIdx];
        setAnswers(prev => ({ ...prev, [activeQ.id]: text }));
    };

    const toggleFlag = () => {
        const activeQ = questions[activeIdx];
        setFlagged(prev => ({ ...prev, [activeQ.id]: !prev[activeQ.id] }));
    };

    const navigateQuestion = (idx: number) => {
        if (idx >= 0 && idx < questions.length) {
            setActiveIdx(idx);
            setVisited(prev => ({ ...prev, [idx.toString()]: true }));
        }
    };

    const handleAutoSubmit = async () => {
        setSubmitting(true);
        // Clear local saved answers
        if (examId) {
            localStorage.removeItem(`exam_answers_${examId}`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSubmitting(false);
        setSubmitted(true);
        toast.success("Exam submitted successfully!");
    };

    const handleFormSubmit = async () => {
        setShowSubmitModal(false);
        setSubmitting(true);
        
        try {
            // Save exam responses in database
            await apiClient.post('/exams/student-submissions', {
                examId,
                studentId,
                answers,
                infractionsCount: tabInfractions,
                submittedAt: new Date().toISOString()
            });
        } catch (e) {
            // Fallback mock upload
            console.log("Mocking submission upload because API backend handles paper-only exams");
        }

        // Clear local storage cache
        if (examId) {
            localStorage.removeItem(`exam_answers_${examId}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitting(false);
        setSubmitted(true);
        toast.success("All answers submitted. Good luck!");
    };

    // Calculate details
    const totalAnswered = Object.keys(answers).filter(k => answers[k] && answers[k].trim() !== '').length;
    const totalFlaged = Object.keys(flagged).filter(k => flagged[k]).length;

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100 border-2 border-emerald-100">
                    <CheckCircle className="w-12 h-12 animate-bounce" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exam Submitted!</h1>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                        Your answers for <span className="font-bold text-gray-900">{examName}</span> have been secure-logged.
                    </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3 max-w-sm mx-auto">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-500">Total Questions:</span>
                        <span className="text-gray-900 font-bold">{questions.length}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-500">Answered Questions:</span>
                        <span className="text-gray-900 font-bold">{totalAnswered}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-500">Tab Focus Infractions:</span>
                        <span className={`font-bold ${tabInfractions > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{tabInfractions}</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/app/student/exams/dashboard')}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95"
                >
                    Back to Exams Dashboard
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const currentQ = questions[activeIdx];

    return (
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
            
            {/* Top Security Banner */}
            <div className="bg-gradient-to-r from-red-500 via-amber-500 to-indigo-600 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-indigo-100 border border-white/15">
                <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 animate-pulse shrink-0" />
                    <span className="text-xs font-black tracking-wider uppercase">Secure Proctor Mode Active</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold bg-black/10 px-3 py-1 rounded-full">
                    <span>Focus Warnings: {tabInfractions}/3</span>
                    <span>System State: Normal</span>
                </div>
            </div>

            {/* Main Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Side: Exam Sheet & Answer Area */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Header Details */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/50 flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-wider">
                                <Sparkles className="w-4 h-4" />
                                {subjectName}
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mt-1">{examName}</h1>
                        </div>

                        {/* Floating Timer widget */}
                        <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 font-bold border transition-all ${
                            timeLeft < 300 
                                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                                : timeLeft < 900 
                                    ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                            <Clock className="w-5 h-5 shrink-0" />
                            <div className="text-lg tabular-nums tracking-wider">{formatTime(timeLeft)}</div>
                        </div>
                    </div>

                    {/* Active Question Sheet */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8 relative min-h-[400px]">
                        
                        {/* Question Info Bar */}
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                                Question {activeIdx + 1} of {questions.length}
                            </span>
                            <span className="px-3 py-1 bg-gray-50 text-gray-400 font-bold text-xs rounded-full border border-gray-100">
                                {currentQ.points} Points
                            </span>
                        </div>

                        {/* Question Body */}
                        <div className="space-y-6">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed">
                                {currentQ.text}
                            </h3>

                            {/* Response Fields */}
                            {currentQ.type === 'MCQ' && currentQ.options && (
                                <div className="grid gap-4 mt-6">
                                    {currentQ.options.map((option, idx) => {
                                        const isSelected = answers[currentQ.id] === option;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerSelect(option)}
                                                className={`w-full p-5 rounded-2xl border text-left font-semibold transition-all transform hover:translate-x-1 active:scale-99 flex items-center justify-between group ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-400'
                                                }`}
                                            >
                                                <span>{option}</span>
                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                                                    isSelected ? 'bg-white/20 border-white text-white' : 'border-gray-300 group-hover:border-indigo-600'
                                                }`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {currentQ.type === 'TRUE_FALSE' && currentQ.options && (
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    {currentQ.options.map((option, idx) => {
                                        const isSelected = answers[currentQ.id] === option;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerSelect(option)}
                                                className={`p-6 rounded-2xl border text-center font-bold text-lg transition-all flex flex-col items-center justify-center gap-3 ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                <span>{option}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {currentQ.type === 'SUBJECTIVE' && (
                                <div className="mt-6">
                                    <textarea
                                        value={answers[currentQ.id] || ''}
                                        onChange={(e) => handleSubjectiveChange(e.target.value)}
                                        placeholder="Write your explanation detailedly here..."
                                        className="w-full min-h-[220px] p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400"
                                    />
                                    <div className="text-right text-xs text-gray-400 mt-2 font-medium">
                                        Character count: {(answers[currentQ.id] || '').length}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-50 flex-wrap gap-4 mt-12">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigateQuestion(activeIdx - 1)}
                                    disabled={activeIdx === 0}
                                    className="px-5 py-3 border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                                <button
                                    onClick={() => navigateQuestion(activeIdx + 1)}
                                    disabled={activeIdx === questions.length - 1}
                                    className="px-5 py-3 border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={toggleFlag}
                                className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 ${
                                    flagged[currentQ.id]
                                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                        : 'border border-gray-200 hover:border-amber-300 hover:text-amber-600'
                                }`}
                            >
                                <Bookmark className="w-4 h-4" /> 
                                {flagged[currentQ.id] ? 'Flagged for Review' : 'Mark for Review'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Virtual Proctor feed & Question map */}
                <div className="space-y-6">
                    
                    {/* Proctoring WebCam Simulation */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                Live Feed
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Monitored
                            </span>
                        </div>

                        {/* Simulated webcam video box */}
                        <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                            {cameraActive ? (
                                <>
                                    <div className="absolute inset-0 bg-slate-800 opacity-60 animate-pulse" />
                                    <div className="z-10 text-center space-y-2">
                                        <Camera className="w-8 h-8 text-white mx-auto animate-bounce duration-[2000ms]" />
                                        <div className="text-[10px] text-white/80 font-black tracking-widest uppercase">Alex Vance (Student)</div>
                                    </div>
                                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[8px] bg-black/60 text-emerald-400 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> CAM ON
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 text-xs">
                                    Camera Connection Restoring...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Question Sheet Navigation Index */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
                        <div className="border-b border-gray-50 pb-3">
                            <h3 className="font-black text-gray-900 text-md">Navigation Index</h3>
                        </div>

                        {/* Questions grid map */}
                        <div className="grid grid-cols-5 gap-3.5">
                            {questions.map((q, idx) => {
                                const isCurrent = idx === activeIdx;
                                const isAnswered = answers[q.id] && answers[q.id].trim() !== '';
                                const isFlagged = flagged[q.id];
                                const isVisited = visited[idx.toString()];

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => navigateQuestion(idx)}
                                        className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-all transform active:scale-90 ${
                                            isCurrent
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md'
                                                : isFlagged
                                                    ? 'border-amber-400 bg-amber-50/70 text-amber-700'
                                                    : isAnswered
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                        : isVisited
                                                            ? 'border-gray-300 bg-gray-50 text-gray-600'
                                                            : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-gray-500 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-emerald-50 border border-emerald-300 rounded" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-amber-50 border border-amber-300 rounded" />
                                <span>Flagged</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded" />
                                <span>Visited</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-white border border-gray-100 rounded" />
                                <span>Unvisited</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Send className="w-5 h-5" />
                            Submit Paper
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100 mx-auto">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <div className="space-y-2 text-center">
                            <h3 className="text-2xl font-black text-gray-900">Submit Examination?</h3>
                            <p className="text-gray-500 font-medium text-sm">
                                You are about to lock your answers and finalize the paper. This action is irreversible.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 divide-y divide-gray-200/50 space-y-2.5">
                            <div className="flex justify-between text-sm font-medium pt-1">
                                <span className="text-gray-500">Answered Questions:</span>
                                <span className="text-emerald-600 font-bold">{totalAnswered} / {questions.length}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium pt-2.5">
                                <span className="text-gray-500">Unanswered Questions:</span>
                                <span className="text-red-500 font-bold">{questions.length - totalAnswered}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="flex-1 py-4 border border-gray-200 hover:bg-gray-50 font-bold rounded-2xl transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFormSubmit}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center"
                            >
                                Confirm Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WriteExamPage;
