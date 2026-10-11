import { inject, isDevMode, provideAppInitializer, LOCALE_ID, Provider, EnvironmentProviders } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { TranslocoHttpLoader } from './transloco-loader';

export const AVAILABLE_LANGS = ['cs'] as const;
export const DEFAULT_LANG = 'cs';

/** BCP 47 locale used by Intl/Angular formatting for each UI language. */
export const LANG_LOCALES: Record<string, string> = {
  cs: 'cs-CZ',
};

export function localeForLang(lang: string): string {
  return LANG_LOCALES[lang] ?? LANG_LOCALES[DEFAULT_LANG];
}

registerLocaleData(localeCs);

export function provideI18n(): (Provider | EnvironmentProviders)[] {
  return [
    { provide: LOCALE_ID, useValue: DEFAULT_LANG },
    provideTransloco({
      config: {
        availableLangs: [...AVAILABLE_LANGS],
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { logMissingKey: isDevMode() },
      },
      loader: TranslocoHttpLoader,
    }),
    // Load translations before the first render, so pipes and services can
    // translate synchronously and there's no flash of raw keys.
    provideAppInitializer(() => firstValueFrom(inject(TranslocoService).load(DEFAULT_LANG))),
  ];
}
