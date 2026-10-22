import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiClient } from './api-client';
import { DailyChallengeVm } from '../models/view-models';
import { getCurrentChallenge$Json } from '../api/generated/fn/challenges/get-current-challenge-json';

/** Daily challenge on Home. */
@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private api = inject(ApiClient);

  /** The current challenge, or null when there is none (or it can't be loaded) — Home then hides the card. */
  current(): Observable<DailyChallengeVm | null> {
    return this.api.call(getCurrentChallenge$Json, {}).pipe(
      map(({ challenge }) => ({
        id: challenge.id,
        title: challenge.title,
        text: challenge.description?.trim() || null,
        featherId: challenge.eagleFeatherId,
      })),
      catchError(() => of(null)),
    );
  }
}
