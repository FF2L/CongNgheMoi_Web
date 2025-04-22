const { io } = require("socket.io-client");
const jwt = require("jsonwebtoken");

const UserIdTestA = "67f70dd5dff3a024ca4be7ba";
const UserIdTestB = "67f70e24dff3a024ca4be7bf";
const JWT_SECRET = "your_jwt_secret_key";

const tokenA = jwt.sign({ id: UserIdTestA }, JWT_SECRET);
const tokenB = jwt.sign({ id: UserIdTestB }, JWT_SECRET);

// Tạo socket client B trước để chắc chắn B connect trước
const socketB = io("http://localhost:5000", {
  auth: {
    token: tokenB,
  },
});

socketB.on("connect", () => {
  console.log("✅ User B connected");

  // Lắng nghe sự kiện nhận lời mời kết bạn
  socketB.on("friend-requested", (data) => {
    console.log("📥 B nhận lời mời kết bạn:", data);
  });

  // Lắng nghe sự kiện hủy lời mời
  socketB.on("friend-request-canceled", (data) => {
    console.log("📤 B nhận hủy lời mời:", data);
  });

  // Sau khi B kết nối rồi, mới khởi tạo A
  const socketA = io("http://localhost:5000", {
    auth: {
      token: tokenA,
    },
  });

  socketA.on("connect", () => {
    console.log("✅ User A connected");

    // Gửi lời mời sau 1s
    setTimeout(() => {
      socketA.emit(
        "request-friend",
        { userId: UserIdTestB, text: "Hi B!" },
        (res) => {
          console.log("🟢 A gửi lời mời callback:", res);
        }
      );
    }, 1000);

    // Sau đó hủy lời mời sau 3s
    setTimeout(() => {
      socketA.emit(
        "cancel-request-friend",
        { userId: UserIdTestB },
        (res) => {
          console.log("🔴 A hủy lời mời callback:", res);
        }
      );
    }, 3000);
  });
});


// //Bắt sự kiện new-chatRomm
// socketTest.on("new-chatRoom", (chatRoom) => {
//   console.log("Người dùng test đã được thêm vào phòng chat", chatRoom);
// });

// //Bắt sự kiện delete-chatRoom
// socketTest.on("delete-chatRoom", (chatRoom) => {
//   console.log(`Đã xóa phòng chat ${chatRoom}`);
// });

// //Bắt sự kiện tạo new-chat
// socketTest.on("new-message", (message) =>{
//   console.log('Tin nhắn tới: ', message)
// })

// //Sự kiện thu hồi từ người tạo chat
// socketTest.on("recall",(recallMessage) =>{
//   console.log('Đã thu hồi tin nhắn:', recallMessage)
// } )

// //Sự kiện gửi lời mời kết bạn
// socketTest.on("request-friend",(user) =>{
//   console.log('Đã nhận lời mời kết bạn của user : ',user )
// } )

// //Sự kiện hủy lời mời kết bạn
// socketTest.on("cancel-request-friend",(user) =>{
//   console.log('Người dùng đã hủy lời mời kết bạn : ',user )
// } )

// //Sự kiện đồng ý lời mời kết bạn
// socketTest.on("agree-friend",(user) =>{
//   console.log('người dùng đã đồng ý kết bạn : ',user )
// } )


// socketTest.on("disconnect", () => {
//   console.log("Người dùng test đã ngắt kết nối");
// });
