const ChatRoom = require('../models/Chatroom');
const User = require('../models/User');

module.exports = (io, socket) => {

  const xuLyCallBack = (callback, status, msg, data = null) => {
    if (typeof callback === 'function') {
      callback({ status, msg, data });
    }
  };

//Taọ phòng chat
socket.on('create-chatRoom', async ({ chatRoomName, members,  }) => {
    
    try {
      const logInUserId = socket.user
      const uniqueMembers = [...new Set([...members, logInUserId])];
  
      const users = await User.find({ _id: { $in: uniqueMembers } });
      if (users.length !== uniqueMembers.length) {
        return xuLyCallBack(callback, 400, 'Một hoặc nhiều người dùng không tồn tại');
      }
  
      const existingChatRoom = await ChatRoom.findOne({
        members: { $all: uniqueMembers },
        $expr: { $eq: [{ $size: '$members' }, uniqueMembers.length] },
      });
  
      if (existingChatRoom) {
        return xuLyCallBack(callback, 200, 'Phòng đã tồn tại',existingChatRoom);
      }
  
      const isGroup = users.length > 2;
  
      const newChatRoom = new ChatRoom({
        isGroup,
        chatRoomName: chatRoomName || null,
        members: uniqueMembers,
      });
  
      const newChatRoomSave = await newChatRoom.save();
  
      // Gửi tới tất cả thành viên phòng chat mới
      uniqueMembers.forEach(userId => {
       const joined = io.to(userId.toString()).socketsJoin(newChatRoomSave._id)
       console.log('Số người tạo join', joined)
       io.to(userId.toString()).emit('chatRoom-created', newChatRoomSave);
      });
  
      // Trả về thành công cho client vừa gửi yêu cầu
        xuLyCallBack(callback,200,'Tạo phòng thành công')
  
    } catch (err) {
      console.error('Lỗi tạo phòng chat:', err);
      socket.emit('error', { msg: 'Lỗi server tạo phòng chat' });
    }
  });
  
  
//Xóa phòng chat
socket.on("delete-chatRoom", async({chatRoomId},callback) =>{
    try{
        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
            return callback({ status: 404, msg: `Không tìm thấy phòng: ${chatRoomId}` });
          }
          const members = chatRoom.members;
          await ChatRoom.findByIdAndDelete(chatRoomId);

          members.forEach((memberId) => {
            io.to(memberId.toString()).leave(chatRoomId.toString());  // Rời khỏi phòng chat theo chatRoomId
            io.to(memberId.toString()).emit("chatRoom-deleted", chatRoomId);  // Gửi sự kiện xóa phòng đến người dùng
        });
          // Trả về thành công cho client vừa gửi yêu cầu
          xuLyCallBack(callback,200,'Xóa phòng thành công')


    }catch(err){
        console.err('Lỗi xóa phòng chat:', err)
        socket.emit('error', { msg: 'Lỗi server xóa phòng chat' });
    }
});



};