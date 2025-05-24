#!/usr/bin/env php
<?php

const API_BASE = 'http://localhost:8000/api/posts';

function request(string $method, string $url, array $data = null): mixed {
    $opts = [
        'http' => [
            'method' => $method,
            'header' => ['Content-Type: application/json'],
            'ignore_errors' => true,
        ]
    ];

    if ($data !== null) {
        $opts['http']['content'] = json_encode($data);
    }

    $context = stream_context_create($opts);
    $result = file_get_contents($url, false, $context);
    return json_decode($result, true);
}

function listPosts() {
    $posts = request('GET', API_BASE);
    foreach ($posts as $post) {
        echo "[{$post['id']}] {$post['title']}\n  {$post['content']}\n\n";
    }
}

function createPost() {
    echo "Title: ";
    $title = trim(fgets(STDIN));
    echo "Content: ";
    $content = trim(fgets(STDIN));

    $res = request('POST', API_BASE, compact('title', 'content'));
    echo "Created post with ID: {$res['id']}\n";
}

function updatePost() {
    echo "ID to update: ";
    $id = trim(fgets(STDIN));
    echo "New Title: ";
    $title = trim(fgets(STDIN));
    echo "New Content: ";
    $content = trim(fgets(STDIN));

    $res = request('PUT', API_BASE . "/$id", compact('title', 'content'));
    echo "Updated post ID: {$res['id']}\n";
}

function deletePost() {
    echo "ID to delete: ";
    $id = trim(fgets(STDIN));
    $res = request('DELETE', API_BASE . "/$id");
    echo "Deleted.\n";
}

function menu() {
    echo "\n=== Post Manager ===\n";
    echo "1. List posts\n";
    echo "2. Create post\n";
    echo "3. Update post\n";
    echo "4. Delete post\n";
    echo "5. Exit\n";
    echo "Select option: ";

    return trim(fgets(STDIN));
}

// Main loop
while (true) {
    switch (menu()) {
        case '1': listPosts(); break;
        case '2': createPost(); break;
        case '3': updatePost(); break;
        case '4': deletePost(); break;
        case '5': exit(0);
        default: echo "Invalid option\n";
    }
}
