// src/components/TeamAgentCard.tsx
import React from 'react';
import { Box, Stack, Typography, Button, Avatar, Menu, MenuItem } from '@mui/material';
import { useTeam } from '../state/useTeam';
import ComposeMessageDialog from './ComposeMessageDialog';
import { STATUS_REASONS, type StatusLabel } from '../state/useAgent';
import { ReasonModal } from './CurrentStatusPanel';

function initials(n: string) {
  return n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
}

function statusClass(s: string) {
  return `status-${s.replace(/\s+/g, '-')}`;
}

function fmt(secs: number) {
  const s = Math.max(0, Math.floor(secs));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(Math.floor(s % 60)).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

const STATUSES: StatusLabel[] = ['Ready','On Call','Post-Call Work','Break','Lunch','Training','Offline','Away'];
const needsReason = (s: StatusLabel) =>
  ['Break','Lunch','Offline','Away','Training','Post-Call Work','On Call'].includes(s);

export default function TeamAgentCard({ agentId }: { agentId: string }) {
  const { team, durationInStatus, summaryForRange, viewAgent, messageAgent, setAgentStatus } = useTeam();
  const a = team.agents.find(x => x.id === agentId);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [tick, setTick] = React.useState(Date.now());
  
  React.useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!a) return null;

  const today = new Date().toISOString().slice(0, 10);
  const sum = summaryForRange(a, today, today);
  const total = Object.values(sum).reduce((s, v) => s + v, 0) || 1;
  const segments = Object.entries(sum)
    .filter(([, v]) => (v as number) > 0)
    .map(([st, v]) => ({ st, w: Math.round(100 * (v as number) / total) }));
  
  const [menuEl, setMenuEl] = React.useState<null | HTMLElement>(null);
  const [pending, setPending] = React.useState<StatusLabel | null>(null);
  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => setMenuEl(e.currentTarget);
  const closeMenu = () => setMenuEl(null);
  const chooseStatus = (s: StatusLabel) => {
    closeMenu();
    if (s === a.status) return;
    if (needsReason(s)) setPending(s);
    else setAgentStatus(a.id, s);
  };

  const GhostSmall = ({ children }: { children: React.ReactNode }) => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 9999,
        border: '1px solid',
        borderColor: 'divider',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box className="card" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Avatar sx={{ bgcolor: '#0A84FF', fontWeight: 800, width: 34, height: 34 }}>
            {initials(a.name)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>
              {a.name}
              {a.id === team.leader.id ? ' (You)' : ''}
            </Typography>
            <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.75 }}>
              <GhostSmall>
                <span className={`pill ${statusClass(a.status)}`} style={{ padding: '3px 8px' }}>
                  {a.status}
                </span>
              </GhostSmall>
              <GhostSmall>Calls {a.diallerStats.calls}</GhostSmall>
              <GhostSmall>Sales {a.diallerStats.sales}</GhostSmall>
            </Stack>
          </Box>
        </Stack>

        <GhostSmall>{fmt(durationInStatus(a))}</GhostSmall>
      </Stack>

      {/* stacked status bar */}
      <div
        className="card"
        style={{
          height: 8,
          borderRadius: 9999,
          overflow: 'hidden',
          marginTop: 12,
          display: 'flex',
        }}
      >
        {segments.map((seg) => (
          <div
            key={seg.st}
            className={statusClass(seg.st)}
            style={{ width: `${seg.w}%` }}
            title={`${seg.st}: ${seg.w}%`}
          />
        ))}
      </div>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.25 }}>
        <Button size="small" variant="outlined" onClick={openMenu}>
          Change Status
        </Button>
        <Stack direction="row" gap={1}>
          <Button size="small" variant="contained" color="secondary" onClick={() => setComposeOpen(true)}>
            Message
          </Button>
          <Button size="small" variant="contained" color="primary" onClick={() => viewAgent(a.id)}>
            View Profile
          </Button>
        </Stack>
      </Stack>

      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={closeMenu}>
        {STATUSES.map(s => (
          <MenuItem key={s} disabled={s === a.status} onClick={() => chooseStatus(s)}>
            {s}
          </MenuItem>
        ))}
      </Menu>

      <ComposeMessageDialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={(txt) => { messageAgent(a.id, txt); setComposeOpen(false); }}
      />

      <ReasonModal
        open={!!pending}
        reasons={pending ? (STATUS_REASONS[pending] || ['Other']) : []}
        onClose={() => setPending(null)}
        onConfirm={(r) => { if (pending) setAgentStatus(a.id, pending, r); setPending(null); }}
      />
    </Box>
  );
}