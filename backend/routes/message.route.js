const express = require('express')
const authMiddelware = require('../middlewales/authMiddleware ')
const MessageController = require('../controller/message.controller')
const uploadFileOrMedia = require('../middlewales/uploadMiddleware')

const router = express.Router();

//Tạo tin nhắn mới
//Cung cấp 
//body : {chatId: <chatRoomId> , 
// content: {
//type :<file/media/text>, nếu chỉ text thôi là chỉ gồm text, file gồm file  hoặc file và text tương tự
//text: text
//}}
// Nếu type là "file" hoặc "media" → gửi kèm file upload:
// file: key cho mảng các tệp đính kèm
// media: key cho mảng ảnh/video

//token được gửi từ sau khi đăng nhập để trong phần header header: {Authorization: <token>

// Người gửi tin nhắn: Nhận được tin nhắn đã lưu trong response
// Tất cả thành viên còn lại trong phòng chat: Sẽ nhận được tin nhắn realtime thông qua socket event new-message
router.post('/',authMiddelware, uploadFileOrMedia,  MessageController.create)

//Lấy tất cả tin nhắn
//Cung cấp
//body: {chatId: <ChatRoomId>}
//token được gửi từ sau khi đăng nhập để trong phần header header: {Authorization: <token>
//Trả về cho người dùng tất cả tin nhắn của phòng đó không phần trang
router.get('/:chatId',authMiddelware, MessageController.getAll)

//Thu hồi tin nhắn
// Endpoint: POST /api/message/recall/:code
// Body: { _id: <ID của tin nhắn> } 
//token được gửi từ sau khi đăng nhập để trong phần header header: {Authorization: <token>
// code:
// "1": chỉ người thu hồi không thấy nội dung nữa
// "2": toàn bộ thành viên trong phòng không thấy nữa(xóa tin nhắn)
// Sau khi gọi API:
// Server cập nhật trường content thành "" và thêm recall: '1' hoặc '2' vào message
//Nếu code === "1" thì api trả về json của message sau khi update
// Nếu code === "2", server sẽ gửi socket event "recall" đến các thành viên khác trong phòng
// if (message.recall === '1' && message.sendID === currentUser._id) {
//     // Tin nhắn bị thu hồi bởi chính người dùng → ẩn hoặc ghi chú
//     return <Text style={{ fontStyle: 'italic', color: 'gray' }}>Bạn đã thu hồi tin nhắn này</Text>
//   }
//   if (message.recall === '2') {
//     return <Text style={{ fontStyle: 'italic', color: 'gray' }}>Tin nhắn đã bị thu hồi</Text>
//   }
//Còn lại bắt sự kiện socket
router.post('/recall/:code',authMiddelware, MessageController.recall)


//Trả lời tin nhắn 
// Endpoint: POST /api/message/reply/
// Body{
//  "_id": "<id tin nhắn gốc cần reply>",
// "content": "<nội dung trả lời>"
// }
//token được gửi từ sau khi đăng nhập để trong phần header header: {Authorization: <token>
//Server sẽ emit socket new-message đến các thành viên trong phòng (trừ người gửi).
//Người gửi nhận về tin nhắn trả lời qua api
router.post('/reply/',authMiddelware, MessageController.replyTo)

module.exports = router