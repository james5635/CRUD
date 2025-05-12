package main

import (
	"database/sql"
	"fmt"

	_ "github.com/denisenkom/go-mssqldb"
)

type User struct {
	ID   int
	Name string
	Age  int
}

var db *sql.DB
var (
	server   = "localhost"
	port     = 1433
	uid      = "sa"
	pwd      = "James@2025"
	database = "master"
)

func initDB() {
	connString := fmt.Sprintf("server=%s;user id=%s;password=%s;database=%s", server, uid, pwd, database)
	var err error
	db, err = sql.Open("sqlserver", connString)
	if err != nil {
		panic(err)
	}
	if err = db.Ping(); err != nil {
		panic(err)
	}
	fmt.Println("Connected to SQL Server")
}

func CreateUser(user User) (int, error) {
    var newID int
    err := db.QueryRow(
        "INSERT INTO Users (Name, Age) OUTPUT INSERTED.ID VALUES (@Name, @Age)",
        sql.Named("Name", user.Name),
        sql.Named("Age", user.Age),
    ).Scan(&newID)
    return newID, err
}


func GetUser(id int) (User, error) {
	var user User
	row := db.QueryRow(
		"SELECT ID, Name, Age FROM Users WHERE ID = @ID",
		sql.Named("ID", id),
	)
	err := row.Scan(&user.ID, &user.Name, &user.Age)
	return user, err
}

func UpdateUser(user User) error {
	_, err := db.Exec(
		"UPDATE Users SET Name = @Name, Age = @Age WHERE ID = @ID",
		sql.Named("Name", user.Name),
		sql.Named("Age", user.Age),
		sql.Named("ID", user.ID),
	)
	return err
}

func DeleteUser(id int) error {
	_, err := db.Exec(
		"DELETE FROM Users WHERE ID = @ID",
		sql.Named("ID", id),
	)
	return err
}

func main() {
	initDB()
	defer db.Close()
	var err error
	// Create
	user := User{Name: "John Doe", Age: 30}
	user.ID, err = CreateUser(user)
	if err != nil {
		fmt.Println("Error creating user:", err)
		return
	}
	// read user
	user, err = GetUser(user.ID)
	if err != nil {
		fmt.Println("Error getting user:", err)
		return
	}
	fmt.Println("Retrieved user:", user)

	// Update
	user.Name = "Jane Doe Updated"
	user.Age = 35
	err = UpdateUser(user)
	if err != nil {
		fmt.Println("Error updating user:", err)
		return
	}
	fmt.Println("User updated")

	// Delete
	err = DeleteUser(user.ID)
	if err != nil {
		fmt.Println("Error deleting user:", err)
		return
	}
	fmt.Println("User deleted")

}
