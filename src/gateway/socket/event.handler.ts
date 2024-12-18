import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventTypes } from '../../scrum-poker/dto/events';
// type EventTypes =
//   | 'userStatusChange'
//   | 'voteEnd'
//   | 'votedUsers'
//   | 'navigate'
//   | 'isExist'
//   | 'unauthorized'
//   | 'taskAdded'
//   | 'endSession';
// type Data = {
//   message?: number | string;
//   users?: { users: string[]; quitedUsers: string }[];
// };
@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class EventHandler implements OnGatewayInit {
  @WebSocketServer() server: Server;

  // constructor(private readonly sharedStorage: SharedStorageService) {}

  afterInit() {
    console.log('ServerEventGateway initialized');
  }

  // private get users() {
  //   return this.sharedStorage.getConnectedUserPull();
  // }
  //
  // private get rooms() {
  //   return this.sharedStorage.getRoomStorage();
  // }
  //
  // private get admins() {
  //   return this.sharedStorage.getAdminRoomKeys();
  // }
  //
  // private get votes() {
  //   return this.sharedStorage.getVoteStorage();
  // }
  //
  // @SubscribeMessage('joinRoom')
  // joinRoomHandler(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: JoinRoom,
  // ) {
  //   const { sessionId, username, key, connectionId } = data;
  //   const existingRoom = this.rooms[sessionId];
  //   if (!this.isExisting(existingRoom, username, sessionId, connectionId)) {
  //     client.emit(sessionId, {
  //       eventType: 'isExist',
  //       message: 4,
  //     });
  //     return;
  //   }
  //   const room = existingRoom[0];
  //   client.emit('joinRoom', {
  //     message: 200,
  //     votes: this.votes[sessionId],
  //     room,
  //     userType: this.admins[sessionId] === key ? 'admin' : 'user',
  //   });
  //   this.server.emit(sessionId, {
  //     eventType: 'userStatusChange',
  //     users: room.users,
  //     quitedUsers: room.quitedUsers,
  //   });
  // }
  //
  // isExisting(
  //   room: Room[],
  //   username: string,
  //   sessionId: string,
  //   connectionId: string,
  // ): boolean {
  //   if (!room) {
  //     return false;
  //   }
  //   const connectedUserPull = this.sharedStorage.getConnectedUserPull();
  //   const user = connectedUserPull[sessionId];
  //   if (!user) {
  //     return false;
  //   }
  //   if (
  //     !user.find((user) => user.username === username) &&
  //     !user.find((user) => user.connectionId === connectionId)
  //   ) {
  //     return false;
  //   }
  //   return true;
  // }
  //
  // @SubscribeMessage('voteEnd')
  // changeHandler(@MessageBody() data: string) {
  //   const roomState = this.rooms[data]?.[0];
  //   if (roomState) {
  //     roomState.voteStatus = 'ended';
  //     this.server.emit(data, {
  //       eventType: 'voteEnd',
  //       vote: this.votes[data],
  //     });
  //   }
  // }
  //
  // @SubscribeMessage('vote')
  // voteHandler(@MessageBody() data: Vote) {
  //   const { sessionId, username, value } = data;
  //   const voteStorage = this.sharedStorage.getVoteStorage();
  //   if (!voteStorage[sessionId]) {
  //     voteStorage[sessionId] = [];
  //   }
  //   const existingVote = voteStorage[sessionId].find(
  //     (vote) => vote.username === username,
  //   );
  //   if (existingVote) {
  //     existingVote.value = value;
  //   } else {
  //     voteStorage[sessionId].push({ username, value });
  //   }
  //   this.server.emit(data.sessionId, {
  //     eventType: 'votedUsers',
  //     vote: voteStorage[sessionId],
  //   });
  // }
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
