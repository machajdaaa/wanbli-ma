import { FeatherRefVm, MetricVm } from '../models/view-models';

/*
 * MOCK(post feather): PostResponse only carries `userEagleFeatherId` — no
 * feather name/code/light, no grand-challenge flag, no metrics, a single
 * `imageUrl`. Until the backend adds them (docs/backend-requirements.md),
 * each real post gets one of these samples picked deterministically by post id.
 * Samples are the posts shown in design/screens (KartaPera, Domu, Skupina…).
 */
export interface PostFeatherSample {
  feather: FeatherRefVm;
  isGrandChallenge: boolean;
  metrics: MetricVm[];
  /** Number of placeholder photos added when the post has no real image. */
  photos: number;
}

// `id: 0` — mock feathers don't map to a real catalog entry.
const ref = (code: string, name: string, categoryName: string): FeatherRefVm => ({
  id: 0,
  code,
  name,
  light: Number(code[0]) as FeatherRefVm['light'],
  categoryCode: code.replace(/\d+$/, ''),
  categoryName,
});

export const POST_FEATHER_SAMPLES: PostFeatherSample[] = [
  {
    feather: ref('1A1', 'Běh na 100 m', 'Atletika – běhy'),
    isGrandChallenge: true,
    metrics: [{ label: 'Čas', value: 11.25, unit: 's' }],
    photos: 1,
  },
  {
    feather: ref('1F3', 'Výlet na kole', 'Cyklistika'),
    isGrandChallenge: false,
    metrics: [
      { label: 'Vzdálenost', value: 12.4, unit: 'km' },
      { label: 'Čas', value: 48, unit: 'min' },
    ],
    photos: 2,
  },
  {
    feather: ref('3Z4', 'Uvaž 10 uzlů poslepu', 'Uzly a lana'),
    isGrandChallenge: false,
    metrics: [],
    photos: 0,
  },
  {
    feather: ref('2D5', 'Poznej hrady a zámky', 'Historie'),
    isGrandChallenge: false,
    metrics: [{ label: 'Navštíveno', value: 7, unit: 'zámků' }],
    photos: 5,
  },
  {
    feather: ref('1C2', 'Skok do výšky', 'Atletika – skoky'),
    isGrandChallenge: false,
    metrics: [{ label: 'Výška', value: 1.35, unit: 'm' }],
    photos: 0,
  },
  {
    feather: ref('2L1', 'Urči stromy v lese', 'Příroda – dřeviny'),
    isGrandChallenge: true,
    metrics: [{ label: 'Určeno', value: 30, unit: 'druhů' }],
    photos: 0,
  },
  {
    feather: ref('4K2', 'Pochod na 20 km', 'Turistika'),
    isGrandChallenge: false,
    metrics: [{ label: 'Vzdálenost', value: 21.3, unit: 'km' }],
    photos: 0,
  },
  {
    feather: ref('1H3', 'Hod míčkem', 'Hody, vrhy a kopy'),
    isGrandChallenge: false,
    metrics: [{ label: 'Vzdálenost', value: 34, unit: 'm' }],
    photos: 1,
  },
];

export function postFeatherSample(postId: number): PostFeatherSample {
  return POST_FEATHER_SAMPLES[Math.abs(postId) % POST_FEATHER_SAMPLES.length];
}
