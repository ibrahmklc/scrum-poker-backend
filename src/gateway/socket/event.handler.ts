import { Injectable } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventTypes } from '../../scrum-poker/dto/events';
@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN || '*' } })
@Injectable()
export class EventHandler implements OnGatewayInit {
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('ServerEventGateway initialized');
  }

  eventHandler(event: EventTypes, sessionId: string, client?: Socket) {
    if (event.eventType === 'isExist') {
      client.emit(sessionId, {
        eventType: 'isExist',
        message: event.message,
      });
    }
    if (event.eventType === 'userStatusChange') {
      this.server.emit(sessionId, {
        eventType: 'userStatusChange',
        users: event.users,
      });
    }
    if (event.eventType === 'newVote') {
      this.server.emit(sessionId, {
        eventType: 'newVote',
        votes: event.votes,
      });
    }
    if (event.eventType === 'voteEnd') {
      this.server.emit(sessionId, {
        eventType: 'voteEnd',
        votes: event.votes,
      });
    }
    if (event.eventType === 'navigate') {
      this.server.emit(sessionId, {
        eventType: 'navigate',
      });
    }
    if (event.eventType === 'taskAdded') {
      this.server.emit(sessionId, {
        eventType: 'taskAdded',
      });
    }
    if (event.eventType === 'endSession') {
      this.server.emit(sessionId, {
        eventType: 'endSession',
      });
    }
  }
}
