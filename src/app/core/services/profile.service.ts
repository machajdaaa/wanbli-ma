import { Injectable, inject } from '@angular/core';
import { Observable, catchError, combineLatest, from, map, of, switchMap, tap } from 'rxjs';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { EagleFeatherService } from './eagle-feather.service';
import { PeopleService } from './people.service';
import { StorageService } from './storage.service';
import { toPerson } from './mappers';
import { ProfileVm } from '../models/view-models';
import { UpdateUserRequest, UserMeResponse } from '../api/generated/models';
import { getUser$Json } from '../api/generated/fn/users/get-user-json';
import { getUserStats$Json } from '../api/generated/fn/users/get-user-stats-json';
import { getOrganisation$Json } from '../api/generated/fn/organisations/get-organisation-json';
import { updateCurrentUser$Json } from '../api/generated/fn/users/update-current-user-json';

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
          stats: this.api.call(getUserStats$Json, { id: me.id }),
          collection: this.feathers.myCollection(),
          bio: from(this.storage.get(BIO_KEY)),
        }),
      ),
      map(({ me, group, stats, collection, bio }) => ({
        person: toPerson(me, me.id),
        firstName: me.firstName,
        lastName: me.lastName,
        group,
        bio: bio || null,
        stats: { feathers: stats.approvedFeatherCount, followers: stats.followerCount, following: stats.followingCount },
        collection,
        isFollowing: false,
        locked: false,
      })),
    );
  }

  /**
   * Someone else's profile. A private profile the user doesn't follow is
   * `locked`: the API then leaves out the counts, and collection and posts
   * aren't loaded. The API has no group or bio for other users yet — both
   * are hidden rather than invented (redesign-plan R5).
   */
  userProfile(userId: number): Observable<ProfileVm> {
    return combineLatest({
      me: this.auth.ensureCurrentUser(),
      user: this.api.call(getUser$Json, { id: userId }),
      following: this.people.loadFollowing(),
    }).pipe(
      switchMap(({ me, user, following }) => {
        const isFollowing = user.isFollowing ?? following.has(userId);
        const locked = !!user.isPrivate && !isFollowing;
        const collection = locked
          ? of([])
          : this.feathers.userCollection(userId).pipe(catchError(() => of([])));
        return collection.pipe(
          map(
            (collection): ProfileVm => ({
              person: toPerson({ ...user, id: userId }, me.id),
              firstName: user.firstName ?? '',
              lastName: user.lastName ?? '',
              group: null,
              bio: null,
              stats: {
                feathers: user.approvedFeatherCount ?? null,
                followers: user.followerCount ?? null,
                following: user.followingCount ?? null,
              },
              collection,
              isFollowing,
              locked,
            }),
          ),
        );
      }),
    );
  }

  /** Private profile: only followers see the collection and posts. */
  setPrivate(isPrivate: boolean): Observable<void> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) => this.api.call(updateCurrentUser$Json, { body: { ...this.updateBody(me), isPrivate } })),
      map((user) => this.auth.setUser(user)),
    );
  }

  /**
   * Saves name and nickname via update-current-user. UpdateUserRequest also
   * requires birthDate, gender and profilePicture — the current values are
   * sent back unchanged (see updateBody). Bio is stored locally (MOCK(bio)).
   */
  updateMyProfile(update: ProfileUpdate): Observable<void> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        this.api.call(updateCurrentUser$Json, {
          body: {
            ...this.updateBody(me),
            firstName: update.firstName.trim(),
            lastName: update.lastName.trim(),
            nickname: update.nickname.trim(),
          },
        }),
      ),
      tap((user) => this.auth.setUser(user)),
      switchMap(() => from(this.storage.set(BIO_KEY, update.bio.trim()))),
    );
  }

  /** The current values — PUT /api/user replaces the whole profile. */
  private updateBody(me: UserMeResponse): UpdateUserRequest {
    return {
      firstName: me.firstName,
      lastName: me.lastName,
      nickname: me.nickname,
      birthDate: me.birthDate,
      gender: me.gender,
      profilePicture: me.profilePicture,
      isPrivate: me.isPrivate,
    };
  }

  private groupOf(me: UserMeResponse): Observable<{ id: number; name: string } | null> {
    if (me.organisationId == null) return of(null);
    return this.api.call(getOrganisation$Json, { id: me.organisationId }).pipe(
      map((o) => ({ id: o.id, name: o.name })),
      catchError(() => of(null)),
    );
  }
}
