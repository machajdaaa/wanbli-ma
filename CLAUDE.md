# Wanbli (v UI „Orlí pera“)

Mobilní aplikace pro TechCrowd, postavená na Ionic 8 + Angular 20 (standalone
komponenty) a Capacitoru 8 (iOS + Android). Backend běží na
`https://trilobit.onrender.com`; klient k němu je generovaný OpenAPI klient
v `src/app/core/api/generated` (přes `ng-openapi-gen`, `npm run generate:api`).

„Wanbli“ je interní kódové jméno (prefix tokenů `--wanbli-*`, appId); v UI se
aplikace jmenuje **Orlí pera**.

## Produkt a koncept

Sociální síť ve stylu Stravy pro děti 8–15 let z oddílů Ligy lesní moudrosti.
Děti plní „orlí pera“, sdílejí je, sledují se a dávají si „pírka“ (lajky).

- Hierarchie: **světlo** (1–4) → **kategorie** (kód `1A` = světlo + sekce,
  např. Atletika – běhy) → **pero** (kód `1A1` = kategorie + číslo). Každé pero
  má **Čin** a těžší **Grand challenge**. Kódy kategorií přeskakují X
  (`2W → 2Y`, `3Z → 3AA`) – nikdy je nedopočítávat z indexu.
- Aplikace je pro **všechny oddíly Ligy** – název oddílu (Trilobit) nikdy
  natvrdo, vždy z dat skupiny.
- Role: dítě a vedoucí mají v aplikaci **stejné možnosti**. Žádné admin
  obrazovky ani tlačítka (oznámení, schvalování per, správa členů jsou
  v samostatné administraci).
- Schvalování per se v UI **vůbec neukazuje** (žádné čeká/potvrzeno/zamítnuto).
- Dítě je členem právě jedné skupiny (`organisationId`).
- Feed Domů = lidé, které sleduju; když nikoho, pera z celé Ligy.
- Pírka ano, **komentáře v UI ne** (i když je API má).
- Žebříček skupiny je celkový, řadí podle počtu per (pero = 1 bod).
- Poloha jen na úrovni obce („Choltice, Pardubický kraj“), nikdy adresa ani mapa.
- Oznámení jsou jen ke čtení – bez pírek a bez přihlašování na akci.
- UI česky, **tyká**. Texty z designu, přes Transloco (připraveno na další jazyky).
- Zatím se nenavrhuje: formulář nahrání pera (jen placeholder `/upload`),
  dark mode (jen struktura tokenů), detail příspěvku, push notifikace, logo.

## Redesign – zdroje pravdy

- `design/` – export obrazovek z Claude Design; začni `design/README.md`
  (formát `.dc.html`, mapa obrazovka → route). Inline styly = přesné hodnoty
  v px při šířce 390. `design/screens/Main.dc.html` je design systém.
  `design/` se neshipuje, je to jen reference.
- Když se design a koncept liší, platí koncept. Co není ani v jednom, rozhodni
  rozumně a zapiš do `docs/redesign-plan.md` (sekce Rozhodnutí).
- `docs/redesign-plan.md` – obrazovky, komponenty, view-modely, rozpory,
  rozhodnutí. `docs/backend-requirements.md` – co chybí v API.
- `trilobit_prompt.md` – původní zadání redesignu (fáze 0–9).

## Datová vrstva a mocky

- Obrazovka čte data jen přes službu v `core/services/`, která vrací
  view-model (`PostCardVm`, `FeatherDetailVm`, …), ne generované API typy.
- Kde API data chybí: ukázková data **jen v `core/mocks/`**, označit
  `// MOCK(<důvod>)` a přidat řádek do `docs/backend-requirements.md`
  (co chybí, pro kterou obrazovku, navržený endpoint/pole). Když backend data
  doplní, mění se jen mapování ve službě.
- U skutečných entit z API se mockují jen pole nutná pro layout; pole, která
  by vypadala jako fakt o skutečném člověku/akci (místo, termín akce), se
  radši skryjí (viz R5 v `docs/redesign-plan.md`).

