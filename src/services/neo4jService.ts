import neo4j, { Driver, Session } from 'neo4j-driver';
import { Task, Category, Attachment, User } from '../types';

class Neo4jService {
  private driver: Driver | null = null;
  private uri: string;
  private username: string;
  private password: string;

  constructor(uri: string, username: string, password: string) {
    this.uri = uri;
    this.username = username;
    this.password = password;
  }

  async connect(): Promise<void> {
    try {
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.username, this.password)
      );
      
      // Test the connection
      const session = this.driver.session();
      await session.run('RETURN 1');
      await session.close();
      
      console.log('Connected to Neo4j database');
    } catch (error) {
      console.error('Failed to connect to Neo4j database:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.driver) {
      this.driver.close();
      this.driver = null;
      console.log('Disconnected from Neo4j database');
    }
  }

  private getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver is not initialized');
    }
    return this.driver.session();
  }

  // Task CRUD operations
  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `
        CREATE (t:Task {
          id: randomUUID(),
          title: $title,
          description: $description,
          completed: $completed,
          dueDate: $dueDate,
          reminderTime: $reminderTime,
          category: $category,
          priority: $priority,
          notes: $notes,
          createdAt: datetime(),
          updatedAt: datetime(),
          symbol: $symbol
        })
        RETURN t
        `,
        {
          title: task.title,
          description: task.description || null,
          completed: task.completed,
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          reminderTime: task.reminderTime ? task.reminderTime.toISOString() : null,
          category: task.category || null,
          priority: task.priority || null,
          notes: task.notes || null,
          symbol: task.symbol || null
        }
      );

      const record = result.records[0];
      const createdTask = record.get('t').properties;

      return {
        ...createdTask,
        dueDate: createdTask.dueDate ? new Date(createdTask.dueDate) : undefined,
        reminderTime: createdTask.reminderTime ? new Date(createdTask.reminderTime) : undefined,
        createdAt: new Date(createdTask.createdAt),
        updatedAt: new Date(createdTask.updatedAt),
      } as Task;
    } finally {
      await session.close();
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    const session = this.getSession();
    try {
      const result = await session.run(
        'MATCH (t:Task {id: $id}) RETURN t',
        { id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const task = record.get('t').properties;

      return {
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      } as Task;
    } finally {
      await session.close();
    }
  }

  async getAllTasks(): Promise<Task[]> {
    const session = this.getSession();
    try {
      const result = await session.run('MATCH (t:Task) RETURN t');

      return result.records.map(record => {
        const task = record.get('t').properties;
        return {
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        } as Task;
      });
    } finally {
      await session.close();
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const session = this.getSession();
    try {
      const updateProps = Object.entries(updates)
        .filter(([key]) => key !== 'id' && key !== 'createdAt')
        .map(([key, value]) => {
          if (value instanceof Date) {
            return `t.${key} = datetime('${value.toISOString()}')`;
          } else if (typeof value === 'string') {
            return `t.${key} = '${value}'`;
          } else {
            return `t.${key} = ${JSON.stringify(value)}`;
          }
        })
        .join(', ');

      const query = `
        MATCH (t:Task {id: $id})
        SET t.updatedAt = datetime(), ${updateProps}
        RETURN t
      `;

      const result = await session.run(query, { id });

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const task = record.get('t').properties;

      return {
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      } as Task;
    } finally {
      await session.close();
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    const session = this.getSession();
    try {
      const result = await session.run(
        'MATCH (t:Task {id: $id}) DELETE t RETURN count(t) as deleted',
        { id }
      );

      const deleted = result.records[0].get('deleted').toInt();
      return deleted > 0;
    } finally {
      await session.close();
    }
  }

  // Category CRUD operations
  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `
        CREATE (c:Category {
          id: randomUUID(),
          name: $name,
          color: $color,
          icon: $icon
        })
        RETURN c
        `,
        {
          name: category.name,
          color: category.color,
          icon: category.icon || null
        }
      );

      const record = result.records[0];
      return record.get('c').properties as Category;
    } finally {
      await session.close();
    }
  }

  async getAllCategories(): Promise<Category[]> {
    const session = this.getSession();
    try {
      const result = await session.run('MATCH (c:Category) RETURN c');

      return result.records.map(record => record.get('c').properties as Category);
    } finally {
      await session.close();
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const session = this.getSession();
    try {
      const result = await session.run(
        'MATCH (c:Category {id: $id}) RETURN c',
        { id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      return record.get('c').properties as Category;
    } finally {
      await session.close();
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const session = this.getSession();
    try {
      const updateProps = Object.entries(updates)
        .filter(([key]) => key !== 'id')
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `c.${key} = '${value}'`;
          } else {
            return `c.${key} = ${JSON.stringify(value)}`;
          }
        })
        .join(', ');

      const query = `
        MATCH (c:Category {id: $id})
        SET ${updateProps}
        RETURN c
      `;

      const result = await session.run(query, { id });

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      return record.get('c').properties as Category;
    } finally {
      await session.close();
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    const session = this.getSession();
    try {
      const result = await session.run(
        'MATCH (c:Category {id: $id}) DELETE c RETURN count(c) as deleted',
        { id }
      );

      const deleted = result.records[0].get('deleted').toInt();
      return deleted > 0;
    } finally {
      await session.close();
    }
  }

  // Task-Category relationship methods
  async assignTaskToCategory(taskId: string, categoryId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `
        MATCH (t:Task {id: $taskId})
        MATCH (c:Category {id: $categoryId})
        MERGE (t)-[:BELONGS_TO]->(c)
        SET t.category = $categoryId
        `,
        { taskId, categoryId }
      );
    } finally {
      await session.close();
    }
  }

  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `
        MATCH (t:Task)-[:BELONGS_TO]->(c:Category {id: $categoryId})
        RETURN t
        `,
        { categoryId }
      );

      return result.records.map(record => {
        const task = record.get('t').properties;
        return {
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        } as Task;
      });
    } finally {
      await session.close();
    }
  }
}

const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const username = process.env.NEO4J_USERNAME || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

const neo4jService = new Neo4jService(uri, username, password);

export default neo4jService; 