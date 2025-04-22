import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';
import { ModalComponent } from '../modal/modal.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

import { ChatRoom } from '../../models/chatRoom.model';
import { Messagee } from '../../models/message.model';
import { SocketService } from '../../socket.service';
import { UserService } from '../../services/user.service';
import { ChatRoomService } from '../../services/chatRoom.service';
import { Userr } from '../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { defaultAvatarUrl, apiUrl, defaulGrouptAvatarUrl } from '../../contants';
import { ModalProfileComponent } from '../profile/modal-profile/modal-profile.component';
import { MembersModalComponent } from "./members-modal/members-modal.component";


@Component({
  selector: 'app-chatting',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PickerComponent, HttpClientModule, ModalProfileComponent, MembersModalComponent],
  templateUrl: './chatting.component.html',
  styleUrl: './chatting.component.css',
})
export class ChattingComponent implements OnInit {
  editingName: any;

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('sidebarRef') sidebarRef!: ElementRef;

  idNguoiDungHienTai: string | null = sessionStorage.getItem('userId')
  chatRooms: ChatRoom[] = [];
  messagees: Messagee[] = [];
  messageText: string = '';
  chatRoomIdDuocChon: string | null = null;
  imageFiles: File[] = [];
  docFiles: File[] = [];
  nguoiDung: Userr[] = [];
  showEmojiPicker: boolean = false;
  showModal = false;
  searchTerm: string = '';
  selectedRoom?: ChatRoom | undefined;
  otherUsersChat: Userr[] = [];
  isSidebarOpen: boolean = false;
  searchTermMember: string = '';

  private baseApiUrl = apiUrl;
  defaulGrouptAvatarUrl = defaulGrouptAvatarUrl;
  defaultAvatarUrl = defaultAvatarUrl;
  membersList: Userr[] = [];
  showProfileModal = false;

  usersList: Userr[] = [];

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private userService: UserService,
    private chatRoomService: ChatRoomService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { };

  ngOnInit(): void {
    this.getChatRooms();

    this.socketService.onNewMessage(msg => {
      console.log('New message received:', msg);

      console.log('Message chatId:', msg.chatId);
      console.log('Current room:', this.chatRoomIdDuocChon);

      const messageData = msg.data || msg;

      if (messageData.chatId === this.chatRoomIdDuocChon ||
        (messageData.chatId && messageData.chatId._id === this.chatRoomIdDuocChon)) {
        this.messagees.push(messageData);

        console.log('Message added to conversation');

        setTimeout(() => {
          const chatContainer = document.querySelector('.messages-chat');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      } else {
        console.log('Message not for current chat room');
      }
    });

    if (this.idNguoiDungHienTai) {
      this.socketService.joinRoom(this.idNguoiDungHienTai);
    }

    this.socketService.onNewRecall(recal => {
      this.messagees = this.messagees.map(msg => msg._id === recal._id ? recal : msg);
      console.log('Message recall processed:', recal);
    });

    this.route.queryParams.subscribe(params => {
      this.chatRoomIdDuocChon = params['roomId'];
      console.log("Selected chat room ID:", this.chatRoomIdDuocChon);
      if (this.chatRoomIdDuocChon) {
        this.getRoom(this.chatRoomIdDuocChon);
      }
    });
  }

  toggleModal(): void {
    this.showModal = !this.showModal;
  }
  toggleSidebar(event: MouseEvent) {
    event.stopPropagation();
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.sidebarRef?.nativeElement.contains(event.target);
    if (!clickedInside && this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }
  selectedMember: Userr | undefined;

  filteredMembers(room: ChatRoom): Userr[] {
    const roomUsers = (room.members as any[]).filter((member: any) => {
      const memberId = typeof member === 'string' ? member : member._id;
      return memberId;
    }).filter((member: any) => typeof member !== 'string');

    return roomUsers;
  }

  loadChattedUsers(): void {
    this.chatRoomService.getChatRooms().subscribe({
      next: (rooms: ChatRoom[]) => {
        console.log("📥 rooms loaded:", rooms);
        this.chatRooms = rooms;
  
        const userIdSet = new Set<string>();
  
        this.chatRooms.forEach(room => {
          room.members.forEach((member: any) => {
            const memberId = typeof member === 'string' ? member : member?._id;
            if (typeof memberId === 'string') {
              userIdSet.add(memberId);
            }
          });
        });
  
        const userIds = Array.from(userIdSet);
  
        userIds.forEach(userId => {
          console.log("🔍 Fetching user ID:", userId); // optional debug
          this.userService.getUserById(userId).subscribe({
            next: (user: Userr) => {
              console.log("📥 user loaded:", user);
              if (!this.usersList.some(existingUser => existingUser._id === user._id)) {
                this.usersList.push(user);
              }
            },
            error: err => {
              console.error("❌ Failed to load user:", err);
            }
          });
        });
      },
      error: err => {
        console.error("❌ Failed to load rooms:", err);
      }
    });
  }
  

  getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `${token}` });
  }

