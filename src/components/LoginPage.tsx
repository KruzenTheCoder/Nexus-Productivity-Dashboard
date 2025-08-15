import React from 'react';
import {
  Box, Stack, Typography, TextField, Button, Divider, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../state/useAuth';
import { ensureDirectorySeed } from '../state/directory';

ensureDirectorySeed();

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#1c1c1e',
  padding: theme.spacing(2),
}));

const StyledCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  backdropFilter: 'blur(20px)',
  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(14, 165, 233, 0.2))',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(4),
  padding: theme.spacing(6), // Increased padding for more space
  width: 500, // Slightly bigger width
  maxWidth: '95vw',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  animation: 'fadeIn 0.8s ease-out',
}));

// Global styles for the login page
const GlobalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .blue-gradient-text {
    background: linear-gradient(90deg, #4f46e5, #0ea5e9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 1.5px;
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #0ea5e9 !important;
  }
  .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: #4f46e5 !important;
  }
  .MuiFormLabel-root.Mui-focused, .MuiFormLabel-root.MuiInputLabel-shrink {
    color: #0ea5e9 !important;
  }
  body {
    background-color: #1c1c1e;
    color: #e0e0e0;
  }
  
  /* TextField specific styling for a cleaner look */
  .MuiOutlinedInput-root {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.6);
  }
`;

export default function LoginPage() {
  const { loginWithEmail, loginWithUserId } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email.trim(), password.trim());
  };

  return (
    <>
      <style>{GlobalStyles}</style>
      <PageContainer>
        <StyledCard>
          <Typography variant="h4" fontWeight={900} className="blue-gradient-text" sx={{ mb: 1 }}>
            Nexus Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to continue
          </Typography>

          <form onSubmit={onSubmit}>
            <Stack spacing={3}> {/* Increased spacing */}
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

          <Divider sx={{ my: 4 }}> {/* Increased vertical margin */}
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
              sx={{ color: 'text.primary', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              Director: Nomusa
            </Button>
            <Button size="small" variant="outlined" onClick={() => loginWithUserId('agent-006')}
              sx={{ color: 'text.primary', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              TL: Thabo (Team 1)
            </Button>
            <Button size="small" variant="outlined" onClick={() => loginWithUserId('agent-001')}
              sx={{ color: 'text.primary', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              Agent: Lerato
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}> {/* Increased top margin */}
            Tip: any-id@nexus.local with password “demo” works. Example: agent-001@nexus.local
          </Typography>
        </StyledCard>
      </PageContainer>
    </>
  );
}