// routes/friend.route.js
const express = require('express');
const router = express.Router();
const authMiddelware = require('../middlewales/authMiddleware ')
const UserController = require('../controller/user.controller')

//Lấy danh sách tất cả người dùng
// cung cấp
//token
router.get('/alluser', authMiddelware, UserController.getAllUser)

//lấy tất cả bạn bè
// cung cấp
//token
router.get('/allfriend', authMiddelware, UserController.getAllFriend)

//update thông tin người dùng
// cung cấp
//token
//body : {name, avatar, phone, address}
router.put('/updateuser', authMiddelware, UserController.updateUser)

//Lấy thông tin người dùng theo id
// cung cấp
//token
//params : {userId}
router.get('/:userId', authMiddelware, UserController.getUserById)

//Gửi lời mời kết bạn
// cung cấp
//token
//body : {userId} id người muốn kết bạn
router.post('/sendreqfriend', authMiddelware, UserController.sendRequestFriend)

//phản hồi kết bạn
// cung cấp
//token
//body : {userId} id gửi lời mời kết bạn // code 0 là ko đồng ý 1 là đồng ý
router.post('/resfriend/:code', authMiddelware, UserController.responseFriend)

//hủy kết bạn
// cung cấp
//token
//body : {friendId}
router.delete('/unfriend', authMiddelware, UserController.unFriend)



// router.post('/cancelreqfriend',authMiddelware, UserController.cancelResquestFriend)


module.exports = router;