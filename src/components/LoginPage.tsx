import React from 'react';
import {
  Box, Stack, Typography, TextField, Button, Divider, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import { useAuth } from '../state/useAuth';
import { ensureDirectorySeed } from '../state/directory';

ensureDirectorySeed();

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  // Use theme.palette for dynamic colors
  backgroundColor: theme.palette.background.default, 
  padding: theme.spacing(2),
}));

const StyledCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  backdropFilter: 'blur(20px)',
  // Use a dynamic background based on the theme
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(14, 165, 233, 0.2))'
    : 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(14, 165, 233, 0.05))',
  // Use dynamic borders and box-shadow
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(4),
  padding: theme.spacing(6),
  width: 500,
  maxWidth: '95vw',
  textAlign: 'center',
  boxShadow: `0 8px 32px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.1)'}`,
  animation: 'fadeIn 0.8s ease-out',
}));

// Now all your styling is inside a single component
export default function LoginPage() {
  const { loginWithEmail, loginWithUserId } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const theme = useTheme(); // Access the current theme

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email.trim(), password.trim());
  };

  return (
    <PageContainer>
      <StyledCard>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 1,
            // Use the theme to apply the gradient in a dynamic way
            background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1.5px',
         }}>
          Nexus Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Sign in to continue
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack spacing={3}>
            <TextField
              size="medium"
              label="Email"
              placeholder="agent-001@nexus.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              size="medium"
              label="Password"
              placeholder="demo"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)',
                color: '#fff',
                fontWeight: 700,
                py: 1.5,
                '&:hover': { background: 'linear-gradient(90deg, #0ea5e9, #4f46e5)' }
              }}
            >Sign in</Button>
          </Stack>
        </form>

        <Divider sx={{ my: 4 }}>
          <Chip label="or quick demo" size="small"
            sx={{
              color: 'text.primary',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              bgcolor: 'rgba(255, 255, 255, 0.05)'
            }}
            variant="outlined"
          />
        </Divider>

        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
          <Button size="small" variant="outlined" onClick={() => loginWithUserId('agent-016')}
            sx={{ color: 'text.primary', borderColor: theme.palette.divider }}
          >
            Director: Nomusa
          </Button>
          <Button size="small" variant="outlined" onClick={() => loginWithUserId('agent-006')}
            sx={{ color: 'text.primary', borderColor: theme.palette.divider }}
          >
            TL: Thabo (Team 1)
          </Button>
          <Button size="small" variant="outlined" onClick={() => loginWithUserId('agent-001')}
            sx={{ color: 'text.primary', borderColor: theme.palette.divider }}
          >
            Agent: Lerato
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
          Tip: any-id@nexus.local with password “demo” works. Example: agent-001@nexus.local
        </Typography>
      </StyledCard>
    </PageContainer>
  );
}