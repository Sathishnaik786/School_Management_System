import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Loading } from '../../../components/ui/Loading';

export const ExamProtectedRoute: React.FC = () => {
  return <Outlet />;
};

export default ExamProtectedRoute;
