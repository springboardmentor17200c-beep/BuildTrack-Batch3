export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'General' | 'Procurement' | 'Inventory' | 'Worker' | 'Project';
}
