export class CreateRoomRequest {
  roomRule: string;
  roomName: string;
  task: string;
  incAmount: string;
}

export class User {
  username: string;
  sessionId: string;
  connectionId: string;
  key: string;
}

export class Card {
  key: string;
  value: string;
}

export class Vote {
  sessionId: string;
  username: string;
  card: Card;
}

export class Auth {
  username: string;
  sessionId: string;
  connectionId: string;
}

export class Room {
  roomRule: string;
  roomName: string;
  task: Task[];
  completedTask: Task[];
  cards: Card[];
  users: string[];
  voteStatus: string;
}

class Task {
  task: string;
  taskStatus: string;
}

export class JoinRoom {
  sessionId: string;
  username: string;
  key: string;
  connectionId: string;
}

export class TaskRequest {
  sessionId: string;
  task: string;
}

