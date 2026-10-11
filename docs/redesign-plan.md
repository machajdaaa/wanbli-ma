# Orlí pera – plán redesignu

Pracovní dokument k redesignu podle `design/` a zadání v `trilobit_prompt.md`.
Rozhodnutí přijatá během práce se dopisují do sekce **Rozhodnutí** (s fází, ve
které vznikla). Chybějící data z API se evidují v `docs/backend-requirements.md`
(vznikne ve fázi 3).

## 0. Výchozí stav (fáze 0, 11. 10. 2026)

- `npm run lint` ✅, `npm run build` ✅ (jen Sass `@import` deprecation warningy).
- `npm test` ❌ **4 z 8 specs padají už teď**:
  - `ActivityCardComponent`, `DailyChallengeCardComponent` – NgModule-styl
    `declarations` u standalone komponenty (gotcha z CLAUDE.md).
  - `AppComponent`, `HomePage` – chybí `provideHttpClient()` v TestBed
    (`HomePage` padá kvůli rozpracovanému `FeedService`).
  - Opraví se ve fázi 1 (`imports` místo `declarations`, `provideHttpClient()` +
    `provideHttpClientTesting()`, Transloco testing provider).
- Karma potřebuje Chrome; na tomhle stroji je jen Brave →
  `CHROME_BIN="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm test -- --watch=false --browsers=ChromeHeadless`.
- Necommitnuté změny (`FeedService` + nekonečný scroll na Domů) se převezmou:
  `FeedService` se ve fázi 3 rozšíří na view-modely, logika stránkování
  a chybového stavu na Domů se zachová ve fázi 4. Commitnou se v rámci fáze 1.
- Katalogové endpointy (`/api/eagle-feathers/...`) vyžadují přihlášení, formát
  `section` (`"A"` vs. `"1A"`, víceznakové `"AA"`) jsem nemohl ověřit naživo.
  Mapování proto bude tolerantní (viz R7).

## 1. Obrazovky a routy

| # | Obrazovka (design) | Route | Kde žije | Stránka / komponenta |
|---|---|---|---|---|
| 9 | `Prihlaseni` | `/login` | mimo taby | `auth/login/LoginPage` (přepsat) |
| 10 | `Registrace` | `/register` | mimo taby | `auth/register/RegisterPage` (nová) |
| – | (není v designu) | `/forgot-password` | mimo taby | `auth/forgot-password/…` – info „připravujeme“ |
| 1, 1b, 1c | `Domu`, `Domu-Nesleduji`, `Domu-Prazdny` | `/nav/home` | tab | `pages/home/HomePage` |
| 1d, 1e | `Domu-MenuPrispevku`, `Profil-MenuPrispevku` | bottom sheet | – | `shared/components/post-menu-sheet` |
| 2 | `OrliPera` | `/nav/eagle-feathers` | tab | `pages/eagle-feathers/EagleFeathersPage` |
| 2a, 2b | `KategorieDetail(-4A)` | `/nav/eagle-feathers/category/:light/:section` | tab (stack) | `pages/eagle-feathers/category/…` |
| 2c, 2d | `PeroDetail(-4A1)` | `/nav/eagle-feathers/feather/:id` | tab (stack) | `pages/eagle-feathers/feather/…` |
| 2e | `VyhledaniPera` | `/nav/eagle-feathers/search` | tab (stack) | `pages/eagle-feathers/search/…` |
| 3a–3d | `Skupina-*` | `/nav/group` | tab | `pages/group/GroupPage` (segmenty uvnitř) |
| 4 | `Profil` | `/nav/profile` | tab | `pages/profile/ProfilePage` |
| 5 | `Nastaveni` | `/settings` | mimo taby | `pages/settings/…` |
| 6 | `UpravitProfil` | `/profile/edit` | mimo taby | `pages/profile-edit/…` |
| 7 | `Hledani` | `/search` | mimo taby | `pages/people-search/…` |
| 8 | `CiziProfil` | `/users/:id` | mimo taby | `pages/user-profile/…` (vlastní id → redirect `/nav/profile`) |
| – | nahrání pera (nenavrženo) | `/upload` | mimo taby | `pages/upload/…` – placeholder |
| – | katalog komponent | `/dev/ui` | mimo taby, jen dev build | `dev/ui/…` |

