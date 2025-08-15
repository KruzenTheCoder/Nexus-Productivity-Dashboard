import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo } from 'react';

import Timer from './Timer';
import { useAgent } from '../state/useAgent';
import { formatTime } from '../lib/time';

import DailyStatusSummary from './DailyStatusSummary';
import DailySummaryCard from './DailySummaryCard';
import TasksCard from './TasksCard';
import Scorecard from './Scorecard';
import ActivityLogCard from './ActivityLogCard';
import StatusTimelineCard from './StatusTimelineCard';
import CallDispositionsCard from './CallDispositionsCard';
import GoalsCard from './GoalsCard';

export default function AgentDashboard() {
  const { agent } = useAgent();

  const labels = Array.from({ length: 12 }, (_, i) => i * 2);
  const series = useMemo(
    () => Array.from({ length: 12 }, () => Math.floor(agent.diallerStats.calls / 12) + Math.floor(Math.random() * 3)),
    [agent.diallerStats.calls]
  );

  const from = new Date().toISOString().slice(0, 10);
  const to = from;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        columnGap: 2,      // horizontal gap between columns (8*2=16px). Set to 0 for none.
        alignItems: 'start'
      }}
    >
      {/* Left column */}
      <Stack spacing={1} sx={{ mb: 0 }}>
        {/* Focus Timer */}
        <Card className="card" variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>Focus Session Timer</Typography>
            <Timer />
          </CardContent>
        </Card>

        {/* Personal Scorecard */}
        <Scorecard />

        {/* Daily Status Summary */}
        <DailyStatusSummary from={from} to={to} />

        {/* Daily Summary */}
        <DailySummaryCard from={from} to={to} />

        {/* Call Dispositions */}
        <CallDispositionsCard />

        {/* Goals */}
        <GoalsCard />
      </Stack>

      {/* Right column */}
      <Stack spacing={1} sx={{ mb: 0 }}>
        {/* Dialler Stats + Trend */}
        <Card className="card" variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>Dialler Stats</Typography>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <StatCard label="Calls" value={agent.diallerStats.calls} color="info.main" />
              <StatCard label="Sales" value={agent.diallerStats.sales} color="success.main" />
              <StatCard label="Dropped" value={agent.diallerStats.droppedCalls} color="error.main" />
              <StatCard label="Time in Calls" value={formatTime(agent.diallerStats.timeInCalls)} />
              <StatCard label="Time in Wrap" value={formatTime(agent.diallerStats.timeInWrap)} />
            </div>

            <Divider sx={{ my: 1 }} />
            <Box sx={{ height: 220 }}>
              <LineChart
                xAxis={[{ data: labels, label: 'Hour of Day' }]}
                series={[{ data: series, label: 'Calls', area: true, color: '#0A84FF' }]}
                height={220}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Tasks */}
        <TasksCard />

        {/* Activity Log */}
        <ActivityLogCard />

        {/* Status Timeline */}
        <StatusTimelineCard from={from} to={to} />
      </Stack>
    </Box>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <Card className="card" variant="outlined" sx={{ p: 1, mb: 0 }}>
      <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ color: color || 'text.primary' }} fontFamily="ui-monospace, Menlo, monospace">
          {String(value)}
        </Typography>
      </CardContent>
    </Card>
  );
}