import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { environment } from '../environments/environment';
import { PlaceholderData } from './pages/placeholder/placeholder.page';

const placeholder = () => import('./pages/placeholder/placeholder.page').then((m) => m.PlaceholderPage);
const soon = (fallback: string): PlaceholderData => ({
  titleKey: 'placeholder.soon.title',
  textKey: 'placeholder.soon.text',
  fallback,
});

// Design-system catalog; dev builds only, no auth so it works without the backend.
const devRoutes: Routes = environment.production
  ? []
  : [
      {
        path: 'dev/ui',
        loadComponent: () => import('./dev/ui/dev-ui.page').then((m) => m.DevUiPage),
      },
    ];

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
  // Phase 8 replaces these two with real screens.
  {
    path: 'register',
    loadComponent: placeholder,
    data: soon('/login'),
  },
  {
    path: 'forgot-password',
    loadComponent: placeholder,
    data: {
      titleKey: 'placeholder.forgotPassword.title',
      textKey: 'placeholder.forgotPassword.text',
      fallback: '/login',
    } satisfies PlaceholderData,
  },
  ...devRoutes,

  // Full-screen pages outside the tab shell (no navbar, back button instead).
  {
    path: 'upload',
    canActivate: [authGuard],
    loadComponent: placeholder,
    data: { titleKey: 'placeholder.upload.title', textKey: 'placeholder.upload.text' } satisfies PlaceholderData,
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/people-search/people-search.page').then((m) => m.PeopleSearchPage),
  },
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-profile/user-profile.page').then((m) => m.UserProfilePage),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'profile/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-edit/profile-edit.page').then((m) => m.ProfileEditPage),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./nav/nav.routes').then((m) => m.routes),
  },
];
