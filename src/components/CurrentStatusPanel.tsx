import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  Fade,
} from '@mui/material';
import { useAgent, STATUS_REASONS, type StatusLabel } from '../state/useAgent';

export type ReasonModalProps = {
  open: boolean;
  reasons: string[];
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function ReasonModal({ open, reasons, onClose, onConfirm }: ReasonModalProps) {
  const [value, setValue] = React.useState<string>(reasons[0] || 'Other');

  React.useEffect(() => {
    setValue(reasons?.[0] || 'Other');
  }, [reasons, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      TransitionComponent={Fade}
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
        },
      }}
      BackdropProps={{
        sx: { backgroundColor: 'rgba(0,0,0,0.6)' },
      }}
    >
      <DialogTitle component="div" sx={{ pb: 0, fontWeight: 800 }}>
        Select reason
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <Select
          size="small"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ borderRadius: 2 }}
        >
          {(reasons?.length ? reasons : ['Other']).map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, fontWeight: 800 }}
          onClick={() => onConfirm(value)}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const STATUSES: StatusLabel[] = [
  'Ready',
  'On Call',
  'Post-Call Work',
  'Break',
  'Lunch',
  'Training',
  'Offline',
  'Away',
];

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

export default function CurrentStatusPanel() {
  const { agent, setStatus } = useAgent();
  const [now, setNow] = React.useState(Date.now());
  const [pending, setPending] = React.useState<StatusLabel | null>(null);

  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const secs = Math.floor((now - new Date(agent.lastStatusChange).getTime()) / 1000);

  const needsReason = (s: StatusLabel) =>
    ['Break', 'Lunch', 'Offline', 'Away', 'Training', 'Post-Call Work', 'On Call'].includes(s);

  const handleClick = (s: StatusLabel) => {
    if (s === agent.status) return;
    if (needsReason(s)) setPending(s);
    else setStatus(s);
  };

  return (
    <>
      <Box className="card" sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Current Status for {agent.name}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <span className={`pill ${statusClass(agent.status)}`}>{agent.status}</span>
            </Box>
            <Typography className="mono" sx={{ mt: 1 }} color="text.secondary">
              Time in status: {fmt(secs)}
            </Typography>
          </Box>

          <Stack direction="row" gap={1} flexWrap="wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                className="status-btn"
                disabled={s === agent.status}
                onClick={() => handleClick(s)}
                style={{ color: 'inherit' }}
              >
                {s}
              </button>
            ))}
          </Stack>
        </Stack>
      </Box>

      <ReasonModal
        open={!!pending}
        reasons={pending ? STATUS_REASONS[pending] || ['Other'] : []}
        onClose={() => setPending(null)}
        onConfirm={(r: string) => {
          if (pending) setStatus(pending, r);
          setPending(null);
        }}
      />
    </>
  );
}