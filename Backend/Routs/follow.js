const express = require('express');
const router = express.Router();
const{followUser,unfollowUser,getFollowers,getFollowing}=require('../Controllers/followController');
router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);
router.get('/followers', getFollowers);
router.get('/following', getFollowing);

module.exports=router;