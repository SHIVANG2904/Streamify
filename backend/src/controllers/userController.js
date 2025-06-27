const FriendRequest = require('../models/FriendRequest');
const Usermodel = require('../models/User');

module.exports.getRecommendedUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await Usermodel.find({
            //the main work of this was find those users who are not in the current user's friends list
            $and: [
                { _id: { $ne: currentUserId } },//exclude current user
                { _id: { $nin: currentUser.friends } },//exclude users who are already friends
                { isOnboarded: true }
            ]
        })
           res.status(200).json({ message: "Recommended users fetched successfully",  recommendedUsers});
    } catch (error) {
     console.log("Error fetching recommended users:", error.message);
     res.status(500).json({ message: "Error fetching recommended users" });   
    }
};

module.exports.getMyFriends = async (req, res) => {
    try {
        const user = await Usermodel.findById(req.user._id).select('friends').populate( 'friends', 'fullname profilePic nativelanguage learninglanguage');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Friends fetched successfully", friends: user.friends });
    } catch (error) {
        console.error("Error fetching friends:", error.message);
        res.status(500).json({ message: "Error fetching friends" });
    }
};

module.exports.sendFriendRequest = async (req, res) => {
    try{
        const myId = req.user._id;
        const { id: recipientId } = req.params;
        if (myId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }
        const recipient = await Usermodel.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found"});
        }
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ]
        });
        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already" });
        }
        //create friend request
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        });
        res.status(201).json({ message: "Friend request sent ", friendRequest });
    }
    catch (error) {
        console.error("Error sending friend request:", error.message);
        res.status(500).json({ message: "Error sending friend request",  });
    }
}

module.exports.acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        if(friendRequest.recipient.toString() !== req.user._id.toString()){
            return res.status(403).json({ message: "You are not authorized to accept this friend request" });
        }
        friendRequest.status = "accepted";
        await friendRequest.save();
        //add both users to each other's friends list
        //$addToSet ensures that the user is added to the array only if they are not already present
        await Usermodel.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });
        await Usermodel.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        });
        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error accepting friend request:", error.message);
        res.status(500).json({ message: "Error accepting friend request" });
    }
}

module.exports.getFriendRequests = async (req, res) => {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user._id,
            status: "pending"
        }).populate('sender', 'fullname profilePic nativelanguage learninglanguage');
        
        const acceptedReqs = await FriendRequest.find({
            sender: req.user._id,
            status: "accepted"
        }).populate('recipient', 'fullname profilePic');
        res.status(200).json({ message: "Friend requests fetched successfully", incomingReqs, acceptedReqs });
    } catch (error) {
        console.error("Error fetching friend requests:", error.message);
        res.status(500).json({ message: "Error fetching friend requests" });
    }
}

module.exports.getOutgoingFriendReqs = async (req, res) => {
    try {
        const outgoingReqs = await FriendRequest.find({
            sender: req.user._id,
            status: "pending"
        }).populate('recipient', 'fullname profilePicture nativelanguage learninglanguage');
        res.status(200).json({ message: "Outgoing friend requests fetched successfully", outgoingReqs });
    } catch (error) {
        console.error("Error fetching outgoing friend requests:", error.message);
        res.status(500).json({ message: "Error fetching outgoing friend requests" });
    }
}