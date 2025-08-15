// src/components/TriageCard.tsx
import React from 'react';
import { Box, Typography, Stack, Button, Menu, MenuItem } from '@mui/material';
import { useTeam } from '../state/useTeam';
import { STATUS_REASONS, type StatusLabel } from '../state/useAgent';
import ComposeMessageDialog from './ComposeMessageDialog';
import { ReasonModal } from './CurrentStatusPanel';

const STATUSES: StatusLabel[] = ['Ready','On Call','Post-Call Work','Break','Lunch','Training','Offline','Away'];
const needsReason = (s: StatusLabel) =>
  ['Break','Lunch','Offline','Away','Training','Post-Call Work','On Call'].includes(s);

export default function TriageCard() {
 const { team, triageQueue, messageAgent, setAgentStatus } = useTeam();
 const today = new Date().toISOString().slice(0, 10);
  const items = triageQueue(today, today);

  const [compose, setCompose] = React.useState<{ open: boolean; agentId?: string; name?: string }>({ open: false });
  const [menuEl, setMenuEl] = React.useState<{ el: HTMLElement | null; agentId?: string }>({ el: null });
  const [pending, setPending] = React.useState<{ status: StatusLabel | null; agentId?: string }>({ status: null });

  const openCompose = (agentId: string) => {
    const a = team.agents.find(x => x.id === agentId);
    setCompose({ open: true, agentId, name: a?.name || 'Agent' });
  };

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, agentId: string) => {
    setMenuEl({ el: e.currentTarget, agentId });
  };
  const closeMenu = () => setMenuEl({ el: null });

  const chooseStatus = (s: StatusLabel) => {
    const agentId = menuEl.agentId!;
    closeMenu();
    const a = team.agents.find(x => x.id === agentId);
    if (!a || s === a.status) return;
    if (needsReason(s)) setPending({ status: s, agentId });
    else setAgentStatus(agentId, s);
  };

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        Triage Queue
      </Typography>
      {!items.length && <Typography color="text.secondary">All good 👍</Typography>}
      <Stack spacing={1}>
        {items.map(it => (
          <Box
            key={`${it.agentId}-${it.label}`}
            className="card"
            sx={{ p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="body2">{it.label}</Typography>
            <Stack direction="row" gap={1}>
              <Button size="small" variant="outlined" onClick={(e) => openMenu(e, it.agentId)}>
                Set Status
              </Button>
              <Button size="small" variant="contained" color="secondary" onClick={() => openCompose(it.agentId)}>
                Message
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Menu anchorEl={menuEl.el} open={Boolean(menuEl.el)} onClose={closeMenu}>
        {STATUSES.map(s => (
          <MenuItem key={s} onClick={() => chooseStatus(s)}>
            {s}
          </MenuItem>
        ))}
      </Menu>

      <ReasonModal
        open={!!pending.status}
        reasons={pending.status ? (STATUS_REASONS[pending.status] || ['Other']) : []}
        onClose={() => setPending({ status: null })}
        onConfirm={(r) => {
          if (pending.status && pending.agentId) setAgentStatus(pending.agentId, pending.status, r);
          setPending({ status: null });
        }}
      />

      <ComposeMessageDialog
        open={compose.open}
        title={compose.name ? `Message ${compose.name}` : 'Message'}
        onClose={() => setCompose({ open: false })}
        onSend={(txt) => { if (compose.agentId) messageAgent(compose.agentId, txt); setCompose({ open: false }); }}
      />
    </Box>
  );
}