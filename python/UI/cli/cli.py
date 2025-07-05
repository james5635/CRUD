import requests
import json

BASE_URL = "http://127.0.0.1:8000/items/"

def create_item(name: str):
    response = requests.post(BASE_URL, json={"name": name})
    if response.status_code == 200:
        print("Item created:", response.json())
    else:
        print("Error creating item:", response.status_code, response.text)

def read_items():
    response = requests.get(BASE_URL)
    if response.status_code == 200:
        print("All items:", response.json())
    else:
        print("Error reading items:", response.status_code, response.text)

def read_item(item_id: int):
    response = requests.get(f"{BASE_URL}{item_id}")
    if response.status_code == 200:
        print(f"Item {item_id}:", response.json())
    else:
        print(f"Error reading item {item_id}:", response.status_code, response.text)

def update_item(item_id: int, new_name: str):
    response = requests.put(f"{BASE_URL}{item_id}", json={"name": new_name})
    if response.status_code == 200:
        print(f"Item {item_id} updated:", response.json())
    else:
        print(f"Error updating item {item_id}:", response.status_code, response.text)

def delete_item(item_id: int):
    response = requests.delete(f"{BASE_URL}{item_id}")
    if response.status_code == 200:
        print(f"Item {item_id} deleted.", response.json())
    else:
        print(f"Error deleting item {item_id}:", response.status_code, response.text)

def main():
    print("CLI for FastAPI CRUD API")
    print("Commands: create <name>, read_all, read <id>, update <id> <new_name>, delete <id>, exit")

    while True:
        command = input("> ").split()
        action = command[0].lower()

        if action == "create":
            if len(command) > 1:
                create_item(" ".join(command[1:]))
            else:
                print("Usage: create <name>")
        elif action == "read_all":
            read_items()
        elif action == "read":
            if len(command) > 1 and command[1].isdigit():
                read_item(int(command[1]))
            else:
                print("Usage: read <id>")
        elif action == "update":
            if len(command) > 2 and command[1].isdigit():
                update_item(int(command[1]), " ".join(command[2:]))
            else:
                print("Usage: update <id> <new_name>")
        elif action == "delete":
            if len(command) > 1 and command[1].isdigit():
                delete_item(int(command[1]))
            else:
                print("Usage: delete <id>")
        elif action == "exit":
            break
        else:
            print("Unknown command.")

if __name__ == "__main__":
    main()
