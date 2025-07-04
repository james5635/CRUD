<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

interface Task {
  id: number;
  title: string;
  description?: string;
  isDone: boolean;
}

const tasks = ref<Task[]>([]);
const newTaskTitle = ref('');
const newTaskDescription = ref('');
const editingTask = ref<Task | null>(null);
const dialogVisible = ref(false);
const API_BASE_URL = 'http://localhost:3000/tasks'; // Assuming NestJS runs on port 3000

const currentTitle = computed({
  get: () => (editingTask.value ? editingTask.value.title : newTaskTitle.value),
  set: (value: string) => {
    if (editingTask.value) {
      editingTask.value.title = value;
    } else {
      newTaskTitle.value = value;
    }
  },
});

const currentDescription = computed({
  get: () => (editingTask.value ? editingTask.value.description : newTaskDescription.value),
  set: (value: string | undefined) => {
    if (editingTask.value) {
      editingTask.value.description = value;
    } else {
      newTaskDescription.value = value || '';
    }
  },
});

const fetchTasks = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    tasks.value = await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    ElMessage.error('Failed to fetch tasks.');
  }
};

const createTask = async () => {
  if (!newTaskTitle.value.trim()) {
    ElMessage.warning('Task title cannot be empty.');
    return;
  }
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newTaskTitle.value,
        description: newTaskDescription.value || undefined,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    newTaskTitle.value = '';
    newTaskDescription.value = '';
    ElMessage.success('Task created successfully!');
    fetchTasks(); // Refresh the list
  } catch (error) {
    console.error('Error creating task:', error);
    ElMessage.error('Failed to create task.');
  }
};

const startEdit = (task: Task) => {
  editingTask.value = { ...task }; // Create a copy to avoid direct mutation
  dialogVisible.value = true;
};

const cancelEdit = () => {
  editingTask.value = null;
  dialogVisible.value = false;
};

const updateTask = async () => {
  if (!editingTask.value || !editingTask.value.title.trim()) {
    ElMessage.warning('Task title cannot be empty.');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/${editingTask.value.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: editingTask.value.title,
        description: editingTask.value.description || undefined,
        isDone: editingTask.value.isDone,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    ElMessage.success('Task updated successfully!');
    cancelEdit();
    fetchTasks(); // Refresh the list
  } catch (error) {
    console.error('Error updating task:', error);
    ElMessage.error('Failed to update task.');
  }
};

const toggleTaskStatus = async (task: Task) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isDone: !task.isDone }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    ElMessage.success(`Task marked ${task.isDone ? 'undone' : 'done'}.`);
    fetchTasks(); // Refresh the list
  } catch (error) {
    console.error('Error toggling task status:', error);
    ElMessage.error('Failed to toggle task status.');
  }
};

const deleteTask = async (id: number) => {
  ElMessageBox.confirm(
    'Are you sure you want to delete this task?',
    'Warning',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        ElMessage.success('Task deleted successfully!');
        fetchTasks(); // Refresh the list
      } catch (error) {
        console.error('Error deleting task:', error);
        ElMessage.error('Failed to delete task.');
      }
    })
    .catch(() => {
      ElMessage.info('Delete cancelled.');
    });
};

onMounted(fetchTasks);
</script>

<template>
  <div class="task-management-container">
    <el-card class="box-card task-form-card">
      <template #header>
        <div class="card-header">
          <span>{{ editingTask ? 'Edit Task' : 'Add New Task' }}</span>
        </div>
      </template>
      <el-input
        v-model="currentTitle"
        placeholder="Task Title"
        clearable
        class="input-margin-bottom"
      ></el-input>
      <el-input
        v-model="currentDescription"
        placeholder="Task Description (Optional)"
        clearable
        class="input-margin-bottom"
      ></el-input>
      <div v-if="editingTask" class="edit-actions">
        <el-checkbox v-model="editingTask.isDone">Done</el-checkbox>
        <el-button type="primary" @click="updateTask">Save Changes</el-button>
        <el-button @click="cancelEdit">Cancel</el-button>
      </div>
      <el-button v-else type="primary" @click="createTask">Add Task</el-button>
    </el-card>

    <el-card class="box-card task-list-card">
      <template #header>
        <div class="card-header">
          <span>My Tasks</span>
        </div>
      </template>
      <p v-if="tasks.length === 0">No tasks yet. Add one above!</p>
      <el-table v-else :data="tasks" style="width: 100%">
        <el-table-column prop="title" label="Title" width="180">
          <template #default="scope">
            <span :class="{ 'task-done-text': scope.row.isDone }">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description">
          <template #default="scope">
            <span :class="{ 'task-done-text': scope.row.isDone }">{{ scope.row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isDone" label="Status" width="100">
          <template #default="scope">
            <el-checkbox :model-value="scope.row.isDone" @change="toggleTaskStatus(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200">
          <template #default="scope">
            <el-button size="small" @click="startEdit(scope.row)">Edit</el-button>
            <el-button size="small" type="danger" @click="deleteTask(scope.row.id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="Edit Task"
      width="30%"
      :before-close="cancelEdit"
    >
      <el-form v-if="editingTask" :model="editingTask" label-width="120px">
        <el-form-item label="Title">
          <el-input v-model="editingTask.title"></el-input>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="editingTask.description"></el-input>
        </el-form-item>
        <el-form-item label="Status">
          <el-checkbox v-model="editingTask.isDone">Done</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit">Cancel</el-button>
          <el-button type="primary" @click="updateTask">Save</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.task-management-container {
  max-width: 900px;
  margin: 2em auto;
  padding: 2em;
  font-family: Arial, sans-serif;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 1.2em;
  font-weight: bold;
}

.input-margin-bottom {
  margin-bottom: 15px;
}

.edit-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.task-done-text {
  text-decoration: line-through;
  color: #909399;
}

.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>