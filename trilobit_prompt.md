# Orlí pera – plán dokončení aplikace a prompt

Oct 11, 2026 · @Jan Macháček

## 1. Současný stav

Aplikace má hotový základ, tedy přihlášení, napojení na API a feed na Domů. Zbytek konceptu chybí: tři ze čtyř záložek jsou prázdné šablony a design odpovídá ještě starým návrhům.

**Stack:** Ionic 8 (standalone, režim iOS) + Angular se signály a novým control flow, Capacitor Preferences pro tokeny a Tailwind v4 (jen utility). API klient je generovaný z OpenAPI (ng-openapi-gen) pro backend na `trilobit.onrender.com`. Funguje JWT s refresh tokenem, auth guard i role guard.

| Část | Stav v kódu | Co ukazuje design |
| --- | --- | --- |
| Přihlášení + registrace | Jedna stránka s přepínačem, výchozí Ionic hlavička „Wanbli“, nativní `<select>` pro pohlaví | Dvě samostatné obrazovky (9, 10) s orlem, zobrazením hesla a „Zapomněl/a jsi heslo?“ |
| Domů | Feed s nekonečným scrollem, statická karta daily challenge s lorem textem | Pozdrav, lupa, 3 stavy (sleduju / nikoho / prázdné), nová karta pera, menu příspěvku |
| Karta příspěvku | `ActivityCard`: přezdívka, datum, text, 1 fotka, ♥ a 💬 jako emoji | Autor + místo, štítek světla, název pera, Grand challenge, výkon, 1–3+ fotek, pírko |
| Orlí pera | Prázdná šablona | Katalog po světlech, detail kategorie, detail pera, hledání pera |
| Skupina | Prázdná šablona | Hlavička skupiny, taby Příspěvky / Oznámení / Žebříček |
| Profil | Prázdná šablona | Profil, sbírka, nastavení, úprava profilu, cizí profil, hledání lidí |
| Navbar | `ion-tab-bar` se 4 záložkami, oddělovači, popisky a megafonem u Skupiny | Plovoucí pilulka, jen ikony, prostřední tlačítko 64 px |
| Tokeny | `tokens.scss` s prefixem `--wanbli-`, staré barvy, chybí stavy, světla a stíny | Kompletní paleta v `design/screens/Main.dc.html` |
| Fonty | Nunito na UI, Inter na text, Baloo 2 jen v řezu 800 | Inter na UI i text, Baloo 2 v řezech 700 a 800 |

**Co v API už je, ale aplikace to nepoužívá:** lajky, sledování, detail uživatele, skupina a její členové, feed skupiny, oznámení, katalog per (světla → sekce → pera) a moje pera (`/api/user/eagle-feathers`).

**Drobnosti, které je potřeba opravit:**

- `index.html` má `lang="en"` a titulek „Ionic App“.
- `global.scss` stylují globálně `h1`–`h3` a `p`, např. `h1` je oranžový 14 px. To se bije s typografií v designu.
- `enums.ts` má `UserRole.Admin = 2`, ale vygenerovaný typ z API je jen `0 | 1`.
- API má komentáře, koncept je zatím nechce. Počet komentářů z karty zmizí.
- V zipu nebyla složka `public/assets`, takže jsem nemohl zkontrolovat ikony a obrázky. Nové ikony budou inline SVG podle designu.

**Podklady pro Claude Code:** přikládám balíček `orli-pera-design.zip` se složkou `design/`. Jsou v ní všechny obrazovky z canvasu (29 souborů), README s mapou obrazovka → route a tři obrázky orla. Rozbal ho do kořene repa vedle `src/`.

## 2. Co je potřeba udělat

Většina práce je ve frontendu. Asi třetina obrazovek ale potřebuje data, která API zatím nevrací (poslední tabulka této sekce). Frontend proto bude číst data přes vlastní služby s view-modely. Kde backend data nemá, služba vrátí ukázková data a díru zapíše do seznamu požadavků na backend.

### 2.1 Design systém a základ

