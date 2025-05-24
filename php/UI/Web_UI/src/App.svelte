<script lang="ts">
  import { onMount } from 'svelte';
  import type { Post } from './lib/types';
  import {
    getPosts,
    createPost,
    updatePost,
    deletePost
  } from './lib/api';

  let posts: Post[] = [];
  let form: Omit<Post, 'id'> = { title: '', content: '' };
  let editing: Post | null = null;

  async function load() {
    posts = await getPosts();
  }

  async function submit() {
    if (editing) {
      await updatePost(editing.id, form);
      editing = null;
    } else {
      await createPost(form);
    }
    form = { title: '', content: '' };
    await load();
  }

  function edit(post: Post) {
    form = { title: post.title, content: post.content };
    editing = post;
  }

  async function remove(id: number) {
    if (confirm('Delete this post?')) {
      await deletePost(id);
      await load();
    }
  }

  onMount(load);
</script>

<main>
  <h1>Posts CRUD (Svelte + TypeScript)</h1>

  <form on:submit|preventDefault={submit}>
    <input bind:value={form.title} placeholder="Title" required />
    <textarea bind:value={form.content} placeholder="Content" required></textarea>
    <button type="submit">{editing ? 'Update' : 'Create'}</button>
    {#if editing}
      <button type="button" on:click={() => { form = { title: '', content: '' }; editing = null; }}>
        Cancel
      </button>
    {/if}
  </form>

  <hr />

  {#each posts as post}
    <div class="post">
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <button on:click={() => edit(post)}>Edit</button>
      <button on:click={() => remove(post.id)}>Delete</button>
    </div>
  {/each}
</main>

<style>
  main {
    max-width: 600px;
    margin: auto;
    padding: 1rem;
    font-family: sans-serif;
  }

  form input, form textarea {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .post {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 6px;
  }

  button {
    margin-right: 0.5rem;
  }
</style>
