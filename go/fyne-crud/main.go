package main

import (
	"fyne.io/fyne/v2/app"
)

func main() {
	a := app.New()
	win := a.NewWindow("Book Library")
	win.SetContent(bookUI(win))
	win.Resize(fyne.NewSize(400, 600))
	win.ShowAndRun()
}
