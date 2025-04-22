const Message = require('../models/Message')
const ChatRoom = require('../models/Chatroom')

const messageUtil = {}

async function updateLastMessage(chatRoomId, messageId) {
    try{
        const chatRoom = await ChatRoom.findById(chatRoomId)
        chatRoom.latestMessage = messageId
        await chatRoom.save()
    }catch(err){
        throw new Error(err.message)
    }
}

messageUtil.saveMessageAndReturn = async (chatId, userId, content, req, res) =>{
     const message = new Message({
            chatId,
            sendID : userId,
            content
        })
    
        await message.save(); 
    
        const populatedMessage = 
        await Message.findById(message._id).
        populate({
            path: 'chatId',
            populate: {path: 'members',select: 'name email' }
        }).
        populate('sendID', 'name email') //Tham số thứ 2 chọn trường muốn poppulate
    
        await updateLastMessage(chatId, populatedMessage._id)
        res.status(200).json(populatedMessage)
}




module.exports = messageUtil