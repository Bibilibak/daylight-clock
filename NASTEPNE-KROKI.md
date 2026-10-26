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

Kolejne kroki, żeby z strony zrobić aplikację:
- ikony aplikacji (różne rozmiary dla iOS i Androida) i ekran startowy,
- plik manifestu (`manifest.webmanifest`) i działanie bez internetu (service worker), bo bez sieci działa wtedy wszystko poza wyszukiwaniem miast,
- opakowanie w Capacitor (projekty Xcode i Android Studio),
- polityka prywatności na osobnej stronie (wymagana przez oba sklepy),
- opisy uprawnień (lokalizacja) dla iOS i Androida,
- decyzja, co będzie płatne (np. widżet na ekran główny, powiadomienia, zegarek), i jednorazowy zakup „Pro” w aplikacji.
