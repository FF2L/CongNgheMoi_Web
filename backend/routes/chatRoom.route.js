const express = require('express')
const authMiddelware = require('../middlewales/authMiddleware ')
const ChatRoomController = require('../controller/chatRoom.controller')

const router = express.Router();

//Tạo phòng chat
//cung cấp token
// cung cấp từ body
// chatRoomName, members, image 
//tạo nhóm >2 thì phải cung cấp chatRoomName ko bắt buộc có image
////Trả về thông tin phòng chat vừa tạo
router.post('/',authMiddelware, ChatRoomController.create)

//Lấy tất cả phòng chat của người dùng
//Cung cấp:
//token được gửi từ sau khi đăng nhập để trong phần header header: {Authorization: <token>
//Trả về phòng chat và thông tin người có trong phòng
router.get('/',authMiddelware, ChatRoomController.getAllChatRoomByUserId)

//Xóa phòng chat
//Cung cấp:
//params chatRoomId
//Nếu đây là chat nhóm thì người xóa phải là admin của phòng chat
//Người xóa nhận lại res: 200 và thông báo: phòng chat đã xóa
router.delete('/:chatRoomId',authMiddelware,ChatRoomController.deleteByChatRoomId)

//Tìm một phòng chat
//Cung cấp:
// token
//params chatRoomId
//Người tìm nhận lại thông tin phòng đã tìm
router.get('/:chatRoomId', authMiddelware, ChatRoomController.getOneChatRoomById)

//Mời vào phòng chat
//Cung cấp:
// token
// body: {userId, chatRoomId}
//Người mời nhận lại thông báo: đã mời thành công
router.post('/invite', authMiddelware, ChatRoomController.inviteToGroupChat)

//Cập nhật phòng chat
//Cung cấp:
//token
// body: {chatRoomId, chatRoomName, members, image, newAdmin} //nếu ko đởi admin thì khooi3 cung cấp
//Kiểm tra người gọi phải là admin ko  là người tạo phòng
router.put('/', authMiddelware, ChatRoomController.updateChatRoom)



module.exports = router