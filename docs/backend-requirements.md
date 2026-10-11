# Orlí pera – požadavky na backend

Co aplikace potřebuje a API (`trilobit.onrender.com`, OpenAPI klient
v `src/app/core/api/generated`) zatím nevrací. Každý řádek odpovídá značce
`// MOCK(<důvod>)` v kódu – ukázková data jsou jen v `src/app/core/mocks/`
a mapují se ve službách v `src/app/core/services/`. Když backend data doplní,
stačí změnit mapování ve službě a smazat mock; komponenty se nemění.

Stav k 11. 10. 2026 (konec redesignu, fáze 9). Priorita: **P1** = bez toho je
obrazovka z velké části vymyšlená, **P2** = část obrazovky, **P3** = drobnost.

## Příspěvky a feed

| MOCK | Potřeba | Obrazovka | Dnes v API | Návrh | P |
|---|---|---|---|---|---|
| `post feather` | Pero u příspěvku: id, kód, název, světlo, kategorie, Grand challenge | Karta pera (Domů, Skupina, Profil) | jen `userEagleFeatherId` | do `PostResponse` vnořený objekt `eagleFeather { id, code, name, light, section, categoryName }` + `isGrandChallenge` | P1 |
| `post feather` | Výkon: 0–2 metriky (popisek, hodnota, jednotka) | Karta pera | nic | `metrics: [{ label, value, unit }]` u splnění pera (i pro „Splněno 12. 9. · 14,3 s“ v detailu pera) | P1 |
| – (skryto) | Místo na úrovni obce | Karta pera, oznámení | nic | `place: { municipality, region }` u příspěvku; nikdy adresa ani souřadnice | P2 |
| – | Více fotek | Karta pera | jedna `imageUrl` | `imageUrls: string[]` | P2 |
| `likedByMe` | Jestli jsem příspěvek olajkoval | Karta pera (pírko) | nic; stav se drží jen v relaci | `likedByMe: boolean` v `PostResponse`; `POST /likes` idempotentní (nebo 409 při duplicitě) | P1 |
| – | Celé jméno autora | Karta pera | jen `nickname` | `firstName`, `lastName` v `PostAuthorResponse` – **rozhodnout, komu jméno ukazovat** (celá Liga vs. vlastní skupina, děti) | P2 |
| – | Feed „celá Liga“, když nikoho nesleduju | Domů (stav 1b) | nevíme, co `/api/feed` vrací uživateli bez sledovaných | potvrdit chování, případně `GET /api/feed?scope=league` | P1 |
| `user posts` | Příspěvky konkrétního uživatele | Můj profil, cizí profil | nic | `GET /api/users/{id}/posts` (stránkovaně) | P1 |
| `hide post` | Skrýt / nahlásit příspěvek | Menu příspěvku | nic; skrytí jen lokálně do obnovení feedu, nahlášení UI poctivě označí jako nedostupné | `POST /api/posts/{id}/hide`, `POST /api/posts/{id}/report` (nahlášení jde vedoucímu oddílu) – **nahlašování je bezpečnostní funkce pro děti** | P1 |
| `daily challenge` | Denní výzva (název, text, pero) | Domů | nic | `GET /api/challenges/today` → `{ title, text, eagleFeatherId }`; kdo ji vybírá (admin / los) je otevřené | P2 |

## Orlí pera

| MOCK | Potřeba | Obrazovka | Dnes v API | Návrh | P |
|---|---|---|---|---|---|
| `category names` | Název kategorie (sekce) | Katalog, detail kategorie, karta pera, hledání | jen kódy světel a sekcí | `GET /lights/{light}/sections` → `[{ section, code, name }]` místo `string[]` | P1 |
| `category rules` | Pravidla kategorie | Detail kategorie | nic | `rules: string \| null` u sekce | P3 |
| `feather detail` | Co se měří, krátký cíl pro seznam | Detail kategorie, detail pera, hledání | jen texty `challenge`, `grandChallenge` | `measure: string`, `goal: string` u pera | P2 |
| `feather detail` | Limity podle věku a pohlaví | Detail pera (tabulka) | nic | `limits: [{ ageFrom, ageTo, gender, deed, grandChallenge, unit }]`; věkové skupiny pro děti 8–15 (design má 14+) | P2 |
| `feather detail` | Slovníček pojmů | Detail pera | nic | `terms: [{ term, definition }]` | P3 |
| `feather social` | Kolik lidí ze skupiny pero má | Detail pera | nic | `GET /api/eagle-feathers/{id}/group-stats` → `{ count, people: PublicUser[3] }` | P2 |
| `metrics` | Výsledek u splněného Činu | Detail pera („Splněno 12. 9. · 14,3 s“) | jen `earnedAt` | `metrics[]` u `UserEagleFeatherResponse` (viz výkon výše) | P2 |
| – | Formát `section` | všechny obrazovky per | neověřeno (`"A"`? `"1A"`?) | potvrdit; klient zvládne obojí (redesign-plan R7) | P3 |
| – | Fulltext hledání per | Hledání pera | nic | zatím se filtruje celý katalog na klientu – OK do stovek per; později `GET /api/eagle-feathers?query=` | P3 |