Všechny routy kromě `/login`, `/register`, `/forgot-password` jsou za
`authGuard`. Žádná route nepotřebuje `roleGuard` (koncept: vedoucí = dítě).

## 2. Komponenty

### `shared/design-system/` (primitivy, bez byznys logiky)

| Komponenta | Stavy / varianty | Zdroj v designu |
|---|---|---|
| `ButtonComponent` (přepis) | primary / secondary / text / destructive × default, pressed (`:active`), disabled, loading; výška 48 (text 44), `block` | Main → Tlačítka |
| `TextInputComponent` (přepis) | label nad polem, focus ring, error + text, hint, counter, password toggle, `textarea` varianta | Main → Input, UpravitProfil, Prihlaseni |
| `SearchInputComponent` | lupa, clear „×“, `type="search"` | Main, Hledani, VyhledaniPera |
| `SegmentedControlComponent` | 2–4 segmenty, `role="tablist"`, `sticky` varianta (bílý podklad + 1px linka) | Main, Skupina, PeroDetail (Muži/Ženy) |
| `AvatarComponent` | 32/40/56/96 (r10/12/18/30), foto / iniciály na tintu / bez fotky ikona | Main → Avatar |
| `BadgeComponent` | grand-challenge, done („Splněno“), announcement, leader, you, deed-done / deed-todo (dashed) | Main, KategorieDetail |
| `LightTagComponent` | světlo 1–4 + římská číslice + název; varianta „kód“ (22 px) | Main, PostCard, KategorieDetail |
| `ProgressBarComponent` | barva světla, výška 6/8, track normal/na-tintu | Main, OrliPera, Profil |
| `ToggleComponent` | on / off / disabled, `role="switch"` | Main → Přepínač |
| `SettingsGroupComponent` + `SettingsRowComponent` | navigace, s hodnotou, s přepínačem, destruktivní, disabled + „Brzy“ | Main, Nastaveni |
| `BottomSheetComponent` | handle, hlavička, akce, Zrušit; postavené na `ion-modal` s breakpointy | Domu-MenuPrispevku |
| `ToastService` + `ToastComponent` | success / error s akcí „Zkusit znovu“ | Main → Toast |
| `EmptyStateComponent` | orel v kruhu, nadpis, věta, CTA (primary/secondary) | Main, Domu-Prazdny |
| `SkeletonComponent` | post-card, list-row | (není v designu – odvozeno z karet) |
| `IconComponent` | inline SVG sada z Main/NavBar (outline + filled varianty) | Main → Ikony |

### `shared/components/` (feature komponenty)

| Komponenta | Pozn. |
|---|---|
| `PostCardComponent` | nahrazuje `ActivityCard`; vstup `PostCardVm`, výstupy `like`, `menu`, `author` |
| `PostMenuSheetComponent` | cizí / vlastní varianta, potvrzení smazání |
| `DailyChallengeCardComponent` (přepis) | vizuál z `DailyChallenge.dc.html` |
| `FloatingNavBarComponent` | součást `nav/` shellu |
| `CategoryCardComponent` | karta 178×128 v katalogu |
| `FeatherRowComponent` | řádek pera v kategorii (Čin/GC stav) a ve výsledcích hledání |
| `CollectionProgressComponent` | „Moje sbírka“ – 4 světla |
| `ProfileHeaderComponent` + `ProfileStatsComponent` | sdílené vlastním a cizím profilem |
| `GroupHeaderComponent` | cover, avatar, název, členové, popis + „více“ |
| `AnnouncementCardComponent` | info blok Kdy / Kde / Vstupné / Věk |
| `LeaderboardPodiumComponent` + `LeaderboardRowComponent` | pódium 2–1–3, řádek, připnutý vlastní řádek |
| `PersonRowComponent` | hledání lidí – avatar, jméno, skupina, počet per, Sledovat |

## 3. View-modely a služby

