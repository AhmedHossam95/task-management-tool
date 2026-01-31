import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'feed',
    loadComponent: () => import('./features/feed/feed').then((m) => m.FeedComponent),
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./features/statistics/statistics.component').then((m) => m.StatisticsComponent),
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
