const { getConnection } = require('../Config/db');

const addComment = async (req, res) => {
    try {
        const db = getConnection();
        const { user_id, post_id, content } = req.body;

        if (!user_id || !post_id || !content) {
            return res.status(400).json({
                success: false,
                message: 'user_id, post_id, and content are required'
            });
        }

        const query = `INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, NOW())`;
        const values = [user_id, post_id, content];

        const [result] = await db.execute(query, values);

        return res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            commentId: result.insertId
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while adding comment'
        });
    }
};
const getComments = async (req, res) => {
    try {
        const db = getConnection();
        const { post_id } = req.query;

        if (!post_id) {
            return res.status(400).json({
                success: false,
                message: 'post_id is required'
            });
        }

        const query = `
            SELECT comments.id, comments.content, comments.created_at, users.id as user_id, users.username
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE comments.post_id = ?
            ORDER BY comments.created_at DESC
        `;
        const [result] = await db.execute(query, [post_id]);

        return res.status(200).json({
            success: true,
            comments: result
        });

    } catch (error) {
        console.error('Error getting comments:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while getting comments'
        });
    }
};


module.exports = {
    addComment,
    getComments
};
