package main

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/widget"
)

func bookUI(win fyne.Window) fyne.CanvasObject {
	bookList := widget.NewList(
		func() int { return 0 },
		func() fyne.CanvasObject { return widget.NewLabel("") },
		func(i widget.ListItemID, o fyne.CanvasObject) {},
	)

	refresh := func() {
		books, err := fetchBooks()
		if err != nil {
			dialog.ShowError(err, win)
			return
		}
		bookList.Length = func() int { return len(books) }
		bookList.UpdateItem = func(i widget.ListItemID, o fyne.CanvasObject) {
			o.(*widget.Label).SetText(books[i].Title + " by " + books[i].Author)
		}
		bookList.OnSelected = func(i widget.ListItemID) {
			book := books[i]
			editForm(book, win, refresh)
		}
		bookList.Refresh()
	}

	addBtn := widget.NewButton("Add Book", func() {
		editForm(Book{}, win, refresh)
	})

	return container.NewBorder(nil, addBtn, nil, nil, bookList)
}

func editForm(book Book, win fyne.Window, refresh func()) {
	title := widget.NewEntry()
	author := widget.NewEntry()
	year := widget.NewEntry()

	title.SetText(book.Title)
	author.SetText(book.Author)
	if book.Year > 0 {
		year.SetText(fmt.Sprintf("%d", book.Year))
	}

	form := &widget.Form{
		Items: []*widget.FormItem{
			{Text: "Title", Widget: title},
			{Text: "Author", Widget: author},
			{Text: "Year", Widget: year},
		},
		OnSubmit: func() {
			book.Title = title.Text
			book.Author = author.Text
			fmt.Sscanf(year.Text, "%d", &book.Year)

			var err error
			if book.ID == "" {
				err = createBook(book)
			} else {
				err = updateBook(book)
			}

			if err != nil {
				dialog.ShowError(err, win)
			} else {
				refresh()
			}
			win.Close()
		},
		OnCancel: func() {
			win.Close()
		},
	}

	dialog.ShowCustom("Edit Book", "Close", form, win)
}
