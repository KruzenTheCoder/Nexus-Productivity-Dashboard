export type StatusLabel =
  | 'Ready' | 'On Call' | 'Post-Call Work' | 'Break' | 'Lunch' | 'Training' | 'Offline' | 'Away';

export type Task = { id: string; text: string; done: boolean };

export type Agent = {
  id: string;
  name: string;
  status: StatusLabel;
  lastStatusChange: string; // ISO
  goals: { calls: number; sales: number };
  diallerStats: {
    calls: number;
    sales: number;
    timeInCalls: number; // seconds
    timeInWrap: number;  // seconds
  };
  tasks: Task[];
  activityLog: { timestamp: string; message: string }[];
};