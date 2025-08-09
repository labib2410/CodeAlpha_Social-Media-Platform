const { getConnection } = require('../Config/db');

const createPost = async (req, res) => {
    try {
        const { content,user_id } = req.body;
        const image = req.file ? req.file.filename : req.body.imageUrl || null;

        if (!user_id || !content) {
            return res.status(400).json({
                success: false,
                message: "user_id and content are required."
            });
        }

        const db = getConnection();
        const query = `INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)`;
        const [result] = await db.execute(query, [user_id, content, image]);

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            postId: result.insertId
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while creating post"
        });
    }
};


const getPosts = async (req, res) => {
    try {
        const db = getConnection(); // ✅ أضف هذا السطر
        const currentUserId = req.query.user_id;

        const postsQuery = `
            SELECT
                posts.id,
                posts.content,
                posts.image,
                posts.created_at,
                posts.user_id AS post_user_id,
                users.username,
                users.email,
                (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS like_count,
                EXISTS (
                    SELECT 1 FROM likes 
                    WHERE likes.post_id = posts.id AND likes.user_id = ?
                ) AS is_liked_by_user,
                EXISTS (
                    SELECT 1 FROM followers 
                    WHERE followers.follower_id = ? AND followers.following_id = posts.user_id
                ) AS is_following_post_owner
            FROM posts
            JOIN users ON users.id = posts.user_id
            WHERE posts.user_id != ?
            ORDER BY posts.created_at DESC
        `;

        const [posts] = await db.query(postsQuery, [currentUserId, currentUserId, currentUserId]);

        const postIds = posts.map(post => post.id);
        if (postIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const commentsQuery = `
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON u.id = c.user_id
            WHERE c.post_id IN (?)
            ORDER BY c.created_at ASC
        `;
        const [comments] = await db.query(commentsQuery, [postIds]);

        const postsWithComments = posts.map(post => {
            const postComments = comments.filter(comment => comment.post_id === post.id);
            return { ...post, comments: postComments };
        });

        return res.json({ success: true, data: postsWithComments });

    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getMyPosts = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const db = getConnection();

        const [posts] = await db.execute(`
            SELECT p.*, u.username 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `, [user_id]);

        const [comments] = await db.execute(`
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
        `);

        const [likes] = await db.execute(`SELECT post_id, COUNT(*) as like_count FROM likes GROUP BY post_id`);
        const [liked] = await db.execute(`SELECT post_id FROM likes WHERE user_id = ?`, [user_id]);
        const likedPosts = liked.map(p => p.post_id);

        const fullPosts = posts.map(post => {
            const postComments = comments.filter(c => c.post_id === post.id);
            const like = likes.find(l => l.post_id === post.id);
            return {
                ...post,
                like_count: like?.like_count || 0,
                is_liked_by_me: likedPosts.includes(post.id),
                comments: postComments
            };
        });

        return res.status(200).json({ success: true, data: fullPosts });
    } catch (error) {
        console.error('Error fetching my posts:', error);
        return res.status(500).json({ success: false, message: 'Error fetching my posts' });
    }
};

const getPostsByUserId = async (req, res) => {
    try {
        const user_id = req.params.userId;
        const current_user_id = req.user?.id || 0;
        const db = getConnection();

        const [posts] = await db.execute(`
            SELECT p.*, u.username,
                CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END AS is_following_post_owner
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN followers f ON f.follower_id = ? AND f.following_id = p.user_id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `, [current_user_id, user_id]);

        const [comments] = await db.execute(`
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.user_id = u.id
        `);

        const [likes] = await db.execute(`SELECT post_id, COUNT(*) as like_count FROM likes GROUP BY post_id`);
        const [liked] = await db.execute(`SELECT post_id FROM likes WHERE user_id = ?`, [current_user_id]);
        const likedPosts = liked.map(p => p.post_id);

        const fullPosts = posts.map(post => {
            const postComments = comments.filter(c => c.post_id === post.id);
            const like = likes.find(l => l.post_id === post.id);
            return {
                ...post,
                like_count: like?.like_count || 0,
                is_liked_by_me: likedPosts.includes(post.id),
                comments: postComments,
                is_following_post_owner: Boolean(post.is_following_post_owner)
            };
        });

        return res.status(200).json({ success: true, data: fullPosts });
    } catch (error) {
        console.error('Error fetching posts by user ID:', error);
        return res.status(500).json({ success: false, message: 'Error fetching posts by user ID' });
    }
};

module.exports = {
    createPost,
    getPosts,
    getMyPosts,
    getPostsByUserId
};
