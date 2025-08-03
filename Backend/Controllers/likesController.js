const { getConnection } = require('../Config/db');
const jwt = require('jsonwebtoken');

// Middleware-like function to extract user ID from token
function getUserIdFromToken(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // استبدلها بنفس secret المستخدم في تسجيل الدخول
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

const addLike = async (req, res) => {
    try {
        const db = getConnection();
        const { user_id, post_id } = req.body; // Get user_id from request body

        if (!user_id || !post_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id and post_id are required',
            });
        }

        const checkQuery = `SELECT id FROM likes WHERE user_id = ? AND post_id = ?`;
        const [existingLike] = await db.execute(checkQuery, [user_id, post_id]);

        if (existingLike.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'You already liked this post',
            });
        }

        const insertQuery = `INSERT INTO likes (user_id, post_id) VALUES (?, ?)`;
        const [result] = await db.execute(insertQuery, [user_id, post_id]);

        return res.status(201).json({
            success: true,
            message: 'Like added successfully',
            likeId: result.insertId,
        });
    } catch (error) {
        console.error('Error liking the post:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while liking the post',
        });
    }
};

const unlike = async (req, res) => {
    try {
        const db = getConnection();
        const { user_id, post_id } = req.body; // Get user_id from request body

        if (!user_id || !post_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id and post_id are required',
            });
        }

        const checkQuery = `SELECT id FROM likes WHERE user_id = ? AND post_id = ?`;
        const [existingLike] = await db.execute(checkQuery, [user_id, post_id]);

        if (existingLike.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Like not found',
            });
        }

        const deleteQuery = `DELETE FROM likes WHERE user_id = ? AND post_id = ?`;
        await db.execute(deleteQuery, [user_id, post_id]);

        return res.status(200).json({
            success: true,
            message: 'Like removed successfully',
        });
    } catch (error) {
        console.error('Error unliking the post:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while unliking the post',
        });
    }
};
const getLikes = async (req, res) => {
    try {
        const db = getConnection();
        const { post_id } = req.query;

        if (!post_id) {
            return res.status(400).json({
                success: false,
                message: 'post_id is required',
            });
        }

        const query = `
            SELECT users.id, users.username, users.email
            FROM likes
            JOIN users ON likes.user_id = users.id
            WHERE likes.post_id = ?
        `;
        const [result] = await db.execute(query, [post_id]);

        return res.status(200).json({
            success: true,
            totalLikes: result.length,
            likedBy: result,
        });
    } catch (error) {
        console.error('Error getting likes:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while getting likes',
        });
    }
};

module.exports = {
    addLike,
    unlike,
    getLikes,
};
