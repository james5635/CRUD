// const API_URL = 'http://localhost:3000/tasks'; // Replace with your computer's IP address
// const API_URL = 'http://192.168.100.34:3000/tasks'; // Replace with your computer's IP address
const API_URL = 'https://a3e7-58-97-230-118.ngrok-free.app/tasks'; // Replace with your computer's IP address

export interface Task {
  id: number;
  title: string;
  description?: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await fetch(API_URL, {
    headers: {
      // ngrok don't work for GET request, we need the header
       'ngrok-skip-browser-warning': 'true'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export const createTask = async (task: { title: string; description?: string }): Promise<Task> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
};

export const updateTask = async (id: number, task: { title?: string; description?: string }): Promise<Task> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
};

export const deleteTask = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
};
