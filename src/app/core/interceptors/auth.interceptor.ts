import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.url.includes('/assets/')) {
    return next(req);
  }

  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => req.url.includes(path));

  return from(authService.getToken()).pipe(
    switchMap((token) => {
      const clonedReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

      return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 401 || isAuthEndpoint) {
            return throwError(() => error);
          }

          return authService.refreshAccessToken().pipe(
            switchMap((newToken) =>
              next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))
            )
          );
        })
      );
    })
  );
};
