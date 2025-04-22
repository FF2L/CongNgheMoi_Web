const ChatRoom = require("../models/Chatroom");
const User = require("../models/User");

const chatRoomController = {};

//Tạo phòng chat
chatRoomController.create = async (req, res) => {
  try {
    const { chatRoomName, members, image } = req.body;

    
    const userCreateId = req.user._id 
    const uniqueMembers = [... new Set([... members, userCreateId])] //Set là object mảng chứa những phần tử duy nhất {[a,b,c]}

    //Kiểm tra xem user có trong bảng user lưu trên mongodb 
    const users = await User.find({ _id: { $in: uniqueMembers } });
    if (users.length !== uniqueMembers.length) {
      return res
        .status(400)
        .json({ msg: "Một hoặc nhiều người dùng không tồn tại" });
    }

    const chatRoom1 = await ChatRoom.findOne({
        //Kiểm tra xem mảng trong MOngo có chưa tất cả phần
        //  tử của members chưa ko để ý thứ tự nhưng nếu mảng mongo
        //  có nhiều phần tử hon mảng có thì vẫn nhận
      members: { $all: uniqueMembers }, 
      //Đảm bảo số lượng phần tử của mảng mongo bằng số lượng phần tử của members đưa vào 
      $expr: { $eq: [{ $size: "$members" }, uniqueMembers.length] },
    });
    if (chatRoom1) return res.status(200).json(chatRoom1);

    const isGroup = users.length > 2;

    if(!isGroup){
      const chatRoom = new ChatRoom({
        isGroupChat: isGroup,
        chatRoomName: chatRoomName ? chatRoomName : null,
        members: uniqueMembers,
      });
      const chatRoomSave = await chatRoom.save();
      const populateChatRoom = await ChatRoom.findById(chatRoomSave._id)
      .populate('members', 'name avatarUrl ')
      res.status(200).json(populateChatRoom);
    }
    else
    {
        const chatRoom = new ChatRoom({
          isGroupChat: isGroup,
          chatRoomName: chatRoomName,
          members: uniqueMembers,
          image: image ? image : 'https://static.vecteezy.com/system/resources/previews/026/019/617/original/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg',
          admin: userCreateId
        });
        const chatRoomSave = await chatRoom.save();
        const populateChatRoom = await ChatRoom.findById(chatRoomSave._id)
        .populate('members', 'name avatarUrl ')
        .populate('admin', 'name avatarUrl ')
        res.status(200).json(populateChatRoom);
    }
   
  } catch (err) {
    console.log('Lỗi tạo phòng', err);
    res.status(500).json({ msg: "Lõi tạo phòng chat" });
  }
};

//Lấy tất cả phòng chat của người dùng

chatRoomController.getAllChatRoomByUserId = async (req, res) => {
  try {
    //Tim phong chat ma nguoi dung la thanh vienv
    const chatRooms = await ChatRoom.find({ members: req.user._id })
      .populate("members",  'name email avatarUrl') // điền đầy các trường bên trong nó mà là Object id trong members
      .populate('latestMessage')
      .sort({ 'latestMessage.createdAt': -1 })
    res.status(200).json(chatRooms);
  } catch (err) {
    console.log('Lỗi khi lấy tất cả phòng',err)
    res.status(500).json({ msg: "Lỗi khi tải phòng chat" });
  }
};

//Xóa phòng chat

chatRoomController.deleteByChatRoomId = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (!chatRoom) {
      return res
        .status(404)
        .json({ msg: `Lỗi không tìm thấy phòng chat: ${chatRoomId}` });
    }
    if(chatRoom.admin.toString() !== req.user._id.toString() && chatRoom.isGroupChat){
      return res.status(403).json({msg: 'Chỉ có admin mới có thể xoa phòng chat'})
    }

    await ChatRoom.findByIdAndDelete(chatRoomId);
    return res.status(200).json({msg: 'phòng chat đã xóa'})


  } catch (err) {
    console.log('Lỗi khi xóa phòng',err);
    res.status(500).json({ msg: "Lỗi xóa phòng chat" });
  }
};

//Tìm một phòng chat

chatRoomController.getOneChatRoomById = async(req, res) =>{
  try{
    const {chatRoomId} = req.params;
    const chatRoom = await ChatRoom.findById(chatRoomId).populate('members', 'name email').exec();
    
    if(!chatRoom){
      return res.status(404).json({msg : 'Không tìm thấy phòng chat'})
    }
    if(!chatRoom.members.some(x => x._id.toString() === req.user._id.toString())){
      return res.status(403).json({msg: 'Người dùng ko có quyền truy cập vào phòng chat'})
    }
    return res.status(200).json(chatRoom)
  }catch(err){
    console.log('Lỗi xóa phòng chat', err)
    res.status(500).json({msg: 'Lỗi xóa phòng chat'})
  }
};

//Mời vào phòng chat
chatRoomController.inviteToGroupChat = async(req,res) =>{
  try{
    const {userId,chatRoomId} = req.body //userId của nguời cần mời vào
    const chatRoom = await ChatRoom.findById(chatRoomId)
    if(!chatRoom){
      return res.status(404).json({msg : 'Không tìm thấy phòng chat'})
    }
    if(!chatRoom.members.includes(userId)){
      chatRoom.members.push(userId);
      const chatRoomSave = await chatRoom.save()
      return res.status(200).json(chatRoomSave)
    }
    else
    {
      return res.status(400).json({msg: 'Người dùng đã có trong phòng chat'})

    }

  }catch(err){
    console.log('Lỗi mời vào phòng chat', err)
    res.status(500).json({msg: 'Lỗi mời vào phòng chat'})
  }
}

//Cập nhật phòng chat

chatRoomController.updateChatRoom = async(req,res) => {
  try{
    const {chatRoomId,chatRoomName,members,image,newAdminId} = req.body
    console.log('body',req.body)

      const chatRoom = await ChatRoom.findById(chatRoomId)

    if(!chatRoom){
      return res.status(404).json('Không tim thấy phòng chat')
    }
    if(chatRoom.admin.toString() !== req.user._id.toString()){
      return res.status(403).json({msg: 'Chỉ người tạo phòng mới có quuyền cập nhật'})
    }
    chatRoom.chatRoomName = chatRoomName || chatRoom.chatRoomName
    chatRoom.members = members || chatRoom.members
    chatRoom.image = image ||  chatRoom.image
    if(newAdminId){
      chatRoom.admin = newAdminId
    }

    const chatRoomSave = await chatRoom.save();
    const populateChatRoom = await ChatRoom.findById(chatRoomSave._id)
    .populate('members', 'name avatarUrl ')
    .populate('admin', 'name avatarUrl ')

    return res.status(200).json(populateChatRoom);

  }catch(err)
  { console.log('Lỗi update chat Room', err)
    res.status(500).json({msg: 'Lỗi update chat Room'})}
}



module.exports = chatRoomController;
