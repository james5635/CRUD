require 'tiny_tds'

# Connect to SQL Server
client = TinyTds::Client.new(
  username: 'sa',
  password: 'James@2025',
  host: 'localhost',
  database: 'master',
  azure: false, # set to true if using Azure SQL
)

puts "Connected to SQL Server"

def create_user(client, name, age)
  client.execute("INSERT INTO Users (Name, Age) VALUES ('#{name}', #{age})").do
  puts "User created"
end

def read_users(client)
  result = client.execute("SELECT * FROM Users")
  result.each do |row|
    puts "ID: #{row['ID']} | Name: #{row['Name']} | Age: #{row['Age']}"
  end
end

def update_user(client, id, new_age)
  client.execute("UPDATE Users SET Age = #{new_age} WHERE ID = #{id}").do
  puts "User updated"
end

def delete_user(client, id)
  client.execute("DELETE FROM Users WHERE ID = #{id}").do
  puts "User deleted"
end

# Test
create_user(client, "Alice", 30)
read_users(client)
update_user(client, 1, 35)
delete_user(client, 1)

client.close
