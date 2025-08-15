// src/state/useCampaign.ts
import React from 'react';
import {
  getCampaignState,
  addMessageToAgentInDirectory,
  teamsInCampaign as teamsInCampaignDir,
  ensureDirectorySeed
} from './directory';

// Utility helpers
function hhmmss(s: number) {
  const x = Math.max(0, Math.floor(s));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(x / 3600))}:${pad(Math.floor((x % 3600) / 60))}:${pad(x % 60)}`;
}
function rangeBounds(fromYMD: string, toYMD: string) {
  const [fy, fm, fd] = fromYMD.split('-').map(Number);
  const [ty, tm, td] = toYMD.split('-').map(Number);
  const start = new Date(fy, fm - 1, fd, 0, 0, 0);
  const end = new Date(ty, tm - 1, td + 1, 0, 0, 0); // exclusive
  return { start, end };
}

type StatusLabel =
  | 'Ready' | 'On Call' | 'Post-Call Work' | 'Break'
  | 'Lunch' | 'Training' | 'Offline' | 'Away';

// Shapes used in this store
type InboxItem = {
  id?: string;
  from: string;
  fromRole?: string;
  fromId?: string;
  timestamp: string;
  message: string;
  isUnread: boolean;
};

type MiniAgent = {
  id: string;
  name: string;
  role: 'teamLeader' | 'agent';
  teamId?: string;
  campaignId?: string;
  status: StatusLabel;
  lastStatusChange: string;
  timezone: string;
  goals: { calls: number; sales: number };
  diallerStats: { calls: number; sales: number; droppedCalls: number; timeInCalls: number; timeInWrap: number };
  inbox: InboxItem[];
  events: { type: 'StatusChanged'; status: StatusLabel; reason?: string | null; start: string; end?: string | null }[];
};

type CampaignTeam = { teamId: string; leader: MiniAgent; agents: MiniAgent[] };
type Director = { id: string; name: string; role: 'director'; campaignId: string; timezone: string; inbox: InboxItem[] };
type CampaignState = { campaignId: string; director: Director; teams: CampaignTeam[] };

type Store = {
  campaign: CampaignState;
  campaignTotals: (fromYMD: string, toYMD: string) => { totalCalls: number; totalSales: number; averageAHT: string };
  teamSummary: (teamId: string, fromYMD: string, toYMD: string) => { totalCalls: number; totalSales: number; averageAHT: string; averageOccupancy: number };
  teamsInCampaign: () => string[];
  messageTL: (teamId: string, text: string) => void;
  markAllReadDirector: () => void;
  exportCampaignXLSX: (fromYMD: string, toYMD: string) => Promise<void>;
  viewTeam: (teamId: string) => void;
  viewAgent: (agentId: string) => void; // optional, you can gate it from UI
};

const DIR_KEY = 'nexus-mui-directory';
const CampaignCtx = React.createContext<Store | null>(null);

// Map directory agent → local mini agent
function mapDirAgent(a: any): MiniAgent {
  return {
    id: a.id,
    name: a.name,
    role: a.role === 'teamLeader' ? 'teamLeader' : 'agent',
    teamId: a.teamId,
    campaignId: a.campaignId,
    status: a.status,
    lastStatusChange: a.lastStatusChange,
    timezone: a.timezone,
    goals: a.goals,
    diallerStats: a.diallerStats,
    inbox: a.inbox || [],
    events: a.events || []
  };
}

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  ensureDirectorySeed();

  const [campaign, setCampaign] = React.useState<CampaignState>(() => {
    const sp = new URLSearchParams(window.location.search);
    const campaignId = sp.get('campaignId') || 'A';
    const hydrated = getCampaignState(campaignId);
    if (!hydrated) {
      // fallback to minimal state if directory missing
      return {
        campaignId,
        director: { id: 'unknown', name: 'Director', role: 'director', campaignId, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, inbox: [] },
        teams: []
      };
    }
    return {
      campaignId,
      director: {
        id: hydrated.director.id,
        name: hydrated.director.name,
        role: 'director',
        campaignId,
        timezone: hydrated.director.timezone,
        inbox: hydrated.director.inbox || []
      },
      teams: hydrated.teams.map(t => ({ teamId: t.teamId, leader: mapDirAgent(t.leader), agents: t.agents.map(mapDirAgent) }))
    };
  });

  // Rehydrate when directory changes or when URL campaignId changes (popstate)
  React.useEffect(() => {
    const rehydrate = () => {
      const sp = new URLSearchParams(window.location.search);
      const campaignId = sp.get('campaignId') || campaign.campaignId || 'A';
      const hydrated = getCampaignState(campaignId);
      if (!hydrated) return;
      setCampaign({
        campaignId,
        director: {
          id: hydrated.director.id,
          name: hydrated.director.name,
          role: 'director',
          campaignId,
          timezone: hydrated.director.timezone,
          inbox: hydrated.director.inbox || []
        },
        teams: hydrated.teams.map(t => ({ teamId: t.teamId, leader: mapDirAgent(t.leader), agents: t.agents.map(mapDirAgent) }))
      });
    };
    window.addEventListener('directory:changed', rehydrate);
    window.addEventListener('popstate', rehydrate);
    // initial
    rehydrate();
    return () => {
      window.removeEventListener('directory:changed', rehydrate);
      window.removeEventListener('popstate', rehydrate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers to compute summaries
  const campaignTotals = React.useCallback((fromYMD: string, _toYMD: string) => {
    const totals = campaign.teams.reduce((acc, t) => {
      const agents = [t.leader, ...t.agents];
      agents.forEach(a => {
        acc.calls += a.diallerStats.calls || 0;
        acc.sales += a.diallerStats.sales || 0;
        acc.tic += a.diallerStats.timeInCalls || 0;
      });
      return acc;
    }, { calls: 0, sales: 0, tic: 0 });
    const averageAHT = totals.calls ? hhmmss(Math.floor(totals.tic / totals.calls)) : '00:00:00';
    return { totalCalls: totals.calls, totalSales: totals.sales, averageAHT };
  }, [campaign.teams]);

  const teamSummary = React.useCallback((teamId: string, fromYMD: string, toYMD: string) => {
    const t = campaign.teams.find(x => x.teamId === teamId);
    if (!t) return { totalCalls: 0, totalSales: 0, averageAHT: '00:00:00', averageOccupancy: 0 };
    const agents = [t.leader, ...t.agents];
    const sums = agents.reduce((acc, a) => {
      acc.calls += a.diallerStats.calls || 0;
      acc.sales += a.diallerStats.sales || 0;
      acc.tic += a.diallerStats.timeInCalls || 0;
      acc.tiw += a.diallerStats.timeInWrap || 0;
      return acc;
    }, { calls: 0, sales: 0, tic: 0, tiw: 0 });

    const averageAHT = sums.calls ? hhmmss(Math.floor(sums.tic / sums.calls)) : '00:00:00';

    // occupancy per agent (simplified)
    const { start, end } = rangeBounds(fromYMD, toYMD);
    const occs = agents.map(a => {
      const map: Record<StatusLabel, number> = { 'Ready':0,'On Call':0,'Post-Call Work':0,'Break':0,'Lunch':0,'Training':0,'Offline':0,'Away':0 };
      (a.events || []).forEach(evt => {
        if (evt.type !== 'StatusChanged') return;
        const s = new Date(evt.start).getTime(); const e = new Date(evt.end || new Date()).getTime();
        const from = Math.max(s, start.getTime()); const to = Math.min(e, end.getTime());
        if (to <= from) return;
        const secs = Math.max(0, Math.floor((to - from) / 1000));
        map[evt.status] = (map[evt.status] || 0) + secs;
      });
      const total = Object.values(map).reduce((s, v) => s + (v as number), 0) || 1;
      const productive = (a.diallerStats.timeInCalls || 0) + (a.diallerStats.timeInWrap || 0);
      return Math.min(100, Math.max(0, Math.floor((productive / total) * 100)));
    });
    const averageOccupancy = occs.length ? Math.round(occs.reduce((s, v) => s + v, 0) / occs.length) : 0;

    return { totalCalls: sums.calls, totalSales: sums.sales, averageAHT, averageOccupancy };
  }, [campaign.teams]);

  const teamsInCampaign = React.useCallback(() => {
    return teamsInCampaignDir(campaign.campaignId);
  }, [campaign.campaignId]);

  // Messaging director → TL (write to directory; stores rehydrate via directory:changed)
  const messageTL = React.useCallback((teamId: string, text: string) => {
    const team = campaign.teams.find(t => t.teamId === teamId);
    if (!team) return;
    const msg: InboxItem = {
      id: 'm' + Math.random().toString(36).slice(2),
      from: campaign.director.name,
      fromRole: 'director',
      fromId: campaign.director.id,
      timestamp: new Date().toISOString(),
      message: text,
      isUnread: true
    };
    addMessageToAgentInDirectory(team.leader.id, msg);
    // local UI will rehydrate on directory:changed
  }, [campaign.director.id, campaign.director.name, campaign.teams]);

  // Mark all read (director inbox) — update directory and broadcast
  const markAllReadDirector = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(DIR_KEY);
      if (!raw) return;
      const dir = JSON.parse(raw);
      const a = (dir.agents || []).find((x: any) => x.id === campaign.director.id);
      if (!a) return;
      a.inbox = (a.inbox || []).map((m: any) => ({ ...m, isUnread: false }));
      localStorage.setItem(DIR_KEY, JSON.stringify(dir));
      window.dispatchEvent(new CustomEvent('directory:changed'));
    } catch {}
  }, [campaign.director.id]);

  // Export XLSX/CSV
  const exportCampaignXLSX = React.useCallback(async (fromYMD: string, toYMD: string) => {
    try {
      const XLSX = await import('xlsx');
      const rows: any[][] = [['Team', 'Total Calls', 'Total Sales', 'Avg AHT', 'Occupancy']];
      campaign.teams.forEach(t => {
        const s = teamSummary(t.teamId, fromYMD, toYMD);
        rows.push([t.teamId, s.totalCalls, s.totalSales, s.averageAHT, `${s.averageOccupancy}%`]);
      });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Campaign');
      XLSX.writeFile(wb, `campaign-${campaign.campaignId}-${fromYMD}_to_${toYMD}.xlsx`);
    } catch {
      // Fallback to CSV
      const rows = [['Team','Total Calls','Total Sales','Avg AHT','Occupancy']];
      campaign.teams.forEach(t => {
        const s = teamSummary(t.teamId, fromYMD, toYMD);
        rows.push([t.teamId, String(s.totalCalls), String(s.totalSales), s.averageAHT, `${s.averageOccupancy}%`]);
      });
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `campaign-${campaign.campaignId}-${fromYMD}_to_${toYMD}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
  }, [campaign.campaignId, campaign.teams, teamSummary]);

  // Navigation helpers (URL-driven)
  const viewTeam = React.useCallback((teamId: string) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set('view', 'teamLeader');
    sp.set('teamId', teamId);
    sp.set('from', 'campaign');
    sp.set('campaignId', campaign.campaignId); // keep origin for back button
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [campaign.campaignId]);

  const viewAgent = React.useCallback((agentId: string) => {
    // Optional direct drill to agent; typically you go via Team → Agent
    const sp = new URLSearchParams(window.location.search);
    sp.set('view', 'agent');
    sp.set('agentId', agentId);
    sp.set('from', 'campaign');
    sp.set('campaignId', campaign.campaignId);
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [campaign.campaignId]);

  const store: Store = {
    campaign,
    campaignTotals,
    teamSummary,
    teamsInCampaign,
    messageTL,
    markAllReadDirector,
    exportCampaignXLSX,
    viewTeam,
    viewAgent
  };

  return React.createElement(CampaignCtx.Provider, { value: store }, children);
}

export function useCampaign() {
  const ctx = React.useContext(CampaignCtx);
  if (!ctx) throw new Error('useCampaign must be used within CampaignProvider');
  return ctx;
}