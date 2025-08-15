import { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, useMediaQuery } from '@mui/material';
import { getTheme } from './theme';
import './ui/tokens.css';
import { AnimatePresence, motion } from 'framer-motion';

import HeaderDirector from './components/HeaderDirector';
import HeaderTL from './components/HeaderTL';
import HeaderClassic from './components/HeaderClassic';
import FiltersBar from './components/FiltersBar';
import CampaignDashboard from './components/CampaignDashboard';
import TeamLeaderDashboard from './components/TeamLeaderDashboard';
import AgentDashboard from './components/AgentDashboard';
import CurrentStatusPanel from './components/CurrentStatusPanel';
import LoginPage from './components/LoginPage';

import { CampaignProvider } from './state/useCampaign';
import { TeamProvider } from './state/useTeam';
import { AgentProvider } from './state/useAgent';
import { AuthProvider, useAuth } from './state/useAuth';

import { WallboardsProvider } from './state/useWallboards';
import WallboardNavBar from './components/WallboardNavBar';
import WallboardList from './components/WallboardList';
import WallboardBuilder from './components/WallboardBuilder';
import WallboardViewer from './components/WallboardViewer';
import SplashScreen from './components/SplashScreen';

const MODE_KEY = 'mui-mode';
type View = 'login' | 'campaign' | 'teamLeader' | 'agent' | 'wallboard';

function readRoute() {
  const sp = new URLSearchParams(window.location.search);
  const view = (sp.get('view') as View) || 'agent';
  return { view };
}

function AppInner({ mode, onToggleMode }: { mode: 'light' | 'dark'; onToggleMode: () => void }) {
  const [route, setRoute] = useState(readRoute());
  const { isAuthenticated } = useAuth();
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Boot splash (short, once)
  const [bootSplash, setBootSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBootSplash(false), reduce ? 0 : 450);
    return () => clearTimeout(t);
  }, [reduce]);

  // Login splash (when auth flips false -> true)
  const [loginSplash, setLoginSplash] = useState(false);
  const prevAuth = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevAuth.current === false && isAuthenticated) {
      setLoginSplash(true);
      const t = setTimeout(() => setLoginSplash(false), reduce ? 0 : 950);
      return () => clearTimeout(t);
    }
    if (prevAuth.current === null) prevAuth.current = isAuthenticated;
    else prevAuth.current = isAuthenticated;
  }, [isAuthenticated, reduce]);

  // Keep route in sync with URL
  useEffect(() => {
    const onPop = () => setRoute(readRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Redirect unauthenticated users to login (but still allow explicit login route)
  useEffect(() => {
    if (!isAuthenticated && route.view !== 'login') {
      const sp = new URLSearchParams(window.location.search);
      sp.set('view', 'login');
      const url = `${window.location.pathname}?${sp.toString()}`;
      window.history.pushState({}, '', url);
      setRoute({ view: 'login' });
    }
  }, [isAuthenticated, route.view]);

  // Exactly like before: if route=login, render the login page immediately
  if (route.view === 'login') {
    return (
      <>
        <AnimatePresence mode="wait">
          <Box
            key="login"
            component={motion.div}
            initial={reduce ? {} : { opacity: 0, y: 8 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            exit={reduce ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <LoginPage />
          </Box>
        </AnimatePresence>
        <SplashScreen open={bootSplash} title="Nexus Dashboard" subtitle="Loading…" />
      </>
    );
  }

  // Build current page content (no skeletons)
  let content: JSX.Element = <></>;

  if (isAuthenticated) {
    if (route.view === 'wallboard') {
      const sp = new URLSearchParams(window.location.search);
      const modeParam = (sp.get('mode') || 'list') as 'list' | 'edit' | 'present';
      const wbId = sp.get('wbId') || '';
      content = (
        <WallboardsProvider>
          <>
            <WallboardNavBar mode={modeParam} wbId={wbId} />
            {modeParam === 'list' ? (
              <Box sx={{ mt: 3 }}><WallboardList /></Box>
            ) : modeParam === 'edit' ? (
              <Box sx={{ mt: 3 }}><WallboardBuilder wbId={wbId} /></Box>
            ) : (
              <WallboardViewer wbId={wbId} />
            )}
          </>
        </WallboardsProvider>
      );
    } else if (route.view === 'campaign') {
      content = (
        <CampaignProvider>
          <HeaderDirector mode={mode} onToggleMode={onToggleMode} />
          <FiltersBar />
          <CampaignDashboard />
        </CampaignProvider>
      );
    } else if (route.view === 'teamLeader') {
      content = (
        <TeamProvider>
          <HeaderTL mode={mode} onToggleMode={onToggleMode} />
          <FiltersBar />
          <TeamLeaderDashboard />
        </TeamProvider>
      );
    } else {
      // Agent (default)
      content = (
        <AgentProvider>
          <HeaderClassic mode={mode} onToggleMode={onToggleMode} />
          <FiltersBar />
          <CurrentStatusPanel />
          <Box sx={{ mt: 2 }}>
            <AgentDashboard />
          </Box>
        </AgentProvider>
      );
    }
  }

  return (
    <>
      {/* Page fade-through transition */}
      <AnimatePresence mode="wait">
        <Box
          key={route.view}
          component={motion.div}
          initial={reduce ? {} : { opacity: 0, y: 8 }}
          animate={reduce ? {} : { opacity: 1, y: 0 }}
          exit={reduce ? {} : { opacity: 0, y: -8 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {content}
        </Box>
      </AnimatePresence>

      {/* Splash overlay (boot + post-login) */}
      <SplashScreen
        open={bootSplash || loginSplash}
        title="Nexus Dashboard"
        subtitle={isAuthenticated ? 'Preparing your workspace…' : 'Loading…'}
      />
    </>
  );
}

export default function App() {
  const getInitialMode = (): 'light' | 'dark' => {
    const saved = localStorage.getItem(MODE_KEY) as 'light' | 'dark' | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [mode, setMode] = useState<'light' | 'dark'>(getInitialMode);
  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
    document.documentElement.style.colorScheme = mode;
    document.body.classList.toggle('dark', mode === 'dark');
    document.body.classList.toggle('light', mode !== 'dark');
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          <AuthProvider>
            <AppInner mode={mode} onToggleMode={toggleMode} />
          </AuthProvider>
        </Box>
      </Box>
    </ThemeProvider>
  );
}