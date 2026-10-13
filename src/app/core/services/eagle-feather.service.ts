import { Injectable, inject } from '@angular/core';
import { Observable, catchError, combineLatest, map, of, shareReplay, switchMap, throwError } from 'rxjs';
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
  FeatherRowVm,
  LightCatalogVm,
  PersonVm,
} from '../models/view-models';
import { EagleFeatherResponse } from '../api/generated/models';
import { getEagleFeathers$Json } from '../api/generated/fn/eagle-feathers/get-eagle-feathers-json';
import { getEagleFeathersBySection$Json } from '../api/generated/fn/eagle-feathers/get-eagle-feathers-by-section-json';
import { getEagleFeatherById$Json } from '../api/generated/fn/eagle-feathers/get-eagle-feather-by-id-json';
import { getMyUserEagleFeathers$Json } from '../api/generated/fn/user-eagle-feathers/get-my-user-eagle-feathers-json';
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

/**
 * Eagle feather catalog and the user's progress.
 *
 * The whole catalog is fetched once (paged) and cached: category counts,
 * progress per light and feather search are computed from it on the client
 * instead of one request per category (redesign-plan R3).
 */
@Injectable({ providedIn: 'root' })
export class EagleFeatherService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);

  private catalog$: Observable<CatalogFeather[]> | null = null;
  private progress$: Observable<Map<number, FeatherProgressVm>> | null = null;

  /** Catalog grouped by light → category, with the user's deed progress. */
  lights(): Observable<LightCatalogVm[]> {
    return combineLatest([this.catalog(), this.progress()]).pipe(
      map(([catalog, progress]) =>
        LIGHTS.map((light) => {
          const categories = this.categoriesOf(catalog.filter((f) => f.light === light), progress);
          return {
            light,
            categories,
            total: categories.reduce((sum, c) => sum + c.total, 0),
            done: categories.reduce((sum, c) => sum + c.done, 0),
          };
        }),
      ),
    );
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

  /** Catalog id for a feather code ("1A1"), or null when it isn't in the catalog. */
  idForCode(code: string): Observable<number | null> {
    return this.catalog().pipe(map((catalog) => catalog.find((f) => f.code === code.toUpperCase())?.id ?? null));
  }

  /** "Moje sbírka": done deeds / all feathers per light. */
  myCollection(): Observable<CollectionLightVm[]> {
    return this.lights().pipe(map((lights) => lights.map(({ light, done, total }) => ({ light, done, total }))));
  }

  /** Number of feathers in each light — used to scale mock collections of other users. */
  totalsByLight(): Observable<Record<Light, number>> {
    return this.catalog().pipe(
      map((catalog) => {
        const totals: Record<Light, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
        for (const f of catalog) totals[f.light]++;
        return totals;
      }),
    );
  }

  /** Feathers the current user has (deed done) — the profile's "Orlí pera" stat. */
  myFeatherCount(): Observable<number> {
    return this.progress().pipe(map((progress) => [...progress.values()].filter((p) => p.deedDone).length));
  }

  /** Re-fetch the user's progress (after adding a feather, later). */
  refreshProgress(): void {
    this.progress$ = null;
  }

  private catalog(): Observable<CatalogFeather[]> {
    if (!this.catalog$) {
      this.catalog$ = this.api.allPages(getEagleFeathers$Json, {}).pipe(
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

  /**
   * featherId → progress. Only completed records count (`isCompleted`);
   * pending / rejected ones are not shown at all (redesign-plan R8).
   */
  private progress(): Observable<Map<number, FeatherProgressVm>> {
    if (!this.progress$) {
      this.progress$ = this.api.allPages(getMyUserEagleFeathers$Json, {}).pipe(
        map((records) => {
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
        }),
        catchError((error) => {
          this.progress$ = null;
          return throwError(() => error);
        }),
        shareReplay(1),
      );
    }
    return this.progress$;
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

  private toRef(f: CatalogFeather) {
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
