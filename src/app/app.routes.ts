import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'nav',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./nav/nav.routes').then((m) => m.routes),
  },
  {
    path: 'eagle-feathers',
    loadComponent: () => import('./pages/eagle-feathers/eagle-feathers.page').then( m => m.EagleFeathersPage)
  },
  {
    path: 'group',
    loadComponent: () => import('./pages/group/group.page').then( m => m.GroupPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
];
