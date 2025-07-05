package com.mycrud;

import javax.swing.*;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            StudentCrudUi ui = new StudentCrudUi();
            ui.setVisible(true);
        });
    }
}
