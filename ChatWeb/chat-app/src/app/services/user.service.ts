import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Userr } from '../models/user.model';
import { Messagee } from '../models/message.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  users: Userr[] = [];
  conversations: Messagee[] = [];
  idNguoiDungHienTai: string | null = sessionStorage.getItem('userId');

  constructor(private http: HttpClient, private apiService: ApiService) { }

  getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `${token}` });
  }

  getUsers(): Observable<Userr[]> {
    return this.http.get<Userr[]>(this.apiService.getApiUrl('user/alluser'), {
      headers: this.getHeaders()
    });
  }

  getFriends(): Observable<Userr[]> {
    return this.http.get<Userr[]>(this.apiService.getApiUrl('user/allfriend'), {
      headers: this.getHeaders()
    });
  }

  updateUser(): Observable<Userr[]> {
    return this.http.put<Userr[]>(this.apiService.getApiUrl('user/updateuser'), {
      headers: this.getHeaders()
    });
  }

  getUserById(userId: string): Observable<Userr> {
    return this.http.get<Userr>(this.apiService.getApiUrl(`user/${userId}`), {
      headers: this.getHeaders()
    });
  }

  addFriend(userId: string): Observable<Userr> {
    const body = { userId };
    return this.http.post<Userr>(this.apiService.getApiUrl('user/sendreqfriend'), body, {
      headers: this.getHeaders()
    });
  }

  requestResponse(code: string, userId: string): Observable<Userr[]> {
    const body = { userId };
    return this.http.post<Userr[]>(this.apiService.getApiUrl(`user/resfriend/${code}`), body, {
      headers: this.getHeaders()
    });
  }

  unFriendRequest(friendId: string): Observable<Userr> {
    const options = {
      headers: this.getHeaders(),
      body: { friendId }
    };
    return this.http.delete<Userr>(this.apiService.getApiUrl('user/unfriend'), options);
  }
}