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
import {
  CreateRoomRequest,
  User,
  JoinRoom,
  Vote,
  TaskRequest,
} from '../../dto';
import { RoomService } from '../../scrum-poker/service/room.service';
import { EventHandler } from './event.handler';
import { UserService } from '../../scrum-poker/service/user.service';
import { VoteService } from '../../scrum-poker/service/vote.service';
import { TaskService } from '../../scrum-poker/service/task.service';

class SessionId {
  sessionId: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class SocketListener implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly roomService: RoomService,
    private readonly eventHandler: EventHandler,
    private readonly userService: UserService,
    private readonly voteService: VoteService,
    private readonly taskService: TaskService,
  ) {}

  afterInit() {
    console.log('ClientEventGateway initialized');
  }

  @SubscribeMessage('createRoom')
  createRoomHandler(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateRoomRequest,
  ) {
    const sessionId = crypto.randomUUID();
    const key = crypto.randomUUID();
    try {
      this.roomService.createRoom({ ...data, sessionId: sessionId, key: key });
      client.emit('createRoom', {
        sessionId: sessionId,
        key: key,
      });
    } catch (error) {
      console.error('Error creating room', error);
    }
  }

  @SubscribeMessage('isUsernameExist')
  isUsernameExistHandler(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: User,
  ) {
    if (!this.userService.isUsernameExist(data)) {
      this.eventHandler.eventHandler(
        {
          eventType: 'isExist',
          message: 5,
        },
        data.sessionId,
        client,
      );
      return;
    }
    this.eventHandler.eventHandler(
      {
        eventType: 'isExist',
        message: 200,
      },
      data.sessionId,
      client,
    );
  }

  @SubscribeMessage('amIExist')
  amIExistHandler(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: User,
  ) {
    if (!this.userService.amIExist(data)) {
      this.eventHandler.eventHandler(
        {
          eventType: 'isExist',
          message: 4,
        },
        data.sessionId,
        client,
      );
      return;
    }
    const room = this.roomService.getRoom(data.sessionId);
    this.eventHandler.eventHandler(
      {
        eventType: 'isExist',
        message: 3,
      },
      data.sessionId,
      client,
    );
    this.eventHandler.eventHandler(
      {
        eventType: 'userStatusChange',
        users: room.users,
      },
      data.sessionId,
    );
    client.emit('joinRoom', {
      votes: this.voteService.getVotes(data.sessionId),
      room: room,
      userType: this.userService.getAdminRoomKey(data.sessionId, data.key),
    });
  }

  @SubscribeMessage('isRoomExist')
  isRoomExistHandler(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SessionId,
  ) {
    const { sessionId } = data;
    if (!this.roomService.isRoomExist(sessionId)) {
      this.eventHandler.eventHandler(
        {
          eventType: 'isExist',
          message: 1,
        },
        sessionId,
        client,
      );
      return;
    }
    this.eventHandler.eventHandler(
      {
        eventType: 'isExist',
        message: 2,
      },
      sessionId,
      client,
    );
  }

  @SubscribeMessage('joinRoom')
  joinRoomHandler(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoom,
  ) {
    const { sessionId, username, key, connectionId } = data;
    if (!this.userService.isUserExist(username, sessionId, connectionId)) {
      this.eventHandler.eventHandler(
        {
          eventType: 'isExist',
          message: 2,
        },
        sessionId,
      );
      return;
    }
    const room = this.roomService.getRoom(sessionId);
    client.emit('joinRoom', {
      message: 200,
      votes: this.voteService.getVotes(sessionId),
      room: room,
      userType: this.userService.getAdminRoomKey(sessionId, key),
    });
    this.eventHandler.eventHandler(
      {
        eventType: 'userStatusChange',
        users: room.users,
      },
      sessionId,
    );
  }

  @SubscribeMessage('vote')
  voteHandler(@MessageBody() data: Vote) {
    const { sessionId, username, card } = data;
    this.voteService.addVote(sessionId, username, card);
    this.eventHandler.eventHandler(
      {
        eventType: 'newVote',
        votes: this.voteService.getVotes(sessionId),
      },
      sessionId,
    );
  }

  @SubscribeMessage('voteEnd')
  voteEndHandler(@MessageBody() data: { sessionId: string }) {
    const room = this.roomService.getRoom(data.sessionId);
    room.voteStatus = 'ended';
    this.eventHandler.eventHandler(
      {
        eventType: 'voteEnd',
        votes: this.voteService.getVotes(data.sessionId),
      },
      data.sessionId,
    );
  }

  @SubscribeMessage('taskEnd')
  taskEndHandler(@MessageBody() data: TaskRequest) {
    this.taskService.taskEnd(data);
    this.eventHandler.eventHandler(
      {
        eventType: 'navigate',
      },
      data.sessionId,
    );
  }

  @SubscribeMessage('addNewTask')
  addNewTaskHandler(@MessageBody() data: TaskRequest) {
    this.taskService.addNewTask(data);
    this.eventHandler.eventHandler(
      {
        eventType: 'taskAdded',
      },
      data.sessionId,
    );
  }

  @SubscribeMessage('manuelDisconnect')
  manuelDisconnectHandler(@MessageBody() data: User) {
    const room = this.roomService.getRoom(data.sessionId);
    this.userService.manuelDisconnect(data);
    this.eventHandler.eventHandler(
      {
        eventType: 'userStatusChange',
        users: room.users || [],
      },
      data.sessionId,
    );
  }

  @SubscribeMessage('endSession')
  endSessionHandler(@MessageBody() data: { sessionId: string }) {
    this.roomService.deleteSession(data.sessionId);
    this.eventHandler.eventHandler(
      {
        eventType: 'endSession',
      },
      data.sessionId,
    );
  }
}
