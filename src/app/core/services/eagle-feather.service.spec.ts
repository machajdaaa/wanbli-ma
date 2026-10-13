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
    http.expectOne((r) => r.url === `${ROOT}/api/eagle-feathers`).flush(page(CATALOG));
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

  it('loads the catalog in pages of at most 100 (backend limit) and follows all pages', async () => {
    const result = firstValueFrom(service.search('beh'));
    const first = http.expectOne((r) => r.url === `${ROOT}/api/eagle-feathers` && r.params.get('Page') === '1');
    expect(first.request.params.get('PageSize')).toBe('100');
    first.flush({ ...page([CATALOG[0]]), totalPages: 2, hasNextPage: true });
    const second = http.expectOne((r) => r.url === `${ROOT}/api/eagle-feathers` && r.params.get('Page') === '2');
    expect(second.request.params.get('PageSize')).toBe('100');
    second.flush({ ...page([CATALOG[1]]), page: 2, totalPages: 2, hasNextPage: false });
    http.expectOne((r) => r.url === `${ROOT}/api/user/eagle-feathers`).flush(page([]));
    expect((await result).map((f) => f.code)).toEqual(['1A1', '1A2']);
  });

  it('searches by name without diacritics and by code prefix', async () => {
    const byName = firstValueFrom(service.search('bylinkove'));
    flushCatalogAndProgress([]);
    expect((await byName).map((f) => f.code)).toEqual(['4A1']);

    // Catalog and progress are cached — no new requests.
    expect((await firstValueFrom(service.search('1a'))).map((f) => f.code)).toEqual(['1A1', '1A2']);
    expect(await firstValueFrom(service.search('  '))).toEqual([]);
  });
});
