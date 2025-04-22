// import { Messagee } from './message.model';
// import { Userr } from './user.model';

import { Messagee } from "./message.model";
import { Userr } from "./user.model";

// export interface ChatRoom {
//   // timeAgo: string;
//   _id: string;
//   members: Userr[];
//   isGroupChat: boolean;
//   chatRoomName?: string | null;
//   groupAvatarUrl?: string;
//   messages? : Messagee[];
// }

export interface ChatRoom {
  _id: string;
  isGroupChat: boolean;
  chatRoomName?: string;
  members: string[]; // user IDs
  image?: string;
  admin?: string; // user ID
  latestMessage?: Messagee;
  createdAt: string;
  updatedAt: string;
  otherMembers:Userr[];
  __v?: number;
}
