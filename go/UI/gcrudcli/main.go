package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

type Book struct {
	ID     interface{} `json:"id,omitempty"`
	Title  string      `json:"title"`
	Author string      `json:"author"`
	Year   int         `json:"year"`
}

const baseURL = "http://localhost:8080"

// Color outputs
var successColor = color.New(color.FgGreen).SprintFunc()
var errorColor = color.New(color.FgRed).SprintFunc()
var infoColor = color.New(color.FgCyan).SprintFunc()
var headerColor = color.New(color.FgYellow).SprintFunc()

func checkResponse(resp *http.Response) error {
	if resp.StatusCode >= 400 {
		var errResp struct {
			Error string `json:"error"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
			// If we can't decode the error response, return the status
			return fmt.Errorf("%s", resp.Status)
		}
		// Return the server's error message
		return fmt.Errorf("%s", errResp.Error)
	}
	return nil
}

func getStringInput(label string, defaultValue string) (string, error) {
	fmt.Print(label + ": ")
	var input string
	reader := bufio.NewReader(os.Stdin)
	input, err := reader.ReadString('\n')
	if err != nil {
		return "", err
	}
	input = strings.TrimSpace(input)
	if input == "" && defaultValue != "" {
		return defaultValue, nil
	}
	return input, nil
}

func getIntInput(label string, defaultValue int) (int, error) {
	input, err := getStringInput(label, strconv.Itoa(defaultValue))
	if err != nil {
		return 0, err
	}

	num, err := strconv.Atoi(input)
	if err != nil {
		return 0, fmt.Errorf("please enter a valid number")
	}
	return num, nil
}

func getValidBookID(prompt string) (string, error) {
	id, err := getStringInput(prompt, "")
	if err != nil {
		return "", err
	}

	id = strings.TrimSpace(id)
	if id == "" {
		fmt.Println(errorColor("Error: Book ID cannot be empty"))
		return "", fmt.Errorf("empty ID")
	}

	// Check if book exists
	resp, err := http.Get(fmt.Sprintf("%s/books/%s", baseURL, id))
	if err != nil {
		fmt.Println(errorColor("❌ Error: Could not verify book ID. Server may be down."))
		return "", fmt.Errorf("server down")
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		fmt.Println(errorColor("❌ Error: Book not found."))
		fmt.Println(infoColor("💡 Hint: Use the 'fetch' command to see available book IDs."))
		return "", fmt.Errorf("not found")
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Println(errorColor("❌ Error: Invalid book ID or server error"))
		return "", fmt.Errorf("server error")
	}

	return id, nil
}

var rootCmd = &cobra.Command{
	Use:   "gcrudcli",
	Short: infoColor("A CLI for managing books"),
	Long: infoColor(`A Command Line Interface (CLI) application for managing books.
This application allows you to create, read, update, and delete books from the library database.`),
}

var fetchCmd = &cobra.Command{
	Use:   "fetch",
	Short: infoColor("Fetch all books"),
	Long:  infoColor(`Fetch retrieves all books from the database and displays them.`),
	Args:  cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		resp, err := http.Get(baseURL + "/books")
		if err != nil {
			fmt.Println(errorColor("❌ Error fetching books:", err))
			return
		}
		defer resp.Body.Close()

		if err := checkResponse(resp); err != nil {
			fmt.Println(errorColor("❌ Error:", err))
			return
		}

		var books []Book
		if err := json.NewDecoder(resp.Body).Decode(&books); err != nil {
			fmt.Println(errorColor("❌ Error decoding response:", err))
			return
		}

		if len(books) == 0 {
			fmt.Println(infoColor("📚 No books found"))
			return
		}

		for _, book := range books {
			fmt.Printf("%s\n", headerColor("📖 Book Details:"))
			fmt.Printf("🔑 ID: %s\n", infoColor(book.ID))
			fmt.Printf("📕 Title: %s\n", infoColor(book.Title))
			fmt.Printf("✍️  Author: %s\n", infoColor(book.Author))
			fmt.Printf("📅 Year: %d\n\n", book.Year)
		}
	},
}

var createCmd = &cobra.Command{
	Use:   "create",
	Short: infoColor("Create a new book"),
	Long: infoColor(`Create adds a new book to the database with the specified title, author, and year.
Example: gcrudcli create --title "Book Title" --author "Author Name" --year 2024`),
	Args: cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		title, _ := cmd.Flags().GetString("title")
		author, _ := cmd.Flags().GetString("author")
		year, _ := cmd.Flags().GetInt("year")

		var err error
		if title == "" {
			title, err = getStringInput("📕 Enter book title", "")
			if err != nil {
				fmt.Println(errorColor("❌ Error getting title:", err))
				return
			}
		}

		if author == "" {
			author, err = getStringInput("✍️  Enter book author", "")
			if err != nil {
				fmt.Println(errorColor("❌ Error getting author:", err))
				return
			}
		}

		if year == 0 {
			year, err = getIntInput("📅 Enter publication year", time.Now().Year())
			if err != nil {
				fmt.Println(errorColor("❌ Error getting year:", err))
				return
			}
		}

		book := Book{
			Title:  title,
			Author: author,
			Year:   year,
		}

		jsonData, err := json.Marshal(book)
		if err != nil {
			fmt.Println(errorColor("❌ Error encoding book data:", err))
			return
		}

		resp, err := http.Post(baseURL+"/books", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Println(errorColor("❌ Error creating book:", err))
			return
		}
		defer resp.Body.Close()

		if err := checkResponse(resp); err != nil {
			fmt.Println(errorColor("❌ Error:", err))
			return
		}

		var createdBook Book
		if err := json.NewDecoder(resp.Body).Decode(&createdBook); err != nil {
			fmt.Println(errorColor("❌ Error decoding response:", err))
			return
		}

		fmt.Printf("%s\n", successColor("✨ Book created successfully:"))
		fmt.Printf("🔑 ID: %s\n", infoColor(createdBook.ID))
		fmt.Printf("📕 Title: %s\n", infoColor(createdBook.Title))
		fmt.Printf("✍️  Author: %s\n", infoColor(createdBook.Author))
		fmt.Printf("📅 Year: %d\n", createdBook.Year)
	},
}

var updateCmd = &cobra.Command{
	Use:   "update",
	Short: infoColor("Update an existing book"),
	Long: infoColor(`Update modifies an existing book in the database with the specified ID.
Example: gcrudcli update --id <book-id> --title "New Title" --author "New Author" --year 2024`),
	Args: cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		id, _ := cmd.Flags().GetString("id")
		title, _ := cmd.Flags().GetString("title")
		author, _ := cmd.Flags().GetString("author")
		year, _ := cmd.Flags().GetInt("year")

		var err error

		// Handle ID validation
		if id == "" {
			id, err = getValidBookID("🔑 Enter book ID")
			if err != nil {
				return // Don't print error message since getValidBookID already did
			}
		} else {
			// Check if book exists when ID is provided via flag
			resp, err := http.Get(fmt.Sprintf("%s/books/%s", baseURL, id))
			if err != nil {
				fmt.Println(errorColor("❌ Error: Could not verify book ID. Server may be down."))
				return
			}
			resp.Body.Close()

			if resp.StatusCode == http.StatusNotFound {
				fmt.Println(errorColor("❌ Error: Book not found."))
				fmt.Println(infoColor("💡 Hint: Use the 'fetch' command to see available book IDs."))
				return
			}

			if resp.StatusCode != http.StatusOK {
				fmt.Println(errorColor("❌ Error: Invalid book ID or server error"))
				return
			}
		}

		// Get update details
		if title == "" {
			title, err = getStringInput("📕 Enter new title", "")
			if err != nil {
				fmt.Println(errorColor("❌ Error getting title:", err))
				return
			}
			title = strings.TrimSpace(title)
			if title == "" {
				fmt.Println(errorColor("❌ Error: Title cannot be empty"))
				return
			}
		}

		if author == "" {
			author, err = getStringInput("✍️  Enter new author", "")
			if err != nil {
				fmt.Println(errorColor("❌ Error getting author:", err))
				return
			}
			author = strings.TrimSpace(author)
			if author == "" {
				fmt.Println(errorColor("❌ Error: Author cannot be empty"))
				return
			}
		}

		if year == 0 {
			year, err = getIntInput("📅 Enter new publication year", time.Now().Year())
			if err != nil {
				fmt.Println(errorColor("❌ Error getting year:", err))
				return
			}
			if year <= 0 {
				fmt.Println(errorColor("❌ Error: Year must be a positive number"))
				return
			}
		}

		updatedBook := Book{
			Title:  title,
			Author: author,
			Year:   year,
		}

		jsonData, err := json.Marshal(updatedBook)
		if err != nil {
			fmt.Println(errorColor("❌ Error encoding book data:", err))
			return
		}

		req, err := http.NewRequest(http.MethodPut, fmt.Sprintf("%s/books/%s", baseURL, id), bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Println(errorColor("❌ Error creating request:", err))
			return
		}
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Println(errorColor("❌ Error updating book:", err))
			return
		}
		defer resp.Body.Close()

		if err := checkResponse(resp); err != nil {
			fmt.Println(errorColor("❌ Error:", err))
			return
		}

		fmt.Printf("\n%s\n", successColor("✨ Book updated successfully:"))
		fmt.Printf("🔑 ID: %s\n", infoColor(id))
		fmt.Printf("📕 Title: %s\n", infoColor(updatedBook.Title))
		fmt.Printf("✍️  Author: %s\n", infoColor(updatedBook.Author))
		fmt.Printf("📅 Year: %d\n", updatedBook.Year)
	},
}

var deleteCmd = &cobra.Command{
	Use:   "delete",
	Short: infoColor("Delete a book"),
	Long: infoColor(`Delete removes a book from the database with the specified ID.
Example: gcrudcli delete --id <book-id>`),
	Args: cobra.NoArgs,
	Run: func(cmd *cobra.Command, args []string) {
		id, _ := cmd.Flags().GetString("id")
		var err error

		if id != "" {
			// Check if book exists when ID is provided via flag
			resp, err := http.Get(fmt.Sprintf("%s/books/%s", baseURL, id))
			if err != nil {
				fmt.Println(errorColor("❌ Error: Could not verify book ID. Server may be down."))
				return
			}
			resp.Body.Close()

			if resp.StatusCode == http.StatusNotFound {
				fmt.Println(errorColor("❌ Error: Book not found."))
				fmt.Println(infoColor("💡 Hint: Use the 'fetch' command to see available book IDs."))
				return
			}

			if resp.StatusCode != http.StatusOK {
				fmt.Println(errorColor("❌ Error: Invalid book ID or server error"))
				return
			}
		} else {
			id, err = getValidBookID("🔑 Enter book ID to delete")
			if err != nil {
				return // Don't show error message since getValidBookID already did
			}
		}

		req, err := http.NewRequest(http.MethodDelete, fmt.Sprintf("%s/books/%s", baseURL, id), nil)
		if err != nil {
			fmt.Println(errorColor("❌ Error creating request:", err))
			return
		}

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Println(errorColor("❌ Error deleting book:", err))
			return
		}
		defer resp.Body.Close()

		if err := checkResponse(resp); err != nil {
			fmt.Println(errorColor("❌ Error:", err))
			return
		}

		fmt.Printf("%s %s %s\n", successColor("🗑️  Book with ID"), infoColor(id), successColor("deleted successfully ✨"))
	},
}

func init() {
	rootCmd.AddCommand(fetchCmd, createCmd, updateCmd, deleteCmd)

	// Add flags for create command
	createCmd.Flags().String("title", "", "Title of the book")
	createCmd.Flags().String("author", "", "Author of the book")
	createCmd.Flags().Int("year", 0, "Publication year of the book")

	// Add flags for update command
	updateCmd.Flags().String("id", "", "ID of the book to update")
	updateCmd.Flags().String("title", "", "New title of the book")
	updateCmd.Flags().String("author", "", "New author of the book")
	updateCmd.Flags().Int("year", 0, "New publication year of the book")

	// Add flags for delete command
	deleteCmd.Flags().String("id", "", "ID of the book to delete")
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(errorColor(err))
		os.Exit(1)
	}
}
