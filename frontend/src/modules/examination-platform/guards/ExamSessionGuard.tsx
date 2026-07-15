import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Loading } from '../../../components/ui/Loading';
import { AlertBanner } from '../shared/components/AlertBanner';

export const ExamSessionGuard: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (!user || !sessionId) {
        setErrorMsg('Unauthorized: Missing credentials.');
        setLoading(false);
        return;
      }

      try {
        // 1. Resolve Student ID mapped to User ID
        const { data: student, error: studentErr } = await supabase
          .from('students')
          .select('id, school_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (studentErr || !student) {
          setErrorMsg('Unauthorized: Candidate record not found.');
          setLoading(false);
          return;
        }

        // 2. Fetch Assessment Session Details
        const { data: session, error: sessionErr } = await supabase
          .from('assessment_sessions')
          .select(`
            id,
            start_time,
            end_time,
            status,
            published_paper_id
          `)
          .eq('id', sessionId)
          .maybeSingle();

        if (sessionErr || !session) {
          setErrorMsg('Exam session not found or invalid.');
          setLoading(false);
          return;
        }

        // 3. Verify Active Window and Status
        const now = new Date();
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);

        if (session.status !== 'ACTIVE' && session.status !== 'SCHEDULED') {
          setErrorMsg(`Exam is not active. Status: ${session.status}`);
          setLoading(false);
          return;
        }

        if (now < start || now > end) {
          setErrorMsg('Exam is outside of its scheduled active time window.');
          setLoading(false);
          return;
        }

        // 4. Fetch/Verify Active Attempt status
        const { data: attempt, error: attemptErr } = await supabase
          .from('assessment_attempts')
          .select('id, status')
          .eq('session_id', sessionId)
          .eq('student_id', student.id)
          .maybeSingle();

        if (attemptErr) {
          setErrorMsg('Failed to verify exam attempt logs.');
          setLoading(false);
          return;
        }

        if (attempt && attempt.status === 'SUBMITTED') {
          setErrorMsg('You have already submitted this exam attempt.');
          setLoading(false);
          return;
        }

        if (attempt && attempt.status === 'SUSPENDED') {
          setErrorMsg('Your attempt has been suspended due to policy violations.');
          setLoading(false);
          return;
        }

        // Candidate validated successfully
        setIsAuthorized(true);
      } catch (err) {
        console.error('Validation error in ExamSessionGuard:', err);
        setErrorMsg('Internal error validating exam session.');
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [user, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <Loading message="Validating assessment eligibility rules..." />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-center text-slate-100">
        <div className="max-w-md w-full space-y-4">
          <AlertBanner message={errorMsg} variant="danger" />
          <p className="text-xs text-slate-400">
            If you believe this is a technical error, please contact the Exam Cell.
          </p>
          <a
            href="/app/exams/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/app/unauthorized" replace />;
};

export default ExamSessionGuard;
