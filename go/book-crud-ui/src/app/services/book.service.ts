import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../models/book';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    private apiUrl = 'http://localhost:8080/books'; // URL to web API

    constructor(private http: HttpClient) {
    }

    getBooks(): Observable<Book[]> {
        return this.http.get<Book[]>(this.apiUrl);
    }
    createBook(book: Book): Observable<Book> {
        return this.http.post<Book>(this.apiUrl, book);
    }
    updateBook(id: string, book: Book): Observable<Book> {
        return this.http.put<Book>(`${this.apiUrl}/${id}`, book);
    }
    deleteBook(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }



}