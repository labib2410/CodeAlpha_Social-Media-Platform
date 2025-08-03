const express = require('express');
const router = express.Router();
const { addComment,getComments } = require('../Controllers/commentsController');


router.post('/addComment', addComment);
router.get('/getComments', getComments);


module.exports = router;