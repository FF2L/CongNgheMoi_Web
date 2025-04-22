const multer = require('multer')
//Trong multer, hàm cb có 2 tham số:
// cb(error, destination)
// Nếu không có lỗi, truyền null cho error.
// Tham số thứ hai là đường dẫn đích để lưu file nếu bạn dùng diskStorage. 
//Đây là lưu vào memmory(RAM) nên ko cần destination cũng được
const storage = multer.memoryStorage({
    destination : function(req,file,cb){
        cb(null,"/")
    }
})

//Tại sao middleware của multer ko cần next() hay luu dữ liệu vào req để chuyển sang xử lý tiếp
// Bởi vì multer:
// Đọc file từ multipart/form-data.
// Biến file đó thành buffer hoặc lưu vào đĩa.
// Gắn vào req.file hoặc req.files (tùy .single() hay .array()).
// Rồi mới gọi next() → sang middleware tiếp theo.

const uploadFileOrMedia = multer({
    storage: storage,
    limits: {fileSize : 1024*1024*40}
}).fields([
    {name: 'media', maxCount: 10}, //Nhận vào array với key là media tối đa là 10
    {name:'file', maxCount: 3} //Nhận vào array với key là file tối đa là 3 file
])


module.exports = uploadFileOrMedia