Služby v `core/services/` vrací view-modely (`core/models/*.vm.ts`). Mock data
jen v `core/mocks/` s `// MOCK(<důvod>)`.

| VM | Služba | Zdroj API | MOCK |
|---|---|---|---|
| `PostCardVm` { id, author{id,name,initials,avatarUrl,tint,isMe}, place?, createdAt, feather{code,name,light,categoryName}, isGrandChallenge, metrics[0–2], photos[], likeCount, likedByMe } | `FeedService`, `PostService` | `get-feed`, `get-organisation-feed`, `get-post`, `like-post`, `unlike-post`, `delete-post` | pero, GC, metriky, více fotek, `likedByMe` (viz R4–R6) |
| `HomeFeedVm` { mode: `following` \| `league`, posts, hasNextPage } | `FeedService` | `get-feed` + `get-following(me).totalCount` | – |
| `DailyChallengeVm` { title, text, featherId } | `ChallengeService` | – | celé |
| `LightVm` / `CategoryCardVm` { light, section, code, name, done, total } | `EagleFeatherService` | `get-eagle-feathers` (celý katalog jednou, cache) + `get-my-user-eagle-feathers` | názvy kategorií (konstanta z `Kategorie.dc.html`) |
| `CategoryDetailVm` { …, rules?, feathers: `FeatherRowVm`[], gcDone } | `EagleFeatherService` | `get-eagle-feathers-by-section` + moje pera | pravidla kategorie |
| `FeatherDetailVm` { code, name, category, light, measure, deed{done,doneAt,text}, gc{…}, limits?, terms?, social } | `EagleFeatherService` | `get-eagle-feather-by-id` (`challenge`, `grandChallenge`) + moje pera | `measure`, limity, slovníček, „kolik lidí ze skupiny“ |
| `FeatherSearchResultVm` | `EagleFeatherService` | z cache katalogu, filtr na klientu (bez diakritiky, kód) | – |
| `GroupVm` { id, name, avatarUrl, coverUrl?, memberCount, description } | `GroupService` | `get-organisation(me.organisationId)` | cover (ilustrace z designu jako default, ne mock) |
| `AnnouncementVm` { author{name,isLeader}, createdAt, title, text, imageUrl?, info? {when,where,price,age} } | `GroupService` | `get-announcements` | info blok, obrázek (viz R5) |
| `LeaderboardVm` { podium[3], rows[], me } | `GroupService` | – | celé |
| `ProfileVm` { user, nickname, group?, bio?, stats{feathers, followers, following}, collection[4], isMe, isFollowing } | `ProfileService` | `user/me` / `get-user`, `get-followers`/`get-following` (`totalCount`), moje pera, `update-current-user` | bio, u cizího: počet per, sbírka, skupina |
| `PersonRowVm` { id, name, initials, groupName, featherCount, isFollowing } | `PeopleService` | `get-organisation-members`, `get-following(me)`, `follow-user`, `unfollow-user` | počet per u členů; fulltext hledání mimo skupinu |
| `SettingsVm` (notifikace, tmavý režim) | `SettingsService` (Preferences) | – | lokálně, ne na serveru |
| `RegisterVm` / oddíly | `AuthService`, `GroupService` | `register` | seznam oddílů, souhlas rodiče |

Sledování: „sleduju ho?“ a „sleduju někoho?“ se počítá z `get-following(me)`
(načte se jednou do signálu v `PeopleService`, follow/unfollow ho aktualizuje).

## 4. Rozpory a nejasnosti

Design × koncept × API. U každého je navržené výchozí řešení (R = rozhodnutí níže).

1. **Jméno vs. přezdívka u autora.** `PostAuthorResponse` má jen `nickname`;
   `PublicUserResponse` a `OrganisationMemberResponse` mají jméno i příjmení.
   → Podle výchozího rozhodnutí v promptu: jméno a příjmení, kde je API vrací
   (profil, hledání, skupina), jinak přezdívka (karta pera, oznámení).
2. **Text příspěvku.** `PostResponse.content` existuje, karta v designu text nemá.
   → R6.
3. **Skutečné příspěvky bez pera/místa.** API nevrací pero, výkon ani místo,
   karta bez nich nemá ani nadpis. → R5.
