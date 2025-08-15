import React from 'react';
import type { StatusLabel } from './useAgent';
import { getTeamState, ensureDirectorySeed } from './directory';
import type { DirAgent } from './directory';

export type InboxItem = {
  id?: string;
  from: string;
  fromRole?: string;
  fromId?: string;
  timestamp: string;
  message: string;
  isUnread: boolean;
};

export type TLAgent = {
  id: string;
  name: string;
  role: 'teamLeader' | 'agent';
  teamId: string;
  campaignId: string;
  status: StatusLabel;
  lastStatusChange: string;
  timezone: string;
  goals: { calls: number; sales: number };
  diallerStats: {
    calls: number;
    sales: number;
    droppedCalls: number;
    timeInCalls: number;
    timeInWrap: number;
  };
  inbox: InboxItem[];
  events: {
    type: 'StatusChanged';
    status: StatusLabel;
    reason?: string | null;
    start: string;
    end?: string | null;
  }[];
};

export type TeamState = {
  teamId: string;
  leader: TLAgent;
  agents: TLAgent[];
};

type Store = {
  team: TeamState;
  statusCounts: () => Record<StatusLabel, number>;
  teamTotals: (fromYMD: string, toYMD: string) => {
    totalCalls: number;
    totalSales: number;
    averageAHT: string;
    averageOccupancy: number;
  };
  triageQueue: (fromYMD: string, toYMD: string) => {
    agentId: string;
    label: string;
    priority: number;
  }[];
  durationInStatus: (a: TLAgent) => number;
  summaryForRange: (a: TLAgent, fromYMD: string, toYMD: string) => Record<StatusLabel, number>;
  occupancyOf: (a: TLAgent, fromYMD: string, toYMD: string) => number;
  getAHT: (calls: number, timeInCalls: number) => string;
  messageAgent: (agentId: string, content: string) => void;
  setAgentStatus: (agentId: string, newStatus: StatusLabel, reason?: string) => void;
  exportTeamCSV: (fromYMD: string, toYMD: string) => void;
  viewAgent: (agentId: string) => void;
  markAllReadLeader: () => void;
};