## Příkazy

- `npm start` — dev server (`ng serve`)
- `npm run lint` — musí projít bez chyb před dokončením úkolu
- `npm test` — Karma/Jasmine unit testy; jeden soubor: `npm test -- --include <cesta-ke-spec-souboru>`
- `npm run build` — produkční build (`ng build`)
- `npx cap sync` — po buildu nebo po přidání/aktualizaci Capacitor pluginu, přegeneruje native projekty
- `npm run generate:api` — přegenerování OpenAPI klienta v `core/api/generated` podle `ng-openapi-gen.json`

## Struktura aplikace

- `src/app/core/` — guards, interceptor, services, generovaný API klient
  - `guards/auth.guard.ts` — `authGuard`, přesměruje na `/login`, pokud `AuthService.ensureAuthenticated()` vrátí `false`
  - `guards/role.guard.ts` — `roleGuard`, čte `route.data['roles']: UserRole[]`; bez rolí v `data` propustí každého přihlášeného. Jestli a kde je aktuálně navěšený, zkontroluj přímo v `app.routes.ts`/`nav.routes.ts` (`canActivate`) — tahle informace rychle zastarává.
  - `interceptors/auth.interceptor.ts` — přidává `Authorization: Bearer <token>`, na 401 (mimo `/api/auth/login` a `/api/auth/refresh`) zkusí refresh a request zopakuje
  - `services/auth.service.ts` — `AuthService`, signals (`currentUser`, `isLoggedIn`, `userRole`)
  - `services/storage.service.ts` — `StorageService`, token storage přes `@capacitor/preferences` + in-memory cache (viz Known debt níže — **není** to Keychain/Keystore)
  - `services/api-client.ts` — `ApiClient.call(fn, params)` / `allPages(fn, params)`: Observable obal nad generovanými `fn/*` funkcemi. Datové služby volají API jen přes něj.
  - datové služby (vrací view-modely): `FeedService`, `PostService` (pírka, mazání), `PeopleService` (sledování – signál `followingIds`), `EagleFeatherService` (katalog se cachuje celý), `GroupService`, `ProfileService`, `ChallengeService`, `SettingsService`
  - `services/mappers.ts` — sdílené mapování (`toPerson`, `displayName`, `categoryCode`, `normalizeSearch`)
- `src/app/core/models/` — `view-models.ts` (všechny `*Vm`), `light.ts` (`Light`, `LIGHTS`)
- `src/app/core/mocks/` — jediné místo pro ukázková data, každé s `// MOCK(<důvod>)` a řádkem v `docs/backend-requirements.md`
- `src/app/pages/placeholder/` — obecná „připravujeme“ stránka konfigurovaná přes route `data` (`/upload` natrvalo, ostatní dočasně do své fáze)
  - `core/api/generated/` — **nikdy needitovat ručně.** Při změně backend API spusť `npm run generate:api`; pokud generovaný klient neodpovídá potřebě, oprava patří do `ng-openapi-gen.json`/backend OpenAPI schématu, ne do vygenerovaného souboru.
- `src/app/auth/` — login/register stránka
- `src/app/nav/` — shell se 4 taby (`nav.routes.ts`)
- `src/app/pages/` — jednotlivé stránky navěšené na taby (home, group, profile, eagle-feathers)
- `src/app/shared/design-system/` — čisté UI primitivy bez byznys logiky podle `Main.dc.html`: `Button`, `TextInput`, `SearchInput`, `SegmentedControl`, `Avatar`, `Badge`, `LightTag`, `ProgressBar`, `Toggle`, `SettingsGroup`/`SettingsRow`, `BottomSheet`, `Toast` (+ `ToastService`), `EmptyState`, `Skeleton`, `Icon` (sada ikon v `icon/icons.ts`), mapa světel `lights.ts`. Postavené na **nativních** `button`/`input`/`a` stylovaných Tailwindem; Ionic jen tam, kde přidává chování (`BottomSheet` = inline `ion-modal`). Všechny stavy jsou vidět na `/dev/ui` (jen dev build).
- `src/app/shared/components/` — složitější, feature-specific komponenty, které skládají primitivy z `design-system/` (`ActivityCardComponent`, `DailyChallengeCardComponent`)
- `android/`, `ios/` — generované native projekty, needitovat bez konkrétního důvodu (viz Native projekty níže)

