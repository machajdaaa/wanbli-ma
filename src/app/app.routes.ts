import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { environment } from '../environments/environment';

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
  ...devRoutes,
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./nav/nav.routes').then((m) => m.routes),
  },
];
