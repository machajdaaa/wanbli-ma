import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationSettingsVm } from '../models/view-models';
import { environment } from '../../../environments/environment';

const NOTIFICATIONS_KEY = 'settings_notifications';

const DEFAULT_NOTIFICATIONS: NotificationSettingsVm = {
  likes: true,
  followers: true,
  announcements: true,
  dailyChallenge: false,
};

/**
 * App settings kept on the device. MOCK(notification settings): there's no
 * backend for notification preferences (and no push yet), so the toggles
 * only persist locally via Preferences.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private storage = inject(StorageService);

  readonly #notifications = signal<NotificationSettingsVm>(DEFAULT_NOTIFICATIONS);
  readonly notifications = this.#notifications.asReadonly();
  readonly appVersion = environment.appVersion;

  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    const raw = await this.storage.get(NOTIFICATIONS_KEY);
    if (!raw) return;
    try {
      this.#notifications.set({ ...DEFAULT_NOTIFICATIONS, ...(JSON.parse(raw) as Partial<NotificationSettingsVm>) });
    } catch {
      // Corrupt value — keep defaults.
    }
  }

  async setNotification(key: keyof NotificationSettingsVm, value: boolean): Promise<void> {
    this.#notifications.update((current) => ({ ...current, [key]: value }));
    await this.storage.set(NOTIFICATIONS_KEY, JSON.stringify(this.#notifications()));
  }
}
