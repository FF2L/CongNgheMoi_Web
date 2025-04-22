// export interface Userr {
//     find(arg0: (u: any) => boolean): any;
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     online: boolean;
//     address?:string;
//     email:string;
//     phone:string;
//     friends:string[];
//   }
  
export interface Userr {
  _id: string;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  phone: string;
  address: string;
  avatarUrl: string;
  requestfriends: string[]; // array of user IDs
  friendRequestsReceived: string[];
  friends: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
