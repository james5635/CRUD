#include <sql.h>
#include <sqlext.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

SQLHENV env;
SQLHDBC dbc;
SQLHSTMT stmt;

void handle_error(SQLRETURN ret, SQLHANDLE handle, SQLSMALLINT type,
                  const char *msg) {
  if (ret != SQL_SUCCESS && ret != SQL_SUCCESS_WITH_INFO) {
    SQLCHAR state[6], text[256];
    SQLINTEGER native;
    SQLSMALLINT len;
    SQLGetDiagRec(type, handle, 1, state, &native, text, sizeof(text), &len);
    fprintf(stderr, "ERROR (%s): %s\n", msg, text);
    exit(EXIT_FAILURE);
  }
}

void connect_db() {
  SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);
  SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, (void *)SQL_OV_ODBC3, 0);
  SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);

  // SQLCHAR connStr[] =
  //     "DRIVER={ODBC Driver 18 for SQL Server};"
  //     "SERVER=localhost;"
  //     "DATABASE=master;"
  //     "UID=sa;"
  //     "PWD=James@2025;"
  //     "TrustServerCertificate=Yes;"
  //     "Encrypt=No;";
  SQLCHAR connStr[] = "DRIVER=FreeTDS;SERVER=localhost;PORT=1433;DATABASE="
                      "master;UID=sa;PWD=James@2025;TDS_Version=7.4;";
  SQLRETURN ret = SQLDriverConnect(dbc, NULL, connStr, SQL_NTS, NULL, 0, NULL,
                                   SQL_DRIVER_COMPLETE);
  handle_error(ret, dbc, SQL_HANDLE_DBC, "Connection");
  SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);
  printf("Connected to SQL Server.\n");
}

void disconnect_db() {
  SQLFreeHandle(SQL_HANDLE_STMT, stmt);
  SQLDisconnect(dbc);
  SQLFreeHandle(SQL_HANDLE_DBC, dbc);
  SQLFreeHandle(SQL_HANDLE_ENV, env);
}

void create_user(const char *name, int age) {
  char query[256];
  snprintf(query, sizeof(query),
           "INSERT INTO Users (Name, Age) VALUES ('%s', %d);", name, age);
  SQLRETURN ret = SQLExecDirect(stmt, (SQLCHAR *)query, SQL_NTS);
  handle_error(ret, stmt, SQL_HANDLE_STMT, "INSERT");
  printf("User inserted: %s, Age %d\n", name, age);
  SQLFreeStmt(stmt, SQL_CLOSE);
}

void read_users() {
  SQLRETURN ret = SQLExecDirect(
      stmt, (SQLCHAR *)"SELECT ID, Name, Age FROM Users;", SQL_NTS);
  handle_error(ret, stmt, SQL_HANDLE_STMT, "SELECT");

  SQLINTEGER id, age;
  SQLCHAR name[100];
  SQLBindCol(stmt, 1, SQL_C_LONG, &id, 0, NULL);
  SQLBindCol(stmt, 2, SQL_C_CHAR, name, sizeof(name), NULL);
  SQLBindCol(stmt, 3, SQL_C_LONG, &age, 0, NULL);

  printf("Users:\n");
  while (SQLFetch(stmt) == SQL_SUCCESS) {
    printf("ID: %d, Name: %s, Age: %d\n", id, name, age);
  }
  SQLFreeStmt(stmt, SQL_CLOSE);
}

void update_user(int id, int new_age) {
  char query[128];
  snprintf(query, sizeof(query), "UPDATE Users SET Age = %d WHERE ID = %d;",
           new_age, id);
  SQLRETURN ret = SQLExecDirect(stmt, (SQLCHAR *)query, SQL_NTS);
  handle_error(ret, stmt, SQL_HANDLE_STMT, "UPDATE");
  printf("User ID %d updated to Age %d\n", id, new_age);
  SQLFreeStmt(stmt, SQL_CLOSE);
}

void delete_user(int id) {
  char query[128];
  snprintf(query, sizeof(query), "DELETE FROM Users WHERE ID = %d;", id);
  SQLRETURN ret = SQLExecDirect(stmt, (SQLCHAR *)query, SQL_NTS);
  handle_error(ret, stmt, SQL_HANDLE_STMT, "DELETE");
  printf("User ID %d deleted\n", id);
  SQLFreeStmt(stmt, SQL_CLOSE);
}

int main() {
  connect_db();

  create_user("Alice", 30);
  read_users();
  update_user(1, 35);
  delete_user(1);

  disconnect_db();
  return 0;
}
