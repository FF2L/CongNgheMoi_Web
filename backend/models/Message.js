const mongoose = require("mongoose");

// const MessageSchema = new mongoose.Schema({
//     chatId: {type: mongoose.Schema.Types.ObjectId, ref: "Chatroom"},
//     sendID: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
//     replyToMessage:{type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null},
//     content:{type: String,require: true},
//     recall: {type: String, default: '0'}
//     // seen: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
// }, { timestamps: true }); //Lưu thời gian tạo và cập nhật

const MessageSchema = new mongoose.Schema({
    chatId: {type: mongoose.Schema.Types.ObjectId, ref: "Chatroom"},
    sendID: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    replyToMessage:{type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null},
    content:{
        type: {type: String, enum:['text','file','media'],default: 'text'},
        text:{type:String,default: ''},
        media: [{type: String, default: null}], // Vì muốn mỗi phần từ là phần tử bình thường thì thêm [] vào trong string với default là []
        files: [
            {type: String, default: null}
        ], //nếu không thì với type là string, default là [] thì nó hiểu mỗi phần từ là một mảng kiểu string 
    },
    recall: {type: String,enum:['0','1','2'], default: '0'}
    // seen: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
}, { timestamps: true }); //Lưu thời gian tạo và cập nhật

module.exports = mongoose.model("Message", MessageSchema);
