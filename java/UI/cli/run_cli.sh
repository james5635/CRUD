#!/bin/bash

# Make sure the Spring Boot application is running before executing this script.

# Navigate to the CLI project directory

# Compile and run the CLI application using Maven
echo "Compiling and running the CLI application..."
mvn compile exec:java
