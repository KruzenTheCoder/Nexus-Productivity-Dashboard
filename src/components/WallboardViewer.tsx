import React from 'react';
import { Box, Typography, LinearProgress, Stack, List, ListItem } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useWallboards } from '../state/useWallboards';

export default function WallboardViewer({ wbId }: { wbId: string }) {
  const { get, computeKpi, computeLeaderboard, computeTrend } = useWallboards();
  const wb = get(wbId);
  const [tick, setTick] = React.useState(Date.now());
  React.useEffect(()=>{ const t = setInterval(()=>setTick(Date.now()), 15000); return ()=>clearInterval(t); },[]);
  if (!wb) return <Typography>Wallboard not found.</Typography>;

  return (
    <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr 1fr' }, gap: 1 }}>
      {wb.layout.map(w => {
        if (w.type === 'kpi') {
          const k = computeKpi(wb, w.metric);
          const pct = (() => {
            if (w.metric === 'aht') {
              if (!w.target) return 0;
              const best = 90, worst = w.target || 300;
              const score = Math.max(0, Math.min(100, Math.round(100 * (worst - k.value) / (worst - best))));
              return score;
            }
            if (!w.target) return 0;
            const v = w.metric === 'occupancy' ? k.value : k.value;
            return Math.max(0, Math.min(100, Math.round((v / w.target) * 100)));
          })();
          return (
            <Box key={w.id} className="card" sx={{ p: 2, gridColumn: `span ${w.colSpan || 1}` }}>
              <Typography variant="subtitle2" color="text.secondary">{w.title || w.metric.toUpperCase()}</Typography>
              <Typography variant="h4" fontWeight={900} sx={{ mt: .5 }}>
                {w.metric === 'occupancy' ? `${k.value}%` : w.metric === 'aht' ? `${k.value}s` : k.value}
              </Typography>
              {w.target !== undefined && (
                <Stack sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{ height: 10, borderRadius: 9999 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Target: {w.metric === 'aht' ? `${w.target}s` : w.metric === 'occupancy' ? `${w.target}%` : w.target}
                  </Typography>
                </Stack>
              )}
            </Box>
          );
        }
        if (w.type === 'leaderboard') {
          const list = computeLeaderboard(wb, w.topN || 5);
          return (
            <Box key={w.id} className="card" sx={{ p: 2, gridColumn: `span ${w.colSpan || 2}` }}>
              <Typography variant="subtitle2" color="text.secondary">{w.title || 'Leaderboard'}</Typography>
              <List dense disablePadding sx={{ mt: 1 }}>
                {list.map((a, i) => (
                  <ListItem key={a.id} sx={{ display:'flex', justifyContent:'space-between', py: .5 }}>
                    <Typography variant="body2">{i+1}. {a.name}</Typography>
                    <Typography variant="body2" fontWeight={800}>{a.sales}</Typography>
                  </ListItem>
                ))}
                {!list.length && <Typography color="text.secondary">No data</Typography>}
              </List>
            </Box>
          );
        }
        if (w.type === 'trend') {
          const data = computeTrend(wb);
          const labels = Array.from({ length: 12 }).map((_,i)=>`${String(i*2).padStart(2,'0')}:00`);
          return (
            <Box key={w.id} className="card" sx={{ p: 2, gridColumn: `span ${w.colSpan || 1}` }}>
              <Typography variant="subtitle2" color="text.secondary">{w.title || 'Trend'}</Typography>
              <div style={{ height: 220 }}>
                <LineChart
                  xAxis={[{ data: labels }]}
                  series={[{ data, label: 'Calls', area: true, color: '#0A84FF' }]}
                  height={220}
                />
              </div>
            </Box>
          );
        }
        return null;
      })}
    </Box>
  );
}