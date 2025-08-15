// src/components/DailyStatusSummary.tsx
import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { useAgent, hhmmss } from '../state/useAgent';
import type { StatusLabel } from '../state/useAgent';

function statusDotClass(s: string) { return `status-${s.replace(/\s+/g, '-')}`; }

export default function DailyStatusSummary({ from, to }: { from: string; to: string }) {
  const { summaryForRange } = useAgent();
  const sum = summaryForRange(from, to);
  const entries = (Object.entries(sum) as [StatusLabel, number][])
    .filter(([,sec])=>sec>0)
    .sort((a,b)=> b[1]-a[1]);

  const exportCSV = () => {
    const rows: string[][] = [['From', 'To'], [from, to], [], ['Status', 'Seconds', 'HH:MM:SS']];
    entries.forEach(([st, secs]) => rows.push([st, String(secs), hhmmss(secs)]));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `daily-status-summary-${from}_to_${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="h6" fontWeight={800}>Daily Status Summary</Typography>
        <Button size="small" variant="contained" color="secondary" onClick={exportCSV}>Export CSV</Button>
      </Stack>
      {!entries.length && <Typography color="text.secondary">No activity yet.</Typography>}
      <Stack spacing={1}>
        {entries.map(([status, secs]) => (
          <Box key={status} className="card" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className={statusDotClass(status)} style={{ display:'inline-block', width:8, height:8, borderRadius:9999 }} />
              {status}
            </Typography>
            <Typography className="mono" color="text.secondary">{hhmmss(secs)}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}