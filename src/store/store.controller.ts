import { Controller, Get } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('room')
  getRoomStorage() {
    return this.storeService.getRoomStorage();
  }

  @Get('user')
  getConnectedUserPull() {
    return this.storeService.getConnectedUserPull();
  }

  @Get('vote')
  getVoteStorage() {
    return this.storeService.getVoteStorage();
  }

  @Get('admin')
  getAdminRoomKeys() {
    return this.storeService.getAdminRoomKeys();
  }
}
