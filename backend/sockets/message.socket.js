const ChatRoom = require('../models/Chatroom');
const User = require('../models/User');
const Message = require('../models/Message');

module.exports = (io, socket) => { 
    const xuLyCallBack = (callback, status, msg, data = null) => {
        if (typeof callback === 'function') {
          callback({ status, msg, data });
        }
      };

    
      //Taọ message mới
      socket.on("create-message", async ({ chatId, content }, callback) => {
        try {
          const logInUserId = socket.user._id;
          const message = await MessageUtil.saveMessageAndReturn(chatId, logInUserId, content);
          io.to(chatId).emit("messages-created", message);
          xuLyCallBack(callback,200,"Tạo tin nhắn thành công")
        } catch (err) {
          console.error(err);
          socket.emit('error', { msg: 'Lỗi sever tạo tin nhắn' })
        }
      });
      
    

}