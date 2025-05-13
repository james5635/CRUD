import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit {
  books: Book[] = [];
  newBook: Book = { title: '', author: '', year: 0 };
  editing: Book | null = null;

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks(): void {
    this.bookService.getBooks().subscribe(books => {
      this.books = books;
    });
  }

  addBook(): void {
    if (!this.newBook.title || !this.newBook.author || !this.newBook.year) return;
    
    this.bookService.createBook(this.newBook).subscribe(book => {
      this.books.push(book);
      this.newBook = { title: '', author: '', year: 0 };
    });
  }

  editBook(book: Book): void {
    this.editing = { ...book };
  }

  saveEdit(): void {
    if (!this.editing || !this.editing.id) return;
    
    this.bookService.updateBook(this.editing.id, this.editing).subscribe(() => {
      const index = this.books.findIndex(b => b.id === this.editing!.id);
      if (index !== -1) {
        this.books[index] = { ...this.editing! };
      }
      this.editing = null;
    });
  }

  deleteBook(id: string): void {
    if (!id) return;
    
    this.bookService.deleteBook(id).subscribe(() => {
      this.books = this.books.filter(book => book.id !== id);
    });
  }
}