const KEY = 'nexus-mui-team';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function hhmmss(s: number) {
  const x = Math.max(0, Math.floor(s));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(x / 3600))}:${p(Math.floor((x % 3600) / 60))}:${p(x % 60)}`;
}

function rangeBounds(fromYMD: string, toYMD: string) {
  const [fy, fm, fd] = fromYMD.split('-').map(Number);
  const [ty, tm, td] = toYMD.split('-').map(Number);
  const start = new Date(fy, fm - 1, fd, 0, 0, 0);
  const end = new Date(ty, tm - 1, td + 1, 0, 0, 0);
  return { start, end };
}

function mapDirAgent(a: DirAgent): TLAgent {
  return {
    id: a.id,
    name: a.name,
    role: a.role === 'teamLeader' ? 'teamLeader' : 'agent',
    teamId: a.teamId!,
    campaignId: a.campaignId!,
    status: a.status as StatusLabel,
    lastStatusChange: a.lastStatusChange,
    timezone: a.timezone,
    goals: a.goals,
    diallerStats: a.diallerStats,
    inbox: a.inbox || [],
    events: a.events || [],
  };
}

function loadTeam(): TeamState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const t = JSON.parse(raw) as TeamState;
      if (t?.leader && t?.teamId) return t;
    }
  } catch {}

  const hydrated = getTeamState('Team 1');
  if (!hydrated) throw new Error('Directory missing Team 1');

  const team: TeamState = {
    teamId: 'Team 1',
    leader: mapDirAgent(hydrated.leader),
    agents: hydrated.agents.map(mapDirAgent),
  };
  localStorage.setItem(KEY, JSON.stringify(team));
  return team;
}

const Ctx = React.createContext<Store | null>(null);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  ensureDirectorySeed();
  const [team, setTeam] = React.useState<TeamState>(() => loadTeam());

  React.useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(team));
  }, [team]);

  // Combined rehydration effect
  React.useEffect(() => {
    const rehydrate = () => {
      const sp = new URLSearchParams(window.location.search);
      const urlTeamId = sp.get('teamId') || team.teamId || 'Team 1';
      const hydrated = getTeamState(urlTeamId);
      if (!hydrated) return;

      setTeam({
        teamId: urlTeamId,
        leader: mapDirAgent(hydrated.leader),
        agents: hydrated.agents.map(mapDirAgent),
      });
    };

    window.addEventListener('directory:changed', rehydrate);
    window.addEventListener('popstate', rehydrate);
    rehydrate();

    return () => {
      window.removeEventListener('directory:changed', rehydrate);
      window.removeEventListener('popstate', rehydrate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live updates when agent replies to TL
  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const { message } = (ce?.detail || {}) as { message?: InboxItem };
      if (!message) return;
      setTeam((prev) => {
        const copy = structuredClone(prev) as TeamState;
        copy.leader.inbox = [...(copy.leader.inbox || []), message];
        return copy;
      });
    };
    window.addEventListener('nexus-message-tl', handler as any);
    return () => window.removeEventListener('nexus-message-tl', handler as any);
  }, []);

  // Live updates when agent status changes
  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const { id, status, lastStatusChange, events } = ce?.detail || {};
      if (!id || !status) return;

      setTeam((prev) => {
        const copy = structuredClone(prev) as TeamState;
        const a = copy.agents.find((x) => x.id === id);
        if (a) {
          a.status = status;
          a.lastStatusChange = lastStatusChange;
          a.events = events;
        }
        return copy;
      });
    };
    window.addEventListener('nexus-status', handler as any);
    return () => window.removeEventListener('nexus-status', handler as any);
  }, []);

  const durationInStatus = (a: TLAgent) =>
    Math.floor((Date.now() - new Date(a.lastStatusChange).getTime()) / 1000);

  const summaryForRange = (a: TLAgent, fromYMD: string, toYMD: string) => {
    const map: any = {
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
    (a.events || []).forEach((evt) => {
      if (evt.type !== 'StatusChanged') return;
      const s = new Date(evt.start).getTime();
      const e = new Date(evt.end || new Date()).getTime();
      const from = Math.max(s, start.getTime());
      const to = Math.min(e, end.getTime());
      if (to <= from) return;
      const secs = Math.max(0, Math.floor((to - from) / 1000));
      map[evt.status] = (map[evt.status] || 0) + secs;
    });
    return map as Record<StatusLabel, number>;
  };

  const occupancyOf = (a: TLAgent, fromYMD: string, toYMD: string) => {
    const sum = summaryForRange(a, fromYMD, toYMD);
    const total = Object.values(sum).reduce((s, v) => s + v, 0) || 1;
    const productive = (a.diallerStats.timeInCalls || 0) + (a.diallerStats.timeInWrap || 0);
    return Math.min(100, Math.max(0, Math.floor((productive / total) * 100)));
  };

  const statusCounts = () => {
    const c: any = {};
    team.agents.forEach((a) => {
      c[a.status] = (c[a.status] || 0) + 1;
    });
    return c as Record<StatusLabel, number>;
  };

  const getAHT = (calls: number, timeInCalls: number) => {
    if (!calls || !timeInCalls) return '00:00:00';
    return hhmmss(Math.floor(timeInCalls / calls));
  };

  const teamTotals = (fromYMD: string, toYMD: string) => {
    const totals = team.agents.reduce(
      (acc, a) => {
        acc.calls += a.diallerStats.calls || 0;
        acc.sales += a.diallerStats.sales || 0;
        acc.timeInCalls += a.diallerStats.timeInCalls || 0;
        acc.timeInWrap += a.diallerStats.timeInWrap || 0;
        const sum = summaryForRange(a, fromYMD, toYMD);
        acc.logged += Object.values(sum).reduce((s, v) => s + v, 0);
        return acc;
      },
      { calls: 0, sales: 0, timeInCalls: 0, timeInWrap: 0, logged: 0 }
    );

    const productive = totals.timeInCalls + totals.timeInWrap;
    const averageOccupancy = totals.logged ? Math.floor((productive / totals.logged) * 100) : 0;
    const averageAHT = totals.calls ? hhmmss(Math.floor(totals.timeInCalls / totals.calls)) : '00:00:00';
    return { totalCalls: totals.calls, totalSales: totals.sales, averageAHT, averageOccupancy };
  };

  const triageQueue = (fromYMD: string, toYMD: string) => {
    const items: { agentId: string; label: string; priority: number }[] = [];
    team.agents.forEach((a) => {
      const since = durationInStatus(a);
      const occ = occupancyOf(a, fromYMD, toYMD);
      const convLow = (a.diallerStats.calls || 0) >= 20 && (a.diallerStats.sales || 0) / Math.max(1, a.diallerStats.calls) < 0.05;
      if (a.status === 'Break' && since > 20 * 60)
        items.push({
          agentId: a.id,
          label: `${a.name} over break (${Math.floor(since / 60)}m)`,
          priority: 100,
        });
      if (a.status === 'Post-Call Work' && since > 10 * 60)
        items.push({
          agentId: a.id,
          label: `${a.name} long wrap (${Math.floor(since / 60)}m)`,
          priority: 80,
        });
      const today = new Date().toISOString().slice(0, 10);
      if (a.status === 'Offline' && fromYMD === today && toYMD === today)
        items.push({ agentId: a.id, label: `${a.name} offline`, priority: 60 });
      if (occ < 40)
        items.push({ agentId: a.id, label: `${a.name} low occupancy (${occ}%)`, priority: 50 });
      if (convLow) items.push({ agentId: a.id, label: `${a.name} conversion low`, priority: 40 });
    });
    return items.sort((a, b) => b.priority - a.priority);
  };

  const messageAgent = (agentId: string, content: string) => {
    setTeam((prev) => {
      const copy = structuredClone(prev) as TeamState;
      const a = copy.agents.find((x) => x.id === agentId);
      if (a) {
        const msg: InboxItem = {
          id: 'm' + Math.random().toString(36).slice(2),
          from: copy.leader.name,
          fromRole: 'teamLeader',
          fromId: copy.leader.id,
          timestamp: new Date().toISOString(),
          message: content,
          isUnread: true,
        };
        a.inbox.push(msg);
        try {
          const raw = localStorage.getItem('nexus-mui-agent');
          if (raw) {
            const agentObj = JSON.parse(raw);
            if (agentObj?.id === agentId) {
              agentObj.inbox = [...(agentObj.inbox || []), msg];
              localStorage.setItem('nexus-mui-agent', JSON.stringify(agentObj));
              window.dispatchEvent(
                new CustomEvent('nexus-message', { detail: { to: agentId, message: msg } })
              );
            }
          }
        } catch {}
      }
      return copy;
    });
  };

  const setAgentStatus = (agentId: string, newStatus: StatusLabel, reason?: string) => {
    setTeam((prev) => {
      const copy = structuredClone(prev) as TeamState;
      const a = copy.agents.find((x) => x.id === agentId);
      if (!a || a.status === newStatus) return prev;
      const now = new Date().toISOString();
      const evs = [...(a.events || [])];
      const open = evs.find((e) => e.type === 'StatusChanged' && !e.end);
      if (open) open.end = now;
      evs.push({ type: 'StatusChanged', status: newStatus, reason, start: now });
      a.events = evs;
      a.status = newStatus;
      a.lastStatusChange = now;
      try {
        const raw = localStorage.getItem('nexus-mui-agent');
        if (raw) {
          const agentObj = JSON.parse(raw);
          if (agentObj?.id === agentId) {
            agentObj.status = newStatus;
            agentObj.lastStatusChange = now;
            agentObj.events = evs;
            localStorage.setItem('nexus-mui-agent', JSON.stringify(agentObj));
            window.dispatchEvent(
              new CustomEvent('nexus-status', {
                detail: { id: agentId, status: newStatus, lastStatusChange: now, events: evs },
              })
            );
          }
        }
      } catch {}
      return copy;
    });
  };

  const markAllReadLeader = () => {
    setTeam((prev) => {
      const copy = structuredClone(prev) as TeamState;
      copy.leader.inbox = (copy.leader.inbox || []).map((m) => ({ ...m, isUnread: false }));
      return copy;
    });
  };

  const exportTeamCSV = (fromYMD: string, toYMD: string) => {
    const rows: string[][] = [['Agent', 'Team', 'Calls', 'Sales', 'AHT', 'Occupancy']];
    team.agents.forEach((a) => {
      const aht = getAHT(a.diallerStats.calls, a.diallerStats.timeInCalls);
      const occ = occupancyOf(a, fromYMD, toYMD);
      rows.push([
        a.name,
        a.teamId,
        String(a.diallerStats.calls || 0),
        String(a.diallerStats.sales || 0),
        aht,
        `${occ}%`,
      ]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-${team.teamId}-${fromYMD}_to_${toYMD}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewAgent = (agentId: string) => {
    const a = team.agents.find((x) => x.id === agentId);
    if (!a) return;
    const agentObj = {
      id: a.id,
      name: a.name,
      status: a.status,
      lastStatusChange: a.lastStatusChange,
      timezone: a.timezone,
      goals: a.goals,
      diallerStats: a.diallerStats,
      tasks: [],
      inbox: a.inbox,
      events: a.events,
      activityLog: [],
    };
    localStorage.setItem('nexus-mui-agent', JSON.stringify(agentObj));
    const sp = new URLSearchParams(window.location.search);
    sp.set('view', 'agent');
    sp.set('from', 'teamLeader');
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const store: Store = {
    team,
    statusCounts,
    teamTotals,
    triageQueue,
    durationInStatus,
    summaryForRange,
    occupancyOf,
    getAHT,
    messageAgent,
    setAgentStatus,
    exportTeamCSV,
    viewAgent,
    markAllReadLeader,
  };

  return React.createElement(Ctx.Provider, { value: store }, children);
}

export function useTeam() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}