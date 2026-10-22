import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

// Translations live in public/assets/i18n/<lang>.json, served from /assets/i18n/.
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}
