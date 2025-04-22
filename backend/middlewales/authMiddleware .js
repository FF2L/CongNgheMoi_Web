const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { use } = require('../routes/auth')
require('dotenv').config()

//middleware để xác thực token (sau khi đăng nhập thành công truyền token cho phần tiếp theo)
const authMiddleware = async(req,res,next) => {
try{
    const token = req.header('Authorization')
    if(!token){
        return res.status(401).json({msg: 'Bạn cần đăng nhập'})
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)

    if(!user){
        return res.status(401).json({msg : 'Người dùng không tồn tại'})    
    }
    
    req.user = user; //lưu thông tin user vào req.user
    next(); //tiếp tục việc xử lý api
}catch(err){
    console.log(err);
    res.status(401).json({msg: 'Token không hợp lệ'})
}
}

module.exports= authMiddleware