import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BooksComponent } from './books/books.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BooksComponent,
    HttpClientModule,
    FormsModule
  ],
  template: '<app-books></app-books>'
})
export class AppComponent {
  title = 'book-crud-ui';
}
