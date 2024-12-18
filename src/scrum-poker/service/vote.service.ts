import { Injectable } from '@nestjs/common';
import { StoreService } from '../../store/store.service';
import { Card } from '../../dto';

@Injectable()
export class VoteService {
  constructor(private readonly storeService: StoreService) {}

  private get votes() {
    return this.storeService.getVoteStorage();
  }

  getVotes(sessionId: string) {
    return this.votes[sessionId];
  }

  setVoteInStore(sessionId: string) {
    if (!this.votes[sessionId]) {
      this.votes[sessionId] = [];
    }
  }

  addVote(sessionId: string, username: string, card: Card) {
    this.setVoteInStore(sessionId);
    const existingVote = this.votes[sessionId].find(
      (vote) => vote.username === username,
    );
    if (existingVote) {
      existingVote.card.value = card.value;
    } else {
      this.votes[sessionId].push({ username, card: card });
    }
  }

  deleteVote(sessionId: string, username: string) {
    const voteIndex = this.votes[sessionId].findIndex(
      (vote) => vote.username === username,
    );
    if (voteIndex !== -1) {
      this.votes[sessionId].splice(voteIndex, 1);
    }
  }
}
