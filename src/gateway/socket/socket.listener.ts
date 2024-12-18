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

  // @SubscribeMessage('taskEnd')
  // navigateUser(@MessageBody() data: TaskEndVote) {
  //   const existingRoom = this.rooms[data.sessionId]?.[0];
  //   const taskIndex = existingRoom.task.findIndex(
  //     (task) => task.task === data.task,
  //   );
  //   if (taskIndex === -1) {
  //     console.error(`Task not found in session ${data.sessionId}`);
  //     return;
  //   }
  //   existingRoom.task.splice(taskIndex, 1);
  //   existingRoom.completedTask.push({
  //     task: data.task,
  //     taskStatus: 'completed',
  //   });
  //   existingRoom.voteStatus = 'task adding';
  //   this.votes[data.sessionId] = [];
  //   this.server.emit(data.sessionId, {
  //     eventType: 'navigate',
  //   });
  // }
  //
  // @SubscribeMessage('addNewTask')
  // addTask(@MessageBody() data: AddNewTask) {
  //   const roomState = this.rooms[data.sessionId]?.[0];
  //   if (roomState) {
  //     roomState.task.push({ task: data.task, taskStatus: 'waiting' });
  //   }
  //   this.votes[data.sessionId] = [];
  //   roomState.voteStatus = 'voting';
  //   this.server.emit(data.sessionId, {
  //     eventType: 'taskAdded',
  //   });
  // }
  //
  // @SubscribeMessage('isUsernameExist')
  // isUserExist(client: SocketListener, data: User) {
  //   const { sessionId, username, connectionId } = data;
  //   const existingRoom = this.rooms[sessionId];
  //   const existingUser = existingRoom[0].users.find(
  //     (user) => user === username,
  //   );
  //   if (existingUser) {
  //     client.emit('isExist', { eventType: 'isExist', message: 2 });
  //     return;
  //   }
  //   if (!this.users[sessionId]) {
  //     this.users[sessionId] = [];
  //   }
  //   this.users[sessionId].push({
  //     username: username,
  //     connectionId: connectionId,
  //   });
  //   existingRoom?.[0].users.push(username);
  //   client.emit(sessionId, { eventType: 'isExist', message: 200 });
  // }
  //
  //
  // @SubscribeMessage('amIExist')
  // amIExist(client: SocketListener, data: JoinRoom) {
  //   const { sessionId, username, connectionId, key } = data;
  //   const userList = this.users[sessionId] || [];
  //   const existingUser = userList.find(
  //     (user) => user.connectionId === connectionId,
  //   );
  //   if (existingUser) {
  //     const room = this.rooms[sessionId]?.[0];
  //     if (!room.users.includes(username)) {
  //       room.users.push(username);
  //     }
  //     if (room.quitedUsers.includes(username)) {
  //       const quitedUserIndex = room.quitedUsers.findIndex(
  //         (user) => user === username,
  //       );
  //       room.quitedUsers.splice(quitedUserIndex, 1);
  //     }
  //     client.emit(sessionId, { eventType: 'isExist', message: 3 });
  //     client.emit('joinRoom', {
  //       votes: this.votes[sessionId],
  //       room,
  //       userType: this.admins[sessionId] === key ? 'admin' : 'user',
  //     });
  //     this.server.emit(sessionId, {
  //       eventType: 'userStatusChange',
  //       users: room.users,
  //       quitedUsers: room.quitedUsers,
  //     });
  //     return;
  //   }
  //   client.emit(sessionId, { eventType: 'isExist', message: 4 });
  // }
  //
  // @SubscribeMessage('manuelDisconnect')
  // manuelDisconnect(
  //   @MessageBody()
  //   data: {
  //     username: string;
  //     sessionId: string;
  //     connectionId: string;
  //   },
  // ) {
  //   const { username, sessionId, connectionId } = data;
  //   const existingRoom = this.rooms[sessionId]?.[0];
  //   const quitedUser = existingRoom.quitedUsers || [];
  //   quitedUser.push(username);
  //   this.server.emit(sessionId, {
  //     eventType: 'userStatusChange',
  //     users: existingRoom.users,
  //     quitedUsers: existingRoom.quitedUsers,
  //   });
  // }
  //
  // @SubscribeMessage('endSession')
  // endSession(@MessageBody() data: { sessionId: string }) {
  //   this.server.emit(data.sessionId, { eventType: 'endSession' });
  //   delete this.rooms[data.sessionId];
  //   delete this.admins[data.sessionId];
  //   delete this.votes[data.sessionId];
  //   delete this.users[data.sessionId];
  // }
}
