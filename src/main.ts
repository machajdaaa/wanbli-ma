import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, NoPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { provideApiConfiguration } from './app/core/api/generated/api-configuration';
import { environment } from './environments/environment';
import { provideI18n } from './app/core/i18n/i18n.config';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ animated: true, mode: 'ios' }),
    provideRouter(routes, withPreloading(NoPreloading)),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideApiConfiguration(environment.apiUrl),
    ...provideI18n(),
  ],
}).catch((err) => console.error(err));
