// src/state/directory.ts
export type DirStatus =
  | 'Ready' | 'On Call' | 'Post-Call Work' | 'Break'
  | 'Lunch' | 'Training' | 'Offline' | 'Away';

export type DirEvent = {
  type: 'StatusChanged';
  status: DirStatus;
  reason?: string | null;
  start: string; // ISO
  end?: string | null;
};

export type DirInboxItem = {
  id?: string;
  from: string;
  fromRole?: string;
  fromId?: string;
  timestamp: string;
  message: string;
  isUnread: boolean;
};

export type DirAgent = {
  id: string;
  name: string;
  role: 'director' | 'teamLeader' | 'agent';
  campaignId?: string;
  teamId?: string;
  status: DirStatus;
  lastStatusChange: string;
  timezone: string;
  goals: { calls: number; sales: number };
  diallerStats: {
    calls: number; sales: number; droppedCalls: number;
    timeInCalls: number; timeInWrap: number;
    callDispositions?: Record<string, number>;
  };
  inbox: DirInboxItem[];
  events: DirEvent[];
};

export type DirTeam = { teamId: string; campaignId: string; leaderId: string; agentIds: string[] };
export type DirCampaign = { campaignId: string; directorId: string; teamIds: string[] };

export type Directory = {
  version: number;
  campaigns: DirCampaign[];
  teams: DirTeam[];
  agents: DirAgent[];
};

const KEY = 'nexus-mui-directory';
const VERSION = 2; // bump this if you change seed shape

function pad(n: number) { return String(n).padStart(2,'0'); }
function isoPast(sec: number) { return new Date(Date.now() - sec*1000).toISOString(); }

function seedDirectory(): Directory {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const agents: DirAgent[] = [
    { id: 'agent-016', name: 'Nomusa Dube', role: 'director', campaignId: 'A', status: 'Offline', lastStatusChange: isoPast(3600), timezone: tz, goals: { calls: 0, sales: 0 }, diallerStats: { calls: 0, sales: 0, droppedCalls: 0, timeInCalls: 0, timeInWrap: 0 }, inbox: [], events: [] },

    { id: 'agent-006', name: 'Thabo Mkhize', role: 'teamLeader', campaignId: 'A', teamId: 'Team 1', status: 'Ready', lastStatusChange: isoPast(200), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 90, sales: 9, droppedCalls: 2, timeInCalls: 5600, timeInWrap: 1200 }, inbox: [], events: [{ type:'StatusChanged', status:'Ready', start: isoPast(3600) }] },
    { id: 'agent-001', name: 'Lerato Vilakazi', role: 'agent', campaignId: 'A', teamId: 'Team 1', status: 'Ready', lastStatusChange: isoPast(240), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 25, sales: 3, droppedCalls: 2, timeInCalls: 2800, timeInWrap: 500, callDispositions: { 'Sale': 3, 'Not Interested': 12, 'Callback': 8, 'Voicemail': 2 } }, inbox: [], events: [{ type:'StatusChanged', status:'Ready', start: isoPast(10800), end: isoPast(7200) }, { type:'StatusChanged', status:'On Call', start: isoPast(7200), end: isoPast(6840) }, { type:'StatusChanged', status:'Break', start: isoPast(600), end: isoPast(240) }, { type:'StatusChanged', status:'Ready', start: isoPast(240) }] },
    { id: 'agent-002', name: 'Sipho Ndlovu', role: 'agent', campaignId: 'A', teamId: 'Team 1', status: 'On Call', lastStatusChange: isoPast(60), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 18, sales: 1, droppedCalls: 1, timeInCalls: 2000, timeInWrap: 350, callDispositions: { 'Sale': 1, 'Not Interested': 10, 'Callback': 6, 'Voicemail': 1 } }, inbox: [], events: [{ type:'StatusChanged', status:'Ready', start: isoPast(7200), end: isoPast(4500) }, { type:'StatusChanged', status:'On Call', start: isoPast(60) }] },
    { id: 'agent-003', name: 'Mbali Dlamini', role: 'agent', campaignId: 'A', teamId: 'Team 1', status: 'Ready', lastStatusChange: isoPast(10), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 22, sales: 2, droppedCalls: 0, timeInCalls: 2100, timeInWrap: 400, callDispositions: { 'Sale': 2, 'Not Interested': 15, 'Callback': 5 } }, inbox: [], events: [{ type:'StatusChanged', status:'Ready', start: isoPast(9000) }] },

    { id: 'agent-007', name: 'Zanele Khumalo', role: 'teamLeader', campaignId: 'A', teamId: 'Team 2', status: 'Ready', lastStatusChange: isoPast(180), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 48, sales: 6, droppedCalls: 0, timeInCalls: 4300, timeInWrap: 900 }, inbox: [], events: [{ type:'StatusChanged', status:'Ready', start: isoPast(3600) }] },
    { id: 'agent-004', name: 'Naledi Sithole', role: 'agent', campaignId: 'A', teamId: 'Team 2', status: 'Lunch', lastStatusChange: isoPast(300), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 8, sales: 0, droppedCalls: 2, timeInCalls: 700, timeInWrap: 150 }, inbox: [], events: [{ type:'StatusChanged', status:'Lunch', start: isoPast(300) }] },
    { id: 'agent-005', name: 'Vusi Zulu', role: 'agent', campaignId: 'A', teamId: 'Team 2', status: 'Break', lastStatusChange: isoPast(180), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 20, sales: 3, droppedCalls: 0, timeInCalls: 2200, timeInWrap: 450 }, inbox: [], events: [{ type:'StatusChanged', status:'Break', start: isoPast(180) }] },

    { id: 'agent-008', name: 'Mandla Kubheka', role: 'teamLeader', campaignId: 'A', teamId: 'Team 3', status: 'Ready', lastStatusChange: isoPast(120), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 46, sales: 6, droppedCalls: 0, timeInCalls: 4200, timeInWrap: 800 }, inbox: [], events: [{ type:'StatusChanged', status:'Ready', start: isoPast(3600) }] },
    { id: 'agent-011', name: 'Tshepo Nkosi', role: 'agent', campaignId: 'A', teamId: 'Team 3', status: 'Ready', lastStatusChange: isoPast(600), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 12, sales: 1, droppedCalls: 0, timeInCalls: 1050, timeInWrap: 250 }, inbox: [], events: [{ type:'StatusChanged', status:'Ready', start: isoPast(600) }] },
    { id: 'agent-012', name: 'Kabelo Motsoene', role: 'agent', campaignId: 'A', teamId: 'Team 3', status: 'Offline', lastStatusChange: isoPast(10000), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 7, sales: 1, droppedCalls: 1, timeInCalls: 650, timeInWrap: 120 }, inbox: [], events: [{ type:'StatusChanged', status:'Offline', start: isoPast(10000) }] },
    { id: 'agent-013', name: 'Lungile Mfeka', role: 'agent', campaignId: 'A', teamId: 'Team 3', status: 'Ready', lastStatusChange: isoPast(50), timezone: tz, goals: { calls: 50, sales: 5 }, diallerStats: { calls: 15, sales: 3, droppedCalls: 0, timeInCalls: 1400, timeInWrap: 300 }, inbox: [], events: [{ type:'StatusChanged', status:'Ready', start: isoPast(50) }] }
  ];

  const teams: DirTeam[] = [
    { teamId: 'Team 1', campaignId: 'A', leaderId: 'agent-006', agentIds: ['agent-001','agent-002','agent-003'] },
    { teamId: 'Team 2', campaignId: 'A', leaderId: 'agent-007', agentIds: ['agent-004','agent-005'] },
    { teamId: 'Team 3', campaignId: 'A', leaderId: 'agent-008', agentIds: ['agent-011','agent-012','agent-013'] }
  ];
  const campaigns: DirCampaign[] = [{ campaignId: 'A', directorId: 'agent-016', teamIds: ['Team 1','Team 2','Team 3'] }];

  return { version: VERSION, campaigns, teams, agents };
}

