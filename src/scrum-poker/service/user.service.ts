import { Injectable } from '@nestjs/common';
import { StoreService } from '../../store/store.service';
import { User } from '../../dto';
import { VoteService } from './vote.service';

@Injectable()
export class UserService {
  constructor(
    private readonly storeService: StoreService,
    private readonly voteService: VoteService,
  ) {}

  private get users() {
    return this.storeService.getConnectedUserPull();
  }

  private get admin() {
    return this.storeService.getAdminRoomKeys();
  }

  private get room() {
    return this.storeService.getRoomStorage();
  }

  addUser(data: User) {
    const { sessionId, username, connectionId } = data;
    if (!this.users[sessionId]) {
      this.users[sessionId] = [];
    }
    this.room[sessionId][0].users.push(username);
    this.users[sessionId].push({ username, connectionId });
  }

  isUserExist(username: string, sessionId: string, connectionId: string) {
    const user = this.users[sessionId];
    if (!user) {
      return false;
    }
    if (
      !user.find((user) => user.username === username) &&
      !user.find((user) => user.connectionId === connectionId)
    ) {
      return false;
    }
    return true;
  }

  getAdminRoomKey(sessionId: string, key: string) {
    let user = 'user';
    if (this.admin[sessionId] === key) {
      user = 'admin';
    }
    return user;
  }

  isUsernameExist(data: User) {
    const { sessionId, username } = data;
    const user = this.room[sessionId]?.[0].users.find(
      (user) => user === username,
    );
    if (user) {
      return false; // 2;
    }
    this.addUser(data);
    return true; // 200;
  }

  amIExist(data: User) {
    const { sessionId, username, connectionId } = data;
    const userList = this.users[sessionId] || [];
    const existingUser = userList.find(
      (user) => user.connectionId === connectionId,
    );
    if (existingUser) {
      const room = this.room[sessionId]?.[0];
      if (!room.users.includes(username)) {
        room.users.push(username);
      }
      return true; // 3;
    }
    return false; // 4;
  }

  manuelDisconnect(data: User) {
    const { sessionId, username, connectionId } = data;
    const userList = this.users[sessionId] || [];
    const existingUser = userList.find(
      (user) => user.connectionId === connectionId,
    );
    if (existingUser) {
      const room = this.room[sessionId]?.[0];
      const userIndex = room.users.findIndex((user) => user === username);
      room.users.splice(userIndex, 1);
      this.voteService.deleteVote(sessionId, username);
    }
  }

  checkUserPullLength(sessionId: string) {
    return this.users[sessionId]?.length;
  }
}
