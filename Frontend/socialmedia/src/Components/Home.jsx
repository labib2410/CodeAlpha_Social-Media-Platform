import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [newComments, setNewComments] = useState({});
    const currentUserId = parseInt(localStorage.getItem('userId'));
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`http://localhost:4008/api/posts/all?user_id=${currentUserId}`);
            setPosts(res.data.data);
        } catch (err) {
            console.error("Error fetching posts:", err);
        }
    };

    const handleLikeToggle = async (postId, isLiked) => {
        try {
            const endpoint = isLiked
                ? 'http://localhost:4008/api/likes/unlike'
                : 'http://localhost:4008/api/likes/addLike';

            const response = await axios.post(endpoint, {
                post_id: postId,
                user_id: currentUserId
            });

            if (response.data.success) {
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                is_liked_by_user: !isLiked,
                                like_count: isLiked
                                    ? Math.max(0, post.like_count - 1)
                                    : post.like_count + 1
                            }
                            : post
                    )
                );
            }
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

    const handleAddComment = async (postId) => {
        const content = newComments[postId]?.trim();
        if (!content) return;

        try {
            const res = await axios.post('http://localhost:4008/api/comments/addComment', {
                post_id: postId,
                user_id: currentUserId,
                content
            });

            if (res.data.success) {
                await fetchPosts();
                setNewComments(prev => ({ ...prev, [postId]: '' }));
            }
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };

    const handleToggleFollow = async (postUserId, isFollowing) => {
        try {
            const endpoint = isFollowing
                ? 'http://localhost:4008/api/follow/unfollow'
                : 'http://localhost:4008/api/follow/follow';

            const res = await axios.post(endpoint, {
                follower_id: currentUserId,
                following_id: postUserId
            });

            if (res.data.success) {
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.user_id === postUserId
                            ? { ...post, is_followed_by_user: !isFollowing }
                            : post
                    )
                );
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
        } finally {
            fetchPosts();
        }
    };

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4 fw-bold">Latest Posts</h2>
            <div className="row justify-content-center">
                {posts.map(post => (
                    <div key={post.id} className="col-12 col-sm-10 col-md-6 col-lg-4 mb-4 d-flex">
                        <div className="card shadow-lg w-100 d-flex flex-column">
                            <div className="card-body d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title mb-0 text-primary">{post.username}</h5>
                                    {post.post_user_id !== currentUserId && (
                                        <button
                                            className={`btn btn-sm ${post.is_following_post_owner ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                            onClick={() => handleToggleFollow(post.post_user_id, post.is_following_post_owner)}
                                        >
                                            {post.is_following_post_owner ? 'Unfollow' : 'Follow'}
                                        </button>
                                    )}
                                </div>

                                <p className="card-text text-secondary">{post.content}</p>

                                {post.image && (
                                    <img
                                        src={`http://localhost:4008/uploads/${post.image}`}
                                        className="img-fluid rounded mb-2"
                                        alt="Post"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )}

                                <p className="text-muted small mb-1"><strong>Email:</strong> {post.email}</p>
                                <p className="text-muted small"><strong>Likes:</strong> {post.like_count}</p>

                                {post.user_id !== currentUserId && (
                                    <button
                                        className={`btn ${post.is_liked_by_user ? 'btn-danger' : 'btn-outline-primary'} btn-sm mb-2`}
                                        onClick={() => handleLikeToggle(post.id, post.is_liked_by_user)}
                                    >
                                        {post.is_liked_by_user ? 'Unlike' : 'Like'}
                                    </button>
                                )}

                                {post.comments?.length > 0 && (
                                    <div className="mb-2">
                                        <hr />
                                        <h6 className="mb-2">Comments:</h6>
                                        <ul className="list-group list-group-flush">
                                            {post.comments.map(comment => (
                                                <li key={comment.id} className="list-group-item px-1 py-2 small">
                                                    <strong>{comment.username}:</strong> {comment.content}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="input-group input-group-sm mt-auto">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Add a comment..."
                                        value={newComments[post.id] || ''}
                                        onChange={(e) =>
                                            setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))
                                        }
                                    />
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleAddComment(post.id)}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            <div className="card-footer bg-light text-muted text-end small">
                                Posted at: {new Date(post.created_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
