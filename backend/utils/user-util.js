const User = require('../models/User')

const userUtil = {}

userUtil.locUserRaIdNameAvatar = (user) => {
    return {
      _id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  };
  userUtil.locUserRaIdNameAvatarRequestFriendFriend = (user) => {
    return {
      _id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      requestfriends: user.requestfriends,
      friends: user.friends,
      friendRequestsReceived: user.friendRequestsReceived,
    };
  };
  
  
module.exports = userUtil