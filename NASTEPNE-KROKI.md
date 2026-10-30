# Następne kroki

Ważne sprawy z przeglądu kodu (26 października 2026), zanim Zegar światła trafi do App Store i Google Play. Każdy punkt wymaga decyzji, więc nie został jeszcze zrobiony.

---

## 1. Licencja

Repozytorium jest publiczne i nie ma licencji. Bez licencji nikt formalnie nie może używać kodu, ale każdy może go zobaczyć i skopiować.

Przed płatną aplikacją trzeba zdecydować:
- czy kod zostaje otwarty (np. licencja MIT albo GPL), czy repozytorium staje się prywatne,
- czy wersja na stronie (GitHub Pages) zostaje darmowa, skoro aplikacja będzie miała płatne funkcje.

Uwaga: GitHub Pages na darmowym koncie wymaga publicznego repozytorium.

## 2. Struktura kodu

Pliki komunikują się przez wspólne zmienne globalne z `js/main.js` (`lat`, `lon`, `tz`, `R`) i funkcje obliczeń (`sunDay`, `sunLonDeg`, `elong`…). `js/calendar.js` nawet podmienia na chwilę `lat` / `lon` / `tz` przy liczeniu urodzin (`atPlace()`).

To działa, ale jest kruche: zmiana w jednym pliku może niezauważenie zepsuć inny, a nowej osobie trudniej się w tym połapać.

Możliwy kierunek:
- wydzielić obliczenia astronomiczne (Słońce, Księżyc, doby, kalendarz orbity) do osobnego pliku, który przyjmuje miejsce jako argument, zamiast czytać zmienne globalne,
- podzielić `js/main.js` (ok. 900 linii) na części: obliczenia, tarcza, miejsce, miesiąc księżycowy, zakładki,
- przejść na moduły JavaScript (`import` / `export`).

To spora zmiana, więc najlepiej zrobić ją po punkcie 3, żeby testy pilnowały, że nic się nie zepsuło.

## 3. Testy automatyczne

Nie ma żadnych testów. Przed wydaniem w sklepach przydałby się choćby zestaw, który sprawdza obliczenia dla kilku trudnych miejsc i dat:
- Warszawa (zwykły przypadek, zmiana czasu letniego),
- Svalbard / Tromsø (dzień i noc polarna, dni przejściowe),
- Sydney (półkula południowa, odwrócone pory roku),
- Samoa (UTC+13, data inna niż w urządzeniu),
- okolice biegunów (±89,9°),
- równik (0°, 0°).

Testy powinny sprawdzać, że nigdzie nie pojawia się `NaN` ani `undefined`, że wschód i zachód zgadzają się ze znanymi danymi (np. z tablic NOAA) i że granice miesięcy oraz fazy Księżyca wypadają w dobrych dobach.

## 4. Przygotowanie pod aplikację

### Etap 1: PWA, czyli strona do zainstalowania (zrobione 30 października 2026)
- [x] ikona: tarcza z pierścieniem w kolorach nieba (`assets/icon.svg`, PNG 32, 180, 192 i 512 px, wersje maskowalne dla Androida),
- [x] manifesty w 9 językach (`manifests/<język>.webmanifest`); strona podmienia manifest i nazwę pod ikoną po zmianie języka,
- [x] działanie bez internetu (`sw.js`): po pierwszym otwarciu strona działa offline, poza wyszukiwaniem miast,
- [x] polityka prywatności (`privacy.html`, PL i EN), link w stopce strony.

Do zrobienia przez Ciebie: uzupełnij w `privacy.html` miejsca oznaczone **[UZUPEŁNIJ]** / **[FILL IN]** (twórca, e-mail, data).

Jak sprawdzić: otwórz https://bibilibak.github.io/daylight-clock/ na telefonie i wybierz „Dodaj do ekranu głównego” (iPhone: Udostępnij → Do ekranu początkowego; Android: menu ⋮ → Zainstaluj aplikację). Potem włącz tryb samolotowy i otwórz zegar z ikony.

### Etap 2: aplikacja w sklepach (do zrobienia)
- opakowanie w Capacitor (wymaga Node.js; projekt Android Studio, a dla iOS Maca albo usługi w chmurze, np. Codemagic),
- ekran startowy (Capacitor tworzy go z ikony i koloru tła `#fff7ea`),
- uprawnienie do lokalizacji: wystarczy przybliżona lokalizacja (Android: tylko `ACCESS_COARSE_LOCATION`, iOS: „Przybliżona” wystarczy), bo do wschodu Słońca dokładność kilku kilometrów nie ma znaczenia. Gotowe opisy zgody:
  - iOS `NSLocationWhenInUseUsageDescription`, PL: „Lokalizacja służy tylko do obliczenia wschodu i zachodu Słońca w Twoim miejscu. Nie jest nigdzie wysyłana.”
  - EN: “Your location is used only to calculate sunrise and sunset where you are. It is never sent anywhere.”
- decyzja, co będzie płatne (np. widżet na ekran główny, powiadomienia, zegarek), i jednorazowy zakup „Pro” w aplikacji,
- konta deweloperskie: Apple (99 USD rocznie), Google Play (25 USD jednorazowo, zamknięte testy z 12 testerami przez 14 dni).
