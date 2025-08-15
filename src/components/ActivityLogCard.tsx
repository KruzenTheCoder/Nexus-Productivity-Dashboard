import React from 'react';
import { Box, Typography, Stack, Button, List, ListItem } from '@mui/material';
import { useAgent, hhmmss } from '../state/useAgent';

type MergedItem = {
  timestamp: string;
  message: string;
  isUnread?: boolean;
  duration?: number;
};

export default function ActivityLogCard() {
  const { agent, markAllRead } = useAgent();

  const items = React.useMemo<MergedItem[]>(() => {
    const msgs = agent.inbox.map(m => ({
      timestamp: m.timestamp,
      message: `Message from ${m.from}${m.fromRole ? ` (${m.fromRole})` : ''}: "${m.message}"`,
      isUnread: m.isUnread
    }));
    const logs = agent.activityLog.map(l => ({
      timestamp: l.timestamp,
      message: l.message,
      duration: l.duration
    }));
    return [...msgs, ...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [agent.inbox, agent.activityLog]);

  return (
    <Box className="card" sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="h6" fontWeight={800}>Activity Log</Typography>
        <Button size="small" onClick={markAllRead} variant="text">Mark all read</Button>
      </Stack>

        <Box
            className="nice-scroll"
            sx={{
                maxHeight: 320,
                overflowY: 'auto',
                pr: 1,               // space so text doesn't sit under the thumb
                scrollbarGutter: 'stable'
            }}
        >

        <List disablePadding>
          {items.length === 0 && (
            <Typography color="text.secondary" sx={{ p: 1 }}>No activity yet.</Typography>
          )}
          {items.map((it, idx) => {
            const t = new Date(it.timestamp).toLocaleTimeString();
            const unread = !!it.isUnread;
            return (
              <ListItem
                key={`${it.timestamp}-${idx}`}
                disableGutters
                sx={{
                  px: 1.25, py: 1,
                  mb: 1,
                  borderRadius: 2,
                  border: unread ? '1px solid rgba(10,132,255,0.35)' : '1px solid transparent',
                  backgroundColor: unread ? 'rgba(10,132,255,0.15)' : 'transparent',
                  '&:hover': { backgroundColor: unread ? 'rgba(10,132,255,0.20)' : 'rgba(255,255,255,0.05)' },
                  display: 'flex', alignItems: 'center', gap: 12
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72 }}>
                  {t}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>{it.message}</Typography>
                {typeof it.duration === 'number' && (
                  <Typography variant="caption" color="text.secondary" className="mono">
                    Duration: {hhmmss(it.duration)}
                  </Typography>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}