import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { adminGuard } from '@core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('@features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('@features/search/search-page/search-page.component').then(m => m.SearchPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'series/:id',
    loadComponent: () => import('@features/series/series-detail/series-detail.component').then(m => m.SeriesDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'watchlist',
    loadComponent: () => import('@features/watchlist/watchlist-page/watchlist-page.component').then(m => m.WatchlistPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'player',
    loadComponent: () => import('@features/player/player-page/player-page.component').then(m => m.PlayerPageComponent),
    canActivate: [authGuard]
  },
  { path: 'admin', redirectTo: 'admin/sources', pathMatch: 'full' },
  {
    path: 'admin/sources',
    loadComponent: () => import('@features/admin/sources/admin-sources.component').then(m => m.AdminSourcesComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('@features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: 'search' }
];
