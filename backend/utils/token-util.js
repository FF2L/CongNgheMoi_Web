// filepath: d:\Study\Cong Nghe Moi\Nhom3-CNM\backend\utils\token-util.js
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
            algorithm: 'HS256'
        }
    );
};

module.exports = { generateToken };