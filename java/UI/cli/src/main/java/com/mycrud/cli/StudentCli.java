package com.mycrud.cli;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Scanner;

public class StudentCli {

    private static final String API_URL = "http://localhost:8080/students";
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.println("\nChoose an option:");
            System.out.println("1. List all students");
            System.out.println("2. Get student by ID");
            System.out.println("3. Create a new student");
            System.out.println("4. Update a student");
            System.out.println("5. Delete a student");
            System.out.println("6. Exit");

            int choice = scanner.nextInt();
            scanner.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    listStudents();
                    break;
                case 2:
                    getStudentById(scanner);
                    break;
                case 3:
                    createStudent(scanner);
                    break;
                case 4:
                    updateStudent(scanner);
                    break;
                case 5:
                    deleteStudent(scanner);
                    break;
                case 6:
                    return;
                default:
                    System.out.println("Invalid choice. Please try again.");
            }
        }
    }

    private static void listStudents() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .GET()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        List<Student> students = mapper.readValue(response.body(), mapper.getTypeFactory().constructCollectionType(List.class, Student.class));
        students.forEach(System.out::println);
    }

    private static void getStudentById(Scanner scanner) throws Exception {
        System.out.print("Enter student ID: ");
        Long id = scanner.nextLong();
        scanner.nextLine();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "/" + id))
                .GET()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            Student student = mapper.readValue(response.body(), Student.class);
            System.out.println(student);
        } else {
            System.out.println("Student not found.");
        }
    }

    private static void createStudent(Scanner scanner) throws Exception {
        System.out.print("Enter name: ");
        String name = scanner.nextLine();
        System.out.print("Enter email: ");
        String email = scanner.nextLine();

        Student newStudent = new Student();
        newStudent.setName(name);
        newStudent.setEmail(email);

        String json = mapper.writeValueAsString(newStudent);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        Student createdStudent = mapper.readValue(response.body(), Student.class);
        System.out.println("Created student: " + createdStudent);
    }

    private static void updateStudent(Scanner scanner) throws Exception {
        System.out.print("Enter student ID to update: ");
        Long id = scanner.nextLong();
        scanner.nextLine();

        System.out.print("Enter new name: ");
        String name = scanner.nextLine();
        System.out.print("Enter new email: ");
        String email = scanner.nextLine();

        Student updatedStudent = new Student();
        updatedStudent.setName(name);
        updatedStudent.setEmail(email);

        String json = mapper.writeValueAsString(updatedStudent);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "/" + id))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        Student resultStudent = mapper.readValue(response.body(), Student.class);
        System.out.println("Updated student: " + resultStudent);
    }

    private static void deleteStudent(Scanner scanner) throws Exception {
        System.out.print("Enter student ID to delete: ");
        Long id = scanner.nextLong();
        scanner.nextLine();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "/" + id))
                .DELETE()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            System.out.println("Student deleted successfully.");
        } else {
            System.out.println("Error deleting student. Status code: " + response.statusCode());
        }
    }
}