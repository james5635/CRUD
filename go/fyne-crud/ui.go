package main

import (
	"fmt"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/widget"
)

func bookUI(win fyne.Window) fyne.CanvasObject {
	var books []Book
	var err error
	books, err = fetchBooks()
	if err != nil {
		dialog.ShowError(err, win)
	}

	bookList := widget.NewList(
		func() int { return len(books) },
		func() fyne.CanvasObject {
			return container.NewPadded(container.NewHBox(
				widget.NewLabelWithStyle("", fyne.TextAlignLeading, fyne.TextStyle{Bold: true}),
				widget.NewLabel(""),
			))
		},
		func(i widget.ListItemID, o fyne.CanvasObject) {
			box := o.(*fyne.Container).Objects[0].(*fyne.Container)
			title := box.Objects[0].(*widget.Label)
			author := box.Objects[1].(*widget.Label)
			title.SetText(books[i].Title)
			author.SetText("  by " + books[i].Author)
		},
	)

	refresh := func() {
		books, err = fetchBooks()
		if err != nil {
			dialog.ShowError(err, win)
			return
		}
		bookList.Refresh()
	}

	bookList.OnSelected = func(i widget.ListItemID) {
		book := books[i]
		showBookOptions(book, win, refresh)
	}

	addBtn := widget.NewButton("Add Book", func() {
		editForm(Book{}, win, refresh)
	})

	content := container.NewBorder(nil, addBtn, nil, nil, bookList)
	sized := container.NewPadded(content)
	sized.Resize(fyne.NewSize(700, 600))
	return sized
}

func showBookOptions(book Book, win fyne.Window, refresh func()) {
	editBtn := widget.NewButton("Edit", func() {
		editForm(book, win, refresh)
	})
	deleteBtn := widget.NewButton("Delete", func() {
		dialog.ShowConfirm("Delete Book", "Are you sure you want to delete this book?", func(ok bool) {
			if ok {
				if err := deleteBook(book.ID); err != nil {
					dialog.ShowError(err, win)
					return
				}
				refresh()
			}
		}, win)
	})

	content := container.NewVBox(editBtn, deleteBtn)
	dialog.ShowCustom("Book Options", "Close", content, win)
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
			{Text: "Title", Widget: container.NewPadded(title)},
			{Text: "Author", Widget: container.NewPadded(author)},
			{Text: "Year", Widget: container.NewPadded(year)},
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
				dialog.ShowInformation("Success", "Book details updated successfully", win)
			}
		},
	}

	d := dialog.NewCustom("Edit Book", "Close", container.NewPadded(form), win)
	d.Resize(fyne.NewSize(500, 300))
	d.Show()
}
