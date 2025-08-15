import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useAgent } from '../state/useAgent';

export default function GoalsCard() {
  const { agent } = useAgent();
  return (
    <Box className="card" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Goals</Typography>
      <Stack spacing={1.5}>
        <GoalBar label="Calls" current={agent.diallerStats.calls} goal={agent.goals.calls} />
        <GoalBar label="Sales" current={agent.diallerStats.sales} goal={agent.goals.sales} />
      </Stack>
    </Box>
  );
}

function GoalBar({ label, current, goal }: { label: string; current: number; goal: number }) {
  const pct = Math.min(100, Math.round((current / Math.max(1,goal)) * 100));
  const color = pct >= 100 ? '#30D158' : pct >= 75 ? '#0A84FF' : pct >= 50 ? '#FFD60A' : '#FF453A';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: 'var(--dark-text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{current} / {goal}</span>
      </div>
      <div style={{ height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 9999 }}>
        <div style={{ height: 12, borderRadius: 9999, width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}