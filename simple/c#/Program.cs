using System;
using Microsoft.Data.SqlClient;

internal class Program
{
    static string connectionString = "Server=localhost;Database=master;User Id=sa;Password=James@2025;TrustServerCertificate=True;";

    private static void Main(string[] args)
    {
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            connection.Open();
            Console.WriteLine("Connected to SQL Server");

            CreateUser(connection, "Alice", 30);
            ReadUsers(connection);
            UpdateUserAge(connection, 1, 35);
            DeleteUser(connection, 1);
        }
    }

    static void CreateUser(SqlConnection connection, string name, int age)
    {
        string query = "INSERT INTO Users (Name, Age) VALUES (@Name, @Age)";
        using (SqlCommand cmd = new SqlCommand(query, connection))
        {
            cmd.Parameters.AddWithValue("@Name", name);
            cmd.Parameters.AddWithValue("@Age", age);
            int rows = cmd.ExecuteNonQuery();
            Console.WriteLine($"Inserted {rows} row(s).");
        }
    }

    static void ReadUsers(SqlConnection connection)
    {
        string query = "SELECT * FROM Users";
        using (SqlCommand cmd = new SqlCommand(query, connection))
        using (SqlDataReader reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                Console.WriteLine($"ID: {reader["ID"]}, Name: {reader["Name"]}, Age: {reader["Age"]}");
            }
        }
    }

    static void UpdateUserAge(SqlConnection connection, int id, int newAge)
    {
        string query = "UPDATE Users SET Age = @Age WHERE ID = @ID";
        using (SqlCommand cmd = new SqlCommand(query, connection))
        {
            cmd.Parameters.AddWithValue("@Age", newAge);
            cmd.Parameters.AddWithValue("@ID", id);
            int rows = cmd.ExecuteNonQuery();
            Console.WriteLine($"Updated {rows} row(s).");
        }
    }

    static void DeleteUser(SqlConnection connection, int id)
    {
        string query = "DELETE FROM Users WHERE ID = @ID";
        using (SqlCommand cmd = new SqlCommand(query, connection))
        {
            cmd.Parameters.AddWithValue("@ID", id);
            int rows = cmd.ExecuteNonQuery();
            Console.WriteLine($"Deleted {rows} row(s).");
        }
    }
}
