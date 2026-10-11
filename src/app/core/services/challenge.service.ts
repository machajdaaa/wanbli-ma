import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DailyChallengeVm } from '../models/view-models';
import { DAILY_CHALLENGE_MOCK } from '../mocks/challenge.mock';

/** Daily challenge on Home. */
@Injectable({ providedIn: 'root' })
export class ChallengeService {
  /** MOCK(daily challenge) — no endpoint yet (proposed GET /api/challenges/today). */
  today(): Observable<DailyChallengeVm> {
    return of({ ...DAILY_CHALLENGE_MOCK });
  }
}
