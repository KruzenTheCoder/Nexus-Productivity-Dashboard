import React from 'react';
import { Box, Typography, Grid as Grid } from '@mui/material';
import { useAgent } from '../state/useAgent';
import { formatTime } from '../lib/time';

export default function DailySummaryCard({ from, to }: { from: string; to: string }) {
  const { agent, summaryForRange, occupancy } = useAgent();
  const sum = summaryForRange(from, to);
  const aht = agent.diallerStats.calls
    ? formatTime(Math.floor(agent.diallerStats.timeInCalls / agent.diallerStats.calls))
    : '00:00:00';

  const adherence = (() => {
    const schedule = agent.schedule || { workSeconds: 8*3600, breakSeconds: 15*60, lunchSeconds: 60*60 };
    const work = (sum['Ready']||0)+(sum['On Call']||0)+(sum['Post-Call Work']||0)+(sum['Training']||0);
    const brk = sum['Break']||0; const lunch = sum['Lunch']||0;
    const off = (a:number,b:number)=>Math.abs(a-b)>300;
    return off(work, schedule.workSeconds)||off(brk, schedule.breakSeconds)||off(lunch, schedule.lunchSeconds) ? 'Behind' : 'On Track';
  })();

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>Daily Summary</Typography>
      <Grid container spacing={1}>
        <Grid size={6}><SmallStat label="Time in Calls" value={formatTime(agent.diallerStats.timeInCalls)} color="info.main" /></Grid>
        <Grid size={6}><SmallStat label="Time in Wrap" value={formatTime(agent.diallerStats.timeInWrap)} color="success.main" /></Grid>
        <Grid size={6}><SmallStat label="AHT" value={aht} color="#FF9F0A" /></Grid>
        <Grid size={6}><SmallStat label="Occupancy" value={`${occupancy()}%`} color="#7C3AED" /></Grid>
        <Grid size={6}><SmallStat label="Adherence" value={adherence} color={adherence === 'On Track' ? '#30D158' : '#FF453A'} /></Grid>
        <Grid size={6}><SmallStat label="Time Ready" value={formatTime(sum['Ready'] || 0)} color="#FFD60A" /></Grid>
      </Grid>
    </Box>
  );
}

function SmallStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Box className="card" sx={{ p: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" sx={{ color: color || 'text.primary' }} fontFamily="ui-monospace, Menlo, monospace">
        {value}
      </Typography>
    </Box>
  );
}