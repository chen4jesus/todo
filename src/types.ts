export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  symbol?: string;
  description?: string;
  reminderTime?: Date;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  repeat?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}
