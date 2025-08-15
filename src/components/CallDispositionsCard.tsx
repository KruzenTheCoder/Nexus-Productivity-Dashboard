import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { useAgent } from '../state/useAgent';

export default function CallDispositionsCard() {
  const { agent, addDisposition } = useAgent();
  const disp = agent.diallerStats.callDispositions || {};
  const total = agent.diallerStats.calls || 1;

  const entries = Object.entries(disp).sort((a,b)=> (b[1] as number) - (a[1] as number));

  const pct = (v: number) => Math.round((v/Math.max(1,total))*100);

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6" fontWeight={800}>Call Dispositions</Typography>
        <Stack direction="row" gap={1}>
          <Button size="small" variant="contained" color="info" onClick={()=>addDisposition('Sale')}>Sale</Button>
          <Button size="small" variant="contained" color="inherit" onClick={()=>addDisposition('Callback')}>Callback</Button>
          <Button size="small" variant="contained" color="inherit" onClick={()=>addDisposition('Not Interested')}>Not Interested</Button>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        {entries.length === 0 && <Typography color="text.secondary">No dispositions yet</Typography>}
        {entries.map(([label, count]) => (
          <Box key={label}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="body2" fontWeight={700}>{count as number} ({pct(count as number)}%)</Typography>
            </Stack>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 9999 }}>
              <div style={{ height: 8, borderRadius: 9999, width: `${pct(count as number)}%`, background: '#0A84FF' }} />
            </div>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}