// src/lib/nav.ts
export function goTo(view: 'campaign' | 'teamLeader' | 'agent', params: Record<string,string> = {}, from?: 'campaign' | 'teamLeader') {
  const sp = new URLSearchParams(window.location.search);
  sp.set('view', view);
  if (from) sp.set('from', from); else sp.delete('from');
  Object.entries(params).forEach(([k,v]) => v ? sp.set(k, v) : sp.delete(k));
  const url = `${window.location.pathname}?${sp.toString()}`;
  window.history.pushState({}, '', url);
  window.dispatchEvent(new Event('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
export function getViewParams() {
  const sp = new URLSearchParams(window.location.search);
  return {
    view: (sp.get('view') || 'agent') as 'campaign' | 'teamLeader' | 'agent',
    from: sp.get('from') || undefined,
    campaignId: sp.get('campaignId') || 'A',
    teamId: sp.get('teamId') || 'Team 1',
    agentId: sp.get('agentId') || undefined
  };
}