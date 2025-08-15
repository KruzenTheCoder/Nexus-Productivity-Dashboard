import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Badge,
  Avatar,
  Switch,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAgent } from '../state/useAgent';
import NotificationsPopover from './NotificationsPopover';
import ComposeMessageDialog from './ComposeMessageDialog';

type Props = { mode: 'light' | 'dark'; onToggleMode: () => void };

export default function HeaderClassic({ mode, onToggleMode }: Props) {
  const { agent, markAllRead, messageLeader } = useAgent();
  const [dnd, setDnd] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const openNotifs = Boolean(anchorEl);

  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replyTo, setReplyTo] = React.useState<any | null>(null);

  const unread = (agent.inbox || []).filter((m) => m.isUnread).length;
  const name = agent.name || 'Neo Molefe';

  const initials = (n: string) =>
    n.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();

  const checked = mode === 'dark';

  const sp = new URLSearchParams(window.location.search);
  const showBackToTeam = sp.get('from') === 'teamLeader';
  const showBackToCampaign = sp.get('from') === 'campaign';

  const backToTeam = () => {
    const s = new URLSearchParams(window.location.search);
    s.set('view', 'teamLeader');
    s.delete('from');
    const url = `${window.location.pathname}?${s.toString()}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToCampaign = () => {
    const s = new URLSearchParams(window.location.search);
    s.set('view', 'campaign');
    s.delete('from');
    const url = `${window.location.pathname}?${s.toString()}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box className="card" sx={{ p: 3, mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        {/* Left side */}
        <Typography variant="h4" fontWeight={800} className="gradient-text">
          Agent Dashboard: {name}
        </Typography>

        {/* Right side group */}
        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
          {/* Back to Team Button */}
          {showBackToTeam && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={backToTeam}
              sx={{ borderRadius: 2 }}
            >
              Back to Team
            </Button>
          )}

          {/* Back to Campaign Button */}
          {showBackToCampaign && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={backToCampaign}
              sx={{ borderRadius: 2 }}
            >
              Back to Campaign
            </Button>
          )}

          {/* Agent pill */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 9999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Avatar sx={{ bgcolor: '#0A84FF', width: 28, height: 28, fontWeight: 800 }}>
              {initials(name)}
            </Avatar>
            <Typography variant="body2" fontWeight={700}>
              Agent: {name}
            </Typography>
          </Box>

          {/* Score pill */}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 9999,
              border: '1px solid',
              borderColor: 'divider',
              fontWeight: 800,
            }}
          >
            86
          </Box>

          {/* Notifications */}
          <IconButton
            className="bell-btn"
            color="inherit"
            title="Notifications"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Badge badgeContent={unread} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <NotificationsPopover
            anchorEl={anchorEl}
            open={openNotifs}
            onClose={() => setAnchorEl(null)}
            items={agent.inbox || []}
            onMarkAllRead={() => {
              markAllRead();
            }}
            onItemReply={(item) => {
              setReplyTo(item);
              setAnchorEl(null);
              setReplyOpen(true);
            }}
          />

          <ComposeMessageDialog
            open={replyOpen}
            title={replyTo ? `Reply to ${replyTo.from}` : 'Reply'}
            onClose={() => setReplyOpen(false)}
            onSend={(txt) => {
              messageLeader(txt);
              setReplyOpen(false);
            }}
          />

          {/* Date pill */}
          <Box
            sx={{ px: 1.5, py: 1, borderRadius: 2, fontWeight: 700, fontSize: 14 }}
          >
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Box>

          {/* DND switch */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              DND: {dnd ? 'On' : 'Off'}
            </Typography>
            <Switch checked={dnd} onChange={() => setDnd((v) => !v)} />
          </Box>

          {/* Theme toggle switch */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              Theme: {mode === 'dark' ? 'Dark' : 'Light'}
            </Typography>
            <Switch checked={checked} onChange={onToggleMode} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}