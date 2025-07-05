"use client";
import { useState, useEffect } from 'react';
import { getAllStudents, createStudent, updateStudent, deleteStudent } from '../services/studentService';
import StudentList from '../components/StudentList';
import StudentForm from '../components/StudentForm';
import { Student } from '../types/student';

export default function Home() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        const data = await getAllStudents();
        setStudents(data);
    };

    const handleSave = async (student: Omit<Student, 'id'>) => {
        if (selectedStudent) {
            await updateStudent(selectedStudent.id, student);
        } else {
            await createStudent(student);
        }
        fetchStudents();
        setSelectedStudent(null);
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
    };

    const handleDelete = async (id: number) => {
        await deleteStudent(id);
        fetchStudents();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Student Management</h1>
            <div className="p-4 border rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">{selectedStudent ? 'Edit Student' : 'Add Student'}</h2>
                <StudentForm student={selectedStudent} onSave={handleSave} />
            </div>
            <StudentList students={students} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
}