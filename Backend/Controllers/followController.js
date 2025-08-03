const {getConnection}=require('../Config/db');

const followUser = async (req, res) => {
    try {
        const db = getConnection();
        const { follower_id, following_id } = req.body;

        if (!follower_id || !following_id) {
            return res.status(400).json({
                success: false,
                message: 'follower_id and following_id are required'
            });
        }

        // تحقق إذا كان الفولور موجود بالفعل
        const checkQuery = `SELECT id FROM followers WHERE follower_id = ? AND following_id = ?`;
        const [existing] = await db.execute(checkQuery, [follower_id, following_id]);

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'You are already following this user'
            });
        }

        const query = `INSERT INTO followers (follower_id, following_id) VALUES (?, ?)`;
        const values = [follower_id, following_id];

        const [result] = await db.execute(query, values);

        return res.status(201).json({
            success: true,
            message: 'Followed successfully',
            followId: result.insertId
        });

    } catch (error) {
        console.error('Error following user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while following user'
        });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const db = getConnection();
        const { follower_id, following_id } = req.body;

        if (!follower_id || !following_id) {
            return res.status(400).json({
                success: false,
                message: 'follower_id and following_id are required'
            });
        }

        // تحقق إذا كان الفولور موجود
        const checkQuery = `SELECT id FROM followers WHERE follower_id = ? AND following_id = ?`;
        const [existing] = await db.execute(checkQuery, [follower_id, following_id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Follow relation not found'
            });
        }

        const deleteQuery = `DELETE FROM followers WHERE follower_id = ? AND following_id = ?`;
        await db.execute(deleteQuery, [follower_id, following_id]);

        return res.status(200).json({
            success: true,
            message: 'Unfollowed successfully'
        });

    } catch (error) {
        console.error('Error unfollowing user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while unfollowing user'
        });
    }
};

const getFollowers = async (req, res) => {
    try {
        const db = getConnection();
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const query = `
            SELECT users.id, users.username, users.email
            FROM followers
            JOIN users ON followers.follower_id = users.id
            WHERE followers.following_id = ?
        `;

        const [result] = await db.execute(query, [user_id]);

        return res.status(200).json({
            success: true,
            followers: result
        });

    } catch (error) {
        console.error('Error getting followers:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while getting followers'
        });
    }
};

const getFollowing = async (req, res) => {
    try {
        const db = getConnection();
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const query = `
            SELECT users.id, users.username, users.email
            FROM followers
            JOIN users ON followers.following_id = users.id
            WHERE followers.follower_id = ?
        `;

        const [result] = await db.execute(query, [user_id]);

        return res.status(200).json({
            success: true,
            following: result
        });

    } catch (error) {
        console.error('Error getting following:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while getting following'
        });
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
};
