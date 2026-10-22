import { Routes } from '@angular/router';
import { NavPage } from './nav.page';

// Screens inside a tab are children of that tab's path, so they stay in the
// tab's navigation stack and keep the navbar.
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
        children: [
          {
            path: '',
            loadComponent: () => import('../pages/eagle-feathers/eagle-feathers.page').then((m) => m.EagleFeathersPage),
          },
          {
            path: 'category/:light/:section',
            loadComponent: () => import('../pages/eagle-feathers/category/category.page').then((m) => m.CategoryPage),
          },
          {
            path: 'feather/:id',
            loadComponent: () => import('../pages/eagle-feathers/feather/feather.page').then((m) => m.FeatherPage),
          },
          {
            path: 'search',
            loadComponent: () => import('../pages/eagle-feathers/search/feather-search.page').then((m) => m.FeatherSearchPage),
          },
        ],
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
