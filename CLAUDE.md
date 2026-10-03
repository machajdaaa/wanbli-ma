# Wanbli

Mobilní aplikace pro TechCrowd, postavená na Ionic 8 + Angular 20 (standalone
komponenty) a Capacitoru 8 (iOS + Android). Backend běží na
`https://trilobit.onrender.com`; klient k němu je generovaný OpenAPI klient
v `src/app/core/api/generated` (přes `ng-openapi-gen`, `npm run generate:api`).

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
  - `core/api/generated/` — **nikdy needitovat ručně.** Při změně backend API spusť `npm run generate:api`; pokud generovaný klient neodpovídá potřebě, oprava patří do `ng-openapi-gen.json`/backend OpenAPI schématu, ne do vygenerovaného souboru.
- `src/app/auth/` — login/register stránka
- `src/app/nav/` — shell se 4 taby (`nav.routes.ts`)
- `src/app/pages/` — jednotlivé stránky navěšené na taby (home, group, profile, eagle-feathers)
- `src/app/shared/design-system/` — Ionic komponenty restylované přes design tokeny; čisté UI primitivy bez byznys logiky (`ButtonComponent` → `ion-button`, `TextInputComponent` → `ion-input`)
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

- Nová stránka v rámci tab shellu: vytvořit `pages/<name>/`, lazy-registrovat (`loadComponent`) jako child v `nav/nav.routes.ts`. Guardování řeší `authGuard`, kterým je v `app.routes.ts` obalený celý `nav` subtree — jednotlivé taby svůj vlastní `authGuard` nepotřebují.
- Stránka mimo tab shell (např. plnohodnotný modal/detail flow): registrovat v `app.routes.ts`, s `canActivate: [authGuard]`, pokud má být dostupná jen přihlášeným.
- Role-gated stránka: `canActivate: [authGuard, roleGuard]` + `data: { roles: [UserRole.X] }`.

## Konfigurace / API URL

`apiUrl` se bere z `src/environments/environment.ts` (dev) a
`environment.prod.ts` (prod build), swap řeší `fileReplacements` v
`angular.json`. Nikdy nehardcodovat URL backendu přímo v service/komponentě —
vždy přes `environment.apiUrl`.

## Styling

- Tailwind utility třídy namísto Ionic utility CSS (`ion-padding`, `ion-margin-top` apod. — ty importy jsou v `global.scss` záměrně vypnuté). Výjimka: shadow-DOM Ionic komponenty, kam se Tailwind třída nedostane (např. `ion-content` padding přes `[--padding-*]` arbitrary values).
- `src/theme/tokens.scss` je jediný zdroj pravdy pro vizuální hodnoty (`--wanbli-*` CSS custom properties — barvy, radius, typografie, spacing). Nehardcodovat barvy/rozměry v komponentách.
- Ionic komponenty v `design-system/` se restylují přes jejich vlastní CSS custom properties (`--background`, `--border-color`, ...) a `::part()`, ne přepisováním shadow DOM selektorů.
- Globální Ionic mode je `ios` (`src/main.ts`). Pokud konkrétní vzhled existuje jen v `md` módu (např. `ion-input fill="outline"` s floating labelem), vynutit `mode="md"` lokálně na té komponentě — neměnit globální mode.

## Native projekty (android/, ios/)

- Needitovat `android/` a `ios/` ručně bez konkrétního důvodu — generuje/aktualizuje je Capacitor.
- Přidání nového Capacitor pluginu: `npm i <plugin>` → `npx cap sync` → případná oprávnění doplnit ručně do `android/app/src/main/AndroidManifest.xml` a `ios/App/App/Info.plist` (to Capacitor samo nedoplní).
- Po každé změně verze pluginu nebo `capacitor.config.ts` spustit `npx cap sync` znovu.

## Testy

Aktuálně existují jen smoke-test specy (`should create` přes `TestBed` +
`fixture.detectChanges()`), žádné e2e, žádný zavedený postup pro mockování
Capacitor pluginů v testech. Nový spec psát ve stejném minimálním duchu, pokud
úkol nevyžaduje jinak; nevymýšlet mock konvenci, která v repu ještě není.

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
