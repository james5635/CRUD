import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput, StyleSheet, Modal, Alert, TouchableOpacity } from 'react-native';

// const API_BASE_URL = 'http://localhost:3000'; // Assuming Rails API runs on port 3000
const API_BASE_URL = 'http://192.168.100.34:3000'; // Assuming Rails API runs on port 3000

interface Motorcycle {
  id: number;
  brand: string;
  model: string;
  year: number;
}

export default function Index() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMotorcycle, setEditingMotorcycle] = useState<Motorcycle | null>(null);
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: '',
  });

  useEffect(() => {
    fetchMotorcycles();
  }, []);

  const fetchMotorcycles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/motorcycles`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Motorcycle[] = await response.json();
      setMotorcycles(data);
    } catch (error) {
      console.error('Error fetching motorcycles:', error);
      Alert.alert('Error', 'Failed to fetch motorcycles.');
    }
  };

  const submitForm = async () => {
    try {
      const payload = {
        motorcycle: {
          brand: form.brand,
          model: form.model,
          year: parseInt(form.year),
        },
      };

      let response;
      if (editingMotorcycle) {
        // Update existing motorcycle
        response = await fetch(`${API_BASE_URL}/motorcycles/${editingMotorcycle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new motorcycle
        response = await fetch(`${API_BASE_URL}/motorcycles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, errors: ${JSON.stringify(errorData)}`);
      }

      await fetchMotorcycles(); // Refresh list
      cancelForm();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', `Failed to save motorcycle: ${error.message}`);
    }
  };

  const editMotorcycle = (motorcycle: Motorcycle) => {
    setEditingMotorcycle(motorcycle);
    setForm({ brand: motorcycle.brand, model: motorcycle.model, year: String(motorcycle.year) });
    setModalVisible(true);
  };

  const deleteMotorcycle = async (id: number) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this motorcycle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/motorcycles/${id}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              await fetchMotorcycles(); // Refresh list
            } catch (error) {
              console.error('Error deleting motorcycle:', error);
              Alert.alert('Error', 'Failed to delete motorcycle.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const cancelForm = () => {
    setModalVisible(false);
    setEditingMotorcycle(null);
    setForm({ brand: '', model: '', year: '' });
  };

  const renderMotorcycleItem = ({ item }: { item: Motorcycle }) => (
    <View style={styles.itemContainer}>
      <View>
        <Text style={styles.itemText}>Brand: {item.brand}</Text>
        <Text style={styles.itemText}>Model: {item.model}</Text>
        <Text style={styles.itemText}>Year: {item.year}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => editMotorcycle(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMotorcycle(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motorcycles</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add New Motorcycle</Text>
      </TouchableOpacity>

      {motorcycles.length > 0 ? (
        <FlatList
          data={motorcycles}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMotorcycleItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noMotorcyclesText}>No motorcycles found. Add one!</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelForm}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {editingMotorcycle ? 'Edit Motorcycle' : 'Create New Motorcycle'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Brand"
              value={form.brand}
              onChangeText={(text) => setForm({ ...form, brand: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Model"
              value={form.model}
              onChangeText={(text) => setForm({ ...form, model: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Year"
              value={form.year}
              onChangeText={(text) => setForm({ ...form, year: text })}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.submitButton} onPress={submitForm}>
                <Text style={styles.buttonText}>{editingMotorcycle ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelForm}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  itemActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
  },
  noMotorcyclesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#777',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
});
