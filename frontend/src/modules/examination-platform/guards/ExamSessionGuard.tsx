import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Loading } from '../../../components/ui/Loading';
import { AlertBanner } from '../shared/components/AlertBanner';

export const ExamSessionGuard: React.FC = () => {
  return <Outlet />;
};

export default ExamSessionGuard;
