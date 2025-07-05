import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'student_form.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Student CRUD',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const StudentList(),
    );
  }
}

class Student {
  final int id;
  final String name;
  final String email;

  Student({required this.id, required this.name, required this.email});

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(id: json['id'], name: json['name'], email: json['email']);
  }
}

class StudentList extends StatefulWidget {
  const StudentList({super.key});

  @override
  _StudentListState createState() => _StudentListState();
}

class _StudentListState extends State<StudentList> {
  late Future<List<Student>> futureStudents;

  @override
  void initState() {
    super.initState();
    futureStudents = fetchStudents();
  }
// hello world
  Future<List<Student>> fetchStudents() async {
    final response = await http.get(Uri.parse('http://10.0.2.2:8080/students'));

    if (response.statusCode == 200) {
      List jsonResponse = json.decode(response.body);
      return jsonResponse.map((student) => Student.fromJson(student)).toList();
    } else {
      throw Exception('Failed to load students');
    }
  }

  Future<void> deleteStudent(int id) async {
    final response = await http.delete(
      Uri.parse('http://10.0.2.2:8080/students/$id'),
    );

    if (response.statusCode == 200) {
      setState(() {
        futureStudents = fetchStudents();
      });
    } else {
      throw Exception('Failed to delete student.');
    }
  }

  void _navigateAndRefresh(BuildContext context, {Student? student}) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => StudentForm(student: student)),
    );

    if (result == true) {
      setState(() {
        futureStudents = fetchStudents();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('brorojame')),
      body: Center(
        child: FutureBuilder<List<Student>>(
          future: futureStudents,
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              return ListView.builder(
                itemCount: snapshot.data!.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text(snapshot.data![index].name),
                    subtitle: Text(snapshot.data![index].email),
                    onTap: () => _navigateAndRefresh(
                      context,
                      student: snapshot.data![index],
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete),
                      onPressed: () {
                        deleteStudent(snapshot.data![index].id);
                      },
                    ),
                  );
                },
              );
            } else if (snapshot.hasError) {
              return Text('${snapshot.error}');
            }

            return const CircularProgressIndicator();
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _navigateAndRefresh(context),
        child: const Icon(Icons.add),
      ),
    );
  }
}
