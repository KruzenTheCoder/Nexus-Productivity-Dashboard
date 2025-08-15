import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { useCampaign } from '../state/useCampaign';

export default function CampaignTotalsCard() {
  const { campaignTotals, exportCampaignXLSX, campaign } = useCampaign();
  const today = new Date().toISOString().slice(0,10);
  const totals = campaignTotals(today, today);

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="h6" fontWeight={800}>Campaign Totals</Typography>
        <Button size="small" variant="contained" color="success" onClick={()=>exportCampaignXLSX(today, today)}>
          Export Campaign XLSX
        </Button>
      </Stack>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8 }}>
        <SmallStat label="Total Calls" value={totals.totalCalls} color="#0A84FF" />
        <SmallStat label="Total Sales" value={totals.totalSales} color="#30D158" />
        <SmallStat label="Average AHT" value={totals.averageAHT} color="#FF9F0A" />
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