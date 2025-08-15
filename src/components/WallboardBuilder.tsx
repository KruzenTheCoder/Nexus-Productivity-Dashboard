import React from 'react';
import {
  Box, Stack, Typography, TextField, Button, Select, MenuItem, Chip, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWallboards } from '../state/useWallboards';
import { readDirectory } from '../state/directory';
import type { Wallboard, WallboardWidget, KpiMetric } from '../state/useWallboards';

export default function WallboardBuilder({ wbId }: { wbId: string }) {
  const { get, update } = useWallboards();
  const wb = get(wbId);
  const d = readDirectory();
  if (!wb) return <Typography>Wallboard not found.</Typography>;

  const onName = (e: React.ChangeEvent<HTMLInputElement>) => update(wb.id, { name: e.target.value });
  const onCampaign = (v: string) => update(wb.id, { scope: { ...wb.scope, campaignId: v, teamIds: [] } });
  const onTeams = (arr: string[]) => update(wb.id, { scope: { ...wb.scope, teamIds: arr } });

  const addWidget = (type: WallboardWidget['type']) => {
    const id = 'w' + Math.random().toString(36).slice(2);
    const nw: WallboardWidget =
      type === 'kpi'
        ? { id, type, metric: 'calls', title: 'KPI', target: undefined, colSpan: 1 }
        : type === 'leaderboard'
        ? { id, type, title: 'Sales Leaderboard', topN: 5, colSpan: 2 }
        : { id, type, title: 'Calls Trend', colSpan: 1 };
    update(wb.id, { layout: [...wb.layout, nw] });
  };

  const updateWidget = (wid: string, patch: Partial<WallboardWidget>) => {
    update(wb.id, {
      layout: wb.layout.map(w => {
        if (w.id !== wid) return w;
        
        // This is the correct, type-safe way to handle the update.
        // It ensures the patch is only applied if it's compatible with the widget's type.
        if (w.type === 'kpi') {
          return { ...w, ...(patch as Partial<WallboardWidget & { type: 'kpi' }>) };
        }
        if (w.type === 'leaderboard') {
          return { ...w, ...(patch as Partial<WallboardWidget & { type: 'leaderboard' }>) };
        }
        if (w.type === 'trend') {
          return { ...w, ...(patch as Partial<WallboardWidget & { type: 'trend' }>) };
        }
        return w;
      })
    });
  };
  
  const removeWidget = (wid: string) => update(wb.id, { layout: wb.layout.filter(w => w.id !== wid) });

  const teamIds = (d.campaigns.find(c => c.campaignId === wb.scope.campaignId)?.teamIds || []);
  const allTeams = teamIds;

  const goPresent = () => {
    const sp = new URLSearchParams(window.location.search);
    sp.set('view', 'wallboard'); sp.set('mode', 'present'); sp.set('wbId', wb.id);
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.pushState({}, '', url); window.dispatchEvent(new Event('popstate'));
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={1} sx={{ mb: 1 }}>
        <TextField size="small" label="Wallboard Name" value={wb.name} onChange={onName} />
        <Select size="small" value={wb.scope.campaignId} onChange={(e)=>onCampaign(e.target.value)} sx={{ minWidth: 140 }}>
          {d.campaigns.map(c => <MenuItem key={c.campaignId} value={c.campaignId}>Campaign {c.campaignId}</MenuItem>)}
        </Select>
        <Select
          multiple size="small" value={wb.scope.teamIds || []} onChange={(e)=>onTeams(e.target.value as string[])}
          renderValue={(s) => (s as string[]).length ? (s as string[]).join(', ') : 'All Teams'}
          sx={{ minWidth: 260 }}
        >
          {allTeams.map(tid => <MenuItem key={tid} value={tid}>{tid}</MenuItem>)}
        </Select>
        <Button variant="contained" onClick={goPresent}>Present</Button>
      </Stack>

      <Stack direction="row" gap={1} sx={{ mb: 1 }}>
        <Button variant="outlined" onClick={()=>addWidget('kpi')}>Add KPI</Button>
        <Button variant="outlined" onClick={()=>addWidget('leaderboard')}>Add Leaderboard</Button>
        <Button variant="outlined" onClick={()=>addWidget('trend')}>Add Trend</Button>
      </Stack>

      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr 1fr' }, gap: 1 }}>
        {wb.layout.map(w => (
          <Box key={w.id} className="card" sx={{ p: 2, gridColumn: `span ${w.colSpan || 1}` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <TextField
                size="small" label="Title" value={w.title || ''} onChange={(e)=>updateWidget(w.id, { title: e.target.value })}
              />
              <IconButton size="small" onClick={()=>removeWidget(w.id)}><DeleteIcon fontSize="small" /></IconButton>
            </Stack>

            {w.type === 'kpi' && (
              <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                <Select
                  size="small"
                  value={(w as any).metric}
                  onChange={(e)=>updateWidget(w.id, { metric: e.target.value as KpiMetric })}
                >
                  <MenuItem value="calls">Calls</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="aht">AHT (seconds)</MenuItem>
                  <MenuItem value="occupancy">Occupancy (%)</MenuItem>
                </Select>
                <TextField
                  size="small" label="Target" type="number"
                  value={(w as any).target ?? ''} onChange={(e)=>updateWidget(w.id, { target: Number(e.target.value) })}
                />
                <Select size="small" value={w.colSpan || 1} onChange={(e)=>updateWidget(w.id, { colSpan: Number(e.target.value) as any })}>
                  <MenuItem value={1}>1 col</MenuItem>
                  <MenuItem value={2}>2 col</MenuItem>
                  <MenuItem value={3}>3 col</MenuItem>
                </Select>
              </Stack>
            )}

            {w.type === 'leaderboard' && (
              <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                <TextField
                  size="small" label="Top N" type="number" value={(w as any).topN ?? 5}
                  onChange={(e)=>updateWidget(w.id, { topN: Number(e.target.value) })}
                />
                <Select size="small" value={w.colSpan || 2} onChange={(e)=>updateWidget(w.id, { colSpan: Number(e.target.value) as any })}>
                  <MenuItem value={1}>1 col</MenuItem>
                  <MenuItem value={2}>2 col</MenuItem>
                  <MenuItem value={3}>3 col</MenuItem>
                </Select>
              </Stack>
            )}

            {w.type === 'trend' && (
              <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                <Select size="small" value={w.colSpan || 1} onChange={(e)=>updateWidget(w.id, { colSpan: Number(e.target.value) as any })}>
                  <MenuItem value={1}>1 col</MenuItem>
                  <MenuItem value={2}>2 col</MenuItem>
                  <MenuItem value={3}>3 col</MenuItem>
                </Select>
              </Stack>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}