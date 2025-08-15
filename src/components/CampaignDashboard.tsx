import React from 'react';
import { Box, Typography } from '@mui/material';
import { useCampaign } from '../state/useCampaign';
import CampaignTotalsCard from './CampaignTotalsCard';
import TeamPerformanceCard from './TeamPerformanceCard';

export default function CampaignDashboard() {
  const { campaign } = useCampaign();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
      <CampaignTotalsCard />

      <Box>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
          Performance by Team
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {campaign.teams.map(t => (
            <TeamPerformanceCard key={t.teamId} teamId={t.teamId} leaderName={t.leader.name} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}