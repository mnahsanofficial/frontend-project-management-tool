import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl, {
      withCredentials: true,
      autoConnect: false
    });
  }

  connect(): void {
    this.socket.connect();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  onProjectUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('projectUpdate', (data: any) => observer.next(data));
    });
  }

  onTaskUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('taskUpdate', (data: any) => observer.next(data));
    });
  }

  joinProjectRoom(projectId: string): void {
    this.socket.emit('joinProjectRoom', projectId);
  }

  leaveProjectRoom(projectId: string): void {
    this.socket.emit('leaveProjectRoom', projectId);
  }
}