  layNguoiDungKhac(room: ChatRoom): Userr[] {
    const otherUsers = (room.members as any[]).filter((member: any) => {
      const memberId = typeof member === 'string' ? member : member._id;
      return memberId !== this.idNguoiDungHienTai;
    }).filter((member: any) => typeof member !== 'string');

    return otherUsers;
  }

  getMessageById(id: string): Messagee | undefined {
    return this.messagees.find(m => m._id === id);
  }

  getChatRooms(): void {
    this.chatRoomService.getChatRooms().subscribe({
      next: (res: any) => {
        const updatedChatRooms = res.map((room: ChatRoom) => {
          return {
            ...room,
            otherMembers: this.layNguoiDungKhac(room)
          }
        })
        this.chatRooms = updatedChatRooms;

        console.log('các phòng chat: ', this.chatRooms)
      }, error: err => {
        console.log(err)
      }
    })
  }

  getRoom(roomId: string): void {
    if (!roomId) {
      console.error('⛔️ roomId không tồn tại khi gọi getRoom');

      return;
    }
    this.selectedRoom = this.chatRooms.find(room => room._id.toString() === roomId)
    
    console.log("🚀 ~ ChattingComponent ~ getRoom ~ this.selectedRoom:", this.selectedRoom)
    if (roomId) {
      this.chatRoomDuocChon(roomId);
    }
    if (this.selectedRoom) {
      this.membersList = this.filteredMembers(this.selectedRoom);
    }
  }