- **Tokeny:** přepsat `theme/tokens.scss` na hodnoty z `design/screens/Main.dc.html` a ponechat prefix `--wanbli-`. Doplnit chybějící skupiny: stavy (success, warning, danger), 4 barvy světel včetně světlé plochy a tmavého textu štítku, Grand challenge, medaile, stíny navbaru a prostředního tlačítka, radiusy 8/12/16/24/full a spacing až 40. Struktura musí umožnit pozdější dark mode, tedy žádné natvrdo zapsané barvy v komponentách.
- **Tailwind:** napojit tokeny do `@theme`, aby šly třídy jako `bg-surface` nebo `text-forest-500`.
- **Fonty:** odebrat Nunito a vše přepnout na Inter. Přidat Baloo 2 v řezu 700 (variabilní font nebo statický řez), protože H2 a H3 jsou v designu 700.
- **Typografie:** zrušit globální styly `h1`–`h3` a `p` v `global.scss` a nahradit je třídami podle typové škály: Display, H1, H2, H3, Metric, Body L, Body, Label, Caption, Overline.
- **Lokalizace:** koncept říká, že systém má být připravený na další jazyky. Navrhuju Transloco s `cs.json` a veškerý text přes klíče. Formátovat čísla a data česky („11,25 s“, „dnes 9:00“, „včera 17:40“, „4. 10. 14:30“).
- **Další základ:** v `index.html` nastavit `lang="cs"` a titulek „Orlí pera“. Pozadí `ion-content` bude z tokenů, šablonové `ion-header` zmizí.

**Sdílené komponenty** (`shared/design-system`), všechny se stavy z `Main.dc.html`:

| Komponenta | Varianty a stavy |
| --- | --- |
| Button | primární, sekundární, textové, destruktivní × default, stisknuto, disabled, načítání |
| TextInput | label nad polem, focus, chyba s textem, nápověda, počítadlo znaků, zobrazení hesla |
| SearchInput | s lupou a křížkem na vymazání |
| SegmentedControl | 2–4 segmenty, lepkavý při scrollu |
| Avatar | squircle 32 / 40 / 56 / 96, fotka nebo iniciály na barevném podkladu |
| Badge | Grand challenge, Splněno, Oznámení, Vedoucí, Ty, Čin (splněno / nesplněno) |
| LightTag | štítek kategorie: římská číslice + název, barva podle světla |
| ProgressBar | v barvě světla |
| Toggle | zapnuto, vypnuto, disabled |
| SettingsRow / SettingsGroup | navigace, s hodnotou, s přepínačem, destruktivní |
| BottomSheet | menu příspěvku |
| Toast | úspěch, chyba s tlačítkem „Zkusit znovu“ |
| EmptyState | orel, nadpis, věta, tlačítko |
| Skeleton | karta příspěvku, řádek seznamu |

### 2.2 Navigace

- **Plovoucí navbar** podle `NavBar.dc.html`: bílá pilulka 16 px od okrajů a 60 px vysoká, 4 ikony bez popisků (popisky jen v `aria-label`) a prostřední oranžové tlačítko 64 px s prstencem. Respektuje safe area, obsah stránek má dole rezervu a pod navbarem je přechod do pozadí. Ikona Skupiny je skupina lidí místo megafonu.
- **Prostřední tlačítko** zatím vede na placeholder „Nahrání pera připravujeme“. Formulář se bude navrhovat později.
- **Nové routy:** `/register`, `/search` (hledání lidí), `/users/:id` (cizí profil), `/settings`, `/profile/edit`, `/nav/eagle-feathers/category/:light/:section`, `/nav/eagle-feathers/feather/:id`, `/nav/eagle-feathers/search` a `/upload` (placeholder).
- **Klik na avatar nebo jméno** kdekoli (karta, žebříček, hledání) otevře cizí profil. U vlastního účtu otevře Profil.

### 2.3 Karta pera

`ActivityCard` nahradí nová `PostCard` podle `PostCard.dc.html` a všech variant v `KartaPera.dc.html`:

1. Autor: avatar 40, jméno, „obec, kraj · relativní čas“, vpravo tlačítko „…“.
2. Štítek světla s názvem kategorie a odznak Grand challenge.
3. Název pera.
4. Výkon: 0–2 metriky (popisek + velké číslo + jednotka). Bez výkonu se zobrazí odznak „Splněno“.
5. Fotky: 1 fotka na celou šířku, 2 vedle sebe, 3 a víc v mřížce s překryvem „+N“.
6. Pírko (lajk) s optimistickým přepnutím přes `like-post` / `unlike-post`. Komentáře se nezobrazují.