4. **„Lajkl jsem?“** API nevrací. → R4.
5. **Stav pera „splněno“.** `UserEagleFeatherResponse` má `status`
   (čeká/schváleno/zamítnuto?) i `isCompleted`. Koncept zakazuje ukazovat stavy
   schvalování. → R8.
6. **Tabulka limitů v `PeroDetail`** začíná na „14–15 let“ a končí „50 a více“,
   aplikace je pro děti 8–15. → Mock tabulka zachová strukturu z designu;
   skutečné věkové kategorie dodá backend (zapsat do backend-requirements).
7. **„V Trilobitu ho má 7 lidí“** – natvrdo název oddílu. → Text přes klíč
   s `{{group}}` z `GroupVm.name`.
8. **„Tady jsou pera z celé organizace“ × „Z celé Ligy“** na stejné obrazovce
   (1b). → Sjednotit na „z celé Ligy“ (koncept mluví o Lize).
9. **`CiziProfil` má v designu navbar**, prompt ale dává `/users/:id` mimo tab
   shell. → R2.
10. **Registrace** – design: jedno pole „Jméno a příjmení“, výběr oddílu,
    souhlas, bez data narození a pohlaví. API: `firstName`, `lastName`,
    `birthDate`, `gender`, `passwordConfirm` povinné. → R10.
11. **Přihlášení** – design „E-mail nebo přezdívka“, API bere jen `nickname`.
    → Label „Přezdívka“, dokud API e-mail nepřijme.
12. **Upravit profil** – design má jedno pole „Jméno“, API `firstName` + `lastName`
    a `UpdateUserRequest` vyžaduje i `birthDate` a `gender` (pošlou se stávající
    hodnoty z `user/me`). Bio v API není. → Dvě pole Jméno / Příjmení; bio
    lokálně (MOCK).
13. **„Upravit příspěvek – Fotky a výkon“** ve vlastním menu – formulář není
    navržený. → Vede na placeholder `/upload` (stejně jako nahrání pera).
14. **`KategorieDetail` má stav „locked“** (zamčené pero, `opacity .55`) a
    nevyrenderovaný filtr Všechna/Moje. Koncept ani API zamykání nezná.
    → Neimplementovat, žádné pero se nezamyká.
15. **`UserRole.Admin = 2`** v `enums.ts`, API `0 | 1`. → Oprava ve fázi 9
    (jak zadáno); nikde se nepoužívá.
16. **Gender enum** (`Unknown=0, Male=1, Female=2`) je v `enums.ts` označený
    „ověřit s backendem“. Registrace na něm závisí. → Ponechat, zapsat
    do backend-requirements jako otázku.
17. **Feed bez sledovaných** – nevím, jestli `/api/feed` vrací celou Ligu.
    → Režim 1b se pozná z `get-following(me).totalCount === 0`, data stejně
    z `/api/feed`; když je prázdný, ukáže se prázdný stav.
18. **Moje příspěvky / příspěvky cizího uživatele** – API nemá
    `GET /users/{id}/posts`. → MOCK + backend-requirements.
19. **Daily challenge text** v designu („Běh na 100m pod 10 minut“) je
    nesmyslný – jen vzorová data, v mocku použít smysluplný text.
20. **Kódy kategorií** přeskakují X (`2W → 2Y`, `3W → 3Y → 3Z → 3AA`). Kód se
    proto nikdy nedopočítává z indexu, vždy z `section` z API.
21. **Dotykové plochy** pod 44 px v designu: tlačítko „Celá pravidla“ (32 px),
    „Do toho!“ a „Začít“ (36 px). → Vizuál zachovat, klikací plochu rozšířit
    na 44 px (padding / `::before` hit area).
