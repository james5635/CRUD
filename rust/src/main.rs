use tiberius::{AuthMethod, Client, Config, Row}; // Removed unused ColumnData
use tokio::net::TcpStream;
use tokio_util::compat::{Compat, TokioAsyncWriteCompatExt};
use std::error::Error;
use futures::TryStreamExt; // Keep this for try_filter_map and try_collect

// --- Prerequisites ---
// 1. Ensure you have a SQL Server instance running.
// 2. Create a database (e.g., 'master' or a dedicated one).
// 3. Create the 'Users' table:
//    CREATE TABLE Users (
//        ID INT PRIMARY KEY IDENTITY(1,1), -- Auto-incrementing ID
//        Name NVARCHAR(100) NOT NULL,
//        Age INT
//    );
// 4. Make sure your `Cargo.toml` includes the necessary dependencies:
/*
[dependencies]
tiberius = { version = "0.12", features = ["chrono", "rust_decimal", "sql-browser"] } # Adjust version as needed
tokio = { version = "1", features = ["full"] }
tokio-util = { version = "0.7", features = ["compat"] }
futures = "0.3"
*/

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    println!("Connecting to database...");
    let mut client = get_client().await?;
    println!("Connected successfully.");

    // Example Usage (ensure the table exists first!)
    println!("Attempting to create user...");
    match create_user(&mut client, "Alice", 30).await {
        Ok(rows_affected) => {
             if rows_affected > 0 {
                 println!("User 'Alice' created.");
             } else {
                 // This case might not happen with INSERT unless there's a trigger or complex logic
                 println!("User 'Alice' creation reported 0 rows affected.");
             }
        }
        Err(e) => eprintln!("Error creating user: {}", e),
    }
    match create_user(&mut client, "Bob", 42).await { // Create another user for testing
        Ok(rows_affected) => {
             if rows_affected > 0 {
                 println!("User 'Bob' created.");
             } else {
                 println!("User 'Bob' creation reported 0 rows affected.");
             }
        }
        Err(e) => eprintln!("Error creating user: {}", e),
    }


    println!("\nReading users...");
    match read_users(&mut client).await {
        Ok(_) => println!("Finished reading users."),
        Err(e) => eprintln!("Error reading users: {}", e),
    }

    // Note: The ID '1' might not exist if the table was just created
    // or if previous operations failed. You might need to fetch the ID
    // after creation or query for an existing user.
    // For demonstration, we assume ID 1 might exist after creating Alice.
    let user_id_to_update = 1; // Example ID
    println!("\nAttempting to update user ID {}...", user_id_to_update);
    match update_user(&mut client, user_id_to_update, 35).await {
        Ok(rows_affected) => {
            if rows_affected > 0 {
                println!("User ID {} updated.", user_id_to_update);
            } else {
                println!("User ID {} not found for update.", user_id_to_update);
            }
        }
        Err(e) => eprintln!("Error updating user: {}", e),
    }

    let user_id_to_delete = 1; // Example ID
    println!("\nAttempting to delete user ID {}...", user_id_to_delete);
     match delete_user(&mut client, user_id_to_delete).await {
        Ok(rows_affected) => {
            if rows_affected > 0 {
                println!("User ID {} deleted.", user_id_to_delete);
            } else {
                println!("User ID {} not found for deletion.", user_id_to_delete);
            }
        }
        Err(e) => eprintln!("Error deleting user: {}", e),
    }

    println!("\nFinal read of users...");
     match read_users(&mut client).await {
        Ok(_) => println!("Finished final read."),
        Err(e) => eprintln!("Error reading users: {}", e),
    }


    Ok(())
}

// Establishes a connection to the SQL Server database.
async fn get_client() -> Result<Client<Compat<TcpStream>>, Box<dyn Error>> {
    let mut config = Config::new();
    config.host("localhost");
    config.port(1433);
    config.database("master"); // Or your specific database

    // WARNING: Hardcoding credentials is not recommended for production.
    // Use environment variables or a config management solution.
    config.authentication(AuthMethod::sql_server("sa", "James@2025")); // Replace with your credentials

    // Use trust_cert() for development/testing ONLY if you trust the server certificate
    // or are using self-signed certificates. For production, configure proper validation.
    config.trust_cert();

    let tcp = TcpStream::connect(config.get_addr()).await?;
    tcp.set_nodelay(true)?;

    // Connect using the configuration and the compatible TCP stream
    // The `Compat` wrapper is needed to bridge tokio 0.2/0.3 AsyncRead/Write traits with tokio 1.x
    let client = Client::connect(config, tcp.compat_write()).await?;
    Ok(client)
}

// Creates a new user in the Users table.
async fn create_user(
    client: &mut Client<Compat<TcpStream>>, // Use the concrete type from get_client
    name: &str,
    age: i32,
) -> Result<u64, Box<dyn Error>> { // Return rows affected
    let result = client
        .execute("INSERT INTO Users (Name, Age) VALUES (@P1, @P2);", &[&name, &age])
        .await?;
    // `execute` returns the number of rows affected for each statement.
    // Since we have one statement, we take the first element.
    Ok(result.rows_affected().get(0).copied().unwrap_or(0))
}

// Reads and prints all users from the Users table.
async fn read_users(
    client: &mut Client<Compat<TcpStream>>, // Use the concrete type
) -> Result<(), Box<dyn Error>> {
    let mut stream = client.query("SELECT ID, Name, Age FROM Users;", &[]).await?;

    // **FIX:** Filter map the stream to get only rows, then collect.
    // `item.into_row()` returns Option<Row>, which try_filter_map handles.
    let rows: Vec<Row> = stream
        .try_filter_map(|item| async move { Ok(item.into_row()) })
        .try_collect()
        .await?;

    println!("--- User List ---");
    if rows.is_empty() {
        println!("No users found.");
    } else {
        for row in rows {
            // Use try_get for safe column retrieval, handling potential errors (e.g., NULLs, type mismatch)
            // Using `?` propagates potential column access errors.
            let id: Option<i32> = row.try_get("ID")?;
            let name: Option<&str> = row.try_get("Name")?;
            let age: Option<i32> = row.try_get("Age")?; // Age might be NULL if allowed by schema

            // Handle potential None values gracefully for printing
            let id_str = id.map_or_else(|| "NULL".to_string(), |v| v.to_string());
            let name_str = name.unwrap_or("NULL"); // &str can be unwrapped or handled
            let age_str = age.map_or_else(|| "NULL".to_string(), |v| v.to_string());

            println!("ID: {}, Name: {}, Age: {}", id_str, name_str, age_str);
        }
    }
    println!("-----------------");
    Ok(())
}

// Updates the age of a user identified by ID.
async fn update_user(
    client: &mut Client<Compat<TcpStream>>, // Use the concrete type
    id: i32,
    new_age: i32,
) -> Result<u64, Box<dyn Error>> { // Return rows affected
    let result = client
        .execute("UPDATE Users SET Age = @P1 WHERE ID = @P2;", &[&new_age, &id])
        .await?;
     // Safely get the rows affected count for the first statement
     Ok(result.rows_affected().get(0).copied().unwrap_or(0))
}

// Deletes a user identified by ID.
async fn delete_user(
    client: &mut Client<Compat<TcpStream>>, // Use the concrete type
    id: i32,
) -> Result<u64, Box<dyn Error>> { // Return rows affected
    let result = client
        .execute("DELETE FROM Users WHERE ID = @P1;", &[&id])
        .await?;
    // Safely get the rows affected count for the first statement
    Ok(result.rows_affected().get(0).copied().unwrap_or(0))
}