Nová jednoduchá, znovupoužitelná UI komponenta (bez byznys logiky) patří do
`design-system/`. Komponenta vázaná na konkrétní feature/stránku, i když
interně používá `design-system/` primitivy, patří do `components/`.

## Auth / RBAC

- JWT access + refresh token se ukládají přes `StorageService` (klíče `AUTH_TOKEN`, `REFRESH_TOKEN`).
- `AuthService.ensureAuthenticated()` — na rozdíl od `isAuthenticated()` zkusí refresh token, pokud je access token expirovaný, takže reload stránky nenutí uživatele znovu se přihlásit.
- `authInterceptor` dělá stejný refresh-and-retry i na 401 odpověď z API.
- Role se čtou z `UserRole` enumu (`core/api/enums.ts`), `AuthService.hasRole()` / `hasAnyRole()`.

**Known debt — token storage není bezpečné úložiště.** `@capacitor/preferences`
ukládá na iOS do `UserDefaults` a na Androidu do `SharedPreferences` — to je
nešifrované, aplikačně-scoped úložiště, ne Keychain/Keystore. Access i refresh
token jsou tam teď v čitelné podobě. Než se to řeší, braní to jako akceptované
riziko pro tuto fázi vývoje; při skutečné potřebě bezpečného úložiště (hlavně
pro refresh token) sáhnout po pluginu typu `@capacitor-community/secure-storage`
nebo `capacitor-secure-storage-plugin`, ne po vlastní šifrovací vrstvě nad
Preferences.

## Angular/Ionic konvence

- Jen standalone komponenty (žádné NgModules).
- `ChangeDetectionStrategy.OnPush` na všech komponentách.
- Signals (`input()`, `signal()`, `computed()`) pro stav a reaktivitu — ne `BehaviorSubject`/RxJS subjects pro komponentní state (RxJS zůstává pro HTTP/async toky v services).
- Funkční guards a interceptors (`CanActivateFn`, `HttpInterceptorFn`) s `inject()`, ne class-based varianty.
- `tsconfig.json` má `strictTemplates: true` — Ionic Inputs mívají úzké typy (např. `AutocompleteTypes`, `TextFieldTypes`); typovat přes ně, ne přes obecný `string`.
- Capacitor pluginy (`@capacitor/*`) se volají přes service v `core/services/`, nikdy přímo z komponenty — stejně jako `StorageService` obaluje `@capacitor/preferences`.

## Routing

- Nová stránka v rámci tab shellu: vytvořit `pages/<name>/`, lazy-registrovat (`loadComponent`) jako child v `nav/nav.routes.ts`. Podstránka tabu (detail kategorie, pera…) patří mezi `children` cesty svého tabu (`eagle-feathers/category/...`), aby zůstala v jeho stacku a s navbarem. Guardování řeší `authGuard`, kterým je v `app.routes.ts` obalený celý `nav` subtree — jednotlivé taby svůj vlastní `authGuard` nepotřebují.
- Navbar je restylovaný `ion-tab-bar` (`nav/nav.page.*`), plovoucí přes obsah; `app-nav ion-content` má v `global.scss` spodní padding na jeho výšku + safe area. Tlačítko zpět = `<app-back-button [fallback]>` (Ionic stack, bez historie na `fallback`).
- Stránka mimo tab shell (`/search`, `/users/:id`, `/settings`, `/profile/edit`, `/upload`): registrovat v `app.routes.ts`, s `canActivate: [authGuard]`, pokud má být dostupná jen přihlášeným. Nemá navbar, má tlačítko zpět.
- Role-gated stránka: `canActivate: [authGuard, roleGuard]` + `data: { roles: [UserRole.X] }`.

