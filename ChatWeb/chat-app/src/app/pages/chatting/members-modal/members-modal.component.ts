
import { Component, EventEmitter, Input, OnInit, Output, TrackByFunction } from '@angular/core';
;
import { firstValueFrom, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Userr } from '../../../models/user.model';
import { defaulGrouptAvatarUrl, defaultAvatarUrl } from '../../../contants';
import { ChatRoom } from '../../../models/chatRoom.model';
import { ChatRoomService } from '../../../services/chatRoom.service';
import { SearchService } from '../../../services/serachService.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-members-modal',
  imports: [CommonModule,FormsModule],
  templateUrl: './members-modal.component.html',
  styleUrl: './members-modal.component.css'
})
export class MembersModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() users: Userr[] = [];  // Declare users as an @Input()
  @Input() modalView: number = 0; 
  @Output() closeModal = new EventEmitter<void>();
  showModal = false;
  showProfileModal = false;
  defaultAvatarUrl = defaultAvatarUrl;
  defaulGrouptAvatarUrl = defaulGrouptAvatarUrl;
  searchTerm: string = '';
  usersList: Userr[] = [];
  chatRooms: ChatRoom[] = [];
  user: Userr | undefined;
  userMap: { [id: string]: Userr } = {};
  currentUser: Userr | undefined;
  foundUser: Userr | undefined;
  searchTermGroup: string = '';
  searchMember: string = '';
  memberList: Userr[] = [];
  constructor(private userService: UserService,
    private chatRoomService: ChatRoomService,
  ) { }

  ngOnInit(): void {
    this.loadChatRooms();
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }
  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }
  close() {
    this.closeModal.emit();
    this.searchTerm = '';
  }

  selecteds: string[] = [];

  toggleSelection(data: string): void {
    if (this.selecteds.includes(data)) {
      this.selecteds = this.selecteds.filter(id => id !== data);
    } else {
      this.selecteds.push(data);
    }
  }
  // getUserById(userId: string): void {
  //   this.userService.getUserById(userId).subscribe({
  //     next: (res: Userr) => {
  //       this.user = res;
  //       console.log('User data loaded:', this.user);
  //     },
  //     error: (err) => {
  //       console.error('Failed to load user:', err);
  //     }
  //   });
  // }

  titleHeader: string = '';

  chooseAction(): void {
    if (this.modalView === 0) {
      this.titleHeader = 'Groups';
    } else if (this.modalView === 1) {
      this.titleHeader = 'Add members';
    } else if (this.modalView === 2) {
      this.titleHeader = 'Change admin';
    }
  }
  
  

  loadChatRooms(): void {
    this.chatRoomService.getChatRooms().subscribe({
      next: (rooms: ChatRoom[]) => {
        console.log("📥 rooms loaded:", rooms);
        this.chatRooms = rooms;
  
        const userIds = this.chatRooms.flatMap(room => room.members);
  
        // We will load each user individually
        userIds.forEach(userId => {
          this.userService.getUserById(userId).subscribe({
            next: (user: Userr) => {  // Corrected here, expect a single user
              console.log("📥 user loaded:", user);
              // Add user to the list if not already present
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
  


  get filteredUsers(): Userr[] {
    return this.usersList.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  get filteredChatRooms(): ChatRoom[] {
    return this.chatRooms.filter(room =>
      room.chatRoomName?.toLowerCase().includes(this.searchTermGroup.toLowerCase())
    );
  }
  get filteredMembers(): Userr[] {
    return this.memberList.filter(mem =>
      mem.name.toLowerCase().includes(this.searchMember.toLowerCase())
    );
  }


}

