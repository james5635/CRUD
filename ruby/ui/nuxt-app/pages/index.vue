<template>
  <div class="container">
    <h1>Motorcycles</h1>

    <!-- List Motorcycles -->
    <button @click="showCreateForm = true; editingMotorcycle = null" class="add-button">Add New Motorcycle</button>
    <div v-if="motorcycles.length">
      <table>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Model</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="motorcycle in motorcycles" :key="motorcycle.id">
            <td>{{ motorcycle.brand }}</td>
            <td>{{ motorcycle.model }}</td>
            <td>{{ motorcycle.year }}</td>
            <td>
              <button @click="editMotorcycle(motorcycle)" class="edit-button">Edit</button>
              <button @click="deleteMotorcycle(motorcycle.id)" class="delete-button">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>No motorcycles found. Add one!</p>

    <!-- Create/Edit Form -->
    <div v-if="showCreateForm || editingMotorcycle" class="form-modal">
      <div class="form-content">
        <h2>{{ editingMotorcycle ? 'Edit Motorcycle' : 'Create New Motorcycle' }}</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="brand">Brand:</label>
            <input type="text" id="brand" v-model="form.brand" required />
          </div>
          <div class="form-group">
            <label for="model">Model:</label>
            <input type="text" id="model" v-model="form.model" required />
          </div>
          <div class="form-group">
            <label for="year">Year:</label>
            <input type="number" id="year" v-model="form.year" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-button">{{ editingMotorcycle ? 'Update' : 'Create' }}</button>
            <button type="button" @click="cancelForm" class="cancel-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const motorcycles = ref([]);
const showCreateForm = ref(false);
const editingMotorcycle = ref(null); // Stores the motorcycle being edited
const form = ref({
  brand: '',
  model: '',
  year: null,
});

const API_BASE_URL = 'http://localhost:3000'; // Assuming Rails API runs on port 3000

// Fetch all motorcycles
const fetchMotorcycles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/motorcycles`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    motorcycles.value = await response.json();
  } catch (error) {
    console.error('Error fetching motorcycles:', error);
  }
};

// Submit form (Create or Update)
const submitForm = async () => {
  try {
    let response;
    if (editingMotorcycle.value) {
      // Update existing motorcycle
      response = await fetch(`${API_BASE_URL}/motorcycles/${editingMotorcycle.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motorcycle: form.value }),
      });
    } else {
      // Create new motorcycle
      response = await fetch(`${API_BASE_URL}/motorcycles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motorcycle: form.value }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, errors: ${JSON.stringify(errorData)}`);
    }

    // Refresh list and reset form
    await fetchMotorcycles();
    cancelForm();
  } catch (error) {
    console.error('Error submitting form:', error);
    alert(`Failed to save motorcycle: ${error.message}`);
  }
};

// Edit motorcycle
const editMotorcycle = (motorcycle) => {
  editingMotorcycle.value = motorcycle;
  form.value = { ...motorcycle }; // Populate form with existing data
  showCreateForm.value = true; // Show the form
};

// Delete motorcycle
const deleteMotorcycle = async (id) => {
  if (confirm('Are you sure you want to delete this motorcycle?')) {
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
      alert('Failed to delete motorcycle.');
    }
  }
};

// Cancel form and reset state
const cancelForm = () => {
  showCreateForm.value = false;
  editingMotorcycle.value = null;
  form.value = { brand: '', model: '', year: null };
};

// Fetch motorcycles on component mount
onMounted(() => {
  fetchMotorcycles();
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

h1, h2 {
  text-align: center;
  color: #333;
}

.add-button {
  display: block;
  margin: 1rem auto;
  padding: 0.8rem 1.5rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.add-button:hover {
  background-color: #218838;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  color: #555;
}

.edit-button, .delete-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.edit-button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.form-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  width: calc(100% - 1rem);
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  text-align: right;
  margin-top: 1.5rem;
}

.submit-button, .cancel-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 0.5rem;
}

.submit-button {
  background-color: #007bff;
  color: white;
}

.submit-button:hover {
  background-color: #0056b3;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}
</style>