## Konfigurace / API URL

`apiUrl` se bere z `src/environments/environment.ts` (dev) a
`environment.prod.ts` (prod build), swap řeší `fileReplacements` v
`angular.json`. Nikdy nehardcodovat URL backendu přímo v service/komponentě —
vždy přes `environment.apiUrl`.

## Styling

- Tailwind utility třídy namísto Ionic utility CSS (`ion-padding`, `ion-margin-top` apod. — ty importy jsou v `global.scss` záměrně vypnuté). Výjimka: shadow-DOM Ionic komponenty, kam se Tailwind třída nedostane (např. `ion-content` padding přes `[--padding-*]` arbitrary values).
- `src/theme/tokens.scss` je jediný zdroj pravdy pro vizuální hodnoty (`--wanbli-*` CSS custom properties — barvy, radius, typografie, spacing). Nehardcodovat barvy/rozměry v komponentách.
- Ionic komponenty (`ion-content`, `ion-modal`, `ion-tab-bar`…) se restylují přes jejich vlastní CSS custom properties (`--background`, ...) a `::part()`, ne přepisováním shadow DOM selektorů. Styly presented overlayů (`ion-modal` se přesouvá do rootu) patří do `src/theme/overlays.scss`.
- Globální CSS Ionicu je v cascade layer `ionic` (nejnižší, `global.scss`), takže Tailwind utility ho vždy přebijí. Ionic `typography.css` se neimportuje. Neimportovat Ionic CSS bez `layer(ionic)`.
- Tailwind generuje jen třídy nalezené v kódu jako literál – dynamické třídy skládat z celých názvů (viz `LIGHT_STYLES` v `lights.ts`), nikdy `'bg-light-' + n`. Angular binding `[class.h-[52px]]` neprojde parserem – třídy s `[]` skládat v `computed`.
- Globální Ionic mode je `ios` (`src/main.ts`). Pokud konkrétní vzhled existuje jen v `md` módu, vynutit `mode="md"` lokálně na té komponentě — neměnit globální mode.
- Tokeny mají dvě vrstvy: `--wanbli-palette-*` (surové barvy, nepoužívat
  v komponentách) a `--wanbli-color-*` / `--wanbli-radius-*` / … (sémantické).
  Dark mode později přepíše jen sémantickou vrstvu. Žádné hex hodnoty mimo
  `tokens.scss`.
- Tailwind je nastavený v `src/tailwind.css` (čisté CSS – Sass neumí v4
  syntaxi `--color-*: initial`). Výchozí palety, radiusy, fonty a stíny jsou
  vypnuté; existují jen třídy z tokenů: `bg-surface`, `bg-surface-raised`,
  `text-text`, `text-text-muted`, `border-border`, `bg-light-1-surface`,
  `text-forest-500`, `rounded-12`, `rounded-full`, `font-display`,
  `shadow-navbar`… V šablonách preferovat třídy před `var(--wanbli-*)` v SCSS.
- Typografie přes utility `type-display`, `type-h1`, `type-h2`, `type-h3`,
  `type-metric`, `type-body-l`, `type-body`, `type-label`, `type-caption`,
  `type-overline` (barva zvlášť). Globální `h1`–`h6`/`p` nemají žádný styl.
  Fonty: Inter (UI i text), Baloo 2 (nadpisy, čísla výkonů).
- Ikony: inline SVG podle `Main.dc.html` (lineární, tah 2 px). Pírko je hlavní
  symbol (lajk, počet per, prostřední tlačítko navbaru).

## i18n a formátování

- Všechny UI texty přes Transloco (`@jsverse/transloco`), klíče
  v `public/assets/i18n/cs.json`. Žádný český text natvrdo v šabloně.
  Konfigurace v `core/i18n/i18n.config.ts` (`provideI18n()`); překlady se
  načtou v app initializeru, takže `TranslocoService.translate()` funguje
  synchronně.
