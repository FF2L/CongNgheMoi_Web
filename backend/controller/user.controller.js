const User = require("../models/User");
const UserUtil = require("../utils/user-util");

const userController = {};

userController.getAllUser = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
    }
    return res.status(200).json(users);
  } catch (err) {
    console.log('Lỗi getAllUser', err);
    return res.status(500).json("Lỗi getAllUser");
  }
};
userController.getAllFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('friends', '-password -__v -friends -requestfriends').exec();
    if (!user) {
      return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
    }
    return res.status(200).json(user.friends);
  } catch (err) {
    console.log('Lỗi getAllFriend', err);
    return res.status(500).json("Lỗi getAllFriend");
  }};

userController.updateUser = async (req,res) =>{
  try{
    const userIdDaDangNhap = req.user._id;
    const {name, avatarUrl,phone,address} = req.body
    const user = await User.findByIdAndUpdate(userIdDaDangNhap,{
      name,
      avatarUrl,
      phone,
      address,
    })
    res.status(200).json(user)
  }catch(err){
    console.log('Lỗi updateUserById',err);
    return res.status(500).json("Lỗi updateUserById");
  }
}


userController.getUserById = async (req,res) =>{
  try{
    const {userId} = req.params
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({msg : 'Không tìm thấy người dùng'})
    }
    return res.status(200).json(user)
  }catch(err){
    console.log('Lỗi getUserById',err);
    return res.status(500).json("Lỗi getUserById");
  }
}

userController.sendRequestFriend = async (req, res) => {
  try {
    const { userId } = req.body; //userId muốn kết bạn
    const userIdDaDangNhap = req.user._id; //user Id người gửi lời mời kết bạn

    const userNhanKetBan = await User.findById(userId.toString());
    const userGuiKetBan = await User.findById(userIdDaDangNhap.toString());
    //Kiểm tra xem đã là bạn chưac
    if(!userNhanKetBan || !userGuiKetBan){
      return res.status(404).json({msg : 'Người dùng không tồn tại'})
    }
    if(userGuiKetBan.friends.includes(userId.toString())){
      return res.status(400).json({msg : 'Người dùng đã là bạn bè'})
    }
    //Kiểm tra xem đã gửi lời mời kết bạn chưa
    if(userGuiKetBan.requestfriends.includes(userId.toString())){
      return res.status(400).json({msg : 'Người dùng đã gửi lời mời kết bạn'})
    }
    userGuiKetBan.requestfriends.push(userId.toString()); //Thêm vào danh sách lời mời kết bạn của người gửi
    await userGuiKetBan.save(); 

    userNhanKetBan.friendRequestsReceived.push(userIdDaDangNhap.toString()); //Thêm vào danh sách yêu cầu kết bạn của người nhận
    await userNhanKetBan.save(); 
    
    return res.status(200).json({ msg: 'Đã gửi yêu cầu kết bạn' });
  } catch (err) {
    console.log(err);
    return res.status(500).json("Lỗi gửi yêu cầu kết bạn");
  }
};

// userController.cancelResquestFriend = async (req, res) => {
//     try{
//         const { userId } = req.body; //userId muốn hủy kết bạn
//         const userIdDaDangNhap = req.user._id; //user Id người hủy lời mời kết bạn

//         const userNhanKetBan = await User.findById(userId);

//         const daGuiLoiMoi = userNhanKetBan.requestfriends.some(
//             (reqfriend) => reqfriend.userId.toString() === userIdDaDangNhap.toString()
//           );

//          if(!daGuiLoiMoi){
//             console.log('Người dùng chưa gửi lời mời kết bạn')
//             return res.status(404).json({msg : ['Người dùng chưa gửi lời mời kết bạn']})
//          }
//       const newReqFriend = userNhanKetBan.requestfriends.filter( reqfriends => 
//         reqfriends.userId.toString() !== userIdDaDangNhap.toString()
//       );
//       userNhanKetBan.requestfriends = newReqFriend
//       await userNhanKetBan.save();

//       //Gửi thong6 tin người đã hủy lời mời kết bạn
//       req.io.to(userNhanKetBan._id.toString())
//       .emit("cancel-request-friend", { user: UserUtil.locUserRaIdNameAvatar(req.user) });
//       return res.status(200).json({ msg: 'Đã hủy lời mời kết bạn' });

//     }catch (err){
//         console.log(err);
//     return res.status(500).json("Lỗi hủy yêu cầu kết bạn");
//     }
// };
// userController.responseFriend = async (req, res) => {
//     try {
//       const { code } = req.params; // 0: từ chối, 1: đồng ý
//       const { userId } = req.body; // userId người gửi lời mời
//       const userDaDangNhap = req.user;

//       //Tim user nhan lời mời kết bạn
//       const userNhanLoiMoiKb = await User.findById(userDaDangNhap._id);
//       // Tìm user gửi lời mời
//       const userGuiLoiMoiKb = await User.findById(userId);
//       if (!userGuiLoiMoiKb) {
//         return res.status(404).json({ msg: 'Không tìm thấy người gửi lời mời kết bạn' });
//       }
  
