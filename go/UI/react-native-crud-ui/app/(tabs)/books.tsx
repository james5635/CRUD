import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { BookService, Book } from '../../services/BookService';

export default function BooksScreen() {
    const [books, setBooks] = useState<Book[]>([]);
    const [newBook, setNewBook] = useState<Book>({ title: '', author: '', year: 0 });
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        setIsLoading(true);
        try {
            const data = await BookService.getBooks();
            setBooks(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load books. Please check your network connection and try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBook = async () => {
        if (!newBook.title || !newBook.author || !newBook.year) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const addedBook = await BookService.createBook(newBook);
            setBooks(prevBooks => [...prevBooks, addedBook]);
            setNewBook({ title: '', author: '', year: 0 });
            Alert.alert('Success', 'Book added successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add book. Please try again.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateBook = async () => {
        if (!editingBook || !editingBook.id) return;

        setIsSubmitting(true);
        try {
            const updatedBook = await BookService.updateBook(editingBook.id, editingBook);
            setBooks(prevBooks => 
                prevBooks.map(book => book.id === updatedBook.id ? updatedBook : book)
            );
            setEditingBook(null);
            Alert.alert('Success', 'Book updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update book. Please try again.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBook = (bookId: string) => {
        if (!bookId) {
            Alert.alert('Error', 'Invalid book ID');
            return;
        }

        Alert.alert(
            'Delete Book',
            'Are you sure you want to delete this book?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsSubmitting(true);
                            await BookService.deleteBook(bookId);
                            // Update local state only after successful deletion
                            setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
                        } catch (error: any) {
                            const errorMessage = error.response?.data?.error || 'Failed to delete book';
                            Alert.alert('Error', errorMessage);
                            console.error('Delete error:', error);
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const renderEditForm = (editingBook: Book) => (
        <View style={styles.editForm}>
            <TextInput
                style={styles.input}
                value={editingBook?.title || ''}
                onChangeText={(text) => setEditingBook(prev => prev ? { ...prev, title: text } : null)}
                editable={!isSubmitting}
            />
            <TextInput
                style={styles.input}
                value={editingBook?.author || ''}
                onChangeText={(text) => setEditingBook(prev => prev ? { ...prev, author: text } : null)}
                editable={!isSubmitting}
            />
            <TextInput
                style={styles.input}
                value={editingBook?.year?.toString() || ''}
                onChangeText={(text) => setEditingBook(prev => prev ? { ...prev, year: parseInt(text) || 0 } : null)}
                keyboardType="numeric"
                editable={!isSubmitting}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.saveButton, isSubmitting && styles.disabledButton]} 
                    onPress={handleUpdateBook}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Save</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setEditingBook(null)}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading books...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Book Management</Text>
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={newBook.title}
                    onChangeText={(text) => setNewBook({...newBook, title: text})}
                    editable={!isSubmitting}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Author"
                    value={newBook.author}
                    onChangeText={(text) => setNewBook({...newBook, author: text})}
                    editable={!isSubmitting}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Year"
                    value={newBook.year ? newBook.year.toString() : ''}
                    onChangeText={(text) => setNewBook({...newBook, year: parseInt(text) || 0})}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                />
                <TouchableOpacity 
                    style={[styles.addButton, isSubmitting && styles.disabledButton]} 
                    onPress={handleAddBook}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Add Book</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.booksList}>
                {books.map((book) => (
                    <View key={book.id} style={styles.bookItem}>
                        {editingBook?.id === book.id ? (
                            editingBook && renderEditForm(editingBook)
                        ) : (
                            <View>
                                <Text style={styles.bookTitle}>{book.title}</Text>
                                <Text style={styles.bookDetails}>by {book.author} ({book.year})</Text>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.button, styles.editButton]}
                                        onPress={() => setEditingBook({...book})}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.buttonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[
                                            styles.button, 
                                            styles.deleteButton,
                                            isSubmitting && styles.disabledButton
                                        ]}
                                        onPress={() => handleDeleteBook(book.id!)}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.buttonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    booksList: {
        flex: 1,
    },
    bookItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bookDetails: {
        color: '#666',
        marginVertical: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 10,
    },
    button: {
        padding: 8,
        borderRadius: 5,
        minWidth: 70,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#FFC107',
    },
    deleteButton: {
        backgroundColor: '#DC3545',
    },
    saveButton: {
        backgroundColor: '#28A745',
    },
    cancelButton: {
        backgroundColor: '#6C757D',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    editForm: {
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    disabledButton: {
        opacity: 0.6,
    },
});