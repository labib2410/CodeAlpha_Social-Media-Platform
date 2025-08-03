const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // المسار حسب مكان الملف

const {
    createPost,
    getPosts,
    getMyPosts,
    getPostsByUserId
} = require('../Controllers/postController');


router.post('/add',upload.single('image'), createPost);              // إضافة بوست جديد
router.get('/all', getPosts);                 // كل البوستات
router.get('/me', getMyPosts);                // بوستات المستخدم الحالي
router.get('/user/:userId', getPostsByUserId);      // بوستات أي مستخدم بدون توكن

module.exports = router;