22. **Kontrast (WCAG AA = 4,5 : 1 pro text pod 18,66 px bold / 24 px).**
    Spočítáno z hex hodnot designu:
    - bílý text na `orange-500` `#E07B1F` (primární tlačítko, segment,
      navbar „+“): **~3,0 : 1** ❌
    - bílý text na `orange-600` `#C9661A`: ~4,0 : 1 ❌
    - `#E07B1F` text na krémové („DAILY CHALLENGE“): ~2,7 : 1 ❌
    - `forest-500` `#5E6B57` na `surface` / `bg`: ~4,9 : 1 ✅,
      `forest-900` na čemkoli světlém ✅
    Primární tlačítko podle designu tedy AA nesplní. **Potřebuje tvoje
    rozhodnutí** (viz otázka O1 níže). Do té doby se tokeny implementují
    přesně podle designu a oranžový *text* na světlém podkladu dostane
    tmavší token `orange-700` (`#A9531A`, ~5 : 1).

## 4b. Otevřené otázky na tebe

- **O1 – Kontrast primárního tlačítka.** (a) Nechat oranžovou z designu
  a přijmout výjimku z AA pro tlačítka, (b) ztmavit výplň tlačítek na
  ~`#B35A12` (bílý text ~4,8 : 1, vizuálně tmavší, okraj/pressed se posunou
  o stupeň). Tmavý text `forest-900` na oranžové by dal jen ~4,2 : 1, takže
  to řešení není.
  **Rozhodnuto 11. 10. 2026: (a)** – barvy podle designu, výjimka z AA pro
  bílý text na oranžových tlačítkách / segmentu / FAB je **známý dluh**.
  Oranžový *text* na světlém podkladu přesto používá `orange-700`.

## 5. Rozhodnutí

- **R1 – Navbar (fáze 3).** Zůstává `ion-tabs` + `ion-tab-bar` (zachová
  Ionic tab stacky a back navigaci), restyluje se na plovoucí pilulku přes CSS
  custom properties / `::part`. Prostřední tlačítko je běžný `<button>` uvnitř
  tab baru, není to tab. Pozadí obsahu pod navbarem dostane gradient
  a `ion-content` spodní padding = výška navbaru + safe area.
- **R2 – Obrazovky mimo taby nemají navbar** (`/users/:id`, `/search`,
  `/settings`, `/profile/edit`, `/upload`) – mají tlačítko Zpět. Drží se tím
  zadaných rout a Ionic stack navigace; navbar v `CiziProfil` designu
  se nepřenáší.
- **R3 – Katalog per** se načte jednou přes `get-eagle-feathers`
  (stránkovaně do vyčerpání) a cachuje v `EagleFeatherService`; z něj se
  počítají počty v kategoriích, progres po světlech a klientské hledání.
  Volat `…/sections/{section}` pro ~95 kategorií by znamenalo ~95 requestů.
  Detail kategorie a pera se přesto čte z vlastních endpointů (čerstvá data).
- **R4 – Pírko.** Počáteční `likedByMe = false` (API ho nevrací). Klik =
  optimistické přepnutí + `like-post`/`unlike-post`; při chybě rollback a toast.
  Pokud `like-post` vrátí 409/400 („už lajknuto“), stav se nastaví na
  lajknuto bez navýšení počtu.
- **R5 – Politika chybějících polí u skutečných dat z API.** Pole nutná pro
  layout (pero u příspěvku: název, kód, světlo, kategorie) se doplní
  deterministickým mockem podle id. Pole, která by po zfalšování
  vypadala jako fakt o skutečném člověku nebo akci (místo u příspěvku,
  kdy/kde/vstupné/věk u oznámení), se **skryjí**. Plně mockované obrazovky
  (žebříček, daily challenge) mají vše.
- **R6 – Text příspěvku.** Když `content` není prázdný, zobrazí se pod názvem
  pera jako Body (max. 3 řádky). Jinak by uživatelský text zmizel.
- **R7 – Kód kategorie / pera.** `code = light + section` (pokud `section`
  už začíná číslem světla, nepřidává se), pero `= code + number`.
  Ověří se proti skutečné odpovědi ve fázi 5.
- **R8 – „Splněno“ = `isCompleted === true`.** Záznamy, které ještě nejsou
  dokončené (čekají na schválení / zamítnuté), UI neukazuje vůbec – pero
  vypadá jako nesplněné. Čin = záznam s `isGrandChallenge = false`,
  Grand challenge = `true`.
