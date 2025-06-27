const express = require('express');
const { protectRoute } = require('../middleware/auth.middleware');
const { getRecommendedUsers, getMyFriends, sendFriendRequest, acceptFriendRequest, getFriendRequests, getOutgoingFriendReqs } = require('../controllers/userController');
const router = express.Router();

//instead of this router.get('/', protectRoute, getRecommendedUsers);
router.use(protectRoute);//(Glocal middleware) apply to all routes in this router

router.get('/', getRecommendedUsers);
router.get('/friends', getMyFriends);

router.post('/friend-request/:id', sendFriendRequest);
router.put('/friend-request/:id/accept', acceptFriendRequest);
//todo reject friend request

router.get('/friend-requests', getFriendRequests); // Assuming you have a function to get friend requests
router.get('/outgoing-friend-requests', getOutgoingFriendReqs);

module.exports = router;