import { Injectable, inject } from '@angular/core';
import { Observable, catchError, combineLatest, forkJoin, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { categoryCode, normalizeSearch, toLight } from './mappers';
import { LIGHTS, Light } from '../models/light';
import {
  CategoryCardVm,
  CategoryDetailVm,
  CollectionLightVm,
  FeatherDetailVm,
  FeatherProgressVm,
  FeatherRefVm,
  FeatherRowVm,
  LightCatalogVm,
  PersonVm,
} from '../models/view-models';
import { EagleFeatherResponse, UserEagleFeatherResponse } from '../api/generated/models';
import { getAllEagleFeathers$Json } from '../api/generated/fn/eagle-feathers/get-all-eagle-feathers-json';
import { getEagleFeathersBySection$Json } from '../api/generated/fn/eagle-feathers/get-eagle-feathers-by-section-json';
import { getEagleFeatherById$Json } from '../api/generated/fn/eagle-feathers/get-eagle-feather-by-id-json';
import { getMyUserEagleFeathers$Json } from '../api/generated/fn/user-eagle-feathers/get-my-user-eagle-feathers-json';
import { getUserEagleFeathers$Json } from '../api/generated/fn/users/get-user-eagle-feathers-json';
import { getOrganisation$Json } from '../api/generated/fn/organisations/get-organisation-json';
import { CATEGORY_NAMES, CATEGORY_RULES } from '../mocks/categories.mock';
import { FEATHER_EXTRAS, FEATHER_SOCIAL_NAMES, defaultFeatherExtra } from '../mocks/feathers.mock';

/** Catalog entry normalized from EagleFeatherResponse (all fields optional in the spec). */
interface CatalogFeather {
  id: number;
  light: Light;
  section: string;
  categoryCode: string;
  code: string;
  number: number;
  name: string;
  challenge: string;
  grandChallenge: string;
  sourceUrl: string | null;
}

const NOT_DONE: FeatherProgressVm = { deedDone: false, deedDoneAt: null, gcDone: false, gcDoneAt: null };

/** The feather a post is about, resolved from its `userEagleFeatherId`. */
export interface PostFeatherVm {
  feather: FeatherRefVm;
  isGrandChallenge: boolean;
}

/** userEagleFeatherId → (eagleFeatherId, Čin / Grand challenge) for one user. */
type UserFeatherLinks = Map<number, { eagleFeatherId: number; isGrandChallenge: boolean }>;

/**
 * Eagle feather catalog and the user's progress.
 *
 * The whole catalog is fetched once (`/eagle-feathers/all`) and cached: category counts,
 * progress per light and feather search are computed from it on the client
 * instead of one request per category (redesign-plan R3).
 */
@Injectable({ providedIn: 'root' })
export class EagleFeatherService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);

  private catalog$: Observable<CatalogFeather[]> | null = null;
  private myRecords$: Observable<UserEagleFeatherResponse[]> | null = null;
  /**
   * Per author — posts only carry `userEagleFeatherId` (docs/backend-requirements.md).
   * The request itself is cached, so parallel feeds share it; `links` holds
   * the loaded result to decide synchronously whether a refetch is needed.
   */
  private linkRequests = new Map<number, Observable<UserFeatherLinks>>();
  private links = new Map<number, UserFeatherLinks>();
  /** Records already refetched once without being found — never refetched again. */
  private missingLinks = new Set<number>();

  /** Catalog grouped by light → category, with the user's deed progress. */
  lights(): Observable<LightCatalogVm[]> {
    return combineLatest([this.catalog(), this.progress()]).pipe(map(([catalog, progress]) => this.lightsOf(catalog, progress)));
  }

  categoryDetail(light: Light, section: string): Observable<CategoryDetailVm> {
    return combineLatest([
      this.api.call(getEagleFeathersBySection$Json, { light, section }),
      this.progress(),
    ]).pipe(
      map(([feathers, progress]) => {
        const rows = feathers
          .map((f) => this.normalize(f))
          .sort((a, b) => a.number - b.number)
          .map((f) => this.toRow(f, progress));
        const code = categoryCode(light, section);
        return {
          category: {
            light,
            section,
            code,
            name: this.categoryName(code),
            total: rows.length,
            done: rows.filter((r) => r.deedDone).length,
          },
          gcDone: rows.filter((r) => r.gcDone).length,
          rules: CATEGORY_RULES[code] ?? null, // MOCK(category rules)
          feathers: rows,
        };
      }),
    );
  }

  featherDetail(id: number): Observable<FeatherDetailVm> {
    return combineLatest([
      this.api.call(getEagleFeatherById$Json, { id }),
      this.progress(),
      this.myGroupName(),
    ]).pipe(
      map(([response, progress, groupName]) => {
        const f = this.normalize(response);
        const extra = FEATHER_EXTRAS[f.code] ?? defaultFeatherExtra(f.challenge); // MOCK(feather detail)
        const state = progress.get(f.id) ?? NOT_DONE;
        return {
          ...this.toRef(f),
          ...state,
          measure: extra.measure,
          deedText: f.challenge,
          gcText: f.grandChallenge,
          deedResult: null, // MOCK(metrics): results aren't stored with user feathers yet
          limits: extra.limits,
          terms: extra.terms,
          social: this.mockSocial(f.id),
          groupName,
          sourceUrl: f.sourceUrl,
        };
      }),
    );
  }

  /** Accent-insensitive name search, or code prefix ("4A1", "4a"). */
  search(query: string): Observable<FeatherRowVm[]> {
    const q = normalizeSearch(query);
    if (!q) return of([]);
    const compactQuery = q.replace(/\s+/g, '');
    return combineLatest([this.catalog(), this.progress()]).pipe(
      map(([catalog, progress]) =>
        catalog
          .filter((f) => normalizeSearch(f.name).includes(q) || f.code.toLowerCase().startsWith(compactQuery))
          .map((f) => this.toRow(f, progress)),
      ),
    );
  }

  /** "Moje sbírka": done deeds / all feathers per light. */
  myCollection(): Observable<CollectionLightVm[]> {
    return this.lights().pipe(map((lights) => lights.map(({ light, done, total }) => ({ light, done, total }))));
  }

  /** Someone else's collection, from their feather records. */
  userCollection(userId: number): Observable<CollectionLightVm[]> {
    return combineLatest([this.catalog(), this.userRecords(userId)]).pipe(
      map(([catalog, records]) =>
        this.lightsOf(catalog, toProgress(records)).map(({ light, done, total }) => ({ light, done, total })),
      ),
    );
  }

  /**
   * Feathers of posts, keyed by `userEagleFeatherId`. The post only has that
   * id, so each author's feather records are fetched — once per author for
   * the session, shared by parallel callers. An author is fetched again only
   * when a post refers to a record that isn't loaded yet (a new post), and
   * only once per such record. My own posts use my progress records. Posts
   * whose record can't be read (e.g. a private profile) are left out of the map.
   */
  postFeathers(posts: { authorId: number; userEagleFeatherId: number }[]): Observable<Map<number, PostFeatherVm>> {
    const byAuthor = new Map<number, number[]>();
    for (const p of posts) byAuthor.set(p.authorId, [...(byAuthor.get(p.authorId) ?? []), p.userEagleFeatherId]);
    const requests = [...byAuthor.entries()].map(([authorId, ids]) =>
      this.authorLinks(authorId, ids).pipe(map((links) => [authorId, links] as const)),
    );
    return combineLatest([this.catalog(), forkJoin(requests)]).pipe(
      map(([catalog, links]) => {
        const byId = new Map(catalog.map((f) => [f.id, f]));
        const linksByAuthor = new Map(links);
        const result = new Map<number, PostFeatherVm>();
        for (const p of posts) {
          const link = linksByAuthor.get(p.authorId)?.get(p.userEagleFeatherId);
          const feather = link && byId.get(link.eagleFeatherId);
          if (link && feather) result.set(p.userEagleFeatherId, { feather: this.toRef(feather), isGrandChallenge: link.isGrandChallenge });
        }
        return result;
      }),
    );
  }


  /** Re-fetch the user's progress (after adding a feather, later). */
  refreshProgress(): void {
    this.myRecords$ = null;
  }

  private catalog(): Observable<CatalogFeather[]> {
    if (!this.catalog$) {
      this.catalog$ = this.api.call(getAllEagleFeathers$Json, {}).pipe(
        map((items) =>
          items
            .map((f) => this.normalize(f))
            .sort((a, b) => a.light - b.light || a.categoryCode.localeCompare(b.categoryCode, 'cs') || a.number - b.number),
        ),
        catchError((error) => {
          this.catalog$ = null;
          return throwError(() => error);
        }),
        shareReplay(1),
      );
    }
    return this.catalog$;
  }

  /** The current user's progress, featherId → state (see toProgress). */
  private progress(): Observable<Map<number, FeatherProgressVm>> {
    return this.myRecords().pipe(map(toProgress));
  }

  /** The current user's feather records — progress and the feathers of my own posts. */
  private myRecords(): Observable<UserEagleFeatherResponse[]> {
    if (!this.myRecords$) {
      this.myRecords$ = this.api.allPages(getMyUserEagleFeathers$Json, {}).pipe(
        catchError((error) => {
          this.myRecords$ = null;
          return throwError(() => error);
        }),
        shareReplay(1),
      );
    }
    return this.myRecords$;
  }

  private authorLinks(authorId: number, needed: number[]): Observable<UserFeatherLinks> {
    const cached = this.linkRequests.get(authorId);
    const loaded = this.links.get(authorId);
    // Not in `links` = in flight, or failed (cached as empty) → reuse the request.
    const unknown = loaded ? needed.filter((id) => !loaded.has(id) && !this.missingLinks.has(id)) : [];
    if (cached && !unknown.length) return cached;
    unknown.forEach((id) => this.missingLinks.add(id));

    const isMe = authorId === this.auth.currentUser()?.id;
    if (isMe && unknown.length) this.refreshProgress();
    const request = (isMe ? this.myRecords() : this.userRecords(authorId)).pipe(
      map((records) => {
        const links: UserFeatherLinks = new Map();
        for (const r of records) links.set(r.id, { eagleFeatherId: r.eagleFeatherId, isGrandChallenge: r.isGrandChallenge });
        this.links.set(authorId, links);
        return links;
      }),
      catchError(() => of<UserFeatherLinks>(new Map())),
      shareReplay(1),
    );
    this.linkRequests.set(authorId, request);
    return request;
  }

  private userRecords(userId: number): Observable<UserEagleFeatherResponse[]> {
    return this.api.allPages(getUserEagleFeathers$Json, { id: userId });
  }

  private lightsOf(catalog: CatalogFeather[], progress: Map<number, FeatherProgressVm>): LightCatalogVm[] {
    return LIGHTS.map((light) => {
      const categories = this.categoriesOf(catalog.filter((f) => f.light === light), progress);
      return {
        light,
        categories,
        total: categories.reduce((sum, c) => sum + c.total, 0),
        done: categories.reduce((sum, c) => sum + c.done, 0),
      };
    });
  }

  private myGroupName(): Observable<string | null> {
    return this.auth.ensureCurrentUser().pipe(
      switchMap((me) =>
        me.organisationId == null
          ? of(null)
          : this.api.call(getOrganisation$Json, { id: me.organisationId }).pipe(
              map((o) => o.name),
              catchError(() => of(null)),
            ),
      ),
    );
  }

  private categoriesOf(feathers: CatalogFeather[], progress: Map<number, FeatherProgressVm>): CategoryCardVm[] {
    const byCode = new Map<string, CatalogFeather[]>();
    for (const f of feathers) byCode.set(f.categoryCode, [...(byCode.get(f.categoryCode) ?? []), f]);
    return [...byCode.entries()].map(([code, items]) => ({
      light: items[0].light,
      section: items[0].section,
      code,
      name: this.categoryName(code),
      total: items.length,
      done: items.filter((f) => progress.get(f.id)?.deedDone).length,
    }));
  }

  private normalize(f: EagleFeatherResponse): CatalogFeather {
    const light = toLight(f.light);
    const section = f.section ?? '';
    const catCode = categoryCode(light, section);
    const number = f.number ?? 0;
    return {
      id: f.id ?? 0,
      light,
      section,
      categoryCode: catCode,
      code: `${catCode}${number}`,
      number,
      name: f.name ?? '',
      challenge: f.challenge ?? '',
      grandChallenge: f.grandChallenge ?? '',
      sourceUrl: f.sourceUrl ?? null,
    };
  }

  private toRef(f: CatalogFeather): FeatherRefVm {
    return {
      id: f.id,
      code: f.code,
      name: f.name,
      light: f.light,
      categoryCode: f.categoryCode,
      categoryName: this.categoryName(f.categoryCode),
    };
  }

  private toRow(f: CatalogFeather, progress: Map<number, FeatherProgressVm>): FeatherRowVm {
    const extra = FEATHER_EXTRAS[f.code] ?? defaultFeatherExtra(f.challenge);
    return { ...this.toRef(f), ...(progress.get(f.id) ?? NOT_DONE), goal: extra.goal };
  }

  /** MOCK(category names) — CATEGORY_NAMES until the API names sections. */
  private categoryName(code: string): string {
    return CATEGORY_NAMES[code] ?? code;
  }

  /** MOCK(feather social): deterministic "N people from your group have it". */
  private mockSocial(featherId: number) {
    const count = featherId % 3 === 0 ? 0 : 3 + (featherId % 6);
    const people: PersonVm[] = FEATHER_SOCIAL_NAMES.slice(0, Math.min(count, 3)).map((name, i) => ({
      id: -(i + 1),
      name,
      nickname: null,
      avatarUrl: null,
      isMe: false,
    }));
    return { count, people };
  }
}

/**
 * featherId → progress. Only completed records count (`isCompleted`);
 * pending / rejected ones are not shown at all (redesign-plan R8).
 */
function toProgress(records: UserEagleFeatherResponse[]): Map<number, FeatherProgressVm> {
  const result = new Map<number, FeatherProgressVm>();
  for (const r of records.filter((x) => x.isCompleted)) {
    const state = { ...(result.get(r.eagleFeatherId) ?? NOT_DONE) };
    const at = r.earnedAt ?? r.createdAt;
    if (r.isGrandChallenge) {
      state.gcDone = true;
      state.gcDoneAt = at;
    } else {
      state.deedDone = true;
      state.deedDoneAt = at;
    }
    result.set(r.eagleFeatherId, state);
  }
  return result;
}
