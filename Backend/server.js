require('dotenv').config();
const express = require('express');
const app = express();
const cors=require('cors');
const userRoutes = require('./Routs/users');
const postsRoutes = require('./Routs/posts');
const likesRoutes = require('./Routs/likes');
const commentsRouts = require('./Routs/comments');
const followRoutes = require('./Routs/follow');
const connectDB = require('./Config/db');
// الاتصال بقاعدة البيانات
connectDB();
// إعدادات عامة
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// ربط الراوتات
app.use('/api/users', userRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRouts);
app.use('/api/likes', likesRoutes);
app.use('/api/follow', followRoutes);
// تشغيل السيرفر
const PORT = process.env.PORT || 4008;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
