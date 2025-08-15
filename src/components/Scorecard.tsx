// src/components/Scorecard.tsx
import React from 'react';
import { Box, Typography, Grid as Grid, LinearProgress, Stack } from '@mui/material';
import { useAgent } from '../state/useAgent';
import { formatTime } from '../lib/time';

export default function Scorecard() {
  const { agent, aht, occupancy, score } = useAgent();
  const callsGoal = agent.goals.calls || 50;
  const salesGoal = agent.goals.sales || 5;
  const callsPct = Math.min(100, Math.round(100 * (agent.diallerStats.calls || 0) / Math.max(1, callsGoal)));
  const salesPct = Math.min(100, Math.round(100 * (agent.diallerStats.sales || 0) / Math.max(1, salesGoal)));

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Personal Scorecard</Typography>
      <Grid container spacing={1}>
        <Grid size={6}>
          <MetricBar label="Calls" pct={callsPct} footer={`${agent.diallerStats.calls} / ${callsGoal}`} color="#0A84FF" />
        </Grid>
        <Grid size={6}>
          <MetricBar label="Sales" pct={salesPct} footer={`${agent.diallerStats.sales} / ${salesGoal}`} color="#30D158" />
        </Grid>
        <Grid size={6}>
          <MetricBar label="AHT" pct={pctFromAHT(aht())} footer={`${aht()} (target 03:00)`} color="#FF9F0A" />
        </Grid>
        <Grid size={6}>
          <MetricBar label="Occupancy" pct={occupancy()} footer={`${occupancy()}%`} color="#7C3AED" />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2, display:'flex', alignItems:'center', justifyContent:'space-between' }} className="card" >
        <Typography color="text.secondary" sx={{ p:1.5 }}>Overall Score</Typography>
        <Typography variant="h5" sx={{ p:1.5, fontWeight: 900 }}>{score()}</Typography>
      </Box>
    </Box>
  );
}

function MetricBar({ label, pct, footer, color }: { label: string; pct: number; footer: string; color: string }) {
  return (
    <Box className="card" sx={{ p: 1.5 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', color:'text.secondary', fontSize:12 }}>
        <span>{label}</span><span>{pct}%</span>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, height: 6, borderRadius: 9999, '& .MuiLinearProgress-bar': { backgroundColor: color } }} />
      <Box sx={{ mt: 0.5, fontSize: 13 }}>{footer}</Box>
    </Box>
  );
}

function pctFromAHT(aht: string) {
  // 90s => 100%, 300s => 0% (same as singleton idea)
  const [h,m,s] = aht.split(':').map(Number);
  const sec = h*3600 + m*60 + s;
  const pct = Math.max(0, Math.min(100, 100 * (300 - sec) / (300 - 90)));
  return Math.round(pct);
}