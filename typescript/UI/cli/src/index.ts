import { Command } from 'commander';
import { getTasks, createTask, updateTask, deleteTask } from './api';

const program = new Command();

program
  .command('list')
  .description('List all tasks')
  .action(async () => {
    const tasks = await getTasks();
    console.log(tasks.data);
  });

program
  .command('add <title>')
  .description('Add a new task')
  .action(async (title) => {
    await createTask({ title, isDone: false });
    console.log('Task added');
  });

program
  .command('update <id> <title>')
  .description('Update a task')
  .action(async (id, title) => {
    await updateTask(parseInt(id), { title });
    console.log('Task updated');
  });

program
  .command('remove <id>')
  .description('Remove a task')
  .action(async (id) => {
    await deleteTask(parseInt(id));
    console.log('Task removed');
  });

program.parse(process.argv);
