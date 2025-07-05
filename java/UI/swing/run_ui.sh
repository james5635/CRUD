#!/bin/bash
mvn clean package
java -jar target/swing-ui-1.0-SNAPSHOT-jar-with-dependencies.jar