- Čísla a data česky přes pipes ze `shared/pipes/`: `relativeTime`
  („dnes 9:00“, „včera 17:40“, „středa 16:05“, „4. 10. 14:30“), `decimal`
  („11,25“), `plural:'feathers'` („1 pero / 2 pera / 5 per“, klíče
  `plural.<noun>.one|few|many|other`). Logika je v `core/i18n/format.ts`.

## Přístupnost

- Skutečné `button` / `a` / `input`, `aria-label` u tlačítek jen s ikonou.
- Dotykové plochy min. 44 px (i když je vizuál menší – rozšířit hit area).
- Kontrast min. WCAG AA (známé výjimky z designu viz `docs/redesign-plan.md`).

## Native projekty (android/, ios/)

- Needitovat `android/` a `ios/` ručně bez konkrétního důvodu — generuje/aktualizuje je Capacitor.
- Přidání nového Capacitor pluginu: `npm i <plugin>` → `npx cap sync` → případná oprávnění doplnit ručně do `android/app/src/main/AndroidManifest.xml` a `ios/App/App/Info.plist` (to Capacitor samo nedoplní).
- Po každé změně verze pluginu nebo `capacitor.config.ts` spustit `npx cap sync` znovu.

## Testy

Aktuálně existují jen smoke-test specy (`should create` přes `TestBed` +
`fixture.detectChanges()`), žádné e2e, žádný zavedený postup pro mockování
Capacitor pluginů v testech. Nový spec psát ve stejném minimálním duchu, pokud
úkol nevyžaduje jinak; nevymýšlet mock konvenci, která v repu ještě není.

- Smoke specy používají `providers: provideTestDefaults()` ze
  `src/testing/test-providers.ts` (HttpClient + testing backend, router,
  Transloco s reálným `cs.json`). Bez HttpClientu `should create` spadne
  na NG0201. Komponentu s `input.required()` nastavit přes
  `fixture.componentRef.setInput(...)` před `detectChanges()`.
- Vizuální kontrolu při 390 px dělat přes emulaci zařízení (CDP `Emulation.setDeviceMetricsOverride`), ne `--window-size=390`: headless Chrome má minimální šířku okna ~500 px a snímek pak jen ořízne širší layout.
- Karma spouští Chrome. Když Chrome není nainstalovaný (tenhle stroj má jen
  Brave): `CHROME_BIN="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm test -- --watch=false --browsers=ChromeHeadless`.
- Na konci každé fáze redesignu musí projít `npm run lint`, `npm run build`
  i `npm test`; testy rozbité změnou opravit.

## Gotchas

- Backend běží na Renderu na free tieru — po delší nečinnosti může první
  request trvat desítky sekund (cold start). Vypadá to jako timeout/bug, není.
- Scaffoldované stránky/komponenty (Ionic/Angular generátor) mívají prázdný
  `ngOnInit`/`constructor` navíc — `@angular-eslint/no-empty-lifecycle-method`
  to odmítne; pokud není co inicializovat, `implements OnInit` i metodu smazat
  (viz `HomePage` jako referenční minimální tvar).
- Scaffoldované `.spec.ts` soubory pro standalone komponenty někdy nesou starý
  NgModule-styl šablony (`declarations: [...]` místo `imports: [...]`) — při
  psaní nového spec souboru pro standalone komponentu použít `imports`.

## Zákazy

- Neupgradovat major verze Ionic/Angular/Capacitor bez výslovného zadání.
- Nepřidávat novou závislost bez vysvětlení proč (a bez ověření, že neexistuje
  už použitý ekvivalent).
- Necommitovat `www/`, `dist/`, `node_modules/` ani jiné build výstupy.

## Jazyk

UI texty (labely, tlačítka, chybové hlášky) jsou v češtině. Kód, komentáře a
commit message jsou v angličtině.
