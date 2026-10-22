import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { normalizeSearch, toPerson } from './mappers';
import { PersonRowVm } from '../models/view-models';
import { followUser$Json } from '../api/generated/fn/followers/follow-user-json';
import { unfollowUser } from '../api/generated/fn/followers/unfollow-user';
import { getFollowing$Json } from '../api/generated/fn/followers/get-following-json';
import { getOrganisationMembers$Json } from '../api/generated/fn/organisations/get-organisation-members-json';
import { getOrganisation$Json } from '../api/generated/fn/organisations/get-organisation-json';
import { getOrganisationLeaderboard$Json } from '../api/generated/fn/organisations/get-organisation-leaderboard-json';

/**
 * Following state and people lists. Who the current user follows is loaded
 * once into a signal; follow/unfollow update it optimistically so every
 * screen ("Sledovat" buttons, home feed mode, post menu) stays in sync.
 */
@Injectable({ providedIn: 'root' })
export class PeopleService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);

  readonly #followingIds = signal<ReadonlySet<number> | null>(null);
  /** null until loaded. */
  readonly followingIds = this.#followingIds.asReadonly();
  readonly followingCount = computed(() => this.#followingIds()?.size ?? 0);

  private following$: Observable<ReadonlySet<number>> | null = null;

  loadFollowing(force = false): Observable<ReadonlySet<number>> {
    if (!this.following$ || force) {
      this.following$ = this.auth.ensureCurrentUser().pipe(
        switchMap((me) => this.api.allPages(getFollowing$Json, { id: me.id })),
        map((users) => new Set(users.map((u) => u.id)) as ReadonlySet<number>),
        tap((ids) => this.#followingIds.set(ids)),
        catchError((error) => {
          this.following$ = null;
          return throwError(() => error);
        }),
        shareReplay(1),
      );
    }
    return this.following$;
  }

  isFollowing(userId: number): boolean {
    return this.#followingIds()?.has(userId) ?? false;
  }

  follow(userId: number): Observable<void> {
    this.setFollowing(userId, true);
    return this.api.call(followUser$Json, { id: userId }).pipe(
      map(() => undefined),
      catchError((error) => {
        this.setFollowing(userId, false);
        return throwError(() => error);
      }),
    );
  }

  unfollow(userId: number): Observable<void> {
    this.setFollowing(userId, false);
    return this.api.call(unfollowUser, { id: userId }).pipe(
      map(() => undefined),
      catchError((error) => {
        this.setFollowing(userId, true);
        return throwError(() => error);
      }),
    );
  }

  /**
   * "Návrhy ze tvé skupiny": members of the user's group except themselves,
   * optionally filtered by name on the client.
   * MOCK(people search): there's no user search endpoint, so search only
   * covers the own group. Feather counts come from the group leaderboard.
   */
  groupSuggestions(query = ''): Observable<PersonRowVm[]> {
    return forkJoin([this.auth.ensureCurrentUser(), this.loadFollowing()]).pipe(
      switchMap(([me]) => {
        if (me.organisationId == null) return of([] as PersonRowVm[]);
        const orgId = me.organisationId;
        return forkJoin({
          members: this.api.allPages(getOrganisationMembers$Json, { id: orgId }),
          group: this.api.call(getOrganisation$Json, { id: orgId }),
          counts: this.api
            .allPages(getOrganisationLeaderboard$Json, { id: orgId })
            .pipe(map((entries) => new Map(entries.map((e) => [e.userId, e.approvedFeatherCount])))),
        }).pipe(
          map(({ members, group, counts }) =>
            members
              .filter((m) => m.id !== me.id)
              .map((m) => ({
                person: toPerson(m, me.id),
                groupName: group.name,
                featherCount: counts.get(m.id) ?? 0,
                isFollowing: this.isFollowing(m.id),
              })),
          ),
        );
      }),
      map((rows) => {
        const q = normalizeSearch(query);
        const filtered = q
          ? rows.filter(
              (r) => normalizeSearch(r.person.name).includes(q) || normalizeSearch(r.person.nickname ?? '').includes(q),
            )
          : rows;
        return filtered.sort((a, b) => b.featherCount - a.featherCount);
      }),
    );
  }

  private setFollowing(userId: number, following: boolean): void {
    this.#followingIds.update((ids) => {
      const next = new Set(ids ?? []);
      if (following) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }
}
