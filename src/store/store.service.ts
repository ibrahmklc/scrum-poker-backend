import { Injectable } from '@nestjs/common';
import { Card, Room } from "../dto";
class UsersStorage {
  connectionId: string;
  username: string;
}
export class VoteStorage {
  username: string;
  card: Card;
}
@Injectable()
export class StoreService {
  private roomStorage: { [sessionId: string]: Room[] } = {};
  private adminRoomKeys: { [sessionId: string]: string } = {};
  private voteStorage: { [sessionId: string]: VoteStorage[] } = {};
  private connectedUserPull: { [sessionId: string]: UsersStorage[] } = {};
  public getRoomStorage(): { [sessionId: string]: Room[] } {
    return this.roomStorage;
  }

  public getAdminRoomKeys(): { [sessionId: string]: string } {
    return this.adminRoomKeys;
  }

  public getVoteStorage(): { [sessionId: string]: VoteStorage[] } {
    return this.voteStorage;
  }

  public getConnectedUserPull(): { [connectionId: string]: UsersStorage[] } {
    return this.connectedUserPull;
  }
}
