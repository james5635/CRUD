CC=gcc
CFLAGS=$(shell pkg-config --cflags gtk4 json-glib-1.0 )
LIBS=$(shell pkg-config --libs gtk4) -lcurl -ljson-glib-1.0

TARGET=gtk_crud_app

all: $(TARGET)

$(TARGET): main.c
	$(CC) -o $(TARGET) main.c $(CFLAGS) $(LIBS)

clean:
	rm -f $(TARGET)
