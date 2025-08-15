// src/state/useWallboards.ts
import React from 'react';
import { readDirectory } from './directory';

export type WallboardWidgetType = 'kpi' | 'leaderboard' | 'trend';
export type KpiMetric = 'calls' | 'sales' | 'aht' | 'occupancy';

export type WallboardWidget =
  | {
      id: string;
      type: 'kpi';
      title?: string;
      metric: KpiMetric;
      target?: number; // for calls/sales/occupancy; for aht, target is seconds (lower is better)
      colSpan?: 1 | 2 | 3;
    }
  | {
      id: string;
      type: 'leaderboard';
      title?: string;
      topN?: number;
      colSpan?: 1 | 2 | 3;
    }
  | {
      id: string;
      type: 'trend';
      title?: string;
      colSpan?: 1 | 2 | 3;
    };

export type Wallboard = {
  id: string;
  name: string;
  scope: {
    campaignId: string;
    teamIds?: string[]; // optional; if omitted, includes all teams in campaign
  };
  layout: WallboardWidget[];
  rotationSec?: number; // optional: auto-rotate between boards later
  updatedAt: string;
};

type Store = {
  boards: Wallboard[];
  get: (id: string) => Wallboard | undefined;
  create: (name?: string) => string;
  update: (id: string, patch: Partial<Wallboard>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => string | undefined;
  // metrics
  getAgents: (wb: Wallboard) => any[]; // returns directory agents filtered by scope
  computeKpi: (wb: Wallboard, metric: KpiMetric) => { value: number; label: string; target?: number; good?: boolean };
  computeLeaderboard: (wb: Wallboard, topN?: number) => { id: string; name: string; sales: number }[];
  computeTrend: (wb: Wallboard) => number[]; // 12 bins
};

const KEY = 'nexus-mui-wallboards-v1';
const WallboardsCtx = React.createContext<Store | null>(null);

function load(): Wallboard[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Wallboard[];
  } catch {}
  // Seed one example board
  const seed: Wallboard[] = [
    {
      id: 'wb-001',
      name: 'Campaign A – Main',
      scope: { campaignId: 'A' },
      layout: [
        { id: 'w1', type: 'kpi', title: 'Total Calls', metric: 'calls', target: 180, colSpan: 1 },
        { id: 'w2', type: 'kpi', title: 'Total Sales', metric: 'sales', target: 20, colSpan: 1 },
        { id: 'w3', type: 'kpi', title: 'Avg. AHT (s)', metric: 'aht', target: 180, colSpan: 1 },
        { id: 'w4', type: 'leaderboard', title: 'Sales Leaderboard', topN: 5, colSpan: 2 },
        { id: 'w5', type: 'trend', title: 'Calls Trend', colSpan: 1 }
      ],
      updatedAt: new Date().toISOString()
    }
  ];
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function save(boards: Wallboard[]) {
  localStorage.setItem(KEY, JSON.stringify(boards));
}

export function WallboardsProvider({ children }: { children: React.ReactNode }) {
  const [boards, setBoards] = React.useState<Wallboard[]>(() => load());

  // Refresh when data changes (directory changed)
  React.useEffect(() => {
    const onDir = () => setBoards(prev => [...prev]); // just trigger refresh
    window.addEventListener('directory:changed', onDir);
    return () => window.removeEventListener('directory:changed', onDir);
  }, []);

  const persist = (mutator: (arr: Wallboard[]) => Wallboard[]) => {
    setBoards(prev => {
      const next = mutator(prev);
      save(next);
      return next;
    });
  };

  const get = (id: string) => boards.find(b => b.id === id);

  const create = (name = 'New Wallboard') => {
    const id = 'wb-' + Math.random().toString(36).slice(2);
    const wb: Wallboard = {
      id,
      name,
      scope: { campaignId: 'A' },
      layout: [],
      updatedAt: new Date().toISOString()
    };
    persist(arr => [wb, ...arr]);
    return id;
  };

  const update = (id: string, patch: Partial<Wallboard>) => {
    persist(arr =>
      arr.map(b => (b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b))
    );
  };

  const remove = (id: string) => {
    persist(arr => arr.filter(b => b.id !== id));
  };

  const duplicate = (id: string) => {
    const orig = get(id);
    if (!orig) return;
    const copyId = 'wb-' + Math.random().toString(36).slice(2);
    const copy: Wallboard = {
      ...orig,
      id: copyId,
      name: `${orig.name} (Copy)`,
      updatedAt: new Date().toISOString()
    };
    persist(arr => [copy, ...arr]);
    return copyId;
  };

  // Directory aggregators
  const getAgents = (wb: Wallboard) => {
    const d = readDirectory();
    const teamIds =
      wb.scope.teamIds && wb.scope.teamIds.length
        ? wb.scope.teamIds
        : (d.campaigns.find(c => c.campaignId === wb.scope.campaignId)?.teamIds || []);
    const ids = teamIds
      .map(tid => d.teams.find(t => t.teamId === tid))
      .filter(Boolean)
      .flatMap(t => (t as any).agentIds);

    const leaders = teamIds
      .map(tid => d.teams.find(t => t.teamId === tid))
      .filter(Boolean)
      .map(t => d.agents.find(a => a.id === (t as any).leaderId));

    const agents = [
      ...(leaders as any[]).filter(Boolean),
      ...ids.map((id: string) => d.agents.find(a => a.id === id)).filter(Boolean)
    ];
    return agents;
  };

  const computeKpi = (wb: Wallboard, metric: KpiMetric) => {
    const agents = getAgents(wb);
    if (metric === 'calls') {
      const value = agents.reduce((s, a) => s + (a.diallerStats?.calls || 0), 0);
      return { value, label: String(value), target: findTarget(wb, 'calls'), good: value >= (findTarget(wb, 'calls') || 0) };
    }
    if (metric === 'sales') {
      const value = agents.reduce((s, a) => s + (a.diallerStats?.sales || 0), 0);
      return { value, label: String(value), target: findTarget(wb, 'sales'), good: value >= (findTarget(wb, 'sales') || 0) };
    }
    if (metric === 'aht') {
      const calls = agents.reduce((s, a) => s + (a.diallerStats?.calls || 0), 0);
      const tic = agents.reduce((s, a) => s + (a.diallerStats?.timeInCalls || 0), 0);
      const sec = calls ? Math.floor(tic / calls) : 0;
      return { value: sec, label: String(sec), target: findTarget(wb, 'aht'), good: (findTarget(wb, 'aht') || 99999) >= sec };
    }
    if (metric === 'occupancy') {
      // simple occupancy approximation
      const occs = agents.map(a => {
        const prod = (a.diallerStats?.timeInCalls || 0) + (a.diallerStats?.timeInWrap || 0);
        const total = prod + 3 * 3600; // assume 3h other statuses in demo
        return total ? Math.round((prod / total) * 100) : 0;
      });
      const avg = occs.length ? Math.round(occs.reduce((s, v) => s + v, 0) / occs.length) : 0;
      return { value: avg, label: `${avg}%`, target: findTarget(wb, 'occupancy'), good: avg >= (findTarget(wb, 'occupancy') || 0) };
    }
    return { value: 0, label: '0' };
  };

  const findTarget = (wb: Wallboard, metric: KpiMetric) => {
    const w = wb.layout.find(w => w.type === 'kpi' && w.metric === metric) as any;
    return w?.target;
  };

  const computeLeaderboard = (wb: Wallboard, topN = 10) => {
    const agents = getAgents(wb);
    const list = agents
      .map(a => ({ id: a.id, name: a.name, sales: a.diallerStats?.sales || 0 }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, topN);
    return list;
  };

  const computeTrend = (wb: Wallboard) => {
    const agents = getAgents(wb);
    // Simple 12-bin trend by distributing calls uniformly for demo
    const totalCalls = agents.reduce((s, a) => s + (a.diallerStats?.calls || 0), 0);
    const bins = Array.from({ length: 12 }, () => 0);
    if (!totalCalls) return bins;
    let i = 0;
    for (let c = 0; c < totalCalls; c++) {
      bins[i % 12] += 1;
      i++;
    }
    return bins;
  };

  const store: Store = {
    boards,
    get,
    create,
    update,
    remove,
    duplicate,
    getAgents,
    computeKpi,
    computeLeaderboard,
    computeTrend
  };

  return React.createElement(WallboardsCtx.Provider, { value: store }, children);
}

export function useWallboards() {
  const ctx = React.useContext(WallboardsCtx);
  if (!ctx) throw new Error('useWallboards must be used within WallboardsProvider');
  return ctx;
}