**Menu příspěvku** (bottom sheet): u cizího příspěvku nabídne Zobrazit profil, Přestat sledovat, Skrýt a Nahlásit. U vlastního Upravit a Smazat s potvrzením.

### 2.4 Domů

- Hlavička „Ahoj, {jméno}!“ a tlačítko lupy, které vede na hledání lidí.
- Daily challenge: vizuál zůstává, texty se aktualizují podle designu. Data jsou zatím statická, protože API nemá endpoint pro denní výzvu. Tlačítko „Do toho!“ otevře detail příslušného pera.
- Stavy obrazovky:
  - načítání: skeleton karet,
  - chyba: zpráva a tlačítko Zkusit znovu,
  - sleduju lidi: nadpis „Od kamarádů“,
  - nikoho nesleduju: karta „Tady jsou pera z celé organizace“ s tlačítkem „Najít kamarády“ a nadpis „Z celé Ligy“,
  - prázdný feed: orel a text „Zatím tu je ticho“.
- Pull-to-refresh a nekonečný scroll zůstávají.

### 2.5 Orlí pera

- **Katalog** (`OrliPera.dc.html`): tmavě zelený banner s tlačítkem „Začít“, které vede na hledání pera. Pod ním sekce 1.–4. světlo, každá s horizontálně scrollovanými kartami kategorií (kód, název, splněno/celkem a progress). Taby „Začínáme / Podle úrovní“ zmizí.
- **Detail kategorie** (`KategorieDetail.dc.html`): hlavička v barvě světla, kód, název, „X ze Y per splněno“, počet Grand challenge, progress a pravidla kategorie (zkrácená, s tlačítkem „Celá pravidla“). Pod tím seznam per se stavem Čin a Grand challenge.
- **Detail pera** (`PeroDetail.dc.html`): kód, název, co se měří a stav Činu i Grand challenge. Dál texty úkolů, tabulka limitů podle věku s přepínačem muži/ženy, slovníček pojmů a kolik lidí ze skupiny pero má. Tlačítko „Přidat splnění“ nebo „Začít s perem“ vede na placeholder nahrání.
- **Hledání pera** (`VyhledaniPera.dc.html`): hledá podle názvu bez ohledu na diakritiku i podle kódu („4A1“), nabízí rychlé čipy a má stavy výchozí, výsledky a nic nenalezeno.
- **Zdroj dat:** `get-eagle-feather-lights` → `…/sections` → `…/sections/{section}` a pro stav „mám / nemám“ `/api/user/eagle-feathers`.

### 2.6 Skupina

- **Hlavička:** cover, avatar skupiny přes okraj coveru, název, počet členů a popis na 3 řádky s tlačítkem „více“. Data jsou z `get-organisation` podle `organisationId` přihlášeného uživatele.
- **Segmentovaný přepínač** Příspěvky / Oznámení / Žebříček se při scrollu přilepí nahoru.
- **Příspěvky:** stejné karty jako na Domů, data z `get-organisation-feed`.
- **Oznámení:** karta se štítkem Oznámení, autorem s odznakem Vedoucí, názvem, textem a volitelným obrázkem. Pod tím info blok s ikonami Kdy, Kde, Vstupné a Věk. Jen ke čtení, bez lajků a bez přihlašování.
- **Žebříček:** pódium v pořadí 2–1–3 v barvách medailí, řádky od 4. místa a vlastní řádek se štítkem „Ty“. Když vlastní řádek není vidět, připne se nad navbar.
- V aplikaci nejsou žádné admin funkce. Oznámení i schvalování per patří do administrace.

### 2.7 Profil, nastavení a lidé

