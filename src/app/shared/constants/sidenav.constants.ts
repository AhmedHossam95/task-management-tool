import { Route } from '../models/sidenav.model';

export const SIDENAV_ROUTES: Route[] = [
  {
    name: 'home',
    icon: 'view_kanban',
  },
  {
    name: 'feed',
    icon: 'track_changes',
  },
  {
    name: 'statistics',
    icon: 'bar_chart',
  },
] as const;
