import { NotificationType } from '../enums/NotificationType';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
}
