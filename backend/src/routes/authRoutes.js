const express = require('express');
const router = express.Router();
const {login, signup, logout, onboard} = require('../controllers/authController');
const { protectRoute } = require('../middleware/auth.middleware');

router.post('/login',login);
router.post('/signup', signup);
router.post('/logout', logout);
router.post('/onboarding',protectRoute, onboard)

//todo forget password
//reset password
//todo email verification

//check if user is logged in or not
router.get('/me', protectRoute, async (req, res) => {
    res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user: req.user,//this user is use in the frontend
    });
})

module.exports = router;