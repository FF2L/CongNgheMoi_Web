import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Userr } from '../models/user.model';
import { Messagee } from '../models/message.model';
import { ChatRoom } from '../models/chatRoom.model';
import { ApiService } from './api.service';
import { apiUrl } from '../contants';

@Injectable({ providedIn: 'root' })
export class ChatRoomService {
  users: Userr[] = [];
  conversations: Messagee[] = [];
  chatRoom: ChatRoom[] = [];
  idNguoiDungHienTai: string | null = sessionStorage.getItem('userId');

  constructor(private http: HttpClient, private apiService: ApiService) { }

  getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `${token}` });
  }

  createChatRoom(roomData: { members: string[], chatRoomName?: string, image?: string }): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(this.apiService.getApiUrl('chatroom'), roomData, {
      headers: this.getHeaders()
    });
  }

  getChatRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(this.apiService.getApiUrl('chatroom'), {
      headers: this.getHeaders()
    });
  }

  getChatRoomsById(chatRoomId: string): Observable<ChatRoom> {
    return this.http.get<ChatRoom>(this.apiService.getApiUrl(`chatroom/${chatRoomId}`), {
      headers: this.getHeaders()
    });
  }

  updateChatRoom(data: {
    chatRoomId: string;
    chatRoomName?: string;
    members?: string[];
    image?: string;
    newAdmin?: string;
  }): Observable<ChatRoom> {
    return this.http.put<ChatRoom>(
      this.apiService.getApiUrl('chatroom'),
      data,
      { headers: this.getHeaders() }
    );
  }
  

  inviteToChatRoom(userId: string, chatRoomId: string): Observable<any> {
    return this.http.post<any>(
      this.apiService.getApiUrl('chatroom/invite'),
      { userId, chatRoomId },
      { headers: this.getHeaders() }
    );
  }
  

  deleteChatRoom(chatRoomId: string): Observable<ChatRoom> {
    return this.http.delete<ChatRoom>(this.apiService.getApiUrl(`chatroom/${chatRoomId}`), {
      headers: this.getHeaders()
    });
  }
}