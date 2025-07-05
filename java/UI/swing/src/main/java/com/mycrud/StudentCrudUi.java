package com.mycrud;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.io.IOException;
import java.util.List;

public class StudentCrudUi extends JFrame {

    private final HttpService httpService = new HttpService();
    private final JTable table;
    private final DefaultTableModel tableModel;

    public StudentCrudUi() {
        setTitle("Student CRUD");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        tableModel = new DefaultTableModel(new Object[]{"ID", "Name", "Email"}, 0);
        table = new JTable(tableModel);
        loadStudents();

        JScrollPane scrollPane = new JScrollPane(table);
        add(scrollPane, BorderLayout.CENTER);

        JPanel panel = new JPanel();
        JButton addButton = new JButton("Add");
        JButton updateButton = new JButton("Update");
        JButton deleteButton = new JButton("Delete");
        panel.add(addButton);
        panel.add(updateButton);
        panel.add(deleteButton);
        add(panel, BorderLayout.SOUTH);

        addButton.addActionListener(e -> addStudent());
        updateButton.addActionListener(e -> updateStudent());
        deleteButton.addActionListener(e -> deleteStudent());
    }

    private void loadStudents() {
        try {
            List<Student> students = httpService.getAllStudents();
            tableModel.setRowCount(0);
            for (Student student : students) {
                tableModel.addRow(new Object[]{student.getId(), student.getName(), student.getEmail()});
            }
        } catch (IOException | InterruptedException ex) {
            ex.printStackTrace();
            JOptionPane.showMessageDialog(this, "Error loading students: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void addStudent() {
        JTextField nameField = new JTextField();
        JTextField emailField = new JTextField();
        Object[] message = {
                "Name:", nameField,
                "Email:", emailField
        };
        int option = JOptionPane.showConfirmDialog(this, message, "Add Student", JOptionPane.OK_CANCEL_OPTION);
        if (option == JOptionPane.OK_OPTION) {
            try {
                Student student = new Student(nameField.getText(), emailField.getText());
                httpService.createStudent(student);
                loadStudents();
            } catch (IOException | InterruptedException ex) {
                ex.printStackTrace();
                JOptionPane.showMessageDialog(this, "Error adding student: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void updateStudent() {
        int selectedRow = table.getSelectedRow();
        if (selectedRow >= 0) {
            Long id = (Long) tableModel.getValueAt(selectedRow, 0);
            String name = (String) tableModel.getValueAt(selectedRow, 1);
            String email = (String) tableModel.getValueAt(selectedRow, 2);

            JTextField nameField = new JTextField(name);
            JTextField emailField = new JTextField(email);
            Object[] message = {
                    "Name:", nameField,
                    "Email:", emailField
            };
            int option = JOptionPane.showConfirmDialog(this, message, "Update Student", JOptionPane.OK_CANCEL_OPTION);
            if (option == JOptionPane.OK_OPTION) {
                try {
                    Student student = new Student(nameField.getText(), emailField.getText());
                    httpService.updateStudent(id, student);
                    loadStudents();
                } catch (IOException | InterruptedException ex) {
                    ex.printStackTrace();
                    JOptionPane.showMessageDialog(this, "Error updating student: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                }
            }
        } else {
            JOptionPane.showMessageDialog(this, "Please select a student to update.", "Warning", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void deleteStudent() {
        int selectedRow = table.getSelectedRow();
        if (selectedRow >= 0) {
            Long id = (Long) tableModel.getValueAt(selectedRow, 0);
            int option = JOptionPane.showConfirmDialog(this, "Are you sure you want to delete this student?", "Confirm Deletion", JOptionPane.YES_NO_OPTION);
            if (option == JOptionPane.YES_OPTION) {
                try {
                    httpService.deleteStudent(id);
                    loadStudents();
                } catch (IOException | InterruptedException ex) {
                    ex.printStackTrace();
                    JOptionPane.showMessageDialog(this, "Error deleting student: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                }
            }
        } else {
            JOptionPane.showMessageDialog(this, "Please select a student to delete.", "Warning", JOptionPane.WARNING_MESSAGE);
        }
    }
}
