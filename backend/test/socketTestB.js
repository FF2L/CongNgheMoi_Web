const { io } = require("socket.io-client");
const jwt = require('jsonwebtoken')
//Chạy test bằng:  node socketTestB.js phải cd tới test
const UserIdTest = "67f70e24dff3a024ca4be7bf";
const JWT_SECRET = 'your_jwt_secret_key'

const token = jwt.sign({ id: UserIdTest }, JWT_SECRET, { expiresIn: "24h" });
const socketTest = io("http://localhost:5000",{
  auth: {
    token: token,
  },
});

socketTest.on("connect", () => {
  console.log("Người dùng test đã kết nối");
  socketTest.emit("join");
});

socketTest.on("friend-requested", (data)=>{
    console.log('Nội dung phản hồi người nhận kết bạn: ', res)
  })