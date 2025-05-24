// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/post.dart';

class ApiService {
  static const String baseUrl = 'https://0d15-58-97-229-14.ngrok-free.app/api/posts';

  static Future<List<Post>> getPosts() async {
    final response = await http.get(Uri.parse(baseUrl));
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((e) => Post.fromJson(e)).toList();
  }

  static Future<void> createPost(Post post) async {
    await http.post(
      Uri.parse(baseUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(post.toJson()),
    );
  }

  static Future<void> updatePost(Post post) async {
    await http.put(
      Uri.parse('$baseUrl/${post.id}'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(post.toJson()),
    );
  }

  static Future<void> deletePost(int id) async {
    await http.delete(Uri.parse('$baseUrl/$id'));
  }
}
