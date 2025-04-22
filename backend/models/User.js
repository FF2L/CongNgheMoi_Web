const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  phone: { type: String, default: ""},
  address: { type: String, default: ""},
  avatarUrl: { type: String, default: "https://bookvexe.vn/wp-content/uploads/2023/04/chon-loc-25-avatar-facebook-mac-dinh-chat-nhat_2.jpg" },
  requestfriends: [
     {type: mongoose.Schema.Types.ObjectId, ref: 'User',default: null},
  ],
  friendRequestsReceived: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
  }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null}],
  
}, { timestamps: true });


module.exports = mongoose.model("User", UserSchema);