- **Můj profil:** avatar 96, jméno, přezdívka, štítek skupiny a bio. Statistiky Orlí pera / Sledující / Sleduji, tlačítko Upravit profil, Moje sbírka (progres ve 4 světlech) a Moje příspěvky. Ikona ozubeného kola vede do nastavení.
- **Nastavení** (`Nastaveni.dc.html`):
  - Účet: osobní údaje, změnit heslo,
  - Aplikace: notifikace se 4 přepínači, tmavý režim, jazyk,
  - Soukromí: kdo vidí moje pera, zablokovaní lidé,
  - O aplikaci: podmínky, ochrana údajů, verze,
  - Odhlásit se.

  Notifikace a tmavý režim se zatím jen ukládají lokálně. Tmavý režim bude mít popisek „Brzy“ a bude neaktivní. Když backend něco nepodporuje, řádek se zobrazí jako neaktivní.
- **Upravit profil:** fotka (změna fotky čeká na upload endpoint), jméno, přezdívka s nápovědou a bio na 150 znaků s počítadlem.
- **Hledání lidí:** pole hledání, „Návrhy ze tvé skupiny“ (členové z `get-organisation-members`) a řádky s tlačítkem Sledovat / Sleduješ.
- **Cizí profil:** stejná struktura jako vlastní profil, místo úpravy je tlačítko Sledovat / Sleduješ a chybí nastavení.

### 2.8 Přihlášení a registrace

- Dvě samostatné obrazovky podle `Prihlaseni.dc.html` a `Registrace.dc.html`, s orlem, zobrazením hesla a chybami u polí místo alertu.
- Odkaz „Zapomněl/a jsi heslo?“ zatím vede na informační obrazovku, protože chybí endpoint.
- **Rozpor design × API:** formulář v designu má jedno pole „Jméno a příjmení“, výběr oddílu, souhlas s podmínkami a upozornění pro děti pod 15 let. API ale vyžaduje zvlášť jméno a příjmení, datum narození a pohlaví. Do rozhodnutí (sekce 5) se ponechají pole, která API vyžaduje, ve vzhledu podle designu.

### 2.9 Co chybí v API

| Potřeba | Pro obrazovku | Dnes v API | Návrh |
| --- | --- | --- | --- |
| Pero u příspěvku (název, kód, světlo, kategorie, Grand challenge) | Karta pera | Jen `userEagleFeatherId` | Přidat do `PostResponse` vnořený objekt pera |
| Výkon (hodnota + jednotka, až 2 metriky) | Karta pera | Není | Pole `metrics[]` u splnění pera |
| Místo (obec, kraj) | Karta pera | Není | Pole `place` u příspěvku |
| Více fotek | Karta pera | Jedna `imageUrl` | `imageUrls[]` |
| Lajkl jsem? | Karta pera | Není | `likedByMe: boolean` |
| Celé jméno autora | Karta pera | Jen přezdívka | Rozhodnout (sekce 5), případně `firstName`, `lastName` |
| Feed „celá Liga“, když nikoho nesleduju | Domů | Nevím, jestli to `/api/feed` dělá | Příznak ve feedu nebo samostatný endpoint |
| Daily challenge | Domů | Není | `GET /api/challenges/today` |
| Skrýt / nahlásit příspěvek | Menu příspěvku | Není | `POST /api/posts/{id}/hide`, `/report` |
| Názvy kategorií a pravidla | Orlí pera | Sekce vrací jen řetězce | Vracet kód, název a pravidla |
| Limity podle věku a pohlaví, slovníček | Detail pera | Jen texty `challenge`, `grandChallenge` | Strukturované limity |
| Kolik lidí ze skupiny má pero | Detail pera | Není | Počet + 3 jména |
| Fulltext hledání per | Hledání pera | Není | Zatím lze filtrovat na klientu z celého katalogu |
| Žebříček | Skupina | Není | `GET /api/organisations/{id}/leaderboard` |
| Oznámení: kdy, kde, vstupné, věk, obrázek, avatar autora | Skupina | Jen název a text | Rozšířit `AnnouncementResponse` |
| Cover skupiny | Skupina | Jen `avatarUrl` | `coverUrl` |
| Hledání lidí | Hledání lidí | Není | `GET /api/users?query=` |
| Statistiky, bio, skupina a sbírka cizího uživatele | Cizí profil | Jen jméno a fotka | Rozšířit `PublicUserResponse` a přidat „sleduju ho?“ |
| Bio | Profil | Není | Pole `bio` |
| Nahrání fotky | Upravit profil (později i pera) | Není | Upload endpoint |
| Změna a obnova hesla | Nastavení, Přihlášení | Není | 2 endpointy |
| Přihlášení e-mailem | Přihlášení | Jen přezdívka | Přijmout obojí |
| Soukromí, blokování, nastavení notifikací | Nastavení | Není | Později, zatím lokálně |