## Skupina

| MOCK | Potřeba | Obrazovka | Dnes v API | Návrh | P |
|---|---|---|---|---|---|
| `leaderboard` | Žebříček skupiny podle počtu per | Skupina → Žebříček | nic | `GET /api/organisations/{id}/leaderboard` → `[{ rank, user, featherCount }]` + vlastní řádek | P1 |
| – (skryto) | Oznámení: kdy, kde, vstupné, věk, obrázek | Skupina → Oznámení | jen `title`, `content`, autor (přezdívka) | rozšířit `AnnouncementResponse` o `startsAt`, `endsAt`, `place`, `price`, `minAge`, `imageUrl`, avatar a jméno autora | P2 |
| – | Cover skupiny | Hlavička skupiny | jen `avatarUrl` | `coverUrl` (do té doby ilustrace z designu) | P3 |

## Profil a lidé

| MOCK | Potřeba | Obrazovka | Dnes v API | Návrh | P |
|---|---|---|---|---|---|
| `bio` | Bio (max. 150 znaků) | Profil, úprava profilu, cizí profil | nic; vlastní bio se ukládá jen v zařízení | `bio` v `UserMeResponse`, `UpdateUserRequest`, `PublicUserResponse` | P2 |
| `public profile` / `people stats` | Cizí profil: skupina, počet per, sbírka po světlech, bio | Cizí profil | jen jméno a fotka | rozšířit `PublicUserResponse` o `organisation { id, name }`, `featherCount`, `collection [{ light, done, total }]`, `isFollowedByMe` | P1 |
| `feather count` | Počet per u člena skupiny | Hledání lidí, žebříček | nic | `featherCount` v `OrganisationMemberResponse` | P2 |
| `people search` | Hledání lidí mimo vlastní skupinu | Hledání lidí | nic | `GET /api/users?query=` | P2 |
| – | Nahrání fotky | Úprava profilu (později pera) | nic | upload endpoint (presigned URL / multipart) | P2 |
| – | Změna a obnova hesla | Nastavení, Přihlášení | nic | `POST /api/auth/change-password`, `/forgot-password`, `/reset-password` | P2 |
| `notification settings` | Nastavení notifikací, soukromí, blokování | Nastavení | nic; přepínače jen lokálně | později, spolu s push notifikacemi | P3 |

## Přihlášení a registrace

| MOCK | Potřeba | Obrazovka | Dnes v API | Návrh | P |
|---|---|---|---|---|---|
| – | Přihlášení e-mailem | Přihlášení | jen `nickname`; pole se proto jmenuje „Přezdívka“ | přijímat e-mail i přezdívku | P3 |
| – | Lokalizované chyby validace | Registrace, úprava profilu | `ProblemDetails.errors` s texty serveru | vracet kódy chyb (`nickname_taken`, `email_invalid`…), klient je přeloží | P3 |
| – | Text podmínek používání a ochrany údajů | Registrace, Nastavení | nic | URL nebo endpoint s textem | P2 |
| `group picker` | Výběr oddílu při registraci | Registrace | pozvánky (`organisation-invites`), seznam oddílů není; výběr se neodesílá | rozhodnout tok (pozvánka vs. výběr); případně `GET /api/organisations` (veřejný seznam). Přijetí pozvánky zatím nemá v aplikaci obrazovku | P2 |
| – | Souhlas rodiče pod 15 let | Registrace | nic; UI jen radí registrovat se s rodičem | `parentEmail` v `RegisterRequest` + potvrzovací e-mail; účet dítěte do potvrzení omezený. **Právní požadavek** (GDPR čl. 8, v ČR hranice 15 let) | P1 |
| – | Hodnoty enumu `Gender` | Registrace | `0 \| 1 \| 2` bez názvů | potvrdit význam (klient: 0 = neuvedeno, 1 = kluk, 2 = holka) nebo přidat `x-enum-varnames` | P3 |

## Shrnutí priorit

**P1 – bez toho jsou obrazovky z velké části ukázkové nebo chybí důležitá funkce:**
pero a výkon u příspěvku, `likedByMe`, chování feedu bez sledovaných,
příspěvky uživatele, názvy kategorií, žebříček, rozšířený veřejný profil,
nahlašování příspěvků, souhlas rodiče pod 15 let.

**P2:** místo, více fotek, jméno autora (rozhodnout viditelnost), denní výzva,
limity / co se měří / kdo ze skupiny pero má, výsledek u splnění, rozšířená
oznámení, bio, počty per členů, hledání lidí, upload fotek, změna a obnova
hesla, tok vstupu do oddílu, texty podmínek.

**P3:** pravidla kategorie, slovníček, formát `section`, fulltext per,
cover skupiny, notifikace/soukromí, přihlášení e-mailem, hodnoty `Gender`,
lokalizované chyby validace.

