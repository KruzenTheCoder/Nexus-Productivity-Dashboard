// src/components/TeamTotalsCard.tsx
import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { useTeam } from '../state/useTeam';

export default function TeamTotalsCard() {
  const { teamTotals, exportTeamCSV } = useTeam();
  const today = new Date().toISOString().slice(0,10);
  const totals = teamTotals(today, today);

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="h6" fontWeight={800}>Team Performance Totals</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button size="small" variant="contained" color="success" onClick={()=>exportTeamCSV(today, today)}>
            Export Team CSV
          </Button>
          <Button size="small" variant="contained" color="primary">Message Ready</Button>
          <Button size="small" variant="contained" color="warning">Recall from Break</Button>
        </Stack>
      </Stack>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8 }}>
        <SmallStat label="Total Calls" value={totals.totalCalls} color="#0A84FF" />
        <SmallStat label="Total Sales" value={totals.totalSales} color="#30D158" />
        <SmallStat label="Avg. AHT" value={totals.averageAHT} color="#FF9F0A" />
      </div>
    </Box>
  );
}

function SmallStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Box className="card" sx={{ p: 1.5, textAlign:'center' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" sx={{ color, fontFamily:'ui-monospace, Menlo, monospace' }}>{String(value)}</Typography>
    </Box>
  );
}