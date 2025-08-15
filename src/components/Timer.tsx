// src/components/Timer.tsx
import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useAgent } from '../state/useAgent';

export default function Timer() {
  const { autoBreakOnComplete, setAutoBreak } = useAgent();
  const [seconds, setSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [tag, setTag] = useState('');
  const tickRef = useRef<number | null>(null);

  useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current); }, []);

  const start = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    setRunning(true);
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          setRunning(false);
          if (autoBreakOnComplete) preset(5);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };
  const pause = () => { if (tickRef.current) clearInterval(tickRef.current); setRunning(false); };
  const reset = () => { if (tickRef.current) clearInterval(tickRef.current); setRunning(false); setRemaining(seconds); };
  const preset = (m: number) => { const s = m * 60; setSeconds(s); setRemaining(s); };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const pill = {
    borderRadius: 12,
    bgcolor: 'background.paper',
    color: 'text.secondary',
    border: '1px solid',
    borderColor: 'divider',
    px: 2
  } as const;

  return (
    <Stack gap={2}>
      <Typography variant="h4" className="mono" color={remaining <= 300 && remaining > 0 ? 'warning.main' : 'text.primary'}>
        {mm}:{ss}
      </Typography>

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button variant="contained" color="success" onClick={start} disabled={running}>Start</Button>
        <Button variant="contained" color="warning" onClick={pause} disabled={!running}>Pause</Button>
        <Button variant="contained" color="inherit" onClick={reset}>Reset</Button>
      </Stack>

      <Stack direction="row" gap={1} flexWrap="wrap">
        {[25, 50, 10].map((m) => (
          <Button key={m} variant="outlined" sx={pill} onClick={() => preset(m)}>{m} min</Button>
        ))}
      </Stack>

      <TextField
        size="small"
        placeholder="Session tag (e.g., Outbound calls, Admin)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        fullWidth
      />
      <FormControlLabel
        control={<Checkbox checked={autoBreakOnComplete} onChange={(e) => setAutoBreak(e.target.checked)} />}
        label="Auto 5m break on complete"
      />
    </Stack>
  );
}