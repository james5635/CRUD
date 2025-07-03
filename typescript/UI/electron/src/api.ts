import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export interface Task {
  id: number;
  title: string;
  description?: string;
  isDone: boolean;
}

export const getTasks = () => api.get<Task[]>('/tasks');
export const createTask = (task: Omit<Task, 'id'>) => api.post<Task>('/tasks', task);
export const updateTask = (id: number, task: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, task);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);
