import { Routes } from '@angular/router';
import { Analytics } from './features/analytics/analytics';
import { Feed } from './features/feed/feed';
import { Home } from './features/home/home';

export const routes: Routes = [
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'feed',
    component: Feed,
  },
  {
    path: 'analytics',
    component: Analytics,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
