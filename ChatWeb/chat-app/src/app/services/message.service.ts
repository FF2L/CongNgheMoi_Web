import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Messagee } from '../models/message.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private http: HttpClient, private apiService: ApiService) { }

  getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `${token}` });
  }

  createMessage(chatId: string, content: any, files?: FormData): Observable<Messagee> {
    const body = { chatId, content };
    const headers = this.getHeaders();

    if (files) {
      return this.http.post<Messagee>(this.apiService.getApiUrl('message'), files, {
        headers,
        params: { chatId },
      });
    } else {
      return this.http.post<Messagee>(this.apiService.getApiUrl('message'), body, { headers });
    }
  }

  getAllMessages(chatId: string): Observable<Messagee[]> {
    const headers = this.getHeaders();
    return this.http.get<Messagee[]>(this.apiService.getApiUrl(`message/${chatId}`), { headers });
  }

  recallMessage(code: string, messageId: string): Observable<Messagee> {
    const headers = this.getHeaders();
    const body = { _id: messageId };
    return this.http.post<Messagee>(this.apiService.getApiUrl(`message/recall/${code}`), body, { headers });
  }

  replyToMessage(messageId: string, replyContent: string): Observable<Messagee> {
    const body = { _id: messageId, content: replyContent };
    const headers = this.getHeaders();
    return this.http.post<Messagee>(this.apiService.getApiUrl('message/reply/'), body, { headers });
  }
}