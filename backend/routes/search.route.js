const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Import model User
const authMiddelware = require('../middlewales/authMiddleware ')
const SearchController= require('../controller/search.controller')

// route tìm kiếm
// tìm kiếm người dùng theo email, số điện thoại hoặc tên đăng nhập
// sử dụng phương thức POST để gửi dữ liệu tìm kiếm
router.post('/', authMiddelware, SearchController.getUserByEmailPhoneNumberEmail);

module.exports = router;  // Export router để sử dụng trong server.js