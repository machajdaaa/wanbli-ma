import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { toPerson } from './mappers';
import { AnnouncementVm, GroupVm, LeaderboardRowVm, LeaderboardVm, PageVm } from '../models/view-models';
import { getOrganisation$Json } from '../api/generated/fn/organisations/get-organisation-json';
import { getAnnouncements$Json } from '../api/generated/fn/announcements/get-announcements-json';
import { LEADERBOARD_MOCK_COUNTS, LEADERBOARD_MOCK_MY_RANK, LEADERBOARD_MOCK_NAMES } from '../mocks/people.mock';

export const ANNOUNCEMENTS_PAGE_SIZE = 20;

/** The user's group (organisation): header, announcements, leaderboard. */
@Injectable({ providedIn: 'root' })
export class GroupService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);

  /** null when the user isn't a member of any group (redesign-plan R13). */
  myGroup(): Observable<GroupVm | null> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        me.organisationId == null
          ? of(null)
          : this.api.call(getOrganisation$Json, { id: me.organisationId }).pipe(
              map((o) => ({
                id: o.id,
                name: o.name,
                avatarUrl: o.avatarUrl,
                coverUrl: null, // not in the API; the screen shows the design's illustration
                memberCount: o.memberCount,
                description: o.description,
              })),
            ),
      ),
    );
  }

  announcements(groupId: number, page: number): Observable<PageVm<AnnouncementVm>> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        this.api.call(getAnnouncements$Json, { id: groupId, Page: page, PageSize: ANNOUNCEMENTS_PAGE_SIZE }).pipe(
          map((res) => ({
            page: res.page,
            hasNextPage: res.hasNextPage ?? res.page < res.totalPages,
            items: res.items.map(
              (a): AnnouncementVm => ({
                id: a.id,
                // Announcements are created in the admin by leaders only.
                author: { ...toPerson({ ...a.createdBy, profilePicture: null }, me.id), isLeader: true },
                createdAt: a.createdAt,
                title: a.title,
                text: a.content,
                imageUrl: null,
                // Kdy / Kde / Vstupné / Věk aren't in the API — hidden, not invented (R5).
                info: null,
                place: null,
              }),
            ),
          })),
        ),
      ),
    );
  }

  /**
   * MOCK(leaderboard): no endpoint (proposed GET /api/organisations/{id}/leaderboard).
   * Sample names and counts; the current user is placed at a fixed rank with
   * their real name.
   */
  leaderboard(): Observable<LeaderboardVm> {
    return this.auth.ensureCurrentUser().pipe(
      map((me) => {
        const rows: LeaderboardRowVm[] = LEADERBOARD_MOCK_COUNTS.map((featherCount, i) => {
          const rank = i + 1;
          const isMe = rank === LEADERBOARD_MOCK_MY_RANK;
          return {
            rank,
            featherCount,
            person: isMe
              ? toPerson(me, me.id)
              : { id: -rank, name: LEADERBOARD_MOCK_NAMES[i], nickname: null, avatarUrl: null, isMe: false },
          };
        });
        return {
          podium: rows.slice(0, 3),
          rows: rows.slice(3),
          me: rows.find((r) => r.person.isMe) ?? null,
        };
      }),
    );
  }
}
