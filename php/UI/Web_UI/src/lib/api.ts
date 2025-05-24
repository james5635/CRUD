import type { Post } from './types';

const BASE_URL = 'http://localhost:8000/api/posts';

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(BASE_URL);
  return res.json();
}

export async function createPost(data: Omit<Post, 'id'>): Promise<Post> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updatePost(id: number, data: Omit<Post, 'id'>): Promise<Post> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deletePost(id: number): Promise<void> {
  await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE'
  });
}
