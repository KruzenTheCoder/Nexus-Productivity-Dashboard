// src/theme.ts
import { createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#0A84FF' },
      info: { main: '#0A84FF' },
      success: { main: '#30D158', contrastText: '#0B0B0B' },
      warning: { main: '#FFD60A', contrastText: '#0B0B0B' },
      error: { main: '#FF453A' },
      divider: mode === 'dark' ? '#48484A' : '#C6C6C8',
      background: {
        default: mode === 'dark' ? '#1C1C1E' : '#F2F2F7',
        paper: mode === 'dark' ? '#2C2C2E' : '#FFFFFF',
      },
      text: {
        primary: mode === 'dark' ? '#FFFFFF' : '#000000',
        secondary: mode === 'dark' ? '#E5E5E7' : '#8E8E93',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Helvetica Neue", sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'dark' ? '#1C1C1E' : '#F2F2F7',
            color: mode === 'dark' ? '#000000' : '#000000', // or rely on theme.text
          },
          canvas: { background: 'transparent !important' },
          svg: { background: 'transparent !important' },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: '1px solid',
            borderColor: mode === 'dark' ? '#48484A' : '#C6C6C8',
            backgroundColor: mode === 'dark' ? '#2C2C2E' : '#FFFFFF',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12, fontWeight: 700, textTransform: 'none' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: mode === 'dark' ? '#2C2C2E' : '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#48484A' : '#C6C6C8',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#6B6B6E' : '#9C9CA0',
            },
          },
          input: { padding: '10px 12px' },
        },
      },
      MuiSelect: { styleOverrides: { select: { borderRadius: 12, padding: '10px 12px' } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 9999, fontWeight: 800 } } },
      MuiSwitch: {
        styleOverrides: {
          root: { width: 48, height: 28, padding: 0 },
          switchBase: { padding: 2, '&.Mui-checked': { transform: 'translateX(20px)' } },
          thumb: { width: 24, height: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.4)' },
          track: { borderRadius: 14, backgroundColor: mode === 'dark' ? '#48484A' : '#C6C6C8', opacity: 1 },
        },
      },
    },
  });

// Important: do NOT export a static `theme` here.