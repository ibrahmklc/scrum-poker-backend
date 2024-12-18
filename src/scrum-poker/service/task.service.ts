import { Injectable } from '@nestjs/common';
import { StoreService } from '../../store/store.service';
import { TaskRequest } from '../../dto';

@Injectable()
export class TaskService {
  constructor(private readonly storeService: StoreService) {}

  private get room() {
    return this.storeService.getRoomStorage();
  }
  private get votes() {
    return this.storeService.getVoteStorage();
  }

  taskEnd(data: TaskRequest) {
    const { sessionId, task } = data;
    const roomData = this.room[sessionId][0];
    const taskIndex = roomData.task.findIndex((t) => t.task === task);
    if (taskIndex === -1) {
      return false;
    }
    roomData.voteStatus = 'task adding';
    roomData.task.splice(taskIndex, 1);
    roomData.completedTask.push({
      task,
      taskStatus: 'completed',
    });
  }

  addNewTask(data: TaskRequest) {
    const { sessionId, task } = data;
    const roomData = this.room[sessionId][0];
    roomData.task.push({
      task,
      taskStatus: 'waiting',
    });
    roomData.voteStatus = 'voting';
    this.votes[sessionId] = [];
  }
}
