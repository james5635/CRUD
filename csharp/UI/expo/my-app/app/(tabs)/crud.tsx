import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

interface Item {
  id: number;
  name: string;
}
// must set in c#:  "applicationUrl": "http://0.0.0.0:5086",
const API_URL = 'http://192.168.100.34:5086/items'; // C# API runs on port 5086 (using host machine's IP)
export default function CrudScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get<Item[]>(API_URL);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to fetch items.');
    }
  };

  const addItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Item name cannot be empty.');
      return;
    }
    try {
      await axios.post(API_URL, { name: itemName });
      setItemName('');
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item.');
    }
  };

  const updateItem = async () => {
    if (selectedItemId === null) {
      Alert.alert('Error', 'No item selected for update.');
      return;
    }
    if (!itemName.trim()) {
      Alert.alert('Error', 'Item name cannot be empty.');
      return;
    }
    try {
      await axios.put(`${API_URL}/${selectedItemId}`, { id: selectedItemId, name: itemName });
      setItemName('');
      setSelectedItemId(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item.');
    }
  };

  const selectItemForEdit = (item: Item) => {
    setItemName(item.name);
    setSelectedItemId(item.id);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name}</Text>
      <View style={styles.itemButtons}>
        <Button title="Edit" onPress={() => selectItemForEdit(item)} />
        <Button title="Delete" onPress={() => deleteItem(item.id)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD Operations</Text>
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />
      <View style={styles.buttonContainer}>
        <Button title={selectedItemId ? "Update Item" : "Add Item"} onPress={selectedItemId ? updateItem : addItem} />
        {selectedItemId && <Button title="Cancel Edit" onPress={() => { setItemName(''); setSelectedItemId(null); }} color="orange" />}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={styles.list}
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
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
  },
  itemButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  list: {
    width: '100%',
  },
});
