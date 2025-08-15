// src/components/FiltersBar.tsx
import { Box, Stack, MenuItem, Select, TextField, Button, Typography } from '@mui/material';
import React from 'react';

const presets = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 days' },
  { value: '28d', label: 'Last 28 days' },
  { value: 'custom', label: 'Custom' }
];

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export default function FiltersBar() {
  const [preset, setPreset] = React.useState('today');
  const [from, setFrom] = React.useState(ymd(new Date()));
  const [to, setTo] = React.useState(ymd(new Date()));
  const [campaign, setCampaign] = React.useState('All');
  const [team, setTeam] = React.useState('All');
  const [status, setStatus] = React.useState('All');

  React.useEffect(() => {
    const d = new Date();
    if (preset === 'today') { setFrom(ymd(d)); setTo(ymd(d)); }
    if (preset === 'yesterday') { const y = new Date(d.getFullYear(), d.getMonth(), d.getDate()-1); setFrom(ymd(y)); setTo(ymd(y)); }
    if (preset === '7d') { const s = new Date(d.getFullYear(), d.getMonth(), d.getDate()-6); setFrom(ymd(s)); setTo(ymd(d)); }
    if (preset === '28d') { const s = new Date(d.getFullYear(), d.getMonth(), d.getDate()-27); setFrom(ymd(s)); setTo(ymd(d)); }
  }, [preset]);

  const pillSx = { 
    minWidth: 125,
    borderRadius: 9999, 
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'divider',
      borderRadius: '9999px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'divider',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'divider',
      borderWidth: '1px',
    }
  };

  const textFieldSx = { 
    '& .MuiOutlinedInput-root': {
      borderRadius: '9999px',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'divider',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'divider',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'divider',
      }
    }
  };

  return (
    <Box className="sticky-filters" sx={{ mb: 2 }}>
      <Box className="card" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" gap={2} flexWrap="wrap">

          {/* Date filter group */}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">Date</Typography>
            <Select size="small" value={preset} onChange={e=>setPreset(e.target.value)} sx={pillSx}>
              {presets.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </Select>
            {preset === 'custom' && (
              <>
                <TextField size="small" type="date" value={from} onChange={e=>setFrom(e.target.value)} sx={textFieldSx} />
                <span>→</span>
                <TextField size="small" type="date" value={to} onChange={e=>setTo(e.target.value)} sx={textFieldSx} />
              </>
            )}
          </Stack>

          {/* Campaign filter group */}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">Campaign</Typography>
            <Select size="small" value={campaign} onChange={e=>setCampaign(e.target.value)} sx={pillSx}>
              {['All','A','B'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </Stack>

          {/* Team filter group */}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">Team</Typography>
            <Select size="small" value={team} onChange={e=>setTeam(e.target.value)} sx={pillSx}>
              {['All','Team 1','Team 2','Team 3','Team 4','Team 5'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </Stack>

          {/* Status filter group */}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Select size="small" value={status} onChange={e=>setStatus(e.target.value)} sx={pillSx}>
              {['All','Ready','On Call','Post-Call Work','Break','Lunch','Training','Offline','Away'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </Stack>

          {/* Export and Apply buttons at the far right */}
          <Stack direction="row" gap={1} alignItems="center" sx={{ ml: { xs: 0, md: 'auto' } }}>
            <Button variant="contained" color="success" sx={{ borderRadius: 2 }}>Export XLSX</Button>
            <Button variant="contained" color="primary" sx={{ borderRadius: 2 }}>Apply</Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}