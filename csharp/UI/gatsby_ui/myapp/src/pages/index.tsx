import React, { useState, useEffect } from "react";

// =============================================================================
// Constants
// =============================================================================

const API_URL = "http://localhost:5086";

// =============================================================================
// Styles
// =============================================================================

const pageStyles = {
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
  padding: "2rem",
  backgroundColor: "#f4f4f9",
  minHeight: "100vh",
};

const containerStyles = {
  maxWidth: "800px",
  margin: "0 auto",
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const headingStyles = {
  color: "#333",
  borderBottom: "2px solid #663399",
  paddingBottom: "0.5rem",
};

const formStyles = {
  display: "flex",
  marginBottom: "2rem",
  gap: "1rem",
};

const inputStyles = {
  flexGrow: 1,
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const buttonStyles = {
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#663399",
  color: "#fff",
  cursor: "pointer",
  transition: "background-color 0.2s",
};

const listStyles = {
  listStyle: "none",
  padding: 0,
};

const listItemStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem",
  borderBottom: "1px solid #eee",
};

const itemNameStyles = {
  flexGrow: 1,
};

const itemButtonsStyles = {
  display: "flex",
  gap: "0.5rem",
};

// =============================================================================
// Component
// =============================================================================

const IndexPage = () => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (e) {
      setError("Failed to fetch items. Is the API running?");
      console.error(e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItemName) return;

    try {
      await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName }),
      });
      setNewItemName("");
      fetchItems();
    } catch (e) {
      setError("Failed to create item.");
      console.error(e);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await fetch(`${API_URL}/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editingItemName }),
      });
      setEditingItemId(null);
      setEditingItemName("");
      fetchItems();
    } catch (e) {
      setError("Failed to update item.");
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/items/${id}`, {
        method: "DELETE",
      });
      fetchItems();
    } catch (e) {
      setError("Failed to delete item.");
      console.error(e);
    }
  };

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingItemName("");
  };

  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <h1 style={headingStyles}>CRUD App</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleCreate} style={formStyles}>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add a new item"
            style={inputStyles}
          />
          <button type="submit" style={buttonStyles}>
            Add
          </button>
        </form>

        <ul style={listStyles}>
          {items.map((item) => (
            <li key={item.id} style={listItemStyles}>
              {editingItemId === item.id ? (
                <input
                  type="text"
                  value={editingItemName}
                  onChange={(e) => setEditingItemName(e.target.value)}
                  style={inputStyles}
                />
              ) : (
                <span style={itemNameStyles}>{item.name}</span>
              )}

              <div style={itemButtonsStyles}>
                {editingItemId === item.id ? (
                  <>
                    <button onClick={() => handleUpdate(item.id)} style={buttonStyles}>Save</button>
                    <button onClick={cancelEditing} style={{...buttonStyles, backgroundColor: '#777'}}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(item)} style={buttonStyles}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{...buttonStyles, backgroundColor: '#d9534f'}}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default IndexPage;