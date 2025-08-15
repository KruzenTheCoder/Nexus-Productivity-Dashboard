import type { StatusLabel } from '../types';

export const STATUSES: StatusLabel[] = [
  'Ready','On Call','Post-Call Work','Break','Lunch','Training','Offline','Away'
];

export function muiColorForStatus(s: StatusLabel):
  'success' | 'info' | 'warning' | 'error' | 'secondary' | 'default' {
  switch (s) {
    case 'Ready': return 'success';
    case 'On Call': return 'info';
    case 'Post-Call Work': return 'warning';
    case 'Break': return 'warning';
    case 'Lunch': return 'error';
    case 'Training': return 'secondary';
    case 'Offline': return 'default';
    case 'Away': return 'default';
  }
}