- **R9 – i18n.** `@jsverse/transloco`, jediný jazyk `cs`, soubor
  `public/assets/i18n/cs.json` (servíruje se jako `/assets/i18n/cs.json`).
  Formátování přes `registerLocaleData(localeCs)` + `LOCALE_ID = 'cs'`
  a vlastní pipes: `relativeTime` („dnes 9:00“, „včera 17:40“, „neděle 16:05“
  do 7 dní, „4. 10. 14:30“, jiný rok „4. 10. 2025“), `czNumber` („11,25“),
  `plural` přes `Intl.PluralRules('cs')` s klíči `one/few/other`
  („1 pero / 2 pera / 5 per“) – bez `transloco-messageformat`, žádná další
  závislost.
- **R10 – Registrace.** Pole: Jméno, Příjmení (zvlášť – API), Přezdívka,
  E-mail, Datum narození (`ion-datetime` v modalu), Pohlaví (SegmentedControl:
  Kluk / Holka / Neuvádím → `Gender` 1/2/0), Heslo se zobrazením hesla
  (`passwordConfirm` = `password`, design má jedno pole). Výběr oddílu
  (MOCK seznam, neodesílá se – API má pozvánky), souhlas s podmínkami
  (povinný na klientu, neodesílá se), upozornění pro mladší 15 let se ukáže
  podle data narození. Chyby u polí, ze serveru přes Toast.
- **R11 – Fonty.** Inter Variable zůstává; Baloo 2 se nahradí variabilním
  řezem (`Baloo2[wght].ttf` z Google Fonts, OFL) pokrývajícím 400–800,
  takže stačí jeden soubor pro 700 i 800. Nunito se ve fázi 1 odpojí
  z `fonts.scss`, soubory se smažou ve fázi 9.
- **R12 – Barvy avatarů** (tinty `#DDE8D2`, `#D6E6EF`, `#F1DCD5`, `#F4E8C1`,
  `#E2E5DA`) jako tokeny `--wanbli-avatar-1..5`, výběr deterministicky podle
  id uživatele.
- **R13 – Skupina bez `organisationId`** → empty state „Zatím nejsi v žádné
  skupině“ (bez akce, vstup řeší pozvánky v administraci).
- **R14 – Nastavení.** Osobní údaje → `/profile/edit`. Neaktivní se štítkem
  „Brzy“: Změnit heslo, Tmavý režim, Jazyk (jen Čeština), Kdo vidí moje
  pera, Zablokovaní lidé, Podmínky, Ochrana údajů (zatím bez URL).
  Notifikace: 4 přepínače, uložené lokálně přes Preferences. Verze
  z `package.json` přes `environment.appVersion`.
- **R15 – Testy.** Zůstávají smoke specy. Protože každá komponenta s texty
  potřebuje Transloco, vznikne jeden helper `src/testing/test-providers.ts`
  (`provideHttpClient`, `provideHttpClientTesting`, Transloco testing
  s `cs.json`). Žádné mocky Capacitor pluginů.
- **R16 – `/dev/ui`** se přidává do rout jen při `!environment.production`.
- **R17 – Tailwind v samostatném `src/tailwind.css` (fáze 1).** Sass neumí
  zparsovat Tailwind v4 syntaxi (`--color-*: initial`), proto `@theme`
  a `@utility` žijí v čistém CSS souboru zařazeném v `angular.json → styles`
  za `global.scss`. Výchozí Tailwind palety, radiusy, fonty a stíny jsou
  vypnuté – existují jen třídy navázané na tokeny (`bg-surface`,
  `text-text-muted`, `text-forest-500`, `rounded-12`, `font-display`,
  `shadow-navbar`). Spacing zůstává Tailwind default (4 px krok = mřížka
  designu). Typová škála = utility `type-display … type-overline`.
- **R18 – Tokeny ve dvou vrstvách (fáze 1).** `--wanbli-palette-*` (surové
  barvy z designu) a `--wanbli-color-*` (sémantické). Komponenty a Tailwind
  používají jen sémantickou vrstvu (výjimka: názvy `forest-*`/`orange-*`
  z designu jsou v Tailwindu kvůli zadání). Dark mode později přepíše jen
  sémantickou vrstvu. Progress track sjednocen na `#E6E5DB` (Main), i když
  OrliPera používá `#E2E1D6`. Radius odznaků 7 px z obrazovek sjednocen na 8
  (Main: „8 – odznaky“).
