// socketAuthMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User')

const socketAuthMiddleware =  (io) => {
  io.use( async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Không có token'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
      
          if(!user){
            return next(new Error('Người dùng không tồn tại'));
          }
      socket.user = user; // Gán user vào socket để dùng sau
      next();
    } catch (err) {
      next(new Error('Token không hợp lệ'));
    }
  });
};

module.exports = socketAuthMiddleware;
