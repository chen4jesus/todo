import { useContext } from 'react';
import { TaskContext, TaskContextProps } from '../contexts/TaskContext.tsx';

export const useTask = (): TaskContextProps => {
  const context = useContext(TaskContext);
  
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  
  return context;
};