- **R19 – `color-scheme: light` v `index.html` (fáze 1).** Dokud není dark
  mode, nativní prvky (date picker, scrollbary) se nemají přepínat do tmavé.
- **R20 – Staré obrazovky (login, ActivityCard, DailyChallengeCard, navbar)**
  dostaly ve fázi 1 jen přemapované tokeny a `type-*` třídy, aby nevypadaly
  rozbitě; jejich texty se převedou na Transloco až při přepisu
  v příslušné fázi (2–4, 8).
- **R21 – Design-system komponenty na nativních prvcích (fáze 2).** `Button`,
  `TextInput`, `Toggle`, `SegmentedControl` atd. renderují skutečné
  `button`/`input`/`a` stylované Tailwindem místo restylovaných `ion-button`
  / `ion-input`. Důvod: design má label nad polem a stavy, které Ionic
  (floating label, shadow DOM) neumí bez boje se `::part`; nativní prvky jsou
  i požadavek přístupnosti. Ionic zůstává tam, kde přidává chování –
  `BottomSheet` je inline `ion-modal` (focus trap, Android back, zavření
  tapnutím na pozadí, `aria-label` Ionic přenese do vnitřního dialogu).
  `Button` s `link` renderuje `<a routerLink>`; během `loading` je nativně
  disabled (žádný dvojí submit), ale vypadá normálně + spinner.
- **R22 – Ionic globální CSS v cascade layer `ionic` (fáze 2).** Bez toho
  neuvrstvené Ionic pravidla (`a { color: primary }`, `h2 { margin-top }`)
  přebíjela všechny Tailwind utility. `typography.css` se neimportuje vůbec.
- **R23 – Stav „stisknuto“ na `/dev/ui`** se zobrazuje přes `forceActive`
  na `Button` (odstraní prefix `active:`); jinak je to `:active`. Focus stav
  inputu se v katalogu ukazuje jen klepnutím. Ukázkové texty na `/dev/ui`
  jsou natvrdo – je to vývojový nástroj, ne produktové UI.
- **R24 – Toast** = vlastní `ToastService` + `<app-toast-host>` v `AppComponent`
  (ne `ion-toast` – design má stavovou tečku a tmavou pilulku). Jeden toast
  najednou, nad navbarem; úspěch zmizí po 3 s, chyba s akcí „Zkusit znovu“
  zůstane do stisknutí. `role="status"` / `role="alert"`.
- **R25 – Hit area.** Malá tlačítka z designu (36 px „Do toho!“/„Začít“,
  `size="sm"`) mají vizuál 36 px, klikací plochu 44 px přes `::after`.
  Akční tlačítko v toastu je 44 px místo 36 px.

## 6. Fáze a výstup

| Fáze | Výstup | Commit |
|---|---|---|
| 1 | tokeny, `@theme`, fonty, typografické třídy, Transloco + pipes, `index.html`, oprava stávajících testů | `feat: design tokens, typography and i18n foundation` |
| 2 | design-system komponenty + `/dev/ui` | `feat: design system components` |
| 3 | navbar, routy, placeholdery, služby + VM + `core/mocks/`, `backend-requirements.md` | `feat: floating navbar, routes and data layer` |
| 4 | `PostCard`, menu příspěvku, Domů | `feat: post card and home screen` |
| 5 | Orlí pera (katalog, kategorie, pero, hledání) | `feat: eagle feathers screens` |
| 6 | Skupina | `feat: group screen` |
| 7 | Profil, nastavení, úprava profilu, lidé | `feat: profile, settings and people` |
| 8 | Přihlášení, registrace | `feat: login and registration screens` |
| 9 | úklid, a11y, shrnutí | `chore: cleanup and accessibility pass` |

Každá fáze končí `npm run lint`, `npm run build` a `npm test` bez chyb.
