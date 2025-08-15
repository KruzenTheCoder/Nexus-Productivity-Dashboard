// src/state/useAgent.ts
import React from 'react';

export type StatusLabel =
  | 'Ready'
  | 'On Call'
  | 'Post-Call Work'
  | 'Break'
  | 'Lunch'
  | 'Training'
  | 'Offline'
  | 'Away';

export type AgentEvent = {
  type: 'StatusChanged';
  status: StatusLabel;
  reason?: string | null;
  start: string;
  end?: string | null;
};

export type ActivityLog = { timestamp: string; message: string; duration?: number };
export type InboxItem = {
  id?: string;
  from: string;
  fromRole?: string;
  fromId?: string;
  timestamp: string;
  message: string;
  isUnread: boolean;
};

export type Agent = {
  id: string;
  name: string;
  status: StatusLabel;
  lastStatusChange: string;
  timezone: string;
  schedule: { workSeconds: number; breakSeconds: number; lunchSeconds: number };
  goals: { calls: number; sales: number };
  diallerStats: {
    calls: number;
    sales: number;
    droppedCalls: number;
    timeInCalls: number;
    timeInWrap: number;
    callDispositions: Record<string, number>;
  };
  tasks: { id: string; text: string; done: boolean }[];
  inbox: InboxItem[];
  events: AgentEvent[];
  activityLog: ActivityLog[];
};

export type Store = {
  agent: Agent;
  autoBreakOnComplete: boolean;
  dndEnabled: boolean;
  setStatus: (s: StatusLabel, reason?: string) => void;
  setAutoBreak: (v: boolean) => void;

  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, delta: -1 | 1) => void;

  messageLeader: (text: string) => void;
  markAllRead: () => void;

  addDisposition: (label: string) => void;

  aht: () => string;
  occupancy: () => number;
  score: () => number;

  summaryForRange: (fromYMD: string, toYMD: string) => Record<StatusLabel, number>;
  perHourForRange: (
    fromYMD: string,
    toYMD: string
  ) => { hour: number; top?: StatusLabel; opacity: number }[];
};

const STORAGE_KEY = 'nexus-mui-agent';
const PREFS_KEY = 'nexus-mui-prefs';

const REASONS: Record<StatusLabel, string[]> = {
  Ready: ['Available'],
  'On Call': ['Inbound', 'Outbound', 'Transfer'],
  'Post-Call Work': ['ACW', 'Follow-up', 'CRM'],
  Break: ['Bio', 'Comfort', 'Personal'],
  Lunch: ['Scheduled', 'Extended'],
  Training: ['Onboarding', 'Calibration', 'Coaching'],
  Offline: ['System', 'Meeting', 'Coaching', 'Network'],
  Away: ['Personal', 'Restroom', 'Other'],
};

export const STATUS_REASONS = REASONS;