//       if (code.toString() === '0') {
//         // Trường hợp từ chối kết bạn
//         //Xóa yêu cầu kết bạn trong danh sách yêu cầu của người nhận
//         userNhanLoiMoiKb.friendRequestsReceived = userNhanLoiMoiKb.friendRequestsReceived.filter(
//           (id) => id.toString() !== userId.toString()
//         );
//         //Xóa lời mời kết bạn đã nhân5 trong danh sách yêu cầu kết bạn của người gửigửi
//         userGuiLoiMoiKb.requestfriends = userGuiLoiMoiKb.requestfriends.filter(
//           (id) => id.toString() !== userDaDangNhap._id.toString()
//         );
//         await userNhanLoiMoiKb.save();
//         await userGuiLoiMoiKb.save();
  
//         return res.status(200).json({ msg: 'Đã từ chối lời mời kết bạn' });
//       } 
//       else {
//         // Trường hợp đồng ý kết bạn
//         //Thêm bạn bè vào danh sách bạn bè của người nhận
//         userNhanLoiMoiKb.friends.push(userId.toString());
//         //Thêm bạn bè vào danh sách bạn bè của người gửi
//         userGuiLoiMoiKb.friends.push(userDaDangNhap._id.toString());

//         //Xóa yêu cầu kết bạn trong danh sách yêu cầu của người nhận
//         userNhanLoiMoiKb.friendRequestsReceived = userNhanLoiMoiKb.friendRequestsReceived.filter(
//           (id) => id.toString() !== userId.toString()
//         );
//         //Xóa yêu cầu kết bạn trong danh sách yêu cầu của người gửi
//         userGuiLoiMoiKb.requestfriends = userGuiLoiMoiKb.requestfriends.filter(
//           (id) => id.toString() !== userDaDangNhap._id.toString()
//         );
//         await userNhanLoiMoiKb.save();
//         await userGuiLoiMoiKb.save();
        
        
//         return res.status(200).json({ msg: 'Đã đồng ý lời mời kết bạn' });
//       }  
//     } catch (err) {
//       console.error(" Lỗi xử lý đồng ý/từ chối kết bạn:", err);
//       return res.status(500).json({ msg: "Lỗi server khi xử lý kết bạn" });
//     }
//   };
userController.responseFriend = async (req, res) => {
  try {
    const { code } = req.params; // 0: từ chối, 1: đồng ý
    const { userId } = req.body; // userId người gửi lời mời
    const userDaDangNhap = req.user;

    console.log(userId);

    // Tìm user nhận lời mời kết bạn
    const userNhanLoiMoiKb = await User.findById(userDaDangNhap._id);
    // Tìm user gửi lời mời
    const userGuiLoiMoiKb = await User.findById(userId);
    if (!userGuiLoiMoiKb) {
      return res.status(404).json({ msg: 'Không tìm thấy người gửi lời mời kết bạn' });
    }

    // Cập nhật tài liệu nếu code === '0' (từ chối) hoặc '1' (đồng ý)
    const updateFriendRequest = async (code) => {
      if (code === '0') {
        // Trường hợp từ chối kết bạn
        userNhanLoiMoiKb.friendRequestsReceived = userNhanLoiMoiKb.friendRequestsReceived.filter(
          (id) => id.toString() !== userId.toString()
        );
        userGuiLoiMoiKb.requestfriends = userGuiLoiMoiKb.requestfriends.filter(
          (id) => id.toString() !== userDaDangNhap._id.toString()
        );
      } else {
        // Trường hợp đồng ý kết bạn
        userNhanLoiMoiKb.friends.push(userId.toString());
        userGuiLoiMoiKb.friends.push(userDaDangNhap._id.toString());

        userNhanLoiMoiKb.friendRequestsReceived = userNhanLoiMoiKb.friendRequestsReceived.filter(
          (id) => id.toString() !== userId.toString()
        );
        userGuiLoiMoiKb.requestfriends = userGuiLoiMoiKb.requestfriends.filter(
          (id) => id.toString() !== userDaDangNhap._id.toString()
        );
      }

      // Cập nhật tài liệu với `findOneAndUpdate`, tránh lỗi VersionError
      await User.findOneAndUpdate({ _id: userNhanLoiMoiKb._id }, userNhanLoiMoiKb, { new: true, runValidators: true });
      await User.findOneAndUpdate({ _id: userGuiLoiMoiKb._id }, userGuiLoiMoiKb, { new: true, runValidators: true });
    };

    // Gọi hàm cập nhật sau khi kiểm tra mã đồng ý/từ chối
    await updateFriendRequest(code);

    // Trả về phản hồi
    return res.status(200).json({ msg: code === '1' ? 'Đã đồng ý lời mời kết bạn' : 'Đã từ chối lời mời kết bạn' });
  } catch (err) {
    console.error("Lỗi xử lý đồng ý/từ chối kết bạn:", err);
    return res.status(500).json({ msg: "Lỗi server khi xử lý kết bạn" });
  }
};

  userController.unFriend = async(req,res) =>{
    try{
      const userIdDangNhap = req.user._id
      const {friendId} = req.body;

      const userDangNhap = await User.findById(userIdDangNhap);
      const friend = await User.findById(friendId)

      userDangNhap.friends = userDangNhap.friends.filter(
        (id) => id.toString() !== friendId.toString()
      ) 
      friend.friends = friend.friends.filter(
        (id) => id.toString() !== userIdDangNhap.toString()
      ) 
      
      await userDangNhap.save()
      await friend.save()

      return res.status(200).json({ user: userDangNhap, friend: friend });

    }catch(err){
      console.error(" Lỗi hủy kết bạn", err);
      return res.status(500).json({ msg: "Lỗi hủy kết bạn" });
    }
  }
  

module.exports = userController;
