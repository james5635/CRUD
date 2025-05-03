import pyodbc

# Connection string
conn_str =(
    "DRIVER=FreeTDS;"
    "SERVER=localhost;"
    "PORT=1433;"
    "DATABASE=master;"
    "UID=sa;"
    "PWD=James@2025;"
     )



def create_user(cursor, name, age):
    cursor.execute("INSERT INTO Users (Name, Age) VALUES (?, ?)", (name, age))
    print("User created.")

def read_users(cursor: pyodbc.Cursor):
    cursor.execute("SELECT * FROM Users")
    for row in cursor.fetchall():
        print(f"ID: {row.ID}, Name: {row.Name}, Age: {row.Age}")

def update_user_age(cursor: pyodbc.Cursor, user_id, new_age):
    cursor.execute("UPDATE Users SET Age = ? WHERE ID = ?", (new_age, user_id))
    print("User updated.")

def delete_user(cursor, user_id):
    cursor.execute("DELETE FROM Users WHERE ID = ?", (user_id,))
    print("User deleted.")

def main():
    with pyodbc.connect(conn_str) as conn:
        with conn.cursor() as cursor:
            print("Connected to SQL Server")

            # CREATE
            create_user(cursor, "Alice", 30)

            # READ
            read_users(cursor)

            # UPDATE
            update_user_age(cursor, 1, 35)

            # DELETE
            delete_user(cursor, 1)

            conn.commit()

if __name__ == "__main__":
    main()
