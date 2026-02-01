import { Route } from '../models/sidenav.model';

export const SIDENAV_ROUTES: Route[] = [
  {
    name: 'home',
    icon: 'view_kanban',
  },

  {
    name: 'statistics',
    icon: 'bar_chart',
  },
] as const;
