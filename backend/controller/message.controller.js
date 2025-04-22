const ChatRoom = require('../models/Chatroom')
const Message = require('../models/Message')
const {uploadFile} = require("../services/file.services")
const MessageUtil = require('../utils/message-util')

const messageController = {}


//Tạo một tin nhắn text
messageController.create = async(req,res) =>{
   try
   { const {chatId} = req.body

   if(!chatId){
        return res.status(400).json({msg: 'Thiếu chatRoom Id'})
   }
    const userId = req.user._id // lấy tự middleware
    
    let content = req.body.content;

    // Nếu content là string (tức được gửi từ FormData) thì parse
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (err) {
        return res.status(400).json({ msg: 'Content không hợp lệ (parse lỗi)' });
      }
    }
    if(content.type.toString() !== 'text'){

        if(content.type.toString() === 'file'){
            
            //Không thể sử dụng async trong forEach để sử dụng await vì nó sẽ ko chờ việc lưu
      
            //Dùng optional chaining (?.) để tránh lỗi nếu req.files là undefined.
            //ví dụ:
            //Nếu req.files = undefined → req.files.file sẽ gây lỗi nếu không file → 
            // nhưng req.files?.file sẽ trả về undefined và không lỗi.
            //Nếu req.files = { file: [file1, file2] } → req.files?.file sẽ trả về mảng [file1, file2]
            //|| []
            //Nếu req.files?.file là undefined (tức không có gì được upload) thì trả về mảng rỗng [] để tránh lỗi khi .map()
            //Promise.all promise là biến gồm 2 trạng thái chờ và đã có kết quả ,all là dảm bảo tất cả kết quả dc dảm bảobảo
            const fileArrayURL = await Promise.all(
                (req.files?.file || [] ).map(file => uploadFile(file) )
            )
           
            const contentfile = {
                type: content.type,
                text: content.text,
                files: fileArrayURL
            }
            return MessageUtil.saveMessageAndReturn(chatId,userId,contentfile,req,res)

        }else{

            const mediaArrayURL = await Promise.all(
                (req.files?.media || [] ).map(media => uploadFile(media) )
            )

                const contentMedia = {
                    type: content.type,
                    text: content.text,
                    media: mediaArrayURL
                }

            return MessageUtil.saveMessageAndReturn(chatId,userId,contentMedia,req,res)
        }
    }
     return MessageUtil.saveMessageAndReturn(chatId,userId,content,req,res)

}catch(err){
    console.log(err)
    res.status(500).json('Lỗi tạo tin nhắn')
}
}


//Lấy tất cả tin nhắn

messageController.getAll = async(req, res) =>{
    try{
        const {chatId} = req.params
        
        if(!chatId){
            return res.status(400).json({msg: 'Thiếu chatRoom Id'})
        }
        const messages = await Message.find({chatId}).populate({
            path: 'replyToMessage',
            select: 'content sendID createdAt',
        }) // Chỉ nhận object key value nếu truyền vào chatId = value thoi nên ko dc
        .sort({ createdAt: 1}) //Sắp xếp từ tạo lâu nhất đến mới nhất tăng dần thời gian
        .populate('sendID', 'name email avatarUrl')

        if(!messages){
            return res.status(404).json({msg: `Lỗi ko tìm thấy phòng chat ${chatId}`})
        }

        return res.status(200).json(messages)
    }catch(err){
        console.log('Lỗi lấy tất cả tin nhắn', err)
        return res.status(500).json({msg: 'Lỗi lấy tất cả tin nhắn'})
    }
}
//Thu hồi tin nhắn 
messageController.recall = async(req,res) =>{
    try{
        //id của message nhận từ client
        const {_id} = req.body
        const {code} = req.params
        //Nhận từ authorMiddleware
        const userRecallId = req.user._id   
        console.log('code nhận dược là ',code)

        //Lấy thông tin message bằng _id của message đã lấy từ body và kiểm tra xem có thuộc về người gọi api này koko
        const messageBelongUserId = await Message.findById(_id).populate({
            path: 'chatId',
            populate: {path: 'members',select: 'name email avatarUrl' }
        })
        if(!messageBelongUserId){
            return res.status(400).json({msg : 'Tin nhắn này không tồn'})
        }
        //Kiểm tra ko thuộc về thì trả lỗi và kết thúc
        if(messageBelongUserId.sendID.toString() !== userRecallId.toString())
            return res.status(400).json({msg:'Tin nhắn không thuộc về người thu hồi'})
        
        //Kiểm tra xem đã thu hồi chưa
        if(messageBelongUserId.recall.toString() === '1' || messageBelongUserId.recall.toString()==='2'){
            return res.status(400).json({msg: 'Tin nhắn đã bị thu hồi trước đó'})
        }

        //code 1 là chỉ với người thu hồi còn 2 là tất cả coi như xóa nếu xóa thì thông báo tin nhắn đã thu hồi
        if(code.toString() === '1'){
            //Mặc định update không trả về document thêm {new:true} mới trả về doccument
            const recallMessage = await Message.findByIdAndUpdate(_id, {content: messageBelongUserId.content , recall:'1'}, {new: true})
            console.log('di qua 1')
            return res.status(200).json(recallMessage)
            
        }else {
            const recallMessage = await Message.findByIdAndUpdate(_id, {content: '' , recall:'2'}, {new: true})
            console.log("di qua 2")
            return res.status(200).json(recallMessage)
        }

    }catch(err){
        console.log('Lỗi thu hồi tin nhắn',err)
        return res.status(500).json({msg: 'Lỗi thu hồi tin nhắn'})
    }

}

//Trả lời tin nhắn: 
messageController.replyTo = async(req,res) =>{
    try{
        //id message cần trả lời
        const {_id,  content} = req.body
        const userCreatChatId = req.user._id 
        if( !_id ){
            return res.status(400).json({msg: 'Thiếu id của message cần trả lời'})
        }
        const messageBeenReply = await Message.findById(_id)
        if(!messageBeenReply){
            return res.status(400).json({msg: 'Không tìm thấy tin nhắn với id: ', _id})
        }
        const messageReplyTo = new Message ({
            chatId : messageBeenReply.chatId,
            sendID:userCreatChatId,
            replyToMessage: _id,
            content
        })
        await messageReplyTo.save(); 

        const populatedMessage = 
        await Message.findById(messageReplyTo._id).
        populate({
            path: 'chatId',
            populate: {path: 'members',select: 'name email avatarUrl' }
        }).
        populate('sendID', 'name email avatarUrl'). //Tham số thứ 2 chọn trường muốn poppulate
        populate({
            path: 'replyToMessage',
            select: 'content sendID createdAt',
            populate: {path: 'sendID', select: 'name email avatarUrl'}
        })

     
        res.status(200).json(populatedMessage)


    }catch(err){
        console.log('Lỗi trả lời tin nhắn',err)
        return res.status(500).json({msg: 'Lỗi trả lời tin nhắn'})
    }
}




module.exports = messageController