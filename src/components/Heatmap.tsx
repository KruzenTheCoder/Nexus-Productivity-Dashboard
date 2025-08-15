// src/components/Heatmap.tsx
import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useAgent } from '../state/useAgent';

function cls(s?: string) { return s ? `status-${s.replace(/\s+/g,'-')}` : ''; }

export default function Heatmap({ from, to }: { from: string; to: string }) {
  const { perHourForRange } = useAgent();
  const hours = perHourForRange(from, to);

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Status Timeline (Hour of Day)</Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2 }}>
        {hours.map(h => (
          <div key={h.hour}
            className={`${cls(h.top)}`}
            style={{ height: 12, borderRadius: 2, opacity: h.opacity }}
            title={`${h.hour}:00 — ${h.top || 'No data'}`}
          />
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(12,1fr)', marginTop: 8 }}>
        {Array.from({ length: 12 }).map((_,i) =>
          <div key={i} style={{ textAlign:'center', fontSize: 12, color:'#9CA3AF' }}>{i*2}:00</div>
        )}
      </div>
    </Box>
  );
}