import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useOutletContext } from 'react-router-dom';

export default function CustomProfile() {
    const { isCollapsed } = useOutletContext();
    const { userId } = useParams();
    const [userPosts, setUserPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4008';

    const fetchUserData = async () => {
        try {
            const [postsRes, followersRes, followingRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/posts/user/${userId}`),
                axios.get(`${API_BASE_URL}/api/follow/followers?user_id=${userId}`),
                axios.get(`${API_BASE_URL}/api/follow/following?user_id=${userId}`)
            ]);

            setUserPosts(postsRes.data.data || []);
            setFollowers(followersRes.data.followers || []);
            setFollowing(followingRes.data.following || []);
        } catch (err) {
            setError('Failed to load user data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="alert alert-danger mt-3 text-center">{error}</div>;

    return (
        <div className="container my-4">
            {/* Followers / Following */}
            <div className="row g-3 justify-content-center">
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Followers ({followers.length})</h5>
                            <ul className="list-group list-group-flush">
                                {followers.length === 0 ? (
                                    <li className="list-group-item text-muted">No followers yet</li>
                                ) : (
                                    followers.map(user => (
                                        <li key={user.id} className="list-group-item">
                                            {user.username} <small className="text-muted">({user.email})</small>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Following ({following.length})</h5>
                            <ul className="list-group list-group-flush">
                                {following.length === 0 ? (
                                    <li className="list-group-item text-muted">Not following anyone</li>
                                ) : (
                                    following.map(user => (
                                        <li key={user.id} className="list-group-item">
                                            {user.username} <small className="text-muted">({user.email})</small>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts */}
            <div className="mt-5">
                <h2 className="mb-4 text-center">User's Posts</h2>
                {userPosts.length === 0 ? (
                    <div className="alert alert-info text-center">This user has no posts.</div>
                ) : (
                    <div className="row g-4">
                        {userPosts.map(post => (
                            <div
                                key={post.id}
                                className={`col-12 ${isCollapsed ? 'col-sm-6 col-lg-4' : 'col-md-6 col-lg-3'}`}
                            >
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{post.username}</h5>
                                        <p className="card-text">{post.content}</p>
                                        {post.image && (
                                            <img
                                                src={`http://localhost:4008/uploads/${post.image}`}
                                                className="img-fluid rounded mb-2"
                                                alt="Post"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <p className="text-muted small mt-auto">Likes: {post.like_count}</p>
                                        {post.comments && post.comments.length > 0 && (
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
                                    <div className="card-footer text-end text-muted small">
                                        Posted at: {new Date(post.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
