import React from 'react';
import {
  Box, Stack, Typography, Avatar, IconButton, Badge, Switch, Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useCampaign } from '../state/useCampaign';
import NotificationsPopover from './NotificationsPopover';
import { useAuth } from '../state/useAuth';

type Props = { mode: 'light' | 'dark'; onToggleMode: () => void };

function initials(n: string) { return n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(); }

export default function HeaderDirector({ mode, onToggleMode }: Props) {
  const { campaign, markAllReadDirector } = useCampaign();
  const { logout } = useAuth(); // add this line
  const [dnd, setDnd] = React.useState(false);
  const unread = (campaign.director.inbox || []).filter(m => m.isUnread).length;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const openNotifs = Boolean(anchorEl);

  return (
    <Box className="card" sx={{ p: 3, mb: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" gap={2}>
        <Typography variant="h4" fontWeight={800} className="gradient-text">
          Campaign {campaign.campaignId} Overview
        </Typography>

        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
          {/* Director pill */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 9999,
            border: '1px solid',
            borderColor: 'divider',
            fontWeight: 700,
            bgcolor: 'background.paper',
          }}>
            <Avatar sx={{ bgcolor: '#0A84FF', width: 28, height: 28, fontWeight: 800 }}>
              {initials(campaign.director.name)}
            </Avatar>
            Director: {campaign.director.name} (Campaign {campaign.campaignId})
          </Box>

          {/* Notifications button */}
          <IconButton className="bell-btn" color="inherit" title="Notifications" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Badge badgeContent={unread} color="error"><NotificationsIcon /></Badge>
          </IconButton>

          {/* Date pill */}
          <Box className="card" sx={{ px: 1.5, py: 1, borderRadius: 2, fontWeight: 700, fontSize: 14 }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Box>

          {/* DND switch */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Typography variant="body2" fontWeight={700}>DND: {dnd ? 'On' : 'Off'}</Typography>
            <Switch size="small" checked={dnd} onChange={() => setDnd(v => !v)} />
          </Box>

          {/* iOS theme toggle */}
          <Box
            className={`toggle-switch ${mode === 'dark' ? 'toggled' : ''}`}
            role="switch"
            aria-checked={mode === 'dark'}
            onClick={onToggleMode}
            title="Toggle theme"
          >
            <div className="toggle-switch-handle" />
          </Box>

          {/* Logout button */}
          <Button size="small" variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Stack>

      <NotificationsPopover
        anchorEl={anchorEl}
        open={openNotifs}
        onClose={() => setAnchorEl(null)}
        items={campaign.director.inbox || []}
        onMarkAllRead={markAllReadDirector}
      />
    </Box>
  );
}