import { SocketListener } from './socket/socket.listener';
import { EventHandler } from './socket/event.handler';
import { Module } from '@nestjs/common';
import { ScrumPokerModule } from '../scrum-poker/scrum.poker.module';

@Module({
  imports: [ScrumPokerModule],
  providers: [SocketListener, EventHandler],
})
export class GatewayModule {}
