import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const API_BASE_URL = 'http://192.168.100.34:8000'; // Assuming FastAPI runs on localhost:8000

interface Item {
  id: number;
  name: string;
}

export default function CRUDScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemName, setEditItemName] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/`);
      const data: Item[] = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to fetch items.');
    }
  };

  const createItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Item name cannot be empty.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItemName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewItemName('');
      fetchItems();
    } catch (error) {
      console.error('Error creating item:', error);
      Alert.alert('Error', 'Failed to create item.');
    }
  };

  const updateItem = async () => {
    if (editItemId === null || !editItemName.trim()) {
      Alert.alert('Error', 'Item name cannot be empty or no item selected for edit.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/items/${editItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editItemName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setEditItemId(null);
      setEditItemName('');
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item.');
    }
  };

  const startEdit = (item: Item) => {
    setEditItemId(item.id);
    setEditItemName(item.name);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>CRUD Operations</ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Create New Item</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Item Name"
          value={newItemName}
          onChangeText={setNewItemName}
        />
        <Button title="Add Item" onPress={createItem} />
      </ThemedView>

      {editItemId !== null && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Edit Item (ID: {editItemId})</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="New Item Name"
            value={editItemName}
            onChangeText={setEditItemName}
          />
          <Button title="Update Item" onPress={updateItem} />
          <Button title="Cancel Edit" onPress={() => { setEditItemId(null); setEditItemName(''); }} color="red" />
        </ThemedView>
      )}

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Items List</ThemedText>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <ThemedText>{item.name} (ID: {item.id})</ThemedText>
              <View style={styles.itemButtons}>
                <Button title="Edit" onPress={() => startEdit(item)} />
                <Button title="Delete" onPress={() => deleteItem(item.id)} color="red" />
              </View>
            </View>
          )}
          ListEmptyComponent={<ThemedText>No items found.</ThemedText>}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0', // Light background for sections
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  itemButtons: {
    flexDirection: 'row',
    gap: 10,
  },
});
