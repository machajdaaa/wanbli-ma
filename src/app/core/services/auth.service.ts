import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import {
  from,
  switchMap,
  Observable,
  map,
  firstValueFrom,
  catchError,
  throwError,
  shareReplay,
  finalize,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { UserRole } from '../api/enums';
import { AuthResponse, RegisterRequest, UserMeResponse } from '../api/generated/models';

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private router = inject(Router);

  #currentUser = signal<UserMeResponse | null>(null);
  #refreshInFlight: Observable<string> | null = null;

  readonly currentUser = this.#currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.#currentUser() !== null);
  readonly userRole = computed((): UserRole | null => {
    const role = this.#currentUser()?.role;
    return role != null ? (role as unknown as UserRole) : null;
  });

  login(nickname: string, password: string): Observable<void> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, { nickname, password })
      .pipe(
        switchMap((response) =>
          from(this.storeTokens(response.accessToken, response.refreshToken))
        ),
        switchMap(() => this.fetchAndSetCurrentUser())
      );
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, payload)
      .pipe(
        switchMap((response) =>
          from(this.storeTokens(response.accessToken, response.refreshToken))
        ),
        switchMap(() => this.fetchAndSetCurrentUser())
      );
  }

  refreshAccessToken(): Observable<string> {
    if (this.#refreshInFlight) {
      return this.#refreshInFlight;
    }

    this.#refreshInFlight = from(this.storage.get(this.storage.REFRESH_TOKEN)).pipe(
      switchMap((refreshToken) => {
        if (!refreshToken) {
          return throwError(() => new Error('No refresh token available'));
        }
        return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/refresh`, {
          refreshToken,
        });
      }),
      switchMap((response) =>
        from(this.storeTokens(response.accessToken, response.refreshToken)).pipe(
          map(() => response.accessToken)
        )
      ),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      }),
      finalize(() => {
        this.#refreshInFlight = null;
      }),
      shareReplay(1)
    );

    return this.#refreshInFlight;
  }

  async logout(): Promise<void> {
    const refreshToken = await this.storage.get(this.storage.REFRESH_TOKEN);
    if (refreshToken) {
      this.http
        .post(`${environment.apiUrl}/api/auth/logout`, { refreshToken })
        .subscribe({ error: () => {} });
    }
    await this.storage.clearAfterLogout();
    this.#currentUser.set(null);
    await this.router.navigateByUrl('/login');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.storage.get(this.storage.AUTH_TOKEN);
    return token != null && this.isTokenValid(token);
  }

  // Unlike isAuthenticated(), falls back to the refresh token so an expired access token doesn't force a re-login on reload.
  async ensureAuthenticated(): Promise<boolean> {
    const token = await this.storage.get(this.storage.AUTH_TOKEN);
    if (token != null && this.isTokenValid(token)) {
      return true;
    }

    const refreshToken = await this.storage.get(this.storage.REFRESH_TOKEN);
    if (!refreshToken) return false;

    try {
      await firstValueFrom(this.refreshAccessToken());
      return true;
    } catch {
      return false;
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    return this.storage.get(this.storage.AUTH_TOKEN);
  }

  setUser(user: UserMeResponse): void {
    this.#currentUser.set(user);
  }

  async loadUserFromToken(): Promise<void> {
    if (!(await this.ensureAuthenticated())) return;
    try {
      await firstValueFrom(this.fetchAndSetCurrentUser());
    } catch {
      // network error — stay not populated but token remains valid
    }
  }

  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const current = this.userRole();
    return current != null && roles.includes(current);
  }

  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.storage.set(this.storage.AUTH_TOKEN, accessToken);
    await this.storage.set(this.storage.REFRESH_TOKEN, refreshToken);
  }

  private fetchAndSetCurrentUser(): Observable<void> {
    return this.http.get<UserMeResponse>(`${environment.apiUrl}/api/user/me`).pipe(
      map((user) => {
        this.#currentUser.set(user);
      })
    );
  }
}
