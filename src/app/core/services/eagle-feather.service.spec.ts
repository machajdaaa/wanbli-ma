import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { EagleFeatherService } from './eagle-feather.service';
import { provideTestDefaults } from '../../../testing/test-providers';
import { provideApiConfiguration } from '../api/generated/api-configuration';
import { EagleFeatherResponse, UserEagleFeatherResponse } from '../api/generated/models';

const ROOT = 'https://api.test';

const feather = (id: number, light: number, section: string, number: number, name: string): EagleFeatherResponse => ({
  id,
  light,
  section,
  number,
  name,
  challenge: `Úkol ${name}.`,
  grandChallenge: `Těžší úkol ${name}.`,
});

const CATALOG = [
  feather(1, 1, 'A', 1, 'Běh na 100 m'),
  feather(2, 1, 'A', 2, 'Běh na 1500 m'),
  feather(3, 4, 'A', 1, 'Bylinkové čaje'),
];

const record = (eagleFeatherId: number, isCompleted: boolean, isGrandChallenge = false): UserEagleFeatherResponse => ({
  id: eagleFeatherId * 10 + (isGrandChallenge ? 1 : 0),
  eagleFeatherId,
  isCompleted,
  isGrandChallenge,
  status: isCompleted ? 1 : 0,
  createdAt: '2026-09-12T10:00:00Z',
  earnedAt: isCompleted ? '2026-09-12T10:00:00Z' : null,
  moderatorNote: null,
  userId: 1,
  verifiedById: null,
});

const page = <T>(items: T[]) => ({ items, page: 1, pageSize: 100, totalCount: items.length, totalPages: 1, hasNextPage: false });

describe('EagleFeatherService', () => {
  let service: EagleFeatherService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...provideTestDefaults(), provideApiConfiguration(ROOT)] });
    service = TestBed.inject(EagleFeatherService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function flushCatalogAndProgress(progress: UserEagleFeatherResponse[]): void {
    http.expectOne(`${ROOT}/api/eagle-feathers/all`).flush(CATALOG);
    http.expectOne((r) => r.url === `${ROOT}/api/user/eagle-feathers`).flush(page(progress));
  }

  it('groups the catalog by light and category and counts only completed deeds', async () => {
    const result = firstValueFrom(service.lights());
    // Feather 2 is pending approval — it must not count as done (redesign-plan R8).
    flushCatalogAndProgress([record(1, true), record(2, false), record(1, true, true)]);
    const lights = await result;

    expect(lights.map((l) => l.light)).toEqual([1, 2, 3, 4]);
    const athletics = lights[0].categories[0];
    expect(athletics.code).toBe('1A');
    expect(athletics.name).toBe('Atletika – běhy');
    expect(athletics.total).toBe(2);
    expect(athletics.done).toBe(1);
    expect(lights[1].categories).toEqual([]);
    expect(lights[3].categories[0].name).toBe('Bylinkářství');
  });

  it('searches by name without diacritics and by code prefix', async () => {
    const byName = firstValueFrom(service.search('bylinkove'));
    flushCatalogAndProgress([]);
    expect((await byName).map((f) => f.code)).toEqual(['4A1']);

    // Catalog and progress are cached — no new requests.
    expect((await firstValueFrom(service.search('1a'))).map((f) => f.code)).toEqual(['1A1', '1A2']);
    expect(await firstValueFrom(service.search('  '))).toEqual([]);
  });

  it('resolves post feathers through the author\'s feather records, once per author', async () => {
    const posts = [
      { authorId: 7, userEagleFeatherId: 11 }, // GC of feather 1
      { authorId: 7, userEagleFeatherId: 30 }, // deed of feather 3
      { authorId: 8, userEagleFeatherId: 99 }, // record not readable
    ];
    const result = firstValueFrom(service.postFeathers(posts));
    http.expectOne(`${ROOT}/api/eagle-feathers/all`).flush(CATALOG);
    http
      .expectOne((r) => r.url === `${ROOT}/api/users/7/eagle-feathers`)
      .flush(page([record(1, true, true), record(3, false)]));
    http
      .expectOne((r) => r.url === `${ROOT}/api/users/8/eagle-feathers`)
      .flush(null, { status: 403, statusText: 'Forbidden' });
    const feathers = await result;

    expect(feathers.get(11)?.feather.code).toBe('1A1');
    expect(feathers.get(11)?.isGrandChallenge).toBeTrue();
    expect(feathers.get(30)?.feather.name).toBe('Bylinkové čaje');
    expect(feathers.has(99)).toBeFalse();

    // Author 7 is cached — no new request for a known record; author 8 failed and isn't retried.
    expect((await firstValueFrom(service.postFeathers([posts[0], posts[2]]))).get(11)?.feather.code).toBe('1A1');
  });

  it('shares one request per author between parallel callers and refetches a missing record only once', async () => {
    const post = { authorId: 7, userEagleFeatherId: 20 }; // not in the author's list
    const first = firstValueFrom(service.postFeathers([post]));
    const second = firstValueFrom(service.postFeathers([post]));
    http.expectOne(`${ROOT}/api/eagle-feathers/all`).flush(CATALOG);
    http.expectOne((r) => r.url === `${ROOT}/api/users/7/eagle-feathers`).flush(page([record(1, true)]));
    expect((await first).size).toBe(0);
    expect((await second).size).toBe(0);

    // A later load tries once more (it may be a new post)…
    const retry = firstValueFrom(service.postFeathers([post]));
    http.expectOne((r) => r.url === `${ROOT}/api/users/7/eagle-feathers`).flush(page([record(1, true)]));
    expect((await retry).size).toBe(0);
    // …and then never again.
    expect((await firstValueFrom(service.postFeathers([post]))).size).toBe(0);
  });
});
