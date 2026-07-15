export interface DashboardWidgetConfig {
  id: string;
  type: 'stat' | 'chart' | 'activity' | 'list';
  title: string;
  size: 'sm' | 'md' | 'lg' | 'full';
  visible: boolean;
}
