import { EnvironmentProviders, importProvidersFrom, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import cs from '../../public/assets/i18n/cs.json';

/**
 * Providers every component smoke test needs: HttpClient (services inject it;
 * no request is actually sent), a router, and Transloco with the real cs.json
 * so templates render real texts.
 */
export function provideTestDefaults(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
    importProvidersFrom(
      TranslocoTestingModule.forRoot({
        langs: { cs },
        translocoConfig: { availableLangs: ['cs'], defaultLang: 'cs' },
        preloadLangs: true,
      }),
    ),
  ];
}
