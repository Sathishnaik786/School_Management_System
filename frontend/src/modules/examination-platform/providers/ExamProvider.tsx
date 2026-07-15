import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ExamRole } from '../enums/ExamRole';

interface ExamContextType {
  activeRole: ExamRole;
  setActiveRole: (role: ExamRole) => void;
  systemMode: string;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<ExamRole>(ExamRole.STUDENT);

  useEffect(() => {
    if (user?.roles) {
      const lowerRoles = user.roles.map(r => r.toLowerCase());
      if (lowerRoles.includes('admin') || lowerRoles.includes('superadmin') || lowerRoles.includes('exam_cell_admin')) {
        setActiveRole(ExamRole.EXAM_CELL);
      } else if (lowerRoles.includes('teacher') || lowerRoles.includes('faculty')) {
        setActiveRole(ExamRole.TEACHER);
      } else if (lowerRoles.includes('evaluator')) {
        setActiveRole(ExamRole.EVALUATOR);
      } else if (lowerRoles.includes('invigilator')) {
        setActiveRole(ExamRole.INVIGILATOR);
      } else if (lowerRoles.includes('applicant')) {
        setActiveRole(ExamRole.APPLICANT);
      } else if (lowerRoles.includes('recruitment_candidate')) {
        setActiveRole(ExamRole.RECRUITMENT_CANDIDATE);
      } else {
        setActiveRole(ExamRole.STUDENT);
      }
    }
  }, [user]);

  return (
    <ExamContext.Provider value={{ activeRole, setActiveRole, systemMode: 'PRODUCTION' }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExamContext = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExamContext must be used within an ExamProvider');
  }
  return context;
};
