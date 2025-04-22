import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoomService } from '../../../services/chatRoom.service';
import { ChatRoom } from '../../../models/chatRoom.model';
import { UserService } from '../../../services/user.service';
import { Userr } from '../../../models/user.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Messagee } from '../../../models/message.model';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-modal-profile',
  imports: [CommonModule],
  standalone:true,
  templateUrl: './modal-profile.component.html',
  styleUrl: './modal-profile.component.css'
})
export class ModalProfileComponent {
  @Input() isOpen: boolean = false; 
  @Input() user: Userr | undefined; 
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  chatRoom: ChatRoom | undefined;
  currentUserId: string | null  = sessionStorage.getItem('userId')
  isFriend:boolean = false;
  requestSent: boolean = false;
  defaulGroupAvatarUrl= 'https://static.vecteezy.com/system/resources/previews/026/019/617/original/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg';
  messagees : Messagee [] = [];
  personGotRequest: Userr | undefined;

  constructor(private chatRoomService : ChatRoomService, 
    private userService: UserService,
    private router: Router,
    private messageService : MessageService,
    private cdRef: ChangeDetectorRef   
  ){}

  close() {
    this.closeModal.emit();
  }

  friendIds: string[] = [];

  ngOnInit(): void {
    this.checkProfile();

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.checkProfile();
    }
  }
  
  
  startChat(friendId: string): void {
    if (!this.user || !this.user._id) {
      console.error("⚠️ Cannot start chat: user._id is undefined");
      return;
    }
    const roomData = {
      members: [this.user?._id, friendId],
      chatRoomName: '', // để trống nếu là phòng 2 người
      image:this.defaulGroupAvatarUrl
    };
    this.chatRoomService.getChatRooms().subscribe({
      next: (chatRooms) => {
        // Check if a chat room already exists with the friend
        const existingRoom = chatRooms.find(room => room.members.includes(friendId));
        
        if (existingRoom) {
          console.log('Chat Room Exists:', existingRoom);
          this.navigateToChatRoom(existingRoom._id);
          // Navigate to the existing chat room or handle it as needed
        } else {
          this.chatRoomService.createChatRoom(roomData).subscribe({
            next: (newRoom) => {
              console.log('Chat Room Created:', newRoom);
              this.navigateToChatRoom(newRoom._id);
              // Navigate to the new chat room or handle it accordingly
            },
            error: (err) => console.error('Failed to create chat room:', err)
          });
        }
      },
      error: (err) => console.error('Error fetching chat rooms:', err)
    });
  }
  navigateToChatRoom(chatRoomId: string): void {
    console.log("Navigating to chat room with ID:", chatRoomId);
    //navigate to chat page
    this.router.navigate([`/chat`], { queryParams: { roomId: chatRoomId } });
    
  }

  

  
  checkProfile(){
    if (!this.user) {
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        // this.loadUserData(userId);
        this.loadFriendsAndCheck(userId);
      }
    }
    if (this.user) {
      this.requestSent = this.checkIfSentRequest(this.user._id);
      
    }
  }


  loadFriendsAndCheck(userId: string): void {
    this.userService.getFriends().subscribe({
      next: (friends: Userr[]) => {
        this.friendIds = friends.map(friend => friend._id);
        this.isFriend = !this.checkIfFriend(userId);
        console.log('Is friend:', this.isFriend);
      },
      error: err => {
        console.error('Failed to fetch friends:', err);
      }
    });
    
  }
  
  checkIfFriend(userId: string): boolean {
    return this.friendIds.includes(userId);
  }

  checkIfSentRequest(id:string): boolean{
    return this.user?.requestfriends?.includes(id) ?? false;
  }
  

  sendAddFriend(friendId: string): void {
    this.userService.addFriend(friendId).subscribe({
      next: (res: Userr) => {
        this.user = res;
        this.requestSent = true;
        console.log("Request sent to:", this.user);
      },
      error: (err) => {
        console.error("Failed to request sent:", err);
      }
    });
  }

  
  // cancelFriendRequest(friendId: string): void {
  //   if (!this.user) return;
  
  //   this.user.requestfriends = this.user.requestfriends.filter(id => id !== friendId);
  //   this.requestSent = false;
  //   console.log('Friend request canceled:', friendId);
  // }
  loadUser(userId:string): void {
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.personGotRequest = user;
        },
        error: (err) => console.error("Failed to load user:", err)
      });
    }
  }
  

  sendRequest(friendId:string) {
    if (this.isFriend) return;
  
    if (!this.requestSent) {
      // Send request logic here
       // Refreshes status
      this.sendAddFriend(friendId)
      this.checkProfile();
      console.log("Friend request sent", friendId);
    } else {
      // Cancel request logic here
      // this.cancelFriendRequest(friendId);
      this.requestSent = false;
      console.log("Friend request canceled",friendId);
    }
  }
  
  
}
