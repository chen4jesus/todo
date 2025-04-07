import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Category } from '../types.ts';
import neo4jService from '../services/neo4jService.ts';


export const TaskContext = createContext<TaskContextProps>({} as TaskContextProps);

export interface TaskContextProps {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskCompletion: (id: string, completed: boolean) => Promise<Task | null>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  assignTaskToCategory: (taskId: string, categoryId: string) => Promise<void>;
  getTasksByCategory: (categoryId: string) => Promise<Task[]>;
}

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Connect to Neo4j on mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Connect to Neo4j
        await neo4jService.connect();
        setInitialized(true);
        
        // Load initial data
        await Promise.all([fetchTasks(), fetchCategories()]);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setError('Failed to connect to database. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();

    // Disconnect on unmount
    return () => {
      neo4jService.disconnect();
    };
  }, []);

  const fetchTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      const fetchedTasks = await neo4jService.getAllTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      setLoading(true);
      const fetchedCategories = await neo4jService.getAllCategories();
      setCategories(fetchedCategories);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      setLoading(true);
      const newTask = await neo4jService.createTask({
        ...task,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      setError(null);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      setLoading(true);
      const updatedTask = await neo4jService.updateTask(id, updates);
      
      if (updatedTask) {
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === id ? updatedTask : task)
        );
      }
      
      setError(null);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await neo4jService.deleteTask(id);
      
      if (success) {
        setTasks(prevTasks => 
          prevTasks.filter(task => task.id !== id)
        );
      }
      
      setError(null);
      return success;
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (id: string, completed: boolean): Promise<Task | null> => {
    return updateTask(id, { completed });
  };

  const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    try {
      setLoading(true);
      const newCategory = await neo4jService.createCategory(category);
      
      setCategories(prevCategories => [...prevCategories, newCategory]);
      setError(null);
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
    try {
      setLoading(true);
      const updatedCategory = await neo4jService.updateCategory(id, updates);
      
      if (updatedCategory) {
        setCategories(prevCategories => 
          prevCategories.map(category => category.id === id ? updatedCategory : category)
        );
      }
      
      setError(null);
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await neo4jService.deleteCategory(id);
      
      if (success) {
        setCategories(prevCategories => 
          prevCategories.filter(category => category.id !== id)
        );
      }
      
      setError(null);
      return success;
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const assignTaskToCategory = async (taskId: string, categoryId: string): Promise<void> => {
    try {
      setLoading(true);
      await neo4jService.assignTaskToCategory(taskId, categoryId);
      
      // Update the task in state
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        updateTask(taskId, { category: categoryId });
      }
      
      setError(null);
    } catch (error) {
      console.error('Error assigning task to category:', error);
      setError('Failed to assign task to category. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTasksByCategory = async (categoryId: string): Promise<Task[]> => {
    try {
      setLoading(true);
      const categoryTasks = await neo4jService.getTasksByCategory(categoryId);
      setError(null);
      return categoryTasks;
    } catch (error) {
      console.error('Error fetching tasks by category:', error);
      setError('Failed to fetch tasks by category. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        loading,
        error,
        fetchTasks,
        fetchCategories,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addCategory,
        updateCategory,
        deleteCategory,
        assignTaskToCategory,
        getTasksByCategory,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}; 