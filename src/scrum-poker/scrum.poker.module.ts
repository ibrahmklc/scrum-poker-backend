import { Module } from '@nestjs/common';
import { RoomService } from './service/room.service';
import { UserService } from './service/user.service';
import { VoteService } from './service/vote.service';
import { CardService } from './service/card.service';
import { StoreModule } from '../store/strore.module';
import { TaskService } from './service/task.service';

@Module({
  imports: [StoreModule],
  controllers: [],
  providers: [RoomService, UserService, VoteService, CardService, TaskService],
  exports: [RoomService, UserService, VoteService, TaskService],
})
export class ScrumPokerModule {}
