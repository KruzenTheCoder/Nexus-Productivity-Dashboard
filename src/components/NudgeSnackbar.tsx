// src/components/NudgeSnackbar.tsx
import React from 'react';
import { Snackbar, Alert, Button, Stack } from '@mui/material';
import { useAgent } from '../state/useAgent';

export default function NudgeSnackbar() {
  const { setStatus } = useAgent();
  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState<string>('');
  const [canResume, setCanResume] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const { message, canResume: cr } = (ce?.detail || {}) as { message?: string; canResume?: boolean };
      if (message) {
        setMsg(message);
        setCanResume(!!cr);
        setOpen(true);
      }
    };
    window.addEventListener('agent:nudge' as any, handler as any);
    return () => window.removeEventListener('agent:nudge' as any, handler as any);
  }, []);

  const onClose = () => setOpen(false);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={onClose}
        severity="info"
        sx={{ width: '100%', alignItems: 'center' }}
        action={
          canResume ? (
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setStatus('Ready', 'Resume via nudge');
                setOpen(false);
              }}
            >
              Resume
            </Button>
          ) : undefined
        }
      >
        {msg}
      </Alert>
    </Snackbar>
  );
}