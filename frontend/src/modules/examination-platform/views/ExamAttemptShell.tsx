import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Award, ChevronLeft, ChevronRight, Bookmark, AlertTriangle, CheckCircle, Clock, FileText, BarChart2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Question {
  id: number;
  text: string;
  options?: string[];
  correctOption?: number; // 0-indexed correct option for MCQ
  isDescriptive?: boolean;
}

export const ExamAttemptShell: React.FC = () => {
  const navigate = useNavigate();

  // 30 Pre-configured Questions (29 MCQs + 1 Descriptive Essay)
  const questions: Question[] = [
    {
      id: 1,
      text: "What is the primary function of DNA inside a living cell?",
      options: [
        "To store genetic information and guide protein synthesis",
        "To synthesize lipids and maintain cell structural boundaries",
        "To generate ATP energy through anaerobic respiration",
        "To act as a direct channel for mineral transport across membranes"
      ],
      correctOption: 0
    },
    {
      id: 2,
      text: "Which of the following elements has the highest electronegativity?",
      options: ["Oxygen", "Fluorine", "Nitrogen", "Chlorine"],
      correctOption: 1
    },
    {
      id: 3,
      text: "A car accelerates from rest at 3 m/s² for 5 seconds. What is its final velocity?",
      options: ["15 m/s", "8 m/s", "1.67 m/s", "37.5 m/s"],
      correctOption: 0
    },
    {
      id: 4,
      text: "Which data structure operates on a Last-In, First-Out (LIFO) basis?",
      options: ["Queue", "Hash Table", "Stack", "Binary Search Tree"],
      correctOption: 2
    },
    {
      id: 5,
      text: "What is the pH value of pure water at 25 degrees Celsius?",
      options: ["pH 1.0", "pH 5.6", "pH 7.0", "pH 14.0"],
      correctOption: 2
    },
    {
      id: 6,
      text: "In computer networks, what does the DHCP protocol stand for?",
      options: [
        "Domain Host Connection Protocol",
        "Dynamic Host Configuration Protocol",
        "Distributed Hardware Channel Port",
        "Digital Hypertext Control Packet"
      ],
      correctOption: 1
    },
    {
      id: 7,
      text: "Which Newton's Law of Motion states that for every action, there is an equal and opposite reaction?",
      options: ["First Law", "Second Law", "Third Law", "Law of Gravitation"],
      correctOption: 2
    },
    {
      id: 8,
      text: "Which organ in the human body is responsible for producing insulin?",
      options: ["Liver", "Pancreas", "Gallbladder", "Spleen"],
      correctOption: 1
    },
    {
      id: 9,
      text: "What is the value of log10(1000)?",
      options: ["2", "3", "10", "100"],
      correctOption: 1
    },
    {
      id: 10,
      text: "Which sorting algorithm has a worst-case time complexity of O(n log n)?",
      options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Quick Sort"],
      correctOption: 2
    },
    {
      id: 11,
      text: "What is the main greenhouse gas responsible for global climate change?",
      options: ["Methane", "Nitrous Oxide", "Carbon Dioxide", "Water Vapor"],
      correctOption: 2
    },
    {
      id: 12,
      text: "If a right-angled triangle has perpendicular sides of length 3 and 4, what is its area?",
      options: ["6", "12", "5", "7"],
      correctOption: 0
    },
    {
      id: 13,
      text: "Which SQL command is used to retrieve data from a database table?",
      options: ["RETRIEVE", "GET", "SELECT", "FETCH"],
      correctOption: 2
    },
    {
      id: 14,
      text: "What is the chemical formula of ozone gas?",
      options: ["O2", "O3", "CO2", "H2O"],
      correctOption: 1
    },
    {
      id: 15,
      text: "Which physical quantity has the SI unit Farad?",
      options: ["Electrical Resistance", "Magnetic Induction", "Capacitance", "Electric Charge"],
      correctOption: 2
    },
    {
      id: 16,
      text: "Which component of blood is primarily responsible for clotting?",
      options: ["Red Blood Cells", "Platelets", "White Blood Cells", "Blood Plasma"],
      correctOption: 1
    },
    {
      id: 17,
      text: "Which HTML tag is used to create a hyperlink?",
      options: ["<link>", "<a>", "<href>", "<src>"],
      correctOption: 1
    },
    {
      id: 18,
      text: "What is the sum of interior angles inside a regular hexagon?",
      options: ["360 degrees", "540 degrees", "720 degrees", "900 degrees"],
      correctOption: 2
    },
    {
      id: 19,
      text: "In mechanics, torque is the rotational equivalent of which quantity?",
      options: ["Momentum", "Velocity", "Force", "Mass"],
      correctOption: 2
    },
    {
      id: 20,
      text: "Which cell organelle is known as the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Lysosome", "Mitochondria"],
      correctOption: 3
    },
    {
      id: 21,
      text: "What is the binary representation of the decimal number 25?",
      options: ["11001", "10101", "11100", "10011"],
      correctOption: 0
    },
    {
      id: 22,
      text: "Who proposed the Theory of General Relativity?",
      options: ["Isaac Newton", "Albert Einstein", "Stephen Hawking", "Niels Bohr"],
      correctOption: 1
    },
    {
      id: 23,
      text: "Which metallic element is liquid at standard room temperature?",
      options: ["Gallium", "Mercury", "Sodium", "Lead"],
      correctOption: 1
    },
    {
      id: 24,
      text: "What is the derivative of f(x) = x² with respect to x?",
      options: ["x", "2x", "x/2", "2"],
      correctOption: 1
    },
    {
      id: 25,
      text: "Which protocol is used to encrypt and secure data transfer over the World Wide Web?",
      options: ["FTP", "HTTP", "HTTPS", "SMTP"],
      correctOption: 2
    },
    {
      id: 26,
      text: "Which blood group is known as the universal donor?",
      options: ["AB Positive", "O Negative", "A Positive", "B Negative"],
      correctOption: 1
    },
    {
      id: 27,
      text: "What is the SI unit of electric resistance?",
      options: ["Volt", "Ampere", "Ohm", "Watt"],
      correctOption: 2
    },
    {
      id: 28,
      text: "Which gas makes up approximately 78% of the Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Argon", "Nitrogen"],
      correctOption: 3
    },
    {
      id: 29,
      text: "In cryptography, what does the 'S' in AES stand for?",
      options: ["Security", "Standard", "System", "Symmetric"],
      correctOption: 1
    },
    {
      id: 30,
      text: "Explain the differences between renewable and non-renewable energy resources, and discuss their respective economic and environmental impacts on sustainable development.",
      isDescriptive: true
    }
  ];

  // Exam States
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [warnings, setWarnings] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);

  // Auto-grader Metrics
  const [scoreMetrics, setScoreMetrics] = useState({
    totalMcqs: 29,
    attemptedMcqs: 0,
    correctMcqs: 0,
    percentage: 0,
    grade: 'F'
  });

  const activeQuestion = questions[activeIdx];

  // 1. Timer Effects
  useEffect(() => {
    if (isSubmitted || isSuspended) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit("Time Limit Expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isSuspended]);

  // 2. Proctoring Tab-Switch Detection
  useEffect(() => {
    if (isSubmitted || isSuspended) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            handleSessionSuspension();
            return 3;
          } else {
            setShowViolationModal(true);
            return next;
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubmitted, isSuspended]);

  // Actions
  const handleSelectOption = (optionIndex: number) => {
    const letter = ['A', 'B', 'C', 'D'][optionIndex];
    setAnswers((prev) => ({
      ...prev,
      [activeIdx]: letter
    }));
  };

  const handleDescriptiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers((prev) => ({
      ...prev,
      [activeIdx]: e.target.value
    }));
  };

  const markVisited = (idx: number) => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  const handleNavigate = (idx: number) => {
    markVisited(idx);
    setActiveIdx(idx);
  };

  const handleNext = () => {
    if (activeIdx < questions.length - 1) {
      handleNavigate(activeIdx + 1);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      handleNavigate(activeIdx - 1);
    }
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(activeIdx)) {
        next.delete(activeIdx);
      } else {
        next.add(activeIdx);
      }
      return next;
    });
  };

  // Grading
  const runAutoGrader = () => {
    let attempted = 0;
    let correct = 0;

    for (let i = 0; i < 29; i++) {
      const q = questions[i];
      const ansLetter = answers[i];
      if (ansLetter) {
        attempted++;
        const correctLetter = ['A', 'B', 'C', 'D'][q.correctOption || 0];
        if (ansLetter === correctLetter) {
          correct++;
        }
      }
    }

    const percentage = Math.round((correct / 29) * 100);
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    setScoreMetrics({
      totalMcqs: 29,
      attemptedMcqs: attempted,
      correctMcqs: correct,
      percentage,
      grade
    });
  };

  const handleConfirmSubmit = () => {
    // Check if there are unanswered questions
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      setShowUnansweredModal(true);
    } else {
      executeSubmission();
    }
  };

  const executeSubmission = () => {
    runAutoGrader();
    setIsSubmitted(true);
    setShowUnansweredModal(false);
  };

  const handleAutoSubmit = (reason: string) => {
    runAutoGrader();
    setIsSubmitted(true);
    alert(`Assessment Auto-Submitted: ${reason}`);
  };

  const handleSessionSuspension = () => {
    setIsSuspended(true);
    setShowViolationModal(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Helper styles for circular palette icons
  const getQuestionPaletteColor = (idx: number) => {
    const isAnswered = !!answers[idx];
    const isFlagged = flagged.has(idx);
    const isVisited = visited.has(idx);

    if (isFlagged) {
      return 'bg-purple-600 border-purple-600 text-white font-extrabold shadow-sm';
    }
    if (isAnswered) {
      return 'bg-emerald-600 border-emerald-600 text-white font-extrabold shadow-sm';
    }
    if (idx === activeIdx) {
      return 'border-blue-600 text-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 font-black';
    }
    if (isVisited) {
      return 'border-amber-400 text-amber-600 bg-amber-50/40 font-bold';
    }
    return 'border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-700 bg-white';
  };

  // SUCCESS SUBMISSION VIEW
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-left py-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-extrabold text-slate-800 leading-tight">Assessment Submitted</h2>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">EduTrack Secure Examination Registry</p>
          </div>
        </div>

        <Card className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium-xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4 text-center sm:text-left">
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none border border-emerald-100">
                Processed & Saved
              </span>
              <h3 className="text-lg font-extrabold text-slate-800 mt-2">Board Assessment Performance Report</h3>
              <p className="text-xs font-semibold text-slate-450 mt-1">
                Your MCQ sections were graded instantly by the auto-scoring engine. The descriptive essay is registered.
              </p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">MCQ Scored</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{scoreMetrics.correctMcqs} / 29</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Score Percentage</span>
                <p className="text-2xl font-black text-blue-600 mt-1">{scoreMetrics.percentage}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estimated Grade</span>
                <p className="text-2xl font-black text-purple-600 mt-1">{scoreMetrics.grade}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Essay Assessment</span>
                <p className="text-xs font-black text-amber-600 mt-1 leading-tight flex items-center gap-1 uppercase">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Pending</span>
                </p>
              </div>
            </div>

            {/* Verification Signature */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Authentication Signature</p>
                <p className="text-[10px] font-semibold text-slate-350 font-mono tracking-tight leading-relaxed">
                  EDUTRACK-HASH: {Math.random().toString(36).substring(2, 15).toUpperCase()}-{Math.random().toString(36).substring(2, 15).toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Clean Attempt</span>
              </div>
            </div>

            {/* Answer Key Audit Panel */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>MCQ Section Audit Summary</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {questions.slice(0, 29).map((q, idx) => {
                  const userAns = answers[idx];
                  const correctAns = ['A', 'B', 'C', 'D'][q.correctOption || 0];
                  const isCorrect = userAns === correctAns;

                  return (
                    <div
                      key={q.id}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold text-center flex flex-col justify-between h-[64px] transition-all ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          : userAns
                          ? 'bg-rose-50 border-rose-100 text-rose-700'
                          : 'bg-slate-50 border-slate-100 text-slate-450'
                      }`}
                    >
                      <span className="text-[9px] text-slate-400 block leading-none">Q{q.id}</span>
                      <p className="mt-1 font-black">
                        {userAns ? `Your: ${userAns}` : 'Skipped'}
                      </p>
                      <span className="text-[9px] block font-semibold opacity-70">Key: {correctAns}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={() => navigate('/app/exams/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-2.5 text-xs transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SUSPENDED VIEW
  if (isSuspended) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-premium-sm">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Attempt Suspended</h2>
          <p className="text-xs font-semibold text-slate-455 max-w-sm mx-auto leading-relaxed">
            This session has been terminated automatically due to repeated proctoring violations. All actions, focus losses, and log history have been flagged for administrative review.
          </p>
        </div>

        <Card className="bg-slate-50 border border-slate-100 rounded-3xl p-5 text-left">
          <CardContent className="p-0 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
              Incident File Report
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-405 block">Student ID</span>
                <span className="font-extrabold text-slate-700">MOCK-STUDENT-01</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-405 block">Reason Code</span>
                <span className="font-extrabold text-rose-600">3x Focus Loss / Tab Switch</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-405 block">Session Logs</span>
                <span className="font-extrabold text-slate-700">Flagged & Locked</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-405 block">Auto-Submit Score</span>
                <span className="font-extrabold text-slate-700">Calculated</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="pt-2">
          <button
            onClick={() => {
              runAutoGrader();
              setIsSubmitted(true);
              setIsSuspended(false);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-6 py-2.5 text-xs transition-colors"
          >
            Review Calculated Score
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE EXAM WORKSPACE
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300 select-none">
      {/* Top Header Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-100 gap-4 shadow-premium-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-white leading-tight">
              Science & Technology Board Assessment (Demo Sandbox)
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Active Security Proctor Sync • Warnings: <span className={`font-black ${warnings > 0 ? 'text-rose-500' : 'text-slate-300'}`}>{warnings} / 3</span>
            </p>
          </div>
        </div>

        {/* Real-time ticking Clock */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
          timeLeft < 5 * 60
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            : 'bg-slate-800 border-slate-700 text-slate-100'
        }`}>
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="font-mono text-sm font-black tracking-wider leading-none">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Question Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {/* Question Header actions */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                    SECTION {activeIdx < 29 ? 'A: MCQS' : 'B: DESCRIPTIVE'}
                  </span>
                  <h4 className="text-xs font-black text-slate-800 uppercase mt-1.5">
                    Question {activeIdx + 1} of 30
                  </h4>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
                    flagged.has(activeIdx)
                      ? 'bg-purple-50 border-purple-200 text-purple-600'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{flagged.has(activeIdx) ? 'Flagged' : 'Flag for Review'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-800 leading-relaxed text-justify">
                  {activeQuestion.text}
                </p>

                {/* Render OPTIONS or TEXTAREA depending on question type */}
                {activeQuestion.isDescriptive ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      value={answers[activeIdx] || ''}
                      onChange={handleDescriptiveChange}
                      rows={6}
                      placeholder="Type your comprehensive essay response here. Step-wise explanations, equations, and structured formatting are expected."
                      className="w-full text-xs font-semibold p-4 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring focus:ring-blue-200/50 resize-y leading-relaxed text-slate-800"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Evaluation criteria: Structure, correctness, and details.</span>
                      <span>{(answers[activeIdx] || '').length} characters typed</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {activeQuestion.options?.map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][oIdx];
                      const isSelected = answers[activeIdx] === letter;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(oIdx)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-blue-50/50 border-blue-500 text-blue-800 shadow-premium-sm ring-1 ring-blue-500/20'
                              : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/40 text-slate-700'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg border text-[10px] font-black flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-premium-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-450'
                          }`}>
                            {letter}
                          </div>
                          <span className="text-xs font-bold leading-normal pt-0.5">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation controls */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={activeIdx === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent font-bold text-xs transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={activeIdx === questions.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent font-bold text-xs transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleConfirmSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-2.5 text-xs transition-colors"
                >
                  Submit Assessment
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Circular Question Palette */}
        <div className="space-y-6">
          <Card className="bg-white border border-slate-200 rounded-3xl p-5 shadow-premium-sm space-y-5">
            <CardContent className="p-0 space-y-4">
              
              {/* Completion Progress indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">
                  <span>Assessed Questions</span>
                  <span>{Object.keys(answers).length} / 30 COMPLETE</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Circular Grid Buttons */}
              <div className="space-y-2 border-t border-slate-100 pt-3.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pb-1">
                  Assigned Question Palette
                </h4>
                <div className="grid grid-cols-5 gap-2.5">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => handleNavigate(idx)}
                      className={`w-9 h-9 rounded-xl border text-xs flex items-center justify-center transition-all duration-200 ${getQuestionPaletteColor(idx)}`}
                    >
                      {q.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Color Legend */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-[10px] font-bold text-slate-500">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legend & Indicators</h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-600" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-600" />
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border border-amber-400 bg-amber-50/40" />
                    <span>Visited/Skipped</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border border-slate-200" />
                    <span>Unvisited</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* PROCTOR VIOLATION WARNING MODAL */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-white border border-rose-100 rounded-3xl p-6 shadow-premium-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Focus Loss Violation Warning</h4>
              <p className="text-[11px] text-slate-455 font-semibold leading-relaxed">
                Exiting fullscreen, switching tabs, or opening desktop applications is strictly flagged by proctor logs. 
              </p>
              <div className="mt-2.5 bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-rose-700 font-extrabold text-[10px] uppercase">
                Active Warnings: {warnings} of 3 Allowed
              </div>
            </div>
            <button
              onClick={() => setShowViolationModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-2.5 text-xs transition-colors"
            >
              Resume Assessment Session
            </button>
          </div>
        </div>
      )}

      {/* UNANSWERED QUESTIONS CONFIRMATION MODAL */}
      {showUnansweredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-white border border-amber-100 rounded-3xl p-6 shadow-premium-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Unanswered Questions Remaining</h4>
              <p className="text-[11px] text-slate-455 font-semibold leading-relaxed">
                You have left <span className="font-black text-slate-800">{questions.length - Object.keys(answers).length}</span> questions unanswered. Once submitted, you cannot modify your answers.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnansweredModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl py-2.5 text-xs transition-colors"
              >
                Back to Exam
              </button>
              <button
                onClick={executeSubmission}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 text-xs transition-colors"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExamAttemptShell;
