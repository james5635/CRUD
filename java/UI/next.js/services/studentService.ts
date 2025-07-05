import axios from 'axios';
import { Student } from '../types/student';

const API_URL = 'http://localhost:8080/students';

export const getAllStudents = async (): Promise<Student[]> => {
    const response = await axios.get<Student[]>(API_URL);
    return response.data;
};

export const getStudentById = async (id: number): Promise<Student> => {
    const response = await axios.get<Student>(`${API_URL}/${id}`);
    return response.data;
};

export const createStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
    const response = await axios.post<Student>(API_URL, student);
    return response.data;
};

export const updateStudent = async (id: number, student: Omit<Student, 'id'>): Promise<Student> => {
    const response = await axios.put<Student>(`${API_URL}/${id}`, student);
    return response.data;
};

export const deleteStudent = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};
