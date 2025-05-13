import axios from 'axios';

export interface Book {
    id?: string;
    _id?: string;
    title: string;
    author: string;
    year: number;
}

// Make sure your Go server is running on this IP and port
const BASE_URL = 'http://192.168.100.34:8080';
const API_URL = `${BASE_URL}/books`;

// Add axios interceptor for logging
axios.interceptors.request.use(request => {
    console.log('Starting Request:', request.method, request.url);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.data);
        return response;
    },
    error => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export const BookService = {
    getBooks: async (): Promise<Book[]> => {
        try {
            const response = await axios.get(API_URL);
            return response.data.map((book: Book) => ({
                ...book,
                id: book._id || book.id // Handle both id formats
            }));
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    },

    createBook: async (book: Book): Promise<Book> => {
        try {
            const response = await axios.post(API_URL, book);
            return {
                ...response.data,
                id: response.data._id || response.data.id
            };
        } catch (error) {
            console.error('Error creating book:', error);
            throw error;
        }
    },

    updateBook: async (id: string, book: Book): Promise<Book> => {
        try {
            // Remove trailing slash if present
            const url = `${API_URL}/${id}`.replace(/\/+$/, '');
            const response = await axios.put(url, book);
            return {
                ...response.data,
                id: response.data._id || response.data.id
            };
        } catch (error) {
            console.error('Error updating book:', error);
            throw error;
        }
    },

    deleteBook: async (id: string): Promise<void> => {
        try {
            // Remove trailing slash if present
            const url = `${API_URL}/${id}`.replace(/\/+$/, '');
            const response = await axios.delete(url);
            if (response.status !== 200) {
                throw new Error(response.data?.error || 'Failed to delete book');
            }
        } catch (error: any) {
            console.error('Error deleting book:', error.response?.data?.error || error.message);
            throw error;
        }
    }
};