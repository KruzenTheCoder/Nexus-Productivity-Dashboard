import * as React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

type SplashProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
};

export default function SplashScreen({
  open,
  title = 'Nexus Dashboard',
  subtitle = 'Loading…',
}: SplashProps) {
  const theme = useTheme();
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const glow = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.18);

  return (
    <AnimatePresence>
      {open && (
        <Box
          component={motion.div}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1400,
            bgcolor: theme.palette.background.default,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {/* subtle background accents */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `
                radial-gradient(600px 300px at 20% 20%, ${glow}, transparent 60%),
                radial-gradient(600px 300px at 80% 80%, ${glow}, transparent 60%)
              `,
            }}
          />

          {/* card */}
          <Box
            component={motion.div}
            initial={reduce ? {} : { y: 12, opacity: 0, scale: 0.98 }}
            animate={reduce ? {} : { y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? {} : { y: -12, opacity: 0, scale: 1.02 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            sx={{
              p: 3,
              minWidth: 260,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.25)}`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* logo badge */}
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 1.5,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(
                  theme.palette.primary.main,
                  0.06
                )})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Box
                component={motion.div}
                initial={reduce ? {} : { rotate: -10 }}
                animate={reduce ? {} : { rotate: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1.5,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                }}
              />
            </Box>

            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {subtitle}
            </Typography>

            {/* indeterminate progress bar */}
            <Box
              sx={{
                position: 'relative',
                height: 3,
                width: 220,
                mx: 'auto',
                borderRadius: 999,
                overflow: 'hidden',
                bgcolor: alpha(theme.palette.text.secondary, 0.15),
              }}
            >
              <Box
                component={motion.div}
                initial={{ x: '-40%' }}
                animate={reduce ? {} : { x: ['-40%', '110%'] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 1.1, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }
                }
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '40%',
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(
                    theme.palette.primary.main,
                    0.7
                  )})`,
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}