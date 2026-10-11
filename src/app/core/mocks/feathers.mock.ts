import { LimitsVm, TermVm } from '../models/view-models';

/*
 * MOCK(feather detail): the API returns only the `challenge` and
 * `grandChallenge` texts. What is measured, the one-line goal, age/gender
 * limits and the glossary come from here until the backend models them
 * (docs/backend-requirements.md). Keyed by feather code; feathers without an
 * entry fall back to `defaultFeatherExtra`.
 */
export interface FeatherExtra {
  /** "Měří se čas" */
  measure: string;
  /** One line for lists: "Měří se čas · limit podle věku" */
  goal: string;
  limits: LimitsVm | null;
  terms: TermVm[];
}

// Ages as in the design (PeroDetail). Note: they start at 14 although the app
// targets 8–15 — real age groups must come from the backend.
const AGES = ['14–15 let', '16–17 let', '18–33 let', '34–49 let', '50 a více'];
const seconds = (values: number[]) => values.map((v) => `${v.toFixed(1).replace('.', ',')} s`);

export const FEATHER_EXTRAS: Record<string, FeatherExtra> = {
  '1A1': {
    measure: 'Měří se čas',
    goal: 'Měří se čas · limit podle věku',
    limits: {
      unitLabel: 'v sekundách',
      ages: AGES,
      men: { deed: seconds([14.5, 14.0, 13.4, 14.1, 15.8]), gc: seconds([13.6, 13.0, 12.6, 13.1, 15.1]) },
      women: { deed: seconds([16.1, 15.6, 15.0, 15.7, 17.4]), gc: seconds([15.1, 14.6, 14.2, 14.7, 16.7]) },
    },
    terms: [],
  },
  '4A1': {
    measure: 'Ověřuje odborník',
    goal: 'Poznej 10 rostlin na čaje a připrav 5 čajů',
    limits: null,
    terms: [
      { term: 'Prokaž, že znáš', definition: 'Popiš či předveď odborníkovi. Ten může dávat doplňující otázky.' },
      { term: 'Vysvětli', definition: 'Popiš odborníkovi. Ten může dávat doplňující otázky.' },
      {
        term: 'Odborník',
        definition:
          'Člověk, který obor vystudoval, studuje nebo v něm pracuje – nebo se o obor zajímá, sám tento čin splnil a své znalosti umí doložit.',
      },
    ],
  },
};

/** Fallback: the goal is the first sentence of the deed text. */
export function defaultFeatherExtra(challenge: string): FeatherExtra {
  const firstSentence = challenge.split(/(?<=[.!?])\s/)[0]?.trim() ?? '';
  return { measure: '', goal: firstSentence, limits: null, terms: [] };
}

// MOCK(feather social): "how many people from your group have it" — no API.
export const FEATHER_SOCIAL_NAMES = ['Tereza Svobodová', 'Matěj Dvořák', 'Vojtěch Procházka'];