  selectMember(member: any): void {
    this.selectedMember = member;
    if (this.selectedMember) {
      this.toggleProfileModal();
    }
  }
  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }
  showAddMembersModal: boolean = false;  // This is the flag that controls the modal's state

  toggleAddMembersModal(): void {
    this.showAddMembersModal = !this.showAddMembersModal;  // Toggle the modal state
    if (this.showAddMembersModal) {
      this.loadChattedUsers();  // Load the chatted users when the modal is opened
    }
  }
  foundUser?: Userr;
  onSearchUser() {
    this.userService.getUsers().subscribe({
      next: users => {
        const found = users.find(u => u.email === this.searchTerm);
        if (found) {
          this.foundUser = found;
          console.log('Found User:', this.foundUser);
          this.showProfileModal = true; // open modal
        } else {
          console.log('No user found.');
        }
      },
      error: err => {
        console.error('Failed to fetch users:', err);
      }
    });
  }

  chatRoomDuocChon(id: string): void {

    this.messageService.getAllMessages(id).subscribe({
      next: (res: any) => {
        this.messagees = res;
        console.log('tin nhắn: ', this.messagees);
        // Log toàn bộ sendID
        const allSendIDs = this.messagees.map(msg => msg.sendID);
        console.log('🔍 Tất cả sendID:', allSendIDs);
        console.log('🙋‍♂️ idNguoiDungHienTai:', this.idNguoiDungHienTai);

      },
      error: err => {
        console.log(err);
      }
    });
  }

  chonHinhAnh() {
    this.imageInput.nativeElement.value = ''; // reset input
    this.docFiles = []; // xoá file không cùng loại
    this.imageInput.nativeElement.click();
  }

  chonTaiLieu() {
    this.fileInput.nativeElement.value = '';
    this.imageFiles = [];
    this.fileInput.nativeElement.click();
  }

  xuLyFiles(event: any, loai: 'image' | 'doc') {
    const files: FileList = event.target.files;
    if (!files) return;

    const arr = Array.from(files);
    if (loai === 'image') {
      this.imageFiles = arr.filter(file => file.type.startsWith('image/'));
    } else {
      this.docFiles = arr.filter(file => !file.type.startsWith('image/'));
    }
  }

  xoaFile(loai: 'image' | 'doc', index: number) {
    if (loai === 'image') {
      this.imageFiles.splice(index, 1);
    } else {
      this.docFiles.splice(index, 1);
    }
  }

  createMessage(text: string): void {
    const chatRoom = this.selectedRoom?._id; // Đây phải là một đối tượng ChatRoom
    const user = this.idNguoiDungHienTai; // Đây phải là một đối tượng Userr

    // Kiểm tra nếu thiếu thông tin cần thiết
    if (!chatRoom || !user) {
      console.warn("Chat room or user information is missing.");
      return;
    }
    const hasFiles = this.imageFiles?.length || this.docFiles?.length;

    if (!hasFiles) {
      if (this.replyingTo) {
        const newReplyMessage: any = {
          _id: this.replyingTo._id,
          content: {
            type: "text",
            text: text,
            media: [],
            files: [],
          },
        };

        this.http.post<Messagee>(`${this.baseApiUrl}/message/reply/`, newReplyMessage, {
          headers: this.getHeaders()
        }).subscribe({
          next: (res: Messagee) => {
            console.log("Tin nhắn vừa trả lời: ", res);
            this.messagees.push(res);

            this.socketService.sendMessage(chatRoom, res);

            this.replyingTo = null;
            this.messageText = "";

            setTimeout(() => {
              const chatContainer = document.querySelector('.messages-chat');
              if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
            }, 100);
          },
          error: (err) => {
            console.error("Error replying to message:", err);
          }
        });
      } else {
        // Tạo dữ liệu tin nhắn mới
        const newMessage: any = {
          chatId: chatRoom, // Gán đối tượng ChatRoom
          sendID: user, // Gán đối tượng Userr
          content: {
            type: "text",
            text: text,
            media: [],
            files: [],
          },
          replyToMessage: this.replyingTo || null,
        };
        console.log("newMessage", newMessage);

        this.http.post<Messagee>(`${this.baseApiUrl}/message/`, newMessage, {
          headers: this.getHeaders(),
        }).subscribe({
          next: (res: Messagee) => {
            console.log("Tin nhắn vừa tạo xong: ", res);

            // Đẩy tin nhắn mới vào danh sách tin nhắn hiện tại
            this.messagees.push(res);

            this.socketService.sendMessage(chatRoom, res);


            // Xóa trạng thái trả lời (replyingTo) sau khi gửi
            this.replyingTo = null;

            // Xóa nội dung input
            this.messageText = "";

            setTimeout(() => {
              const chatContainer = document.querySelector('.messages-chat');
              if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
            }, 100);
          },
          error: (err) => {
            console.error("Lỗi khi tạo tin nhắn: ", err);
          },
        });
      }
    } else {
      const formData = new FormData();

      const content = {
        type: this.imageFiles?.length ? 'media' : 'file',
        text: this.messageText || '',
        media: [],
        files: [],
      };

      formData.append('chatId', chatRoom);
      formData.append('content', JSON.stringify(content)); // Gửi content dưới dạng stringified JSON

      if (this.imageFiles?.length) {
        this.imageFiles.forEach(file => formData.append('media', file));
      }

      if (this.docFiles?.length) {
        this.docFiles.forEach(file => formData.append('file', file)); // Quan trọng: key là `file` để backend bắt đúng
      }

      if (this.replyingTo) {
        this.http.post<Messagee>(`${this.baseApiUrl}/message/reply/`, formData, {
          headers: this.getHeaders()
        }).subscribe({
          next: (res: Messagee) => {
            console.log("Tin nhắn vừa trả lời: ", res);
            this.messagees.push(res);

            this.socketService.sendMessage(chatRoom, res);

            this.replyingTo = null;
            this.messageText = "";
            this.imageFiles = [];
            this.docFiles = [];

            setTimeout(() => {
              const chatContainer = document.querySelector('.messages-chat');
              if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
            }, 100);
          },
          error: (err) => {
            console.error("Error replying with files:", err);
          }
        });
      } else {
        this.http.post<Messagee>(`${this.baseApiUrl}/message/`, formData, {
          headers: this.getHeaders(),
        }).subscribe({
          next: (res: Messagee) => {
            console.log("Tin nhắn vừa tạo xong: ", res);

            // Đẩy tin nhắn mới vào danh sách tin nhắn hiện tại
            this.messagees.push(res);

            this.socketService.sendMessage(chatRoom, res);

            // Xóa trạng thái trả lời (replyingTo) sau khi gửi
            this.replyingTo = null;

            // Xóa nội dung input
            this.messageText = "";
            this.imageFiles = [];
            this.docFiles = [];

            setTimeout(() => {
              const chatContainer = document.querySelector('.messages-chat');
              if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
              }
            }, 100);
          },
          error: (err) => {
            console.error("Lỗi khi tạo tin nhắn: ", err);
          },
        });
      }
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        img.src = e.target.result;
  
        img.onload = () => {
          const size = 200; // desired size for avatar
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
  
          canvas.width = size;
          canvas.height = size;
  
          // Draw circle mask
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
  
          // Draw the image centered
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
  
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  
          const base64Image = canvas.toDataURL('image/jpeg', 0.9);
          this.changedImage = base64Image;
          this.updateChatRoom();
        };
      };
  
      reader.readAsDataURL(file);
    }
  }
  
  

  editedRoomName: string = '';
  addedMembers: string[] = [];
  changedImage: string = '';
  changedAdmin: string = '';
  updateChatRoom(): void {
    const updateData: any = {
      chatRoomId: this.selectedRoom?._id
    };
  
    if (this.editedRoomName && this.editedRoomName !== this.selectedRoom?.chatRoomName) {
      updateData.chatRoomName = this.editedRoomName;
    }
  
    if (this.addedMembers.length > 0) {
      updateData.members = this.addedMembers;
    }
  
    if (this.changedImage) {
      updateData.image = this.changedImage;
    }
  
    if (this.changedAdmin) {
      updateData.newAdmin = this.changedAdmin;
    }
  
    this.chatRoomService.updateChatRoom(updateData).subscribe({
      next: (updatedRoom) => {
        console.log('Room updated successfully:', updatedRoom);
        this.selectedRoom = updatedRoom;
        this.editingName = false;
        this.addedMembers = [];
        this.changedImage = '';
        this.changedAdmin = '';
      },
      error: (err) => {
        console.error('Update failed', err);
      }
    });
  }
  removeMember(memberId: string): void {
    // Remove member from the addedMembers list
    this.addedMembers = this.addedMembers.filter(member => member !== memberId);
    
    // Update the chat room
    this.updateChatRoom();
  }
  
  
  toggleEditName(){
    this.editedRoomName = this.selectedRoom?.chatRoomName || '';
    this.editingName = true;
  }
  

  recallMessage(idMsg: string, index: number, code: number): void {
    const msg = this.messagees[index];
    console.log(code);

    if (code === 2) {
      this.http.post<Messagee>(`${this.baseApiUrl}/message/recall/${code}`, { _id: idMsg }, {
        headers: this.getHeaders()
      }).subscribe({
        next: (res: Messagee) => {
          console.log('Tin nhắn đẵ thu hồi voi code là 2', res);
          msg.recall = '2';
          msg.content.text = '';
          msg.content.files = [];
          msg.content.media = [];
          console.log('2');
        }
      });
    } else if (code === 1) {
      this.http.post<Messagee>(`${this.baseApiUrl}/message/recall/${code}`, { _id: idMsg }, {
        headers: this.getHeaders()
      }).subscribe({
        next: (res: Messagee) => {
          console.log('Tin nhắn đẵ thu hồi với code là 1', res);
          msg.recall = '1';
          msg.content.text = '';
          msg.content.files = [];
          msg.content.media = [];
        }
      });
      console.log('1');
    }

    this.closeMessageOptions();
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji($event: any) {
    const emoji = $event.emoji.native;
    this.messageText += emoji;
    this.showEmojiPicker = false;
  }

  getDisplayName(userId: string): string {
    const user = this.nguoiDung.find(u => u._id === userId);
    if (!user) {
      return 'Me';
    } else {
      return user.name;
    }
  }

  selectedMessageIndex: number | null = null;
  replyingTo: Messagee | null = null;

  toggleMessageOptions(index: number): void {
    this.selectedMessageIndex = this.selectedMessageIndex === index ? null : index;
  }

  closeMessageOptions(): void {
    this.selectedMessageIndex = null;
  }

  replyToMessage(index: number): void {
    this.replyingTo = this.messagees[index];
    console.log("Đang reply đến:", this.replyingTo);
    this.closeMessageOptions();
  }

  cancelReply(): void {
    this.replyingTo = null;
  }

  get filteredChats(): ChatRoom[] {
    return this.chatRooms.filter(chatRoom => {
      return chatRoom.members.some((memberId: string) => {
        const user = this.nguoiDung.find(u => u._id === memberId);
        return user?.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    });
  }

  getUserFromChats(chatRoomId: string): Userr[] {
    const chatRoom = this.chatRooms.find(room => room._id === chatRoomId);

    if (!chatRoom) return [];

    return chatRoom.members
      .map((memberId: string) => this.nguoiDung.find(u => u._id === memberId))
      .filter((user): user is Userr =>
        !!user && user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
  }

  getUserFromId(userId: string): Userr | undefined {
    return this.nguoiDung.find(user => user._id === userId);
  }

  getUserName(userId: string): string {
    const user = this.getUserFromId(userId);
    return user ? user.name : 'Unknown User';
  }

  processIncomingMessage(msg: any): void {
    console.log('Processing incoming message:', msg);

    const messageData = msg.data || msg;

    this.messagees.push(messageData);

    setTimeout(() => {
      const chatContainer = document.querySelector('.messages-chat');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}