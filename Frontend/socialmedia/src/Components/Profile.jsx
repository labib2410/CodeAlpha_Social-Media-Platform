import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

export default function Profile() {
    const { isCollapsed } = useOutletContext();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPost, setNewPost] = useState({ content: '', image: '' });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4008';

    const fetchUserPosts = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError("User not found.");
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/posts/user/${userId}`);
            setPosts(response.data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowData = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            const [followersRes, followingRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/follow/followers?user_id=${userId}`),
                axios.get(`${API_BASE_URL}/api/follow/following?user_id=${userId}`)
            ]);

            setFollowers(followersRes.data.followers || []);
            setFollowing(followingRes.data.following || []);
        } catch (error) {
            console.error("Error fetching followers/following:", error);
        }
    };

    useEffect(() => {
        fetchUserPosts();
        fetchFollowData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPost(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setCreateError('File must be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setCreateError('Only image files allowed');
            return;
        }

        setSelectedFile(file);
        setCreateError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target.result);
            setNewPost(prev => ({ ...prev, image: '' }));
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setNewPost(prev => ({ ...prev, image: '' }));
        const fileInput = document.getElementById('imageFile');
        if (fileInput) fileInput.value = '';
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!newPost.content.trim()) {
            setCreateError('Content is required');
            return;
        }

        setCreateLoading(true);
        setCreateError(null);

        try {
            const formData = new FormData();
            formData.append('user_id', localStorage.getItem('userId'));
            formData.append('content', newPost.content.trim());

            // Add image file if selected
            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (newPost.image.trim()) {
                formData.append('imageUrl', newPost.image.trim());
            }

            const response = await axios.post(`${API_BASE_URL}/api/posts/add`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setNewPost({ content: '', image: '' });
                setSelectedFile(null);
                setImagePreview(null);
                setShowCreateForm(false);
                await fetchUserPosts();
            }
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to create post');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className={`container-fluid mt-4 ${isCollapsed ? 'px-2' : 'ps-md-5 pe-md-3'}`}>
            <div className="row mb-4 gy-3 justify-content-center">
                <div className="col-sm-6 col-md-4 col-lg-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">Followers ({followers.length})</h5>
                            <ul className="list-group list-group-flush">
                                {followers.length === 0
                                    ? <li className="list-group-item text-muted">No followers yet.</li>
                                    : followers.map(user => (
                                        <li key={user.id} className="list-group-item">
                                            {user.username} <small className="text-muted">({user.email})</small>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-md-4 col-lg-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">Following ({following.length})</h5>
                            <ul className="list-group list-group-flush">
                                {following.length === 0
                                    ? <li className="list-group-item text-muted">Not following anyone.</li>
                                    : following.map(user => (
                                        <li key={user.id} className="list-group-item">
                                            {user.username} <small className="text-muted">({user.email})</small>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold">My Posts</h4>
                <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? "Cancel" : "New Post"}
                </button>
            </div>

            {showCreateForm && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <form onSubmit={handleCreatePost}>
                            {createError && <div className="alert alert-danger">{createError}</div>}
                            <div className="mb-3">
                                <textarea
                                    name="content"
                                    className="form-control"
                                    placeholder="What's on your mind?"
                                    value={newPost.content}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                    type="file"
                                    id="imageFile"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                    type="url"
                                    name="image"
                                    className="form-control"
                                    placeholder="Or paste image URL"
                                    value={newPost.image}
                                    onChange={handleInputChange}
                                    disabled={selectedFile}
                                />
                            </div>

                            {imagePreview || newPost.image ? (
                                <div className="mb-3">
                                    <img
                                        src={imagePreview || newPost.image}
                                        alt="Preview"
                                        className="img-thumbnail"
                                        style={{ maxHeight: '200px' }}
                                    />
                                    <button className="btn btn-sm btn-danger ms-2" onClick={removeImage} type="button">×</button>
                                </div>
                            ) : null}

                            <button className="btn btn-success" type="submit" disabled={createLoading}>
                                {createLoading ? 'Creating...' : 'Create Post'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border" role="status" />
                </div>
            ) : error ? (
                <div className="alert alert-danger text-center">{error}</div>
            ) : posts.length === 0 ? (
                <div className="alert alert-info text-center">No posts yet.</div>
            ) : (
                <div className="row g-4">
                    {posts.map(post => (
                        <div className="col-sm-12 col-md-6 col-lg-4" key={post.id}>
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{post.username}</h5>
                                    <p className="card-text">{post.content}</p>


                                    <img
                                        src={`http://localhost:4008/uploads/${post.image}`}
                                        className="img-fluid rounded mb-2"
                                        alt="Post"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />


                                    <p className="text-muted small">Likes: {post.like_count}</p>

                                    {post.comments?.length > 0 && (
                                        <>
                                            <hr />
                                            <h6>Comments:</h6>
                                            <ul className="list-group">
                                                {post.comments.map(comment => (
                                                    <li key={comment.id} className="list-group-item">
                                                        <strong>{comment.username}:</strong> {comment.content}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                                <div className="card-footer text-muted small text-end">
                                    {new Date(post.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
