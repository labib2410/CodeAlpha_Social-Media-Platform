const multer = require('multer');
const path = require('path');

// تحديد مكان حفظ الملفات واسمها
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // مجلد الحفظ
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // اسم الملف
    }
});

// فلترة الملفات (اختياري)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
