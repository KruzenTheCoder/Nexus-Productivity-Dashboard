// src/components/TeamLeaderDashboard.tsx
import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import TeamSummaryPills from './TeamSummaryPills';
import TeamTotalsCard from './TeamTotalsCard';
import TriageCard from './TriageCard';
import TeamAgentCard from './TeamAgentCard';
import { useTeam } from '../state/useTeam';

export default function TeamLeaderDashboard() {
  const { team } = useTeam();

  return (
    <Stack spacing={1}>
      {/* Summary pills row */}
      <TeamSummaryPills />

      {/* Team totals */}
      <TeamTotalsCard />

      {/* Triage */}
      <TriageCard />

      {/* Agents grid */}
      <Box>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
          Agents in {team.teamId}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 1
          }}
        >
          {team.agents.map(a => (
            <TeamAgentCard key={a.id} agentId={a.id} />
          ))}
        </Box>
      </Box>
    </Stack>
  );
}