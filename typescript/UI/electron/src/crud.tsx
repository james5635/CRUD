import { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask, Task } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash, Edit, Save, X } from 'lucide-react';

export default function Crud() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await getTasks();
    setTasks(response.data);
  };

  const handleCreateTask = async () => {
    if (newTaskTitle.trim() === '') return;
    await createTask({ title: newTaskTitle, isDone: false });
    setNewTaskTitle('');
    fetchTasks();
  };

  const handleUpdateTask = async (id: number, task: Partial<Task>) => {
    await updateTask(id, task);
    fetchTasks();
  };

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id);
    fetchTasks();
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const saveEditing = async (id: number) => {
    if (editingTaskTitle.trim() === '') return;
    await handleUpdateTask(id, { title: editingTaskTitle });
    cancelEditing();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Task Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-grow"
            />
            <Button onClick={handleCreateTask} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary">
                <Checkbox
                  checked={task.isDone}
                  onCheckedChange={(checked) => handleUpdateTask(task.id, { isDone: !!checked })}
                />
                {editingTaskId === task.id ? (
                  <Input
                    value={editingTaskTitle}
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    className="flex-grow"
                  />
                ) : (
                  <span className={`flex-grow ${task.isDone ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                )}
                {editingTaskId === task.id ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => saveEditing(task.id)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => startEditing(task)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}