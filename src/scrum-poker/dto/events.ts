import { VoteStorage } from '../../store/store.service';

interface UserStatusChange {
  eventType: 'userStatusChange';
  users: string[];
}

interface VoteStatusChange {
  eventType: 'voteEnd';
  votes: VoteStorage[];
}

interface NewVote {
  eventType: 'newVote';
  votes: VoteStorage[];
}

interface NavigateUser {
  eventType: 'navigate';
}

interface IsExist {
  eventType: 'isExist';
  message: number;
}

interface TaskAdded {
  eventType: 'taskAdded';
}

interface SessionEnd {
  eventType: 'endSession';
}

export type EventTypes =
  | UserStatusChange
  | VoteStatusChange
  | NewVote
  | NavigateUser
  | IsExist
  | TaskAdded
  | SessionEnd;
