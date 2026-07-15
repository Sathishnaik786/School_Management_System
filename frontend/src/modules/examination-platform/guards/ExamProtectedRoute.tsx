import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Loading } from '../../../components/ui/Loading';

export const ExamProtectedRoute: React.FC = () => {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <Loading message="Securing exam portal session..." />
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ExamProtectedRoute;
