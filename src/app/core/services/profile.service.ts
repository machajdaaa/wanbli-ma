import { Injectable, inject } from '@angular/core';
import { Observable, catchError, combineLatest, from, map, of, switchMap, tap } from 'rxjs';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { EagleFeatherService } from './eagle-feather.service';
import { PeopleService } from './people.service';
import { StorageService } from './storage.service';
import { toPerson } from './mappers';
import { LIGHTS } from '../models/light';
import { ProfileVm } from '../models/view-models';
import { UserMeResponse } from '../api/generated/models';
import { getUser$Json } from '../api/generated/fn/users/get-user-json';
import { getOrganisation$Json } from '../api/generated/fn/organisations/get-organisation-json';
import { updateCurrentUser$Json } from '../api/generated/fn/users/update-current-user-json';
import { mockBio, mockCollection, mockFeatherCount } from '../mocks/people.mock';

// MOCK(bio): the API has no bio field; the own bio is kept on the device.
const BIO_KEY = 'profile_bio';

export interface ProfileUpdate {
  firstName: string;
  lastName: string;
  nickname: string;
  bio: string;
}

/** My profile and other users' profiles. */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);
  private feathers = inject(EagleFeatherService);
  private people = inject(PeopleService);
  private storage = inject(StorageService);

  myProfile(): Observable<ProfileVm> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        combineLatest({
          me: of(me),
          group: this.groupOf(me),
          counts: this.people.followCounts(me.id),
          collection: this.feathers.myCollection(),
          featherCount: this.feathers.myFeatherCount(),
          bio: from(this.storage.get(BIO_KEY)),
        }),
      ),
      map(({ me, group, counts, collection, featherCount, bio }) => ({
        person: toPerson(me, me.id),
        firstName: me.firstName,
        lastName: me.lastName,
        group,
        bio: bio || null,
        stats: { feathers: featherCount, ...counts },
        collection,
        isFollowing: false,
      })),
    );
  }

  /**
   * Someone else's profile. Name, photo and follow counts are real; the API
   * doesn't expose their group, bio, feather count or collection yet —
   * MOCK(public profile): bio and progress are sample values, group is hidden.
   */
  userProfile(userId: number): Observable<ProfileVm> {
    return combineLatest({
      me: this.auth.ensureCurrentUser(),
      user: this.api.call(getUser$Json, { id: userId }),
      counts: this.people.followCounts(userId),
      totals: this.feathers.totalsByLight(),
      following: this.people.loadFollowing(),
    }).pipe(
      map(({ me, user, counts, totals, following }) => {
        const done = mockCollection(user.id, totals);
        return {
          person: toPerson(user, me.id),
          firstName: user.firstName,
          lastName: user.lastName,
          group: null,
          bio: mockBio(user.id),
          stats: { feathers: mockFeatherCount(user.id), ...counts },
          collection: LIGHTS.map((light) => ({ light, done: done[light], total: totals[light] })),
          isFollowing: following.has(user.id),
        };
      }),
    );
  }

  /**
   * Saves name and nickname via update-current-user. UpdateUserRequest also
   * requires birthDate, gender and profilePicture — the current values are
   * sent back unchanged. Bio is stored locally (MOCK(bio)).
   */
  updateMyProfile(update: ProfileUpdate): Observable<void> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        this.api.call(updateCurrentUser$Json, {
          body: {
            firstName: update.firstName.trim(),
            lastName: update.lastName.trim(),
            nickname: update.nickname.trim(),
            birthDate: me.birthDate,
            gender: me.gender,
            profilePicture: me.profilePicture,
          },
        }),
      ),
      tap((user) => this.auth.setUser(user)),
      switchMap(() => from(this.storage.set(BIO_KEY, update.bio.trim()))),
    );
  }

  private groupOf(me: UserMeResponse): Observable<{ id: number; name: string } | null> {
    if (me.organisationId == null) return of(null);
    return this.api.call(getOrganisation$Json, { id: me.organisationId }).pipe(
      map((o) => ({ id: o.id, name: o.name })),
      catchError(() => of(null)),
    );
  }
}
