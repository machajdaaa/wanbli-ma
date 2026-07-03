import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const navCtrl = inject(NavController);

  if (await authService.isAuthenticated()) {
    return true;
  }

  await navCtrl.navigateRoot('/login');
  return false;
};
