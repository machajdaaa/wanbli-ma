import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { NotificationSettingsVm } from '../../core/models/view-models';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { BackButtonComponent } from '../../shared/design-system/back-button/back-button.component';
import { SettingsGroupComponent } from '../../shared/design-system/settings/settings-group.component';
import { SettingsRowComponent } from '../../shared/design-system/settings/settings-row.component';

/**
 * Settings (Nastaveni.dc.html). Personal details lead to the profile edit;
 * notification toggles are stored on the device only; everything the backend
 * doesn't support yet is shown disabled with "Brzy" (redesign-plan R14).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  imports: [IonContent, TranslocoPipe, BackButtonComponent, SettingsGroupComponent, SettingsRowComponent],
})
export class SettingsPage {
  private auth = inject(AuthService);
  protected readonly settings = inject(SettingsService);

  protected readonly notificationKeys: { key: keyof NotificationSettingsVm; label: string }[] = [
    { key: 'likes', label: 'settings.notifyLikes' },
    { key: 'followers', label: 'settings.notifyFollowers' },
    { key: 'announcements', label: 'settings.notifyAnnouncements' },
    { key: 'dailyChallenge', label: 'settings.notifyDailyChallenge' },
  ];
  protected readonly loggingOut = signal(false);

  constructor() {
    this.settings.load();
  }

  protected setNotification(key: keyof NotificationSettingsVm, value: boolean): void {
    this.settings.setNotification(key, value);
  }

  protected async logout(): Promise<void> {
    this.loggingOut.set(true);
    await this.auth.logout();
  }
}
