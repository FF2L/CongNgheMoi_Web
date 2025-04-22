const User = require("../models/User");
const UserUtil = require("../utils/user-util");

module.exports = (io, socket) => {

    const xuLyCallBack = (callback, status, msg, data = null) => {
    if (typeof callback === 'function') {
      callback({ status, msg, data });
    }
  };

    socket.on('request-friend', async ({ userId, text }, callback) => { //userId của người muốn nhận kết bạnbạn
        try {
          const userIdDaDangNhap = socket.user._id;
          const userNhanKetBan = await User.findById(userId.toString());
      
          const isFriend = userNhanKetBan.friends.includes(userIdDaDangNhap.toString());
          const isReqfriend = userNhanKetBan.requestfriends.some(
            (reqfriend) => reqfriend.userId.toString() === userIdDaDangNhap.toString()
          );
      
          if (isFriend) {
            return callback({ code: 3, user: UserUtil.locUserRaIdNameAvatar(userNhanKetBan) });
          }
      
          if (isReqfriend) {
            return callback({ code: 2, user: UserUtil.locUserRaIdNameAvatar(userNhanKetBan) });
          }
      
          // Thêm lời mời
          userNhanKetBan.requestfriends.push({ userId: userIdDaDangNhap, text: text || "" });
          await userNhanKetBan.save();
      
          io.to(userId.toString()).emit('friend-requested', {
            user: UserUtil.locUserRaIdNameAvatar(socket.user),
          });
      
          return callback({ code: 1 });
      
        } catch (err) {
          console.error('Lỗi gửi lời mời kết bạn:', err);
          socket.emit('error', { msg: 'Lỗi sever gửi lời mời kết bạn' });
        }
      });


      socket.on('cancel-request-friend', async ({ userId }, callback) => {
        try {
          const userIdDaDangNhap = socket.user._id;
          const userNhanKetBan = await User.findById(userId);
      
          const daGuiLoiMoi = userNhanKetBan.requestfriends.some(
            (req) => req.userId.toString() === userIdDaDangNhap.toString()
          );
      
          if (!daGuiLoiMoi) {
            return callback({ error: 'Người dùng chưa gửi lời mời' });
          }
      
          userNhanKetBan.requestfriends = userNhanKetBan.requestfriends.filter(
            (req) => req.userId.toString() !== userIdDaDangNhap.toString()
          );
      
          await userNhanKetBan.save();
      
          io.to(userId.toString()).emit('friend-request-canceled', {
            user: UserUtil.locUserRaIdNameAvatar(socket.user),
          });
      
          callback({ msg: 'Đã hủy lời mời' });
      
        } catch (err) {
          console.error('Lỗi hủy lời mời:', err);
          socket.emit('error', { msg: 'Lỗi sever hủy lời mời kết bạn' })
        }
      });
      
      
      socket.on('response-friend', async ({ code, userId }, callback) => {
        try {
          const userDaDangNhap = socket.user;
          const userGuiLoiMoi = await User.findById(userId);
      
          if (!userGuiLoiMoi) {
            return callback({ error: 'Không tìm thấy người gửi lời mời' });
          }
      
          userDaDangNhap.requestfriends = userDaDangNhap.requestfriends.filter(
            (req) => req.userId.toString() !== userId.toString()
          );
      
          if (code.toString() === '0') {
            await userDaDangNhap.save();
            return callback({ msg: 'Từ chối lời mời' });
          }
      
          // Đồng ý
          if (!userDaDangNhap.friends.includes(userId.toString())) {
            userDaDangNhap.friends.push(userId);
          }
          if (!userGuiLoiMoi.friends.includes(userDaDangNhap._id.toString())) {
            userGuiLoiMoi.friends.push(userDaDangNhap._id);
          }
      
          await userDaDangNhap.save();
          await userGuiLoiMoi.save();
      
          const friendA = UserUtil.locUserRaIdNameAvatar(userDaDangNhap);
          const friendB = UserUtil.locUserRaIdNameAvatar(userGuiLoiMoi);
      
          io.to(userId.toString()).emit('agree-friend', friendA);
          io.to(userDaDangNhap._id.toString()).emit('agree-friend', friendB);
      
          return callback(friendB);
      
        } catch (err) {
          console.error('Lỗi xử lý phản hồi lời mời:', err);
          callback({ error: 'Lỗi server' });
        }
      });
      
      

}