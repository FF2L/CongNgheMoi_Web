import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { forkJoin, map, Observable } from 'rxjs';
import { ModalProfileComponent } from '../profile/modal-profile/modal-profile.component';
import { Userr } from '../../models/user.model';
import { ChatRoomService } from '../../services/chatRoom.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ModalProfileComponent,FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @Input() isOpen = false;
  @Input() title = '';
  @Output() closeModal = new EventEmitter<void>();
  // selectedEmail: string | null = null;
  showProfileModal: boolean = false;
  users!:Userr[];
  defaultAvatarUrl = 'https://i1.rgstatic.net/ii/profile.image/1039614412341248-1624874799001_Q512/Meryem-Laval.jpg';
  defaulGrouptAvatarUrl= 'https://static.vecteezy.com/system/resources/previews/026/019/617/original/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg';
  user: Userr | undefined;

  activeTab: 'friend' | 'group' = 'friend';
  searchTerm: string = '';
  currentUserId = sessionStorage.getItem('userId'); ;
  groupName = '';

  constructor(private userService : UserService,
    private chatRoomService: ChatRoomService,
    private router: Router){}

  ngOnInit(): void {
    this.loadFriends();
  }

  close() {
    this.closeModal.emit();
    this.searchTerm='';
  }

  setTab(tab: 'friend' | 'group') {
    this.activeTab = tab;
  }
  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }
  

  friendsList: Userr[] = [];

  loadFriends(): void {
    this.userService.getFriends().subscribe({
      next: (friends: Userr[]) => {
        this.friendsList = friends;
      },
      error: (err) => {
        console.error('❌ Failed to load friends:', err);
      }
    });
  }
  

  foundUser?: Userr;
  onSearchFriend() {
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
  
  
  get filteredFriends(): Userr[] {
    return this.friendsList.filter(friend =>
      friend.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectedFriends: string[] = [];

  toggleFriendSelection(friendId: string): void {
    if (this.selectedFriends.includes(friendId)) {
      this.selectedFriends = this.selectedFriends.filter(id => id !== friendId);
    } else {
      this.selectedFriends.push(friendId);
    }
  }

  createGroup(friendIds: string[]): void {
    if (friendIds.length < 2) {
      alert("Please select at least 2 friends");
      return;
    }
  
    if (!this.currentUserId) {
      console.error("⚠️ Cannot start chat: user._id is undefined");
      return;
    }
  
    console.log("📦 Creating room with:", {
      currentUserId: this.currentUserId,
      friendIds: friendIds
    });
  
    const roomData = {
      members: [...friendIds],
      chatRoomName: this.groupName ?? '', // Use nullish coalescing to provide an empty string as default
      image: this.defaulGrouptAvatarUrl
    };
  
    console.log("🚀 ~ ModalComponent ~ createGroup ~ roomData:", roomData);
  
    this.chatRoomService.createChatRoom(roomData).subscribe({
      next: (newRoom) => {
        console.log('Chat Room Created:', newRoom);
        this.close();
        this.navigateToChatRoom(newRoom._id);
        // Navigate to the new chat room or handle it accordingly
      },
      error: (err) => console.error('Failed to create chat room:', err)  // Handle errors here
    });
  }
  
  navigateToChatRoom(chatRoomId: string): void {
    console.log("Navigating to chat room with ID:", chatRoomId);
    // Navigate to chat page
    this.router.navigate([`/chat`], { queryParams: { roomId: chatRoomId } });
  }
}  

