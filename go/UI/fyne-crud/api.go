package main

import (
	"bytes"
	"encoding/json"
	"fmt"

	"net/http"
)

const baseURL = "http://localhost:8080/books"

type Book struct {
	ID     string `json:"id,omitempty"`
	Title  string `json:"title"`
	Author string `json:"author"`
	Year   int    `json:"year"`
}

func fetchBooks() ([]Book, error) {
	resp, err := http.Get(baseURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var books []Book
	err = json.NewDecoder(resp.Body).Decode(&books)
	return books, err
}

func createBook(book Book) error {
	data, _ := json.Marshal(book)
	_, err := http.Post(baseURL, "application/json", bytes.NewBuffer(data))
	return err
}

func updateBook(book Book) error {
	data, _ := json.Marshal(book)
	req, err := http.NewRequest(http.MethodPut, fmt.Sprintf("%s/%s", baseURL, book.ID), bytes.NewBuffer(data))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	_, err = client.Do(req)
	return err
}

func deleteBook(id string) error {
	req, err := http.NewRequest(http.MethodDelete, fmt.Sprintf("%s/%s", baseURL, id), nil)
	if err != nil {
		return err
	}
	client := &http.Client{}
	_, err = client.Do(req)
	return err
}
