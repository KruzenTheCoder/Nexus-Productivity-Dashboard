// src/components/TeamSummaryPills.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTeam } from '../state/useTeam';

function Pill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Box className="card" sx={{ p: 2, textAlign:'center' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ color, fontWeight: 800, mt: 0.5 }}>{value}</Typography>
    </Box>
  );
}

export default function TeamSummaryPills() {
  const { statusCounts, teamTotals } = useTeam();
  const counts = statusCounts();
  const today = new Date().toISOString().slice(0,10);
  const totals = teamTotals(today, today);
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 8 }}>
      <Pill label="Agents On Call" value={counts['On Call'] || 0} color="#0A84FF" />
      <Pill label="Agents Ready" value={counts['Ready'] || 0} color="#30D158" />
      <Pill label="Agents Offline" value={counts['Offline'] || 0} color="#6366F1" />
      <Pill label="Team Occupancy" value={`${totals.averageOccupancy}%`} color="#7C3AED" />
    </div>
  );
}