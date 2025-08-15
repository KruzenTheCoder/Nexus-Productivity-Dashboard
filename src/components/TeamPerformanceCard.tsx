// src/components/TeamPerformanceCard.tsx
import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { useCampaign } from '../state/useCampaign';
import ComposeMessageDialog from './ComposeMessageDialog';

export default function TeamPerformanceCard({ teamId, leaderName }: { teamId: string; leaderName: string }) {
  const { teamSummary, messageTL, viewTeam } = useCampaign();
  const today = new Date().toISOString().slice(0, 10);
  const s = teamSummary(teamId, today, today);

  // Compose dialog state
  const [composeOpen, setComposeOpen] = React.useState(false);

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={800} gutterBottom>
        Team {teamId} - {leaderName}
      </Typography>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <SmallStat label="Total Calls" value={s.totalCalls} color="#0A84FF" />
        <SmallStat label="Total Sales" value={s.totalSales} color="#30D158" />
        <SmallStat label="Avg. AHT" value={s.averageAHT} color="#FF9F0A" />
        <SmallStat label="Occupancy" value={`${s.averageOccupancy}%`} color="#7C3AED" />
      </div>

      <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mt: 1.5 }}>
        <Button size="small" variant="contained" color="secondary" onClick={() => setComposeOpen(true)}>
          Message TL
        </Button>
        <Button size="small" variant="contained" color="primary" onClick={() => viewTeam(teamId)}>
          View Team
        </Button>
      </Stack>

      <ComposeMessageDialog
        open={composeOpen}
        title={`Message TL of ${teamId}`}
        onClose={() => setComposeOpen(false)}
        onSend={(txt) => {
          if (txt.trim()) messageTL(teamId, txt.trim());
          setComposeOpen(false);
        }}
      />
    </Box>
  );
}

function SmallStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Box className="card" sx={{ p: 1.5, textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ color, fontFamily: 'ui-monospace, Menlo, monospace' }}>
        {String(value)}
      </Typography>
    </Box>
  );
}