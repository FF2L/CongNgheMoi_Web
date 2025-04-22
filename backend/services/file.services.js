require("dotenv").config();
const{s3} = require("../Utils/aws-helper")

const randomString = (numberC) =>{
    return `${Math.random().toString(36)
        .substring(2,numberC+2)}`
}

const FILE_TYPE_MATCH = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "video/mp3",
    "video/mp4",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.rar",
    "application/zip",
    "text/plain"
  ];

  const uploadFile = async file =>{
    const filePath = `${randomString(4)}-${new Date().getTime()}-${file?.originalname}`
    if(FILE_TYPE_MATCH.indexOf(file.mimetype) === -1){
        throw new Error(`${file?.originalname} khong hop le`)
    }
    const uploadParams ={
        Bucket: process.env.BUCKET_NAME,
        Body: file?.buffer,
        Key: filePath,
        ContentType: file?.mimetype
    }

    try{
        const data  = await s3.upload(uploadParams).promise();
        console.log(`Anh da duoc tai len thanh cong ${data.Location}`)
        const fileName = `${data.Location}`;
        return fileName;
    }catch(error){
        console.error('Loi khong tai anh len duoc', error)
        throw new Error('Tai anh len s3 that bai')
    }
  }

  module.exports = {uploadFile}
  
  