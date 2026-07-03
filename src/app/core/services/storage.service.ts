import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly AUTH_TOKEN = 'auth_token';
  readonly REFRESH_TOKEN = 'refresh_token';

  private cache: Record<string, string | null> = {};

  async set(key: string, value: string): Promise<void> {
    this.cache[key] = value;
    await Preferences.set({ key, value });
  }

  async get(key: string): Promise<string | null> {
    if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
      return this.cache[key];
    }
    const { value } = await Preferences.get({ key });
    this.cache[key] = value;
    return value;
  }

  async remove(key: string): Promise<void> {
    delete this.cache[key];
    await Preferences.remove({ key });
  }

  async clearAfterLogout(): Promise<void> {
    await this.remove(this.AUTH_TOKEN);
    await this.remove(this.REFRESH_TOKEN);
  }
}
