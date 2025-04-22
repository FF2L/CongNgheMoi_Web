import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:5000');

    this.socket.on('connect', () => {
      console.log('Socket connected successfully!');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });
  }

  joinRoom(userId: string): void {
    this.socket.emit("join", userId);
    console.log('User joined room:', userId);
  }

  onNewMessage(callback: (message: any) => void): void {
    this.socket.on("new-message", callback);
    this.socket.on("message-created", callback);
    this.socket.on("messages-created", callback);
  }

  onNewChatRoom(callback: (chatRoom: any) => void): void {
    this.socket.on("new-chatRoom", callback);
  }

  onNewRecall(callback: (recallmessage: any) => void): void {
    this.socket.on('recall', callback);
  }

  sendMessage(chatRoomId: string, message: any): void {
    console.log('Sending message via socket:', { chatRoomId, message });

    this.socket.emit('create-message', { chatRoomId, data: message });

  }
}