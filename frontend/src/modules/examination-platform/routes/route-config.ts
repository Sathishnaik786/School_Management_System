import { ExamRole } from '../enums/ExamRole';

export interface ExamRouteConfig {
  path: string;
  element: React.ReactNode;
  roles?: ExamRole[];
  permissions?: string[];
}
