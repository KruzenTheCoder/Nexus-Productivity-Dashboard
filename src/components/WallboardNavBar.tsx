import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

type Props = {
  mode: 'list' | 'edit' | 'present';
  wbId?: string;
};

export default function WallboardNavBar({ mode }: Props) {
  const goToList = () => {
    const sp = new URLSearchParams(window.location.search);
    sp.set('view', 'wallboard');
    sp.set('mode', 'list');
    sp.delete('wbId');
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        mb: 1,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        backgroundImage: 'none',
        bgcolor: 'background.paper'
      }}
    >
      <Toolbar sx={{ px: 2 }}>
        <Typography variant="h6" fontWeight={900} sx={{ flexGrow: 1 }}>
          Nexus Dashboard
        </Typography>

        {(mode === 'edit' || mode === 'present') && (
          <Button variant="outlined" onClick={goToList}>
            Back to List
          </Button>
        )}
        {/* list mode intentionally has no actions */}
      </Toolbar>
    </AppBar>
  );
}