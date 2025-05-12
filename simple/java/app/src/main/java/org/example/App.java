package org.example;

import java.sql.*;

public class App {

    private static final String DB_URL =
        "jdbc:sqlserver://localhost:1433;databaseName=master;encrypt=true;trustServerCertificate=true";
    private static final String USER = "sa";
    private static final String PASSWORD = "James@2025";

    public static void main(String[] args) {
        try (
            Connection conn = DriverManager.getConnection(
                DB_URL,
                USER,
                PASSWORD
            )
        ) {
            // CREATE
            createUser(conn, "Alice", 30);

            // READ
            readUsers(conn);

            // UPDATE
            updateUserAge(conn, 1, 35); // Update user with ID=1

            // DELETE
            deleteUser(conn, 1); // Delete user with ID=1
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    static void createUser(Connection conn, String name, int age)
        throws SQLException {
        String sql = "INSERT INTO Users (Name, Age) VALUES (?, ?);";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, name);
            stmt.setInt(2, age);

            int rows = stmt.executeUpdate();
            System.out.println(rows);

            System.out.println("User created.");
        }
    }

    static void readUsers(Connection conn) throws SQLException {
        String sql = "SELECT * FROM Users";
        try (
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql)
        ) {
            while (rs.next()) {
                System.out.printf(
                    "ID: %d, Name: %s, Age: %d%n",
                    rs.getInt("ID"),
                    rs.getString("Name"),
                    rs.getInt("Age")
                );
            }
        }
    }

    static void updateUserAge(Connection conn, int id, int newAge)
        throws SQLException {
        String sql = "UPDATE Users SET Age = ? WHERE ID = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, newAge);
            stmt.setInt(2, id);
            int rows = stmt.executeUpdate();

            System.out.println(rows > 0 ? "User updated." : "User not found.");
        }
    }

    static void deleteUser(Connection conn, int id) throws SQLException {
        String sql = "DELETE FROM Users WHERE ID = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            int rows = stmt.executeUpdate();
            System.out.println(rows > 0 ? "User deleted." : "User not found.");
        }
    }
}
