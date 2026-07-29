import { Routes } from '@angular/router';
import { NavPage } from './nav.page';

export const routes: Routes = [
  {
    path: 'nav',
    component: NavPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('../pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'eagle-feathers',
        loadComponent: () => import('../pages/eagle-feathers/eagle-feathers.page').then((m) => m.EagleFeathersPage),
      },
      {
        path: 'group',
        loadComponent: () => import('../pages/group/group.page').then((m) => m.GroupPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('../pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: '/nav/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/nav/home',
    pathMatch: 'full',
  },
];
