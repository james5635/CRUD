
#include <iostream>
#include <sqlext.h>
#include <string>

using namespace std;

SQLHENV env;
SQLHDBC dbc;
SQLHSTMT stmt;

void checkError(SQLRETURN ret, SQLHANDLE handle, SQLSMALLINT type) {
  if (ret == SQL_SUCCESS || ret == SQL_SUCCESS_WITH_INFO || ret == SQL_NO_DATA)
    return;

  SQLCHAR sqlState[1024] = {0};
  SQLCHAR message[1024] = {0};

  if (SQLGetDiagRec(type, handle, 1, sqlState, NULL, message, sizeof(message),
                    NULL) == SQL_SUCCESS) {
    cerr << "ODBC Error: " << message << " (SQL State: " << sqlState << ")"
         << endl;
  } else {
    cerr << "ODBC Error: Unknown (no diagnostic info)" << endl;
  }

  exit(1);
}

void createUser(const string &name, int age) {
  string query = "INSERT INTO Users (Name, Age) VALUES ('" + name + "', " +
                 to_string(age) + ");";
  SQLRETURN ret = SQLExecDirect(stmt, (SQLCHAR *)query.c_str(), SQL_NTS);
  checkError(ret, stmt, SQL_HANDLE_STMT);
  cout << "User created: " << name << endl;
  SQLFreeStmt(stmt, SQL_CLOSE);
}

void readUsers() {
  SQLRETURN ret = SQLExecDirect(
      stmt, (SQLCHAR *)"SELECT ID, Name, Age FROM Users;", SQL_NTS);
  checkError(ret, stmt, SQL_HANDLE_STMT);

  while ((ret = SQLFetch(stmt)) == SQL_SUCCESS) {
    SQLINTEGER id, age;
    SQLCHAR name[100];

    SQLGetData(stmt, 1, SQL_C_LONG, &id, 0, NULL);
    SQLGetData(stmt, 2, SQL_C_CHAR, name, sizeof(name), NULL);
    SQLGetData(stmt, 3, SQL_C_LONG, &age, 0, NULL);

    cout << "ID: " << id << ", Name: " << name << ", Age: " << age << endl;
  }

  SQLFreeStmt(stmt, SQL_CLOSE);
}

void updateUser(int id, int newAge) {
  string query = "UPDATE Users SET Age = " + to_string(newAge) +
                 " WHERE ID = " + to_string(id) + ";";
  SQLRETURN ret = SQLExecDirect(stmt, (SQLCHAR *)query.c_str(), SQL_NTS);
  checkError(ret, stmt, SQL_HANDLE_STMT);
  cout << "User with ID " << id << " updated to age " << newAge << endl;
  SQLFreeStmt(stmt, SQL_CLOSE);
}

void deleteUser(int id) {
  string query = "DELETE FROM Users WHERE ID = " + to_string(id) + ";";
  SQLRETURN ret = SQLExecDirect(stmt, (SQLCHAR *)query.c_str(), SQL_NTS);
  checkError(ret, stmt, SQL_HANDLE_STMT);
  cout << "User with ID " << id << " deleted" << endl;
  SQLFreeStmt(stmt, SQL_CLOSE);
}

int main() {
  SQLRETURN ret;

  // Init ODBC
  SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);
  SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, (void *)SQL_OV_ODBC3, 0);
  SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);

  // SQLCHAR connStr[] =
  //     "DRIVER=ODBC Driver 17 for SQL Server;"
  //     "SERVER=localhost;"
  //     "DATABASE=master;"
  //     "UID=sa;"
  //     "PWD=James@2025;"
  //     "TrustServerCertificate=Yes;"
  //     "Encrypt=no;";
  SQLCHAR connStr[] = "DRIVER=FreeTDS;SERVER=localhost;PORT=1433;DATABASE="
                      "master;UID=sa;PWD=James@2025;TDS_Version=7.4;";

  ret = SQLDriverConnect(dbc, NULL, connStr, SQL_NTS, NULL, 0, NULL,
                         SQL_DRIVER_NOPROMPT);
  checkError(ret, dbc, SQL_HANDLE_DBC);
  cout << "Connected to SQL Server" << endl;

  SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

  // Create table if not exists
  ret = SQLExecDirect(
      stmt,
      (SQLCHAR *)"IF OBJECT_ID('Users', 'U') IS  NULL "
                 "CREATE TABLE Users (ID INT IDENTITY(1,1) PRIMARY "
                 "KEY, Name NVARCHAR(100), Age INT)",
      // "CREATE TABLE Users (ID INT IDENTITY PRIMARY KEY, Name "
      // "VARCHAR(100), Age INT);",
      SQL_NTS);
  cout << ret << endl;
  checkError(ret, stmt, SQL_HANDLE_STMT);
  SQLFreeStmt(stmt, SQL_CLOSE);

  // Run operations
  createUser("Alice", 30);
  createUser("Bob", 28);
  readUsers();
  updateUser(1, 35);
  deleteUser(2);
  readUsers();

  // Cleanup
  SQLFreeHandle(SQL_HANDLE_STMT, stmt);
  SQLDisconnect(dbc);
  SQLFreeHandle(SQL_HANDLE_DBC, dbc);
  SQLFreeHandle(SQL_HANDLE_ENV, env);

  return 0;
}
