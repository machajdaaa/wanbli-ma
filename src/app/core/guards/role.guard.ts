import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../api/enums';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const navCtrl = inject(NavController);

  if (!(await authService.isAuthenticated())) {
    await navCtrl.navigateRoot('/login');
    return false;
  }

  const requiredRoles: UserRole[] = route.data?.['roles'] ?? [];
  if (requiredRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  await navCtrl.navigateRoot('/tabs/tab1');
  return false;
};
