// lib/main.dart
import 'package:flutter/material.dart';
import 'models/post.dart';
import 'services/api_service.dart';

void main() {
  runApp(MaterialApp(home: PostPage()));
}

class PostPage extends StatefulWidget {
  @override
  _PostPageState createState() => _PostPageState();
}

class _PostPageState extends State<PostPage> {
  List<Post> posts = [];
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  Post? selected;

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  void _loadPosts() async {
    posts = await ApiService.getPosts();
    setState(() {});
  }

  void _clearFields() {
    _titleController.clear();
    _contentController.clear();
    selected = null;
  }

  void _save() async {
    final post = Post(
      id: selected?.id ?? 0,
      title: _titleController.text,
      content: _contentController.text,
    );
    if (selected == null) {
      await ApiService.createPost(post);
    } else {
      await ApiService.updatePost(post);
    }
    _clearFields();
    _loadPosts();
  }

  void _edit(Post post) {
    setState(() {
      selected = post;
      _titleController.text = post.title;
      _contentController.text = post.content;
    });
  }

  void _delete(int id) async {
    await ApiService.deletePost(id);
    _loadPosts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Laravel CRUD')),
      body: Column(
        children: [
          TextField(controller: _titleController, decoration: InputDecoration(labelText: 'Title')),
          TextField(controller: _contentController, decoration: InputDecoration(labelText: 'Content')),
          Row(
            children: [
              ElevatedButton(onPressed: _save, child: Text(selected == null ? 'Create' : 'Update')),
              if (selected != null)
                TextButton(onPressed: _clearFields, child: Text('Cancel'))
            ],
          ),
          Expanded(
            child: ListView.builder(
              itemCount: posts.length,
              itemBuilder: (_, index) {
                final post = posts[index];
                return ListTile(
                  title: Text(post.title),
                  subtitle: Text(post.content),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(icon: Icon(Icons.edit), onPressed: () => _edit(post)),
                      IconButton(icon: Icon(Icons.delete), onPressed: () => _delete(post.id)),
                    ],
                  ),
                );
              },
            ),
          )
        ],
      ),
    );
  }
}
