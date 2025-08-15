// src/state/useAuth.ts
import React from 'react';
import { findAgent } from '../state/directory';

type Session = {
  id: string;
  name: string;
  role: 'director' | 'teamLeader' | 'agent';
  campaignId?: string;
  teamId?: string;
};

type Store = {
  session: Session | null;
  isAuthenticated: boolean;
  loginWithUserId: (userId: string) => void;
  loginWithEmail: (email: string, password: string) => void;
  logout: () => void;
};

const KEY = 'nexus-auth-v1';
const AuthCtx = React.createContext<Store | null>(null);

// helpers
function userEmailFor(id: string) {
  // synthetic emails for demo
  return `${id}@nexus.local`;
}

function routeToDefault(session: Session) {
  const sp = new URLSearchParams(window.location.search);
  if (session.role === 'director') {
    sp.set('view', 'campaign');
    sp.set('campaignId', session.campaignId || 'A');
    sp.delete('from'); sp.delete('teamId'); sp.delete('agentId');
  } else if (session.role === 'teamLeader') {
    sp.set('view', 'teamLeader');
    sp.set('teamId', session.teamId || 'Team 1');
    sp.set('campaignId', session.campaignId || 'A');
    sp.delete('from'); sp.delete('agentId');
  } else {
    sp.set('view', 'agent');
    sp.set('agentId', session.id);
    if (session.teamId) sp.set('teamId', session.teamId);
    if (session.campaignId) sp.set('campaignId', session.campaignId);
    sp.delete('from');
  }
  const url = `${window.location.pathname}?${sp.toString()}`;
  window.history.pushState({}, '', url);
  window.dispatchEvent(new Event('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  });

  const save = (s: Session | null) => {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { session: s } }));
  };

  const loginWithUserId = (userId: string) => {
    const a = findAgent(userId);
    if (!a) return;
    const s: Session = {
      id: a.id,
      name: a.name,
      role: a.role === 'director' ? 'director' : a.role === 'teamLeader' ? 'teamLeader' : 'agent',
      campaignId: a.campaignId,
      teamId: a.teamId
    };
    setSession(s); save(s);
    routeToDefault(s);
  };

  const loginWithEmail = (email: string, password: string) => {
    // demo: accept 'demo' as password; derive ID from email local-part
    if (!email || !password) return;
    if (password !== 'demo') return; // basic guard for demo
    const id = email.split('@')[0];
    const a = findAgent(id);
    if (!a) return;
    const s: Session = {
      id: a.id,
      name: a.name,
      role: a.role === 'director' ? 'director' : a.role === 'teamLeader' ? 'teamLeader' : 'agent',
      campaignId: a.campaignId,
      teamId: a.teamId
    };
    setSession(s); save(s);
    routeToDefault(s);
  };

  const logout = () => {
    setSession(null); save(null);
    const sp = new URLSearchParams(window.location.search);
    sp.set('view', 'login');
    sp.delete('from'); sp.delete('teamId'); sp.delete('agentId'); sp.delete('campaignId');
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('popstate'));
  };

  const value: Store = {
    session,
    isAuthenticated: !!session,
    loginWithUserId,
    loginWithEmail,
    logout
  };

  return React.createElement(AuthCtx.Provider, { value }, children);

}

export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}