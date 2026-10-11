/*
 * View models — what screens render. Services in core/services map API
 * responses (and core/mocks where the API has no data yet) into these, so a
 * backend change only touches the mapping, never a component.
 */
import { Light } from './light';

/** A person as shown next to content (author, leaderboard row, member). */
export interface PersonVm {
  id: number;
  /** Full name when the API provides it, otherwise the nickname. */
  name: string;
  nickname: string | null;
  avatarUrl: string | null;
  isMe: boolean;
}

/* ---------- Eagle feathers ---------- */

/** Minimal reference to a feather (post card, search result). */
export interface FeatherRefVm {
  id: number;
  /** "1A1" */
  code: string;
  name: string;
  light: Light;
  /** "1A" */
  categoryCode: string;
  categoryName: string;
}

export interface FeatherProgressVm {
  deedDone: boolean;
  deedDoneAt: string | null;
  gcDone: boolean;
  gcDoneAt: string | null;
}

export interface CategoryCardVm {
  light: Light;
  /** API section, e.g. "A" or "AA" */
  section: string;
  /** "1A" */
  code: string;
  name: string;
  total: number;
  /** Feathers with the deed (Čin) done. */
  done: number;
}

export interface LightCatalogVm {
  light: Light;
  categories: CategoryCardVm[];
  total: number;
  done: number;
}

export interface FeatherRowVm extends FeatherRefVm, FeatherProgressVm {
  /** One-line goal: "Měří se čas · limit podle věku". */
  goal: string;
}

export interface CategoryDetailVm {
  category: CategoryCardVm;
  gcDone: number;
  rules: string | null;
  feathers: FeatherRowVm[];
}

export interface LimitsVm {
  /** "v sekundách" */
  unitLabel: string;
  ages: string[];
  men: { deed: string[]; gc: string[] };
  women: { deed: string[]; gc: string[] };
}

export interface TermVm {
  term: string;
  definition: string;
}

export interface FeatherSocialVm {
  /** How many people from the user's group have the feather. */
  count: number;
  people: PersonVm[];
}

export interface FeatherDetailVm extends FeatherRefVm, FeatherProgressVm {
  /** "Měří se čas" */
  measure: string;
  deedText: string;
  gcText: string;
  /** Result recorded with the done deed, e.g. "14,3 s". */
  deedResult: string | null;
  limits: LimitsVm | null;
  terms: TermVm[];
  social: FeatherSocialVm;
  groupName: string | null;
  sourceUrl: string | null;
}

/* ---------- Posts ---------- */

export interface MetricVm {
  label: string;
  value: number;
  unit: string;
}

/** `url: null` = placeholder tile (mock photo without an image). */
export interface PhotoVm {
  url: string | null;
}

export interface PostCardVm {
  id: number;
  author: PersonVm;
  /** "Choltice, Pardubický kraj" — municipality level only; null = hidden. */
  place: string | null;
  createdAt: string;
  feather: FeatherRefVm;
  isGrandChallenge: boolean;
  /** 0–2 metrics; empty = show the "Splněno" badge. */
  metrics: MetricVm[];
  photos: PhotoVm[];
  /** Free text written by the author. */
  content: string | null;
  likeCount: number;
  likedByMe: boolean;
  isOwn: boolean;
}

export interface PageVm<T> {
  items: T[];
  page: number;
  hasNextPage: boolean;
}

export type HomeFeedMode = 'following' | 'league';

export interface DailyChallengeVm {
  title: string;
  text: string;
  /** Feather to open from "Do toho!" ("1A1"); resolved to an id via the catalog. */
  featherCode: string;
}

/* ---------- Group ---------- */

export interface GroupVm {
  id: number;
  name: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  memberCount: number;
  description: string | null;
}

export interface AnnouncementInfoVm {
  when: string;
  where: string;
  price: string;
  age: string;
}

export interface AnnouncementVm {
  id: number;
  author: PersonVm & { isLeader: boolean };
  createdAt: string;
  title: string;
  text: string;
  imageUrl: string | null;
  /** Kdy / Kde / Vstupné / Věk — null when the API doesn't provide it. */
  info: AnnouncementInfoVm | null;
  place: string | null;
}

export interface LeaderboardRowVm {
  rank: number;
  person: PersonVm;
  featherCount: number;
}

export interface LeaderboardVm {
  /** Ranks 1–3, in rank order (the screen lays them out 2–1–3). */
  podium: LeaderboardRowVm[];
  /** Rank 4 onwards. */
  rows: LeaderboardRowVm[];
  /** The current user's row, also when it's in `podium` / `rows`. */
  me: LeaderboardRowVm | null;
}

/* ---------- Profiles & people ---------- */

export interface CollectionLightVm {
  light: Light;
  done: number;
  total: number;
}

export interface ProfileVm {
  person: PersonVm;
  firstName: string;
  lastName: string;
  group: { id: number; name: string } | null;
  bio: string | null;
  stats: { feathers: number; followers: number; following: number };
  collection: CollectionLightVm[];
  isFollowing: boolean;
}

export interface PersonRowVm {
  person: PersonVm;
  groupName: string | null;
  featherCount: number;
  isFollowing: boolean;
}

/* ---------- Settings ---------- */

export interface NotificationSettingsVm {
  likes: boolean;
  followers: boolean;
  announcements: boolean;
  dailyChallenge: boolean;
}
