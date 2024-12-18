import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { StoreService } from '../../store/store.service';
import { Room } from '../../dto';
import { CardService } from './card.service';
class CreateRoom {
  roomRule: string;
  roomName: string;
  task: string;
  incAmount: string;
  sessionId: string;
  key: string;
}
@Injectable()
export class RoomService {
  constructor(
    private readonly storeService: StoreService,
    private readonly cardService: CardService,
  ) {}

  private get users() {
    return this.storeService.getConnectedUserPull();
  }

  private get rooms() {
    return this.storeService.getRoomStorage();
  }

  private get admins() {
    return this.storeService.getAdminRoomKeys();
  }

  private get votes() {
    return this.storeService.getVoteStorage();
  }

  setRoomInStore(sessionId: string) {
    if (!this.rooms[sessionId]) {
      this.rooms[sessionId] = [];
    }
  }

  createRoom(data: CreateRoom) {
    const { roomRule, roomName, incAmount, task, sessionId, key } = data;

    if (!sessionId || !roomName || !task || !key) {
      throw new BadRequestException(
        'Eksik parametreler: sessionId, roomName, task, key gerekli.',
      );
    }

    try {
      this.setRoomInStore(sessionId);

      const roomData = {
        cards: this.cardService.cardGenerate(roomRule, incAmount),
        roomName: roomName,
        roomRule: roomRule,
        completedTask: [],
        task: [{ task: task, taskStatus: 'waiting' }],
        users: [],
        voteStatus: 'voting',
      } as Room;

      this.rooms[sessionId].push(roomData);
      this.admins[sessionId] = key;
    } catch (error) {
      console.error('createRoom sırasında hata oluştu:', error);
      throw new InternalServerErrorException(
        'Oda oluşturulurken bir hata meydana geldi.',
      );
    }
  }

  getRoom(sessionId: string) {
    return this.rooms[sessionId]?.[0];
  }

  isRoomExist(sessionId: string) {
    return !!this.rooms[sessionId];
  }

  deleteSession(sessionId: string) {
    delete this.rooms[sessionId];
    delete this.admins[sessionId];
    delete this.votes[sessionId];
    delete this.users[sessionId];
  }
}
