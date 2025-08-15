// src/components/NotificationsPopover.tsx
import React from 'react';
import { Popover, Box, Stack, Typography, Button, List, ListItem } from '@mui/material';

type Item = {
  id?: string;
  from: string;
  fromRole?: string;
  fromId?: string;
  timestamp: string;
  message: string;
  isUnread?: boolean;
};

export default function NotificationsPopover({
  anchorEl,
  open,
  onClose,
  items,
  onMarkAllRead,
  onItemReply
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  items: Item[];
  onMarkAllRead: () => void;
  onItemReply?: (item: Item) => void;
}) {
  const sorted = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: 320,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          p: 1.5,
          backgroundImage: 'none'
        }
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={800}>Notifications</Typography>
        <Button size="small" variant="text" onClick={onMarkAllRead}>Mark all read</Button>
      </Stack>

      <Box className="nice-scroll" sx={{ maxHeight: 280, overflowY: 'auto', pr: 1 }}>
        {sorted.length === 0 && <Typography color="text.secondary">No notifications</Typography>}
        <List disablePadding>
          {sorted.map((m, i) => (
            <ListItem
              key={m.id || i}
              disableGutters
              onClick={() => onItemReply?.(m)}
              sx={{
                px: 1,
                py: 1,
                mb: .75,
                borderRadius: 2,
                cursor: 'pointer',
                border: m.isUnread ? '1px solid rgba(10,132,255,0.35)' : '1px solid transparent',
                backgroundColor: m.isUnread ? 'rgba(10,132,255,0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: m.isUnread ? 'rgba(10,132,255,0.20)' : 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(m.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {m.from} {m.fromRole ? <span style={{ color: 'var(--light-text-secondary)' }}>({m.fromRole})</span> : null}
                </Typography>
                <Typography variant="body2">{m.message}</Typography>
                <Box sx={{ textAlign: 'right', mt: .5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemReply?.(m);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Reply
                  </Button>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Popover>
  );
}