const express = require('express');
const router = express.Router();
const { addLike, unlike, getLikes } = require('../Controllers/likesController');

router.post('/addLike', addLike);
router.post('/unlike', unlike);
router.get('/getLikes', getLikes);

module.exports = router;
