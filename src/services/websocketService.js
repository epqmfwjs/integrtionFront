// src/services/websocketService.js
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscribers = new Set();
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          brokerURL: 'ws://localhost:5000/ws',  // 포트를 5000으로 수정
          connectHeaders: {},
          debug: function (str) {
            console.log(str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
          console.log('Connected:', frame);
          
          // 플레이어 정보 구독
          this.client.subscribe('/topic/players', (message) => {
            try {
              const players = JSON.parse(message.body);
              this.subscribers.forEach(callback => callback(players));
            } catch (error) {
              console.error('Failed to parse message:', error);
            }
          });

          resolve();
        };

        this.client.onStompError = (frame) => {
          console.error('Broker reported error:', frame.headers['message']);
          console.error('Additional details:', frame.body);
          reject(new Error(frame.headers['message']));
        };

        this.client.activate();
      } catch (error) {
        console.error('Connection error:', error);
        reject(error);
      }
    });
  }

  onPlayersUpdate(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  sendPosition(nickname, position) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/position',
        body: JSON.stringify({ nickname, position })
      });
    }
  }

  sendJoin(nickname, position) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/join',
        body: JSON.stringify({ nickname, position })
      });
    }
  }

  sendLeave(nickname) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/leave',
        body: JSON.stringify({ nickname })
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}

export const websocketService = new WebSocketService();