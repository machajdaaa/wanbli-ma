# Orlí pera – design reference

Exported from the Claude Design canvas "Orlí pera" (light mode, design system v1).
This folder is the source of truth for the redesign. Do not ship these files; use
them as a pixel reference while building the Ionic/Angular screens.

## How to read a `.dc.html` file

- Every element has its final styles **inline** (`style="…"`). Sizes are CSS px at
  a 390 px wide phone. Treat those values as exact.
- `{{name}}` is a placeholder filled from `renderVals()` in the `<script type="text/x-dc">`
  block at the bottom. That function also holds realistic **sample data** for the screen.
- `<sc-for list="{{items}}" as="x">` is a loop, `<sc-if value="{{flag}}">` is a condition.
- `<dc-import name="PostCard" post="{{it}}">` embeds another file from this folder
  (`PostCard.dc.html`). Shared parts: `PostCard`, `NavBar`, `DailyChallenge`, `KategorieDetail`, `PeroDetail`.
- `<script src="./support.js">` and `<x-dc>` / `<helmet>` are design-tool runtime; ignore them.
- Images live in `../assets/`.

## Screen index → app route

| File | Screen | Route in the app |
|---|---|---|
| `Main.dc.html` | Design system: colors, type, spacing, radius, icons, all components with states | – |
| `PostCard.dc.html`, `KartaPera.dc.html` | Post card (feather card) + all variants | shared component |
| `NavBar.dc.html` | Floating navbar | tabs shell (`/nav`) |
| `DailyChallenge.dc.html` | Daily challenge banner | shared component |
| `MapaAplikace.dc.html` | App map: which screen leads where | – |
| `Domu.dc.html` | 1 Home – feed of followed people | `/nav/home` |
| `Domu-Nesleduji.dc.html` | 1b Home – follows nobody → whole League feed | `/nav/home` (state) |
| `Domu-Prazdny.dc.html` | 1c Home – empty | `/nav/home` (state) |
| `Domu-MenuPrispevku.dc.html` | 1d Post menu (someone else's post) | bottom sheet |
| `Profil-MenuPrispevku.dc.html` | 1e Post menu (own post) | bottom sheet |
| `OrliPera.dc.html` | 2 Eagle feathers – catalog by light | `/nav/eagle-feathers` |
| `KategorieDetail.dc.html`, `KategorieDetail-4A.dc.html` | 2a/2b Category (sub-light) detail | `/nav/eagle-feathers/category/:light/:section` |
| `PeroDetail.dc.html`, `PeroDetail-4A1.dc.html` | 2c/2d Feather detail | `/nav/eagle-feathers/feather/:id` |
| `VyhledaniPera.dc.html` | 2e Feather search | `/nav/eagle-feathers/search` |
| `Kategorie.dc.html` | Reference: all categories (codes, names) per light | – |
| `Skupina-Prispevky.dc.html` | 3a Group – posts tab | `/nav/group` |
| `Skupina-Oznameni.dc.html` | 3b Group – announcements tab | `/nav/group` |
| `Skupina-Zebricek.dc.html` | 3c Group – leaderboard | `/nav/group` |
| `Skupina-Zebricek-Scroll.dc.html` | 3d Leaderboard scrolled, own row pinned | `/nav/group` (state) |
| `Profil.dc.html` | 4 My profile | `/nav/profile` |
| `Nastaveni.dc.html` | 5 Settings | `/settings` |
| `UpravitProfil.dc.html` | 6 Edit profile | `/profile/edit` |
| `Hledani.dc.html` | 7 People search | `/search` |
| `CiziProfil.dc.html` | 8 Someone else's profile | `/users/:id` |
| `Prihlaseni.dc.html` | 9 Login | `/login` |
| `Registrace.dc.html` | 10 Registration | `/register` |

Not designed yet (build only a placeholder): the "add feather" upload form (center navbar
button, "Přidat splnění", "Začít s perem") and dark mode.

## Assets

- `assets/eagle-daily-challenge.png` – eagle in the daily challenge banner
- `assets/eagle-empty-state.png` – eagle for empty states
- `assets/eagle-auth.png` – eagle on login / registration