export function ensureDirectorySeed(): Directory {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Directory;
      if (d.version === VERSION) return d;
    }
  } catch {}
  const d = seedDirectory();
  localStorage.setItem(KEY, JSON.stringify(d));
  return d;
}

export function readDirectory(): Directory {
  return ensureDirectorySeed();
}

// Hydration helpers
export function getTeamState(teamId: string) {
  const d = ensureDirectorySeed();
  const t = d.teams.find(x => x.teamId === teamId);
  if (!t) return null;
  const leader = d.agents.find(a => a.id === t.leaderId)!;
  const agents = t.agentIds.map(id => d.agents.find(a => a.id === id)!).filter(Boolean);
  return { leader, agents };
}
export function getCampaignState(campaignId: string) {
  const d = ensureDirectorySeed();
  const c = d.campaigns.find(c => c.campaignId === campaignId);
  if (!c) return null;
  const director = d.agents.find(a => a.id === c.directorId)!;
  const teams = c.teamIds.map(tid => {
    const t = d.teams.find(tt => tt.teamId === tid)!;
    const leader = d.agents.find(a => a.id === t.leaderId)!;
    const agents = t.agentIds.map(id => d.agents.find(a => a.id === id)!).filter(Boolean);
    return { teamId: t.teamId, leader, agents };
  });
  return { director, teams };
}
export function teamsInCampaign(campaignId: string) {
  const d = ensureDirectorySeed();
  const c = d.campaigns.find(c => c.campaignId === campaignId);
  return c ? c.teamIds : [];
}
export function findAgent(agentId: string) {
  const d = ensureDirectorySeed();
  return d.agents.find(a => a.id === agentId);
}

// Mutation helpers: always update directory and broadcast
function saveAndBroadcast(d: Directory) {
  localStorage.setItem(KEY, JSON.stringify(d));
  window.dispatchEvent(new CustomEvent('directory:changed'));
}

export function setAgentStatusInDirectory(agentId: string, newStatus: DirStatus, reason?: string) {
  const d = ensureDirectorySeed();
  const a = d.agents.find(x => x.id === agentId);
  if (!a || a.status === newStatus) return;
  const now = new Date().toISOString();
  const open = (a.events || []).find(e => e.type === 'StatusChanged' && !e.end);
  if (open) open.end = now;
  a.events = [...(a.events||[]), { type:'StatusChanged', status:newStatus, reason, start: now }];
  a.status = newStatus;
  a.lastStatusChange = now;
  saveAndBroadcast(d);
}

export function addMessageToAgentInDirectory(agentId: string, msg: DirInboxItem) {
  const d = ensureDirectorySeed();
  const a = d.agents.find(x => x.id === agentId);
  if (!a) return;
  a.inbox = [...(a.inbox || []), msg];
  saveAndBroadcast(d);
}