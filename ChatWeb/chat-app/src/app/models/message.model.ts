import { Userr } from "./user.model";
import { ChatRoom } from "./chatRoom.model";
  
export interface Messagee {
  _id: string;
  chatId: string;
  sendID: ISenderId;
  replyToMessage?: Messagee | null;
  content: {
    type: 'text' | 'file' | 'media';
    text: string;
    media: string[]; // array of URLs
    files: string[]; // array of file names/URLs
  };
  recall: '0' | '1' | '2';
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ISenderId{
    _id:string,
    name: string
    email:string,
    avatarUrl:string
}