import sys
import requests
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QLineEdit, QLabel, QListWidget, QMessageBox
)
from PyQt6.QtCore import Qt

API_BASE_URL = "http://127.0.0.1:8000/items"

class CRUDApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PyQt FastAPI CRUD App")
        self.setGeometry(100, 100, 600, 400)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout()

        # Input fields for ID and Name
        input_layout = QHBoxLayout()
        self.id_input = QLineEdit(self)
        self.id_input.setPlaceholderText("Item ID (for Read/Update/Delete)")
        self.name_input = QLineEdit(self)
        self.name_input.setPlaceholderText("Item Name (for Create/Update)")
        input_layout.addWidget(QLabel("ID:"))
        input_layout.addWidget(self.id_input)
        input_layout.addWidget(QLabel("Name:"))
        input_layout.addWidget(self.name_input)
        main_layout.addLayout(input_layout)

        # CRUD Buttons
        button_layout = QHBoxLayout()
        self.create_btn = QPushButton("Create Item")
        self.create_btn.clicked.connect(self.create_item)
        self.read_all_btn = QPushButton("Read All Items")
        self.read_all_btn.clicked.connect(self.read_all_items)
        self.read_one_btn = QPushButton("Read One Item")
        self.read_one_btn.clicked.connect(self.read_one_item)
        self.update_btn = QPushButton("Update Item")
        self.update_btn.clicked.connect(self.update_item)
        self.delete_btn = QPushButton("Delete Item")
        self.delete_btn.clicked.connect(self.delete_item)

        button_layout.addWidget(self.create_btn)
        button_layout.addWidget(self.read_all_btn)
        button_layout.addWidget(self.read_one_btn)
        button_layout.addWidget(self.update_btn)
        button_layout.addWidget(self.delete_btn)
        main_layout.addLayout(button_layout)

        # Item List Display
        self.item_list = QListWidget(self)
        main_layout.addWidget(self.item_list)

        self.setLayout(main_layout)
        self.read_all_items() # Load items on startup

    def show_message(self, title, message):
        msg_box = QMessageBox()
        msg_box.setWindowTitle(title)
        msg_box.setText(message)
        msg_box.exec()

    def create_item(self):
        name = self.name_input.text()
        if not name:
            self.show_message("Error", "Item name cannot be empty.")
            return
        try:
            response = requests.post(API_BASE_URL, json={"name": name})
            response.raise_for_status()
            self.show_message("Success", f"Item created: {response.json()}")
            self.name_input.clear()
            self.read_all_items()
        except requests.exceptions.RequestException as e:
            self.show_message("Error", f"Failed to create item: {e}\n{response.text if 'response' in locals() else ''}")

    def read_all_items(self):
        try:
            response = requests.get(API_BASE_URL)
            response.raise_for_status()
            items = response.json()
            self.item_list.clear()
            if items:
                for item in items:
                    self.item_list.addItem(f"ID: {item['id']}, Name: {item['name']}")
            else:
                self.item_list.addItem("No items found.")
        except requests.exceptions.RequestException as e:
            self.show_message("Error", f"Failed to read items: {e}\n{response.text if 'response' in locals() else ''}")

    def read_one_item(self):
        item_id_str = self.id_input.text()
        if not item_id_str.isdigit():
            self.show_message("Error", "Please enter a valid numeric Item ID.")
            return
        item_id = int(item_id_str)
        try:
            response = requests.get(f"{API_BASE_URL}/{item_id}")
            response.raise_for_status()
            item = response.json()
            self.item_list.clear()
            self.item_list.addItem(f"Found Item - ID: {item['id']}, Name: {item['name']}")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                self.show_message("Not Found", f"Item with ID {item_id} not found.")
            else:
                self.show_message("Error", f"Failed to read item: {e}\n{e.response.text}")
        except requests.exceptions.RequestException as e:
            self.show_message("Error", f"Failed to read item: {e}")

    def update_item(self):
        item_id_str = self.id_input.text()
        name = self.name_input.text()
        if not item_id_str.isdigit() or not name:
            self.show_message("Error", "Please enter a valid numeric Item ID and a new name.")
            return
        item_id = int(item_id_str)
        try:
            response = requests.put(f"{API_BASE_URL}/{item_id}", json={"name": name})
            response.raise_for_status()
            self.show_message("Success", f"Item updated: {response.json()}")
            self.id_input.clear()
            self.name_input.clear()
            self.read_all_items()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                self.show_message("Not Found", f"Item with ID {item_id} not found for update.")
            else:
                self.show_message("Error", f"Failed to update item: {e}\n{e.response.text}")
        except requests.exceptions.RequestException as e:
            self.show_message("Error", f"Failed to update item: {e}")

    def delete_item(self):
        item_id_str = self.id_input.text()
        if not item_id_str.isdigit():
            self.show_message("Error", "Please enter a valid numeric Item ID.")
            return
        item_id = int(item_id_str)
        try:
            response = requests.delete(f"{API_BASE_URL}/{item_id}")
            response.raise_for_status()
            self.show_message("Success", f"Item deleted: {response.json()}")
            self.id_input.clear()
            self.read_all_items()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                self.show_message("Not Found", f"Item with ID {item_id} not found for deletion.")
            else:
                self.show_message("Error", f"Failed to delete item: {e}\n{e.response.text}")
        except requests.exceptions.RequestException as e:
            self.show_message("Error", f"Failed to delete item: {e}")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = CRUDApp()
    window.show()
    sys.exit(app.exec())