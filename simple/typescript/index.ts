import sql from 'mssql';

// SQL Server connection config
const config: sql.config = {
  user: 'sa',
  password: 'James@2025',
  server: 'localhost',
  database: 'master',
  options: {
    trustServerCertificate: true,
  },
};

async function connect() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server");

    // Call functions here
    await createUser("Alice", 30);
    await readUsers();
    await updateUser(1, 35);
    await deleteUser(1);

    await pool.close();
  } catch (err) {
    console.error("SQL error", err);
  }
}

async function createUser(name: string, age: number) {
  await sql.query`INSERT INTO Users (Name, Age) VALUES (${name}, ${age})`;
  console.log("User created");
}

async function readUsers() {
  const result = await sql.query`SELECT * FROM Users`;
  result.recordset.forEach(user => {
    console.log(`ID: ${user.ID}, Name: ${user.Name}, Age: ${user.Age}`);
  });
}

async function updateUser(id: number, newAge: number) {
  await sql.query`UPDATE Users SET Age = ${newAge} WHERE ID = ${id}`;
  console.log("User updated");
}

async function deleteUser(id: number) {
  await sql.query`DELETE FROM Users WHERE ID = ${id}`;
  console.log("User deleted");
}

connect();
