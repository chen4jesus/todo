export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  reminderTime?: Date;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  repeat?: RepeatPattern;
  attachments?: Attachment[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  symbol?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface RepeatPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6, where 0 is Sunday
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
} 