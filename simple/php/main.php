<?php
$serverName = "localhost";
$connectionOptions = [
    "Database" => "master",
    "Uid" => "sa",
    "PWD" => "James@2025",
    "TrustServerCertificate" => true
];

// Connect to SQL Server
$conn = sqlsrv_connect($serverName, $connectionOptions);
if (!$conn) {
    die(print_r(sqlsrv_errors(), true));
}

function createUser($conn, $name, $age) {
    $sql = "INSERT INTO Users (Name, Age) VALUES (?, ?)";
    $params = [$name, $age];
    $stmt = sqlsrv_query($conn, $sql, $params);
    echo $stmt ? "User created.\n" : print_r(sqlsrv_errors(), true);
}

function readUsers($conn) {
    $sql = "SELECT * FROM Users";
    $stmt = sqlsrv_query($conn, $sql);
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        echo "ID: {$row['ID']} | Name: {$row['Name']} | Age: {$row['Age']}\n";
    }
}

function updateUser($conn, $id, $newAge) {
    $sql = "UPDATE Users SET Age = ? WHERE ID = ?";
    $params = [$newAge, $id];
    $stmt = sqlsrv_query($conn, $sql, $params);
    echo $stmt ? "User updated.\n" : print_r(sqlsrv_errors(), true);
}

function deleteUser($conn, $id) {
    $sql = "DELETE FROM Users WHERE ID = ?";
    $params = [$id];
    $stmt = sqlsrv_query($conn, $sql, $params);
    echo $stmt ? "User deleted.\n" : print_r(sqlsrv_errors(), true);
}

// Test
createUser($conn, "Alice", 30);
readUsers($conn);
updateUser($conn, 1, 35);
deleteUser($conn, 1);

sqlsrv_close($conn);
?>
