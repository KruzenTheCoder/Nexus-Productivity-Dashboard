// src/components/TasksCard.tsx
import React from 'react';
import { Box, Typography, Stack, TextField, Button, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAgent } from '../state/useAgent';

export default function TasksCard() {
  const { agent, addTask, toggleTask, deleteTask, moveTask } = useAgent();
  const [text, setText] = React.useState('');

  const submit = () => { if (text.trim()) { addTask(text.trim()); setText(''); } };

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>My Tasks</Typography>
      <Stack direction="row" gap={1} mb={1}>
        <TextField fullWidth size="small" placeholder="Add a task and press Enter"
          value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={(e)=>{ if (e.key === 'Enter') submit(); }} />
        <Button variant="contained" onClick={submit}>Add</Button>
      </Stack>
      <Stack spacing={1}>
        {agent.tasks.map(t => (
          <Box key={t.id} className="card" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent:'space-between' }}>
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} />
              <span style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--dark-text-secondary)' : 'inherit' }}>{t.text}</span>
            </label>
            <div>
              <IconButton size="small" onClick={()=>moveTask(t.id, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={()=>moveTask(t.id, +1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={()=>deleteTask(t.id)}><DeleteIcon fontSize="small" /></IconButton>
            </div>
          </Box>
        ))}
        {agent.tasks.length === 0 && <Typography color="text.secondary">No tasks yet</Typography>}
      </Stack>
    </Box>
  );
}