import React from 'react';
import { Box, Stack, Typography, Button, List, ListItem, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useWallboards } from '../state/useWallboards';

export default function WallboardList() {
  const { boards, create, remove, duplicate } = useWallboards();

  const goTo = (mode: 'edit' | 'present', id: string) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set('view', 'wallboard'); sp.set('mode', mode); sp.set('wbId', id);
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.pushState({}, '', url); window.dispatchEvent(new Event('popstate'));
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>Wallboards</Typography>
        <Button variant="contained" onClick={() => goTo('edit', create('New Wallboard'))}>New Wallboard</Button>
      </Stack>
      <List disablePadding>
        {boards.map(b => (
          <ListItem
            key={b.id}
            secondaryAction={
              <Stack direction="row" gap={1}>
                <IconButton size="small" onClick={() => duplicate(b.id)} title="Duplicate">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => remove(b.id)} title="Delete">
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Button size="small" variant="outlined" onClick={() => goTo('edit', b.id)}>Edit</Button>
                <Button size="small" variant="contained" onClick={() => goTo('present', b.id)}>Present</Button>
              </Stack>
            }
            sx={{ px: 0, py: 1 }}
          >
            <Box className="card" sx={{ p: 1.5, borderRadius: 2, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={800}>{b.name}</Typography>
              <Typography variant="caption" color="text.secondary">Scope: Campaign {b.scope.campaignId} {b.scope.teamIds?.length ? `— Teams: ${b.scope.teamIds.join(', ')}` : ''}</Typography>
            </Box>
          </ListItem>
        ))}
        {!boards.length && <Typography color="text.secondary">No wallboards yet.</Typography>}
      </List>
    </Box>
  );
}