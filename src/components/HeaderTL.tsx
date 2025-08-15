import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Switch,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTeam } from '../state/useTeam';
import NotificationsPopover from './NotificationsPopover';
import ComposeMessageDialog from './ComposeMessageDialog';
import { useAuth } from '../state/useAuth';

type Props = { mode: 'light' | 'dark'; onToggleMode: () => void };

function initials(n: string) {
  return n.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
}

export default function HeaderTL({ mode, onToggleMode }: Props) {
  const { team, markAllReadLeader, messageAgent } = useTeam();
  const { logout } = useAuth(); // add this line
  const [dnd, setDnd] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const openNotifs = Boolean(anchorEl);

  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replyTo, setReplyTo] = React.useState<any | null>(null);

  const unread = React.useMemo(
    () => (team?.leader?.inbox || []).filter((m) => m.isUnread).length,
    [team?.leader?.inbox]
  );

  const leaderName = team?.leader?.name || 'Thabo Mokwena';
  const checked = mode === 'dark';

  const sp = new URLSearchParams(window.location.search);
  const showBackToCampaign = sp.get('from') === 'campaign';

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
    <Box className="card" sx={{ p: 3, mb: 1 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Typography variant="h4" fontWeight={800} className="gradient-text">
          {team?.teamId ? `Team '${team.teamId}' Dashboard` : 'Team Dashboard'}
        </Typography>

        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
          {/* Back to Campaign button */}
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

          {/* Leader pill */}
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
              {initials(leaderName)}
            </Avatar>
            <Typography variant="body2" fontWeight={700}>
              Team Lead: {leaderName}
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
            items={team?.leader?.inbox || []}
            onMarkAllRead={() => markAllReadLeader?.()}
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
              const targetId =
                replyTo?.fromId || team.agents.find((a) => a.name === replyTo?.from)?.id;
              if (targetId) messageAgent(targetId, txt);
              setReplyOpen(false);
            }}
          />

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
           
           {/* Logout button */}
           <Button size="small" variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}