## 3. Pořadí práce

Práce je rozdělená do 9 fází. Každá končí buildem bez chyb a commitem, takže můžeš po kterékoli fázi zastavit a zkontrolovat výsledek. Fáze 1–3 jsou základ pro všechno ostatní, fáze 5–8 na sobě nezávisí.

0. **Průzkum a plán:** Claude projde kód a složku `design/`, založí `CLAUDE.md` a `docs/redesign-plan.md` a počká na tvůj souhlas.
1. **Základ:** tokeny, Tailwind `@theme`, fonty, typografické třídy, Transloco s `cs.json`, české formátování čísel a času, `index.html`.
2. **Komponenty:** všechny ze sekce 2.1 a stránka `/dev/ui` jen pro vývojové prostředí, kde jsou všechny stavy vidět pohromadě.
3. **Navigace a datová vrstva:** plovoucí navbar, nové routy, placeholder nahrání pera, služby s view-modely a mock fallbackem a soubor `docs/backend-requirements.md`.
4. **Karta pera a Domů:** PostCard, menu příspěvku, lajky a všechny stavy Domů.
5. **Orlí pera:** katalog, detail kategorie, detail pera, hledání pera.
6. **Skupina:** hlavička, příspěvky, oznámení, žebříček.
7. **Profil a lidé:** můj profil, nastavení, úprava profilu, hledání lidí, cizí profil, sledování.
8. **Přihlášení a registrace:** dvě nové obrazovky.
9. **Úklid:** smazat `ActivityCard`, Nunito a nepoužívané ikony, opravit testy, zkontrolovat a11y a dotykové plochy 44 px, dopsat `backend-requirements.md` a shrnutí všech míst, kde jsou ukázková data.

Máš dvě možnosti, jak to pustit. Buď pošleš celý prompt najednou a Claude projde fáze sám, nebo ho pustíš fázi po fázi a každou zkontroluješ. Doporučuju druhou možnost aspoň pro fáze 0–4. Tam se nastavuje vzhled, který pak používají všechny další obrazovky.

## 4. Prompt pro Claude Code

Nejdřív rozbal `orli-pera-design.zip` do kořene repa, takže vedle `src/` vznikne `design/`. Pak pusť Claude Code v kořeni repa a vlož text níže. Prompt je napsaný tak, aby se po fázi 0 zastavil a počkal na tvůj souhlas s plánem.

```text
Dokončíme mobilní aplikaci „Orlí pera“ (kódové jméno Wanbli) podle nového designu a konceptu. Pracuj po fázích níže. Po fázi 0 se zastav a počkej na můj souhlas.

# O aplikaci
Sociální síť ve stylu Stravy pro děti 8–15 let z oddílů Ligy lesní moudrosti. Děti plní „orlí pera“ (výzvy jako Běh na 100 m), sdílejí je, sledují se a dávají si „pírka“ (lajky). Pera jsou rozdělená do 4 světel (1.–4. světlo), každé světlo do kategorií (kód např. 1A = Atletika – běhy) a každá kategorie obsahuje pera (kód např. 1A1 = Běh na 100 m). Každé pero má „Čin“ a těžší variantu „Grand challenge“. Aplikace není jen pro oddíl Trilobit, ale pro všechny oddíly Ligy. Název oddílu proto nikde nepiš natvrdo.

# Zdroje pravdy
1. Složka design/ v kořeni repa: export obrazovek z Claude Design. Začni souborem design/README.md, kde je popsaný formát .dc.html a mapa obrazovka → route. Inline styly v souborech jsou přesné hodnoty (px při šířce 390). Ukázková data jsou v renderVals(). design/screens/Main.dc.html je design systém (barvy, typografie, spacing, radiusy, ikony, komponenty se stavy). design/screens/MapaAplikace.dc.html ukazuje, kam která obrazovka vede.
2. Pravidla konceptu (níže). Když se design a koncept liší, platí koncept.
3. Když něco není v designu ani v konceptu, rozhodni rozumně, zapiš rozhodnutí do docs/redesign-plan.md a pokračuj.

# Pravidla konceptu
- Role v této aplikaci: dítě a vedoucí. Vedoucí má v aplikaci stejné možnosti jako dítě. Oznámení, schvalování per a správa členů jsou v samostatné administraci. V této aplikaci nevytvářej žádné admin obrazovky ani tlačítka.
- Schvalování per se v UI vůbec neukazuje: žádné stavy čeká / potvrzeno / zamítnuto.
- Dítě je členem právě jedné skupiny (organisationId uživatele).
- Feed na Domů ukazuje příspěvky lidí, které sleduju. Když nikoho nesleduju, ukazuje pera z celé Ligy (stav 1b).
- Příspěvky mají pírka (lajky). Komentáře API má, ale v UI nebudou.
- Žebříček skupiny je celkový a řadí podle počtu per. Každé pero má hodnotu 1.
- Poloha jen na úrovni obce: „Choltice, Pardubický kraj“. Nikdy přesnou adresu ani mapu.
- Oznámení jsou jen informace, bez lajků a bez přihlašování na akci.
- UI je česky a tyká. Texty ber z designu. Systém musí být připravený na další jazyky.
- Zatím se nenavrhuje: formulář nahrání pera (prostřední tlačítko navbaru, „Přidat splnění“, „Začít s perem“), dark mode, detail příspěvku, push notifikace a logo. Pro nahrání pera udělej jen placeholder stránku /upload. Pro dark mode připrav strukturu tokenů, ale neimplementuj ho.

# Technická pravidla
- Stack zůstává: Ionic 8 standalone (mode ios), Angular se signály a novým control flow, OnPush, Capacitor, Tailwind v4. Nepřidávej UI knihovny.
- src/app/core/api/generated/ needituj, je generovaná. API volá jen přes služby v core/services.
- Datová vrstva: každá obrazovka čte data přes službu, která vrací view-model (např. PostCardVm, LeaderboardRowVm, FeatherDetailVm). Kde API data má, mapuj je. Kde chybí, doplň ukázková data v jednom místě (core/mocks/), označ je komentářem // MOCK(<důvod>) a přidej řádek do docs/backend-requirements.md: co chybí, pro kterou obrazovku a navrhovaný endpoint nebo pole. Když backend data doplní, mění se jen mapování ve službě.
- Barvy, rozměry a fonty jen přes tokeny (CSS proměnné --wanbli-* a Tailwind @theme). Žádné hex hodnoty v komponentách.
- Texty přes Transloco (@jsverse/transloco), soubor assets/i18n/cs.json. Čísla a data formátuj česky: „11,25 s“, „dnes 9:00“, „včera 17:40“, „4. 10. 14:30“, „1 pero / 2 pera / 5 per“.
- Přístupnost: skutečné button / a / input, aria-label u tlačítek jen s ikonou, dotykové plochy min. 44 px, kontrast min. WCAG AA.
- Ikony: inline SVG podle Main.dc.html (lineární, tah 2 px). Ikona pírka je hlavní symbol (lajk, počet per, prostřední tlačítko).
- Kód a komentáře anglicky jako zbytek repa. Commit po každé fázi. Na konci každé fáze musí projít build, lint a testy. Testy, které rozbiješ změnou, oprav.
- Když můžeš spustit aplikaci a prohlížeč, zkontroluj každou obrazovku při šířce 390 px proti inline stylům v design/.

# Světla (používaj všude stejně)
| světlo | římsky | barva (tečka, progress) | plocha štítku | text štítku |
| 1 | I | #5B8C3A | #E3ECDA | #2F5A1A |
| 2 | II | #3D7EA6 | #DCE9F1 | #1F4E6B |
| 3 | III | #B5523B | #F3E0DA | #7A2E1E |
| 4 | IV | #D4A017 | #F6ECCB | #6B4F00 |
Grand challenge: plocha #FCEFB4, text #5A4200, hvězda #B88A0E. Kód kategorie = světlo + sekce (1A), kód pera = kód kategorie + číslo (1A1). Názvy kategorií jsou v design/screens/Kategorie.dc.html. Dokud je API nevrací, dej je do konstanty.

# Fáze
0. Průzkum a plán. Projdi src/ a design/. Založ CLAUDE.md (stack, konvence, pravidla výše ve zkratce) a docs/redesign-plan.md (seznam obrazovek a komponent, routy, view-modely, pro každou obrazovku zdroj dat API nebo MOCK a seznam rozporů, které jsi našel). ZASTAV SE a počkej na můj souhlas.
1. Základ. Přepiš theme/tokens.scss na hodnoty z Main.dc.html (ponech prefix --wanbli-, doplň stavy, světla, Grand challenge, medaile, stíny, radiusy 8/12/16/24/full, spacing 4–40). Napoj tokeny do Tailwind @theme. Odeber Nunito, vše přepni na Inter a přidej Baloo 2 v řezu 700 (H2 a H3). Zruš globální styly h1–h3 a p v global.scss a nahraď je třídami typové škály (Display, H1, H2, H3, Metric, Body L, Body, Label, Caption, Overline). Nastav Transloco a formátovací pipes. V index.html nastav lang="cs" a titulek „Orlí pera“.
2. Komponenty v shared/design-system se všemi stavy z Main.dc.html: Button (primární, sekundární, textový, destruktivní × default, stisknuto, disabled, loading), TextInput (label nad polem, focus, chyba, nápověda, počítadlo, zobrazení hesla), SearchInput, SegmentedControl (lepkavý), Avatar (squircle 32/40/56/96, iniciály na barevném podkladu bez fotky), Badge, LightTag, ProgressBar, Toggle, SettingsRow a SettingsGroup, BottomSheet, Toast, EmptyState, Skeleton. Přidej stránku /dev/ui (jen mimo produkční build), kde jsou všechny pohromadě.
3. Navigace a data. Plovoucí navbar podle NavBar.dc.html: bílá pilulka 16 px od okrajů, výška 60, 4 ikony 26 px bez popisků (popisky v aria-label), aktivní položka s podkladem orange-100 56×44 a vyplněnou ikonou, prostřední tlačítko 64 px s prstencem v barvě pozadí, safe area a přechod do pozadí pod ním. Ikona Skupiny je skupina lidí. Routy: /nav/home, /nav/eagle-feathers (+ /category/:light/:section, /feather/:id, /search), /nav/group, /nav/profile, /search, /users/:id, /settings, /profile/edit, /login, /register, /upload. Vytvoř služby s view-modely, core/mocks/ a docs/backend-requirements.md.
4. Karta pera a Domů. Nahraď ActivityCard komponentou PostCard podle PostCard.dc.html a všech variant v KartaPera.dc.html (autor + místo + relativní čas, menu „…“, LightTag + Grand challenge, název, 0–2 metriky nebo „Splněno“, 1 / 2 / 3+ fotky, pírko s optimistickým přepnutím přes like-post a unlike-post). Menu příspěvku jako bottom sheet: cizí (Domu-MenuPrispevku) a vlastní (Profil-MenuPrispevku, smazání s potvrzením). Domů: pozdrav s jménem, lupa na /search, DailyChallenge (vizuál podle DailyChallenge.dc.html, data zatím MOCK, „Do toho!“ otevře detail pera), stavy načítání / chyba / sleduju (Domu) / nikoho nesleduju (Domu-Nesleduji) / prázdné (Domu-Prazdny), pull-to-refresh a nekonečný scroll.
5. Orlí pera. OrliPera (banner + „Začít“ vede na hledání, sekce 4 světel s horizontálními kartami kategorií a progresem), KategorieDetail, PeroDetail (tabulka limitů s přepínačem muži/ženy, slovníček, kolik lidí ze skupiny pero má, CTA na /upload), VyhledaniPera (bez diakritiky, podle kódu, čipy, 3 stavy). Data: get-eagle-feather-lights, …/sections, …/sections/{section} a stav uživatele z /api/user/eagle-feathers.
6. Skupina. Hlavička (cover, avatar, název, počet členů, popis na 3 řádky + „více“), lepkavý SegmentedControl a taby Příspěvky (get-organisation-feed), Oznámení (Skupina-Oznameni: info blok Kdy / Kde / Vstupné / Věk) a Žebříček (Skupina-Zebricek + Skupina-Zebricek-Scroll: pódium 2–1–3, vlastní řádek připnutý nad navbarem). Klik na člověka otevře /users/:id.
7. Profil a lidé. Profil (statistiky, Moje sbírka po světlech, moje příspěvky), Nastaveni (všechny skupiny řádků, notifikace a tmavý režim jen lokálně přes Preferences, tmavý režim neaktivní s popiskem „Brzy“, Odhlásit se volá AuthService.logout), UpravitProfil (update-current-user, bio max. 150 znaků), Hledani (návrhy z get-organisation-members, follow-user a unfollow-user), CiziProfil.
8. Přihlášení a registrace jako dvě obrazovky podle Prihlaseni a Registrace. Chyby zobrazuj u polí nebo v Toastu, ne v AlertControlleru. „Zapomněl/a jsi heslo?“ zatím vede na informační obrazovku. Registrace musí poslat všechna pole, která vyžaduje RegisterRequest (jméno a příjmení zvlášť, datum narození s date pickerem, pohlaví jako segmentovaný výběr). Vzhled ber z designu. Výběr oddílu a souhlas rodiče pod 15 let zobraz podle designu. Kde na to chybí API, označ to MOCK.
9. Úklid. Smaž ActivityCard, Nunito a nepoužívané assety, oprav UserRole v enums.ts podle API (0 | 1), zkontroluj a11y a 44 px, dopiš docs/backend-requirements.md a na konci mi pošli shrnutí: co je hotové, co běží na MOCK datech a co potřebuje backend.

Výchozí rozhodnutí, dokud je nezměním: u autora příspěvku a v žebříčku zobrazuj jméno a příjmení, když je API vrací, jinak přezdívku.
```

## 5. Otevřené otázky

Na žádné z těchto otázek nemusíš čekat se spuštěním promptu, protože má pro každou výchozí řešení. Každá ale ovlivní, kolik obrazovek poběží na ukázkových datech.

- [ ] **Backend:** kdo ho dělá a dostanou se do něj požadavky z tabulky 2.9? Bez nich zůstane na ukázkových datech žebříček, hledání lidí, daily challenge, většina karty pera a detail pera.
- [ ] **Jméno, nebo přezdívka?** Design ukazuje u karet a v žebříčku celé jméno, API vrací jen přezdívku. U dětí bych zvážil, jestli celé jméno ukazovat všem v Lize, nebo jen členům vlastní skupiny.
- [ ] **Registrace:** design má jedno pole „Jméno a příjmení“, výběr oddílu a souhlas rodiče pod 15 let, ale nemá datum narození ani pohlaví. API pohlaví i datum narození vyžaduje a bez data narození nejde poznat, kdo je pod 15. Bude potřeba upravit design, nebo API.
- [ ] **Vstup do oddílu:** API má pozvánky do skupiny (organisation-invites), design má výběr oddílu při registraci. Který způsob platí?
- [ ] **Přihlášení e-mailem:** design říká „E-mail nebo přezdívka“, API bere jen přezdívku.
- [ ] **Fotky:** kam se budou nahrávat (profilovky, později fotky k perům)? Bez upload endpointu nejde změnit fotku profilu.
- [ ] **Daily challenge:** odkud se bude brát? Vybere ji někdo ručně v administraci, nebo se bude losovat?
- [ ] **Feed bez sledovaných:** vrací `/api/feed` příspěvky z celé Ligy, když uživatel nikoho nesleduje?
- [ ] **Složka `public/assets`:** nebyla v zipu. Pokud jsou v ní vlastní ikony nebo obrázky, které chceš zachovat, řekni Claudovi v promptu, aby je nemazal.
- [ ] **Název:** v kódu je „Wanbli“, v designu „Orlí pera“. Prompt nechává Wanbli jako interní kódové jméno (prefix tokenů) a v UI používá „Orlí pera“.
