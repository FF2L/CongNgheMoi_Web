const express = require("express");
const cors = require("cors");
const http = require('http')
const connectDB = require("./db");
const { Server } = require('socket.io')
require("dotenv").config();

const socketAuthMiddleware = require('./middlewales/socketAuthMiddleware')
const chatRoomSocket = require('./sockets/chatRoom.socket');
const userSocket = require('./sockets/user.socket')
const ChatRoom = require('./models/Chatroom')

const app = express();
const server = http.createServer(app) //Tạo sever http tử express để có thể xử lý API RESTREST(express) và socket.io

const io = new Server(server, {
  cors: {
    origin: "*", //cho phép mọi domain kết nối với socket(Cho phép tất cả frontend ở localhost hoặc nơi khác kết nối được WebSocket.)
    methods: ["GET", "POST"]
  }
})

// Cấu hình middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Thoát chương trình nếu kết nối thất bại
  });



//Chia sẻ io cho các route khác
app.set('io', io)
app.use((req, res, next) => {
  req.io = io;
  next()
})
// Sử dụng API đăng ký & đăng nhập
app.use("/api/auth", require("./routes/auth"));
//Sử dụng API chatRoom
app.use('/api/chatroom', require('./routes/chatRoom.route'))
//Sử dụng API cho message
app.use('/api/message', require('./routes/message.route'))
//Sử dụng API cho search
app.use('/api/search', require('./routes/search.route'))
//Sử dụng API cho user
app.use('/api/user', require('./routes/user.route'))

// emit là gửi sự kiện với 2 tham số là tên sự kiện và giá trị gửi di
//on là nhận sử kiện  với 2 tham số là tên sự kiện và giá trị đã gửi(giá trị nhận được)
//join là tham gia vào phòng tham số cần là tên phòng
//to được dùng để chỉ phòng muốn tham gia tham số là tên phòng

//Mỗi khi một client kết nối tới server qua socket (WebSocket),
// server tự động phát hiện và gọi callback trong "connection". và disconnect cũng vậyvậy





io.on("connection", (socket) => {
  console.log('Đã có người tham gia phòng');
  // tham gia vao phòng chat riêng
  //tham gia vào phòng chat nhóm của người dùng
  socket.on("join", async (userId) => {
    socket.join(userId.toString()) //Tham gia vào phòng với tên là userId
    socket.user = userId //Lưu thông tin người dùng vào socket để sử dụng sau này
    console.log(`User ${socket.user} đã tham gia vào phòng riêng`) // Sửa đổi để sử dụng socket.user

    const chatRooms = await ChatRoom.find({ members: socket.user })
    chatRooms.forEach(chatRoomId => {
      socket.join(chatRoomId._id.toString())
      console.log(`${socket.user} Đã tham gia vào phòng chat ${chatRoomId._id} `)
    })
  })

  socket.on('send-friend-request', (friendId, data) => {
    console.log('Received friend request:', data);
    socket.broadcast.to(friendId.toString()).emit('received-friend-request', data);
  });

  socket.on('accept-friend-request', (friendId, data) => {
    console.log('Received friend request:', data);
    socket.broadcast.to(friendId.toString()).emit('accepted-friend-request', data);
  });

  //Nhận vào sự kiện cấp cho người mình muốn unfriend
  //phát sự kiện unfriend cho người dùng đó
  //Người dùng nhận sự kiện unfriend và hủy kết bạn với người đó
  socket.on('unfriend', async (userId) => {
    socket.broadcast.to(userId).emit('unfriended', socket.user);
    console.log(`User ${socket.user} đã hủy kết bạn với ${userId}`);
  })

  //Nhận sự kiện đồng ý kết bạn

  socket.on('accept-friend', async (userId) => {
    socket.broadcast.to(userId).emit('friend-accepted', socket.user);
    console.log(`User ${socket.user} đã đồng ý kết bạn với ${userId}`);
  })

  //tạo phòng chat nhóm mới
  //người dùng tự động tham gia vào phòng chat nhóm mới
  // sau dó phát sự kiện cho tất cả người dùng online room-chat-created 
  socket.on('create-chatRoom', async (chatRoomId, data) => {
    socket.join(chatRoomId.toString())
    socket.broadcast.emit('roomChat-created', data)
  })
  //Người dùng nhận sự kiện roomChat-created và 
  //và kiểm tra xem trong member có người dùng đó ko
  //có thì gọi join-chatRoom để tham gia vào phòng chat nhóm mới
  socket.on('join-chatRoom', async (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`User ${socket.user._id} đã tham gia vào phòng chat ${chatRoomId}`);
  });

  socket.on('update-chatRoom', ({ chatRoomId, data }) => {
    socket.broadcast.to(chatRoomId).emit('chatRoom-updated', data);
  })

  //emit leave-chatRoom thì sever nhận
  //rời khỏi phòng chat nhóm và phát sự kiện user-left cho tất cả người dùng trong phòng chat nhóm đó
  socket.on('leave-chatRoom', async (chatRoomId, data) => {
    socket.leave(chatRoomId);
    socket.broadcast.to(chatRoomId).emit('user-left', data);
  });

  //emit create-message thì sever nhận
  //phát sự kiện message-created cho tất cả người dùng trong phòng chat nhóm đó
  socket.on('create-message', ({ chatRoomId, data }) => {
    console.log('create-message', data);
    const room = io.sockets.adapter.rooms.get(chatRoomId.toString());

    if (room) {
      console.log(`Phòng ${chatRoomId} tồn tại với ${room.size} client`);
      socket.broadcast.to(chatRoomId.toString()).emit('message-created', data);
      console.log(`Đã gửi tin nhắn tới phòng ${chatRoomId}`);
    } else {
      console.log(`Phòng ${chatRoomId} không tồn tại, không thể gửi tin nhắn`);
    }
  });

  socket.on('delete-message', ({ chatRoomId, data }) => {
    socket.broadcast.to(chatRoomId).emit('message-deleted', data);
  });



  socket.on('disconnect', () => {
    console.log('Người dùng đã ngắt kết nối')
  })
})

// Cấu hình cổng và khởi động server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

