import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export const ExamSessionLayout: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Refs to access latest state values in event listeners without closures stale states
  const attemptIdRef = useRef<string | null>(null);
  const studentIdRef = useRef<string | null>(null);

  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  useEffect(() => {
    studentIdRef.current = studentId;
  }, [studentId]);

  // 1. Fetch Attempt Info
  useEffect(() => {
    const fetchAttemptInfo = async () => {
      if (!user || !sessionId) return;
      try {
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (student) {
          setStudentId(student.id);
          const { data: attempt } = await supabase
            .from('assessment_attempts')
            .select('id')
            .eq('session_id', sessionId)
            .eq('student_id', student.id)
            .maybeSingle();
          if (attempt) {
            setAttemptId(attempt.id);
          }
        }
      } catch (err) {
        console.error('Error fetching attempt info for violations:', err);
      }
    };
    fetchAttemptInfo();
  }, [user, sessionId]);

  // 2. Logging function
  const logViolation = async (
    type: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    metadata: any = {}
  ) => {
    const activeStudentId = studentIdRef.current;
    const activeAttemptId = attemptIdRef.current;

    if (!activeStudentId || !sessionId || !activeAttemptId) {
      console.warn('Postponing violation write: IDs are missing.', {
        studentId: activeStudentId,
        sessionId,
        attemptId: activeAttemptId,
      });
      return;
    }

    try {
      const { error } = await supabase.from('exam_violation_log').insert({
        attempt_id: activeAttemptId,
        student_id: activeStudentId,
        session_id: sessionId,
        violation_type: type,
        severity: severity,
        browser_metadata: {
          ...metadata,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        },
        user_agent: navigator.userAgent,
      });

      if (error) {
        console.error('Error writing violation record to Supabase:', error);
      } else {
        console.log(`Violation [${type}] logged successfully.`);
      }
    } catch (err) {
      console.error('Exception writing violation record:', err);
    }
  };

  useEffect(() => {
    // Sync browser fullscreen status
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        logViolation('FULLSCREEN_EXIT', 'HIGH', { detail: 'User exited secure fullscreen mode' });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Warn user if attempting to leave
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      logViolation('REFRESH_OR_LEAVE_ATTEMPT', 'MEDIUM', { detail: 'User triggered beforeunload prompt' });
      e.returnValue = 'Are you sure you want to exit the exam session? Your progress will be saved but this action will be flagged.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Tab switching (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('TAB_SWITCH', 'HIGH', { detail: 'User switched browser tab or minimized window' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Window focus/blur
    const handleWindowBlur = () => {
      logViolation('WINDOW_BLUR', 'MEDIUM', { detail: 'Browser window lost focus' });
    };
    window.addEventListener('blur', handleWindowBlur);

    // Keyboard combinations for refresh or inspect
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.metaKey && e.key === 'r')
      ) {
        logViolation('REFRESH_ATTEMPT', 'MEDIUM', { detail: 'User attempted page refresh' });
      }
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J')
      ) {
        logViolation('INSPECT_ATTEMPT', 'CRITICAL', { detail: 'User opened developer tools' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Network disconnect
    const handleOffline = () => {
      logViolation('NETWORK_DISCONNECT', 'HIGH', { detail: 'Network connection lost' });
    };
    window.addEventListener('offline', handleOffline);

    // Copy / paste attempts
    const handleCopy = (e: Event) => {
      e.preventDefault();
      logViolation('COPY_ATTEMPT', 'LOW', { detail: 'User attempted to copy selection' });
    };
    const handlePaste = (e: Event) => {
      e.preventDefault();
      logViolation('PASTE_ATTEMPT', 'LOW', { detail: 'User attempted to paste content' });
    };
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const requestFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  const handleExitExam = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
    navigate('/app/exams/dashboard');
  };

  return (
    <div className="min-h-screen w-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden relative select-none">
      
      {/* Locked Header */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-blue-500 animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide uppercase text-slate-400">Secure Live Session</span>
            <span className="text-[10px] text-slate-500 font-bold leading-none mt-0.5">EduTrack Exam Lock v1.0</span>
          </div>
        </div>

        {/* Security / Diagnostic Indicators */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Camera Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Mic Connected</span>
          </div>
          {!isFullscreen && (
            <button
              onClick={requestFullscreen}
              className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/40 text-amber-300 font-bold px-3 py-1 rounded-lg transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Lock Fullscreen</span>
            </button>
          )}
        </div>

        {/* Emergency Terminate Button */}
        <div>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 border border-rose-500/30 px-3.5 py-1.5 rounded-xl transition-all"
          >
            Submit & Exit
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-start bg-slate-900 select-text">
        <div className="max-w-4xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Exit Warning Dialog Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left space-y-4 shadow-premium-2xl">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold font-display text-slate-100">
                Confirm Submission & Exit?
              </h3>
              <p className="text-xs text-slate-450 leading-relaxed">
                You are about to close this active exam attempt. Confirming will compile and save all answers. You cannot re-enter the session.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExitExam}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                Confirm Submit
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExamSessionLayout;