function pad(n: number) {
  return n.toString().padStart(2, '0');
}
export function hhmmss(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(ss)}`;
}
const nowISO = () => new Date().toISOString();
const format = (d: Date) => d.toISOString();

const defaultAgent: Agent = {
  id: 'agent-019',
  name: 'Neo Molefe',
  status: 'Break',
  lastStatusChange: format(new Date(Date.now() - 4 * 60 * 1000)),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  schedule: { workSeconds: 8 * 3600, breakSeconds: 15 * 60, lunchSeconds: 60 * 60 },
  goals: { calls: 50, sales: 5 },
  diallerStats: {
    calls: 10,
    sales: 1,
    droppedCalls: 0,
    timeInCalls: 800,
    timeInWrap: 150,
    callDispositions: { 'Not Interested': 8, Callback: 3, Sale: 1 },
  },
  tasks: [
    { id: 't1', text: 'Warm-up calls', done: false },
    { id: 't2', text: 'Follow-up callbacks', done: true },
  ],
  inbox: [
    {
      id: 'm1',
      from: 'TL: Thabo',
      fromRole: 'teamLeader',
      fromId: 'agent-006',
      timestamp: format(new Date(Date.now() - 50 * 60 * 1000)),
      message: 'Check your opener on call 3.',
      isUnread: true,
    },
  ],
  events: [
    { type: 'StatusChanged', status: 'Ready', start: format(new Date(Date.now() - 5 * 3600 * 1000)) },
    {
      type: 'StatusChanged',
      status: 'On Call',
      start: format(new Date(Date.now() - 4.5 * 3600 * 1000)),
      end: format(new Date(Date.now() - 4.25 * 3600 * 1000)),
    },
    {
      type: 'StatusChanged',
      status: 'Post-Call Work',
      reason: 'ACW',
      start: format(new Date(Date.now() - 4.25 * 3600 * 1000)),
      end: format(new Date(Date.now() - 4 * 3600 * 1000)),
    },
    {
      type: 'StatusChanged',
      status: 'Break',
      reason: 'Bio',
      start: format(new Date(Date.now() - 260 * 1000)),
    },
  ],
  activityLog: [
    { timestamp: format(new Date(Date.now() - 260 * 1000)), message: 'Status changed to Break (Bio)' },
  ],
};

type Prefs = { autoBreakOnComplete: boolean; dndEnabled: boolean };

function load(): Agent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultAgent;
}
function save(agent: Agent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agent));
}
function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { autoBreakOnComplete: true, dndEnabled: false };
}
function savePrefs(p: Prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

const Ctx = React.createContext<Store | null>(null);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = React.useState<Agent>(() => load());
  const [prefs, setPrefs] = React.useState<Prefs>(() => loadPrefs());

  React.useEffect(() => {
    save(agent);
  }, [agent]);
  React.useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  // Live updates when TL messages the currently loaded Agent
  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const { to, message } = (ce?.detail || {}) as { to?: string; message?: any };
      if (to && message && to === agent.id) {
        setAgent((prev) => ({ ...prev, inbox: [...(prev.inbox || []), message] }));
      }
    };
    window.addEventListener('nexus-message' as any, handler as any);
    return () => window.removeEventListener('nexus-message' as any, handler as any);
  }, [agent.id]);

  // Live updates when TL changes agent status
  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const { id, status, lastStatusChange, events } = (ce?.detail || {}) as any;
      if (id && id === agent.id) {
        setAgent((prev) => ({ ...prev, status, lastStatusChange, events }));
      }
    };
    window.addEventListener('nexus-status' as any, handler as any);
    return () => window.removeEventListener('nexus-status' as any, handler as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id]);

  // The new patch to handle directory updates
  React.useEffect(() => {
    const handler = () => {
      try {
        const { findAgent } = require('./directory');
        const dirAgent = findAgent(agent.id);
        if (dirAgent) {
          setAgent((prev) => ({
            ...prev,
            status: dirAgent.status as any,
            lastStatusChange: dirAgent.lastStatusChange,
            events: dirAgent.events,
            inbox: dirAgent.inbox,
          }));
        }
      } catch (e) {
        console.error('Failed to sync with directory:', e);
      }
    };
    window.addEventListener('directory:changed', handler);
    return () => window.removeEventListener('directory:changed', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id]);

  // Idle detection
  React.useEffect(() => {
    // thresholds
    const IDLE_SECS = 5 * 60;       // 5 minutes to go Offline (Idle)
    const IDLE_LOG_SECS = 15 * 60;  // 15 minutes to append to activityLog

    const lastActivityRef = { current: Date.now() };
    const idleRef = { current: false };
    const idleSinceRef = { current: 0 };
    const idleLoggedRef = { current: false };

    // bump = user activity detected
    const bump = () => {
      lastActivityRef.current = Date.now();
      if (idleRef.current) {
        idleRef.current = false;
        idleSinceRef.current = 0;
        idleLoggedRef.current = false;
        // On resume, go Ready
        setStatus('Ready', 'Return from idle');
      }
    };

    const onVisibility = () => {
      if (!document.hidden) bump();
    };

    const evts: Array<keyof DocumentEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'wheel',
      'scroll',
      'touchstart',
      'pointerdown'
    ];

    evts.forEach(e => window.addEventListener(e, bump, { passive: true }));
    document.addEventListener('visibilitychange', onVisibility);

    const timer = setInterval(() => {
      const elapsedMs = Date.now() - lastActivityRef.current;

      // crossed idle threshold
      if (!idleRef.current && elapsedMs > IDLE_SECS * 1000) {
        idleRef.current = true;
        idleSinceRef.current = Date.now();
        idleLoggedRef.current = false;

        // Only auto-pause if not on call
        if (agent.status !== 'On Call') {
          setStatus('Offline', 'Idle');
        }

        // Fire a gentle nudge to UI
        window.dispatchEvent(
          new CustomEvent('agent:nudge', {
            detail: {
              type: 'idle',
              message: 'You’ve been inactive — set to Offline (Idle).',
              canResume: true
            }
          })
        );
      }

      // if we are idle, check if we need to log after 15 minutes
      if (idleRef.current && !idleLoggedRef.current) {
        const idleFor = Date.now() - idleSinceRef.current;
        if (idleFor >= IDLE_LOG_SECS * 1000) {
          idleLoggedRef.current = true;
          // Append to activity log
          setAgent(prev => ({
            ...prev,
            activityLog: [
              ...(prev.activityLog || []),
              {
                timestamp: new Date().toISOString(),
                message: 'Inactive for 15 minutes (auto).'
              }
            ]
          }));
          // Optional: another nudge
          window.dispatchEvent(
            new CustomEvent('agent:nudge', {
              detail: {
                type: 'idle-15',
                message: 'Inactive for 15 minutes — entry added to your Activity Log.',
                canResume: true
              }
            })
          );
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      evts.forEach(e => window.removeEventListener(e, bump as any));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.status]);

  const setStatus = (s: StatusLabel, reason?: string) => {
    if (s === agent.status) return;
    const now = nowISO();
    const events = [...agent.events];
    const open = events.find((e) => e.type === 'StatusChanged' && !e.end);
    if (open) open.end = now;
    events.push({ type: 'StatusChanged', status: s, reason: reason || undefined, start: now });
    const activity = [
      ...agent.activityLog,
      { timestamp: now, message: `Status changed to ${s}${reason ? ` (${reason})` : ''}` },
    ];
    setAgent({ ...agent, status: s, lastStatusChange: now, events, activityLog: activity });

    if (s === 'On Call') {
      const callDuration = Math.floor(Math.random() * 60) + 30;
      const wrapDuration = Math.floor(Math.random() * 30) + 10;
      setTimeout(() => {
        setAgent((prev) => {
          const evs = [...prev.events];
          const open2 = evs.find((e) => e.type === 'StatusChanged' && !e.end);
          if (open2) open2.end = nowISO();
          const ds = { ...prev.diallerStats };
          ds.calls += 1;
          ds.timeInCalls += callDuration;
          ds.timeInWrap += wrapDuration;
          const act = [
            ...prev.activityLog,
            { timestamp: nowISO(), message: 'Call completed.', duration: callDuration },
            { timestamp: nowISO(), message: 'Wrap-up completed.', duration: wrapDuration },
          ];
          evs.push({ type: 'StatusChanged', status: 'Post-Call Work', reason: 'ACW', start: nowISO() });
          return { ...prev, diallerStats: ds, events: evs, activityLog: act };
        });
        setTimeout(() => {
          setStatus('Ready');
        }, wrapDuration * 1000);
      }, Math.random() * 5000 + 2000);
    }
  };

  const markAllRead = () =>
    setAgent((prev) => ({
      ...prev,
      inbox: prev.inbox.map((m) => ({ ...m, isUnread: false })),
    }));

  const messageLeader = (text: string) => {
    setAgent((prev) => {
      // Update TL inbox in team object stored in localStorage
      try {
        const rawTeam = localStorage.getItem('nexus-mui-team');
        if (rawTeam) {
          const teamObj = JSON.parse(rawTeam);
          const msg = {
            id: 'm' + Math.random().toString(36).slice(2),
            from: prev.name,
            fromRole: 'agent',
            fromId: prev.id,
            timestamp: new Date().toISOString(),
            message: text,
            isUnread: true,
          };
          teamObj.leader = teamObj.leader || {};
          teamObj.leader.inbox = [...(teamObj.leader.inbox || []), msg];
          localStorage.setItem('nexus-mui-team', JSON.stringify(teamObj));
          // notify TL headers to update immediately
          window.dispatchEvent(
            new CustomEvent('nexus-message-tl', { detail: { message: msg } })
          );
        }
      } catch {}
      return prev;
    });
  };

  const addDisposition = (label: string) =>
    setAgent((prev) => {
      const ds = {
        ...prev.diallerStats,
        callDispositions: { ...(prev.diallerStats.callDispositions || {}) },
      };
      ds.callDispositions[label] = (ds.callDispositions[label] || 0) + 1;
      if (label === 'Sale') ds.sales = (ds.sales || 0) + 1;
      return { ...prev, diallerStats: ds };
    });

  const aht = () => {
    const calls = agent.diallerStats.calls || 0;
    const tic = agent.diallerStats.timeInCalls || 0;
    if (!calls || !tic) return '00:00:00';
    const sec = Math.floor(tic / calls);
    return hhmmss(sec);
  };
  const occupancy = () => {
    const total = Object.values(summaryForRange(today(), today())).reduce((s, v) => s + v, 0) || 1;
    const productive = (agent.diallerStats.timeInCalls || 0) + (agent.diallerStats.timeInWrap || 0);
    return Math.min(100, Math.max(0, Math.floor((productive / total) * 100)));
  };
  const adherence = (sum: Record<StatusLabel, number>) => {
    const sch = agent.schedule || { workSeconds: 8 * 3600, breakSeconds: 15 * 60, lunchSeconds: 60 * 60 };
    const work =
      (sum['Ready'] || 0) +
      (sum['On Call'] || 0) +
      (sum['Post-Call Work'] || 0) +
      (sum['Training'] || 0);
    const brk = sum['Break'] || 0;
    const lunch = sum['Lunch'] || 0;
    const off = (a: number, b: number) => Math.abs(a - b) > 300;
    return off(work, sch.workSeconds) || off(brk, sch.breakSeconds) || off(lunch, sch.lunchSeconds)
      ? 'Behind'
      : 'On Track';
  };
  const score = () => {
    const sum = summaryForRange(today(), today());
    const occ = occupancy() / 100;
    const adher = adherence(sum) === 'On Track' ? 1 : 0.2;
    const calls = agent.diallerStats.calls || 0;
    const sales = agent.diallerStats.sales || 0;
    const callsGoal = agent.goals.calls || 50;
    const salesGoal = agent.goals.sales || 5;
    const callsScore = Math.max(0, Math.min(1, calls / Math.max(1, callsGoal)));
    const salesScore = Math.max(0, Math.min(1, sales / Math.max(1, salesGoal)));
    const ahtSec = calls > 0 ? agent.diallerStats.timeInCalls / Math.max(1, calls) : 0;
    const ahtScore = ahtSec ? Math.max(0, Math.min(1, (300 - ahtSec) / (300 - 90))) : 0;
    const w = { calls: 0.25, sales: 0.35, aht: 0.15, occupancy: 0.15, adherence: 0.1 };
    const s =
      w.calls * callsScore +
      w.sales * salesScore +
      w.aht * ahtScore +
      w.occupancy * occ +
      w.adherence * adher;
    return Math.round(s * 100);
  };

  function today() {
    return new Date().toISOString().slice(0, 10);
  }
  function rangeBounds(fromYMD: string, toYMD: string) {
    const [fy, fm, fd] = fromYMD.split('-').map(Number);
    const [ty, tm, td] = toYMD.split('-').map(Number);
    const start = new Date(fy, fm - 1, fd, 0, 0, 0);
    const end = new Date(ty, tm - 1, td + 1, 0, 0, 0);
    return { start, end };
  }

  const summaryForRange = (fromYMD: string, toYMD: string) => {
    const base: any = {
      Ready: 0,
      'On Call': 0,
      'Post-Call Work': 0,
      Break: 0,
      Lunch: 0,
      Training: 0,
      Offline: 0,
      Away: 0,
    };
    const { start, end } = rangeBounds(fromYMD, toYMD);
    agent.events.forEach((evt) => {
      if (evt.type !== 'StatusChanged') return;
      const s = new Date(evt.start).getTime();
      const e = new Date(evt.end || new Date()).getTime();
      let from = Math.max(s, start.getTime());
      const to = Math.min(e, end.getTime());
      if (to <= from) return;
      const secs = Math.max(0, Math.floor((to - from) / 1000));
      base[evt.status] = (base[evt.status] || 0) + secs;
    });
    return base as Record<StatusLabel, number>;
  };

  const perHourForRange = (fromYMD: string, toYMD: string) => {
    const { start, end } = rangeBounds(fromYMD, toYMD);
    const perHour = Array.from({ length: 24 }, () => ({
      total: 0,
      byStatus: {} as Record<StatusLabel, number>,
    }));
    agent.events.forEach((evt) => {
      if (evt.type !== 'StatusChanged') return;
      const s = new Date(evt.start).getTime();
      const e = new Date(evt.end || new Date()).getTime();
      let from = Math.max(s, start.getTime());
      const to = Math.min(e, end.getTime());
      if (to <= from) return;
      while (from < to) {
        const d = new Date(from);
        const nextHour = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1).getTime();
        const chunkEnd = Math.min(nextHour, to);
        const secs = Math.max(0, Math.floor((chunkEnd - from) / 1000));
        const hour = d.getHours();
        const label = evt.status as StatusLabel;
        perHour[hour].total += secs;
        perHour[hour].byStatus[label] = (perHour[hour].byStatus[label] || 0) + secs;
        from = chunkEnd;
      }
    });
    return perHour.map((rec, h) => {
      if (!rec.total) return { hour: h, opacity: 1 };
      let top: StatusLabel | undefined;
      let topSecs = 0;
      (Object.keys(rec.byStatus) as StatusLabel[]).forEach((st) => {
        const v = rec.byStatus[st];
        if (v > topSecs) {
          topSecs = v;
          top = st;
        }
      });
      const ratio = topSecs / Math.max(1, rec.total);
      const opacity = Math.max(0.25, Math.min(1, 0.25 + ratio * 0.75));
      return { hour: h, top, opacity };
    });
  };

  const addTask = (text: string) => {
    if (!text.trim()) return;
    setAgent((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: Math.random().toString(36).slice(2), text, done: false }],
    }));
  };
  const toggleTask = (id: string) =>
    setAgent((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  const deleteTask = (id: string) =>
    setAgent((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  const moveTask = (id: string, delta: -1 | 1) => {
    setAgent((prev) => {
      const arr = [...prev.tasks];
      const i = arr.findIndex((t) => t.id === id);
      if (i === -1) return prev;
      const j = Math.max(0, Math.min(arr.length - 1, i + delta));
      if (i === j) return prev;
      const [item] = arr.splice(i, 1);
      arr.splice(j, 0, item);
      return { ...prev, tasks: arr };
    });
  };

  const setAutoBreak = (v: boolean) => setPrefs((p) => ({ ...p, autoBreakOnComplete: v }));

  const store: Store = {
    agent,
    autoBreakOnComplete: prefs.autoBreakOnComplete,
    dndEnabled: prefs.dndEnabled,
    setStatus,
    setAutoBreak,
    addTask,
    toggleTask,
    deleteTask,
    moveTask,
    messageLeader,
    markAllRead,
    addDisposition,
    aht,
    occupancy,
    score,
    summaryForRange,
    perHourForRange,
  };

  return React.createElement(Ctx.Provider, { value: store }, children);
}

export function useAgent() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useAgent must be used within AgentProvider');
  return ctx;
}