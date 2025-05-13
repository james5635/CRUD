package main

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
)

func main() {
	a := app.New()
	win := a.NewWindow("Book Library")
	win.SetContent(bookUI(win))
	win.Resize(fyne.NewSize(800, 800)) // Increased from 400x600 to 800x800
	win.ShowAndRun()
}
