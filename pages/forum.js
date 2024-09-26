import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../src/components/ui/navbar';
import '../src/forum/forumPage.css';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', author_id: 1 });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/posts/', newPost);
      setNewPost({ title: '', content: '', author_id: 1 });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="forum-container">
        <h1 className="forum-title">论坛</h1>
        
        <form onSubmit={handleSubmit} className="post-form">
          <input
            type="text"
            name="title"
            value={newPost.title}
            onChange={handleInputChange}
            placeholder="标题"
            required
          />
          <textarea
            name="content"
            value={newPost.content}
            onChange={handleInputChange}
            placeholder="内容"
            required
          ></textarea>
          <button type="submit">发布帖子</button>
        </form>

        <div className="post-list">
          {posts.map((post) => (
            <div key={post.id} className="post-item">
              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">{post.content}</p>
              <p className="post-meta">
                发布时间：{new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forum;