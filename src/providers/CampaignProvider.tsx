// src/providers/CampaignProvider.tsx
import React from 'react';
import { CampaignProvider as CampaignProviderState } from '../state/useCampaign';

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  return <CampaignProviderState>{children}</CampaignProviderState>;
}

export default CampaignProvider;