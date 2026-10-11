import { Routes } from '@angular/router';
import { NavPage } from './nav.page';
import { PlaceholderData } from '../pages/placeholder/placeholder.page';

const placeholder = () => import('../pages/placeholder/placeholder.page').then((m) => m.PlaceholderPage);

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
          // Phase 5 replaces these placeholders with the real screens.
          {
            path: 'category/:light/:section',
            loadComponent: placeholder,
            data: { titleKey: 'placeholder.soon.title', textKey: 'placeholder.soon.text', fallback: '/nav/eagle-feathers' } satisfies PlaceholderData,
          },
          {
            path: 'feather/:id',
            loadComponent: placeholder,
            data: { titleKey: 'placeholder.soon.title', textKey: 'placeholder.soon.text', fallback: '/nav/eagle-feathers' } satisfies PlaceholderData,
          },
          {
            path: 'search',
            loadComponent: placeholder,
            data: { titleKey: 'placeholder.soon.title', textKey: 'placeholder.soon.text', fallback: '/nav/eagle-feathers' } satisfies PlaceholderData,
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
