import type { Agent } from '../types';

const now = new Date();
const pastISO = (sec: number) => new Date(now.getTime() - sec * 1000).toISOString();

export const sampleAgent: Agent = {
  id: 'a-001',
  name: 'Lerato Vilakazi',
  status: 'Ready',
  lastStatusChange: pastISO(240),
  goals: { calls: 50, sales: 5 },
  diallerStats: {
    calls: 25,
    sales: 3,
    timeInCalls: 2800,
    timeInWrap: 500
  },
  tasks: [
    { id: 't1', text: 'Warm-up calls', done: false },
    { id: 't2', text: 'Follow-up callbacks', done: true }
  ],
  activityLog: [
    { timestamp: pastISO(3600), message: 'Logged in' },
    { timestamp: pastISO(240), message: 'Status changed to Ready' }
  ]
};