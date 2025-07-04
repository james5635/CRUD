import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { getTasks, createTask, updateTask, deleteTask, Task } from '../api';

export default function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tasks. Make sure the NestJS server is running and the IP address in api.ts is correct.');
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!title) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }

    try {
      if (selectedId) {
        await updateTask(selectedId, { title, description });
      } else {
        await createTask({ title, description });
      }
      clearForm();
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', `Failed to ${selectedId ? 'update' : 'create'} task.`);
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task.');
    }
  };

  const clearForm = () => {
    setSelectedId(null);
    setTitle('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Manager</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.buttonContainer}>
        <Button title={selectedId ? 'Update' : 'Create'} onPress={handleCreateOrUpdate} />
        {selectedId && <Button title="Cancel" onPress={clearForm} color="gray" />}
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <View>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text>{item.description}</Text>
            </View>
            <View style={styles.taskActions}>
              <Button title="Edit" onPress={() => handleSelectTask(item)} />
              <Button title="Delete" onPress={() => handleDelete(item.id)} color="red" />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskActions: {
    flexDirection: 'row',
  },
});