import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../src/components/ui/navbar';
import '../src/styles/forumPage.css';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '问题求助' });
  const [author, setAuthor] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const categories = ['全部', '问题求助', '改进意见', '交流分享', '其他'];
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user'));
    setAuthor(user.username);
    if (!isLoggedIn) {
      router.push('/login');
    }
    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/posts/', {
        params: { 
          category: selectedCategory !== '全部' ? selectedCategory : undefined,
          search: searchTerm
        }
      });
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
      await axios.post('http://localhost:8000/posts/', { ...newPost, author });
      setNewPost({ title: '', content: '', category: '问题求助' });
      setShowNewPostForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handlePostClick = async (postId) => {
    try {
      const postResponse = await axios.get(`http://localhost:8000/posts/${postId}`);
      setSelectedPost(postResponse.data);
      const commentsResponse = await axios.get(`http://localhost:8000/posts/${postId}/comments`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Error fetching post details or comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/posts/${selectedPost.id}/comments`, {
        content: newComment,
        author: author // 使用当前登录用户作为评论作者
      });
      setNewComment('');
      // 重新获取评论列表
      const commentsResponse = await axios.get(`http://localhost:8000/posts/${selectedPost.id}/comments`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/posts/${selectedPost.id}/comments/${commentId}/reply`, {
        content: replyContent,
        author: author,
        parent_id: commentId
      });
      setReplyContent('');
      setReplyingTo(null);
      // 重新获取评论列表
      const commentsResponse = await axios.get(`http://localhost:8000/posts/${selectedPost.id}/comments`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8000/posts/${selectedPost.id}/comments/${commentId}`);
      // 重新获取评论列表
      const commentsResponse = await axios.get(`http://localhost:8000/posts/${selectedPost.id}/comments`);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const closePostDetails = () => {
    setSelectedPost(null);
  };

  const toggleComment = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderComments = (comments, parentId = null, depth = 0) => {
    const filteredComments = comments.filter(comment => comment.parent_id === parentId);
    if (filteredComments.length === 0) return null;

    return (
      <div className={`comments-list depth-${depth}`}>
        {filteredComments.map((comment) => {
          const isExpanded = expandedComments[comment.id];
          const areRepliesExpanded = expandedReplies[comment.id];
          const shouldCollapse = comment.content.length > 200;
          const replies = renderComments(comments, comment.id, depth + 1);
          const hasReplies = comment.reply_count > 0;

          return (
            <div key={comment.id} className="comment">
              <div className="comment-author">{comment.author}</div>
              <div className={`comment-content ${shouldCollapse && !isExpanded ? 'collapsed' : ''}`}>
                {shouldCollapse && !isExpanded ? `${comment.content.substring(0, 200)}...` : comment.content}
              </div>
              {shouldCollapse && (
                <button className="toggle-comment" onClick={() => toggleComment(comment.id)}>
                  {isExpanded ? '收起' : '展开'}
                </button>
              )}
              <div className="comment-date">{new Date(comment.created_at).toLocaleString()}</div>
              <button onClick={() => setReplyingTo(comment.id)}>回复</button>
              {author === comment.author && (
                <button onClick={() => handleDeleteComment(comment.id)}>删除</button>
              )}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="reply-form">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="写下你的回复..."
                    required
                  />
                  <div className="reply-form-buttons">
                    <button type="submit">发表回复</button>
                    <button type="button" onClick={() => setReplyingTo(null)} className="cancel-button">取消</button>
                  </div>
                </form>
              )}
              {hasReplies && (
                <div>
                  <button onClick={() => toggleReplies(comment.id)}>
                    {areRepliesExpanded ? '收起回复' : `(${comment.reply_count})查看回复`}
                  </button>
                  {areRepliesExpanded && replies}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleDeletePost = async (postId, e) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    if (window.confirm('确定要删除这个帖子吗？')) {
      try {
        await axios.delete(`http://localhost:8000/posts/${postId}`, {
          data: { author: author }
        });
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('删除帖子失败，可能是因为你不是帖子的作者。');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="forum-container">
        <div className="custom-image-container">
          <img src="imgs/占位图片.jpeg" alt="自定义图片" className="custom-image" />
        </div>
        <div className="new-post-button-container">
          <button className="new-post-button" onClick={() => setShowNewPostForm(true)}>
            + 发布新帖
          </button>
        </div>
        {showNewPostForm && (
          <form onSubmit={handleSubmit} className="new-post-form">
            <input
              type="text"
              name="title"
              value={newPost.title}
              onChange={handleInputChange}
              placeholder="帖子标题"
              required
            />
            <textarea
              name="content"
              value={newPost.content}
              onChange={handleInputChange}
              placeholder="帖子内容"
              required
            />
            <div className="form-group">
              <label htmlFor="category">帖子类别：</label>
              <select
                id="category"
                name="category"
                value={newPost.category}
                onChange={handleInputChange}
                required
              >
                <option value="问题求助">问题求助</option>
                <option value="改进意见">改进意见</option>
                <option value="交流分享">交流分享</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <button type="submit">发布</button>
            <button type="button" onClick={() => setShowNewPostForm(false)}>取消</button>
          </form>
        )}
        <div className="filter-search-container">
          <div className="category-filter">
            <span>筛选类别：</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'active' : ''}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="搜索帖子标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={fetchPosts}>搜索</button>
          </div>
        </div>
        <div className="posts-container">
          <div className="post-header">
            <div className="post-title-header">
              帖子标题
              <button className="refresh-button" onClick={fetchPosts}>刷新</button>
            </div>
            <div className="post-category-header">类别</div>
            <div className="post-author-header">创建人</div>
            <div className="post-date-header">创建时间</div>
            <div className="post-actions-header">操作</div>
          </div>
          {posts.length > 0 ? (
            <ul className="post-list">
              {posts.map((post) => (
                <li key={post.id} className="post-item">
                  <div className="post-title" onClick={() => handlePostClick(post.id)}>{post.title}</div>
                  <div className="post-category">{post.category}</div>
                  <div className="post-author">{post.author || '匿名用户'}</div>
                  <div className="post-date">{new Date(post.created_at).toLocaleString()}</div>
                  <div className="post-actions">
                    {author === post.author && (
                      <button onClick={(e) => handleDeletePost(post.id, e)} className="delete-post-button">
                        删除
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-posts-message">暂时没有帖子</div>
          )}
          {selectedPost && (
            <div className="post-details-overlay">
              <div className="post-details">
                <h2>{selectedPost.title}</h2>
                <div className="post-details-content">
                  <div className="post-details-left">
                    <div className="post-author">{selectedPost.author || '匿名用户'}</div>
                    <div className="post-date">{new Date(selectedPost.created_at).toLocaleString()}</div>
                  </div>
                  <div className="post-details-right">
                    <div className="post-content">{selectedPost.content}</div>
                  </div>
                </div>
                <div className="comments-section">
                  <h3>评论</h3>
                  {renderComments(comments)}
                  <form onSubmit={handleCommentSubmit} className="comment-form">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="写下你的评论..."
                      required
                    />
                    <button type="submit">发表评论</button>
                  </form>
                </div>
                <button onClick={closePostDetails}>关闭</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;