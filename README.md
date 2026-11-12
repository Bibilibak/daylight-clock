# Zegar światła (daylight-clock)

Interaktywny zegar światła w przeglądarce. Czas pokazuje w **stopniach obrotu Ziemi**, a nie w godzinach: tarcza liczy od wschodu Słońca w wybranym miejscu na Ziemi, a kalendarz od położenia Ziemi na orbicie.

**▶ Otwórz: https://bibilibak.github.io/daylight-clock/**

Strona działa na komputerze i telefonie. Nic nie trzeba instalować, ale można ją dodać do ekranu głównego telefonu: otwiera się wtedy jak aplikacja i działa bez internetu (poza wyszukiwaniem miast).

Strona ma trzy zakładki: **Doba**, **Rok** i **Kalendarz**. Miejsce jest wspólne dla wszystkich zakładek.

## Doba

### Tarcza zegara
- **Pierścień dnia i nocy**: kolor każdego kawałka pierścienia odpowiada wysokości Słońca w tej chwili doby (noc, zmierzch, niebieska godzina, złota godzina, dzień).
- **Wskazówka Słońca** pokazuje kąt Słońca. Tarcza liczy od wschodu: wschód to 0° po lewej stronie.
- Na tarczy są zaznaczone **wschód**, **górowanie**, **zachód** i **środek nocy**. W środku tarczy widać odległość od najbliższego z nich (np. „12° 30′ do południa”) i długość dnia w stopniach.
- **Księżyc**: srebrna wskazówka oraz łuk pokazujący, kiedy Księżyc jest nad horyzontem.
- **Wydarzenia**: możesz dodać własne punkty dnia, np. „Lekcja 08:00”, i zobaczyć je na tarczy. Przy każdym wydarzeniu widać jego kąt od wschodu. Godzina odnosi się do strefy czasowej wybranego miasta.

### Słońce i Księżyc w liczbach
- Kąt Słońca od wschodu, wysokość Słońca nad horyzontem, największa wysokość Słońca dzisiaj (w chwili górowania) i stopnie światła, które zostały do zachodu.
- Faza Księżyca (nów, kwadry, pełnia…) i procent oświetlenia.
- **Miesiąc księżycowy** jako siatka dni w dwóch rzędach: *przybywa* (od nowiu do pełni) i *ubywa* (od pełni do nowiu). Dni to doby kalendarza (od słonecznej północy): dzień 1 to doba, w której wypada nów, a cykl ma 29 albo 30 dni. Ikony faz stoją w dniach, w których fazy naprawdę wypadają, a ↻ oznacza dobę, w której Księżyc kończy pełną orbitę (miesiąc syderyczny). Kliknięty dzień pokazuje kafelek: datę w kalendarzu klimatycznym, kąt Słońce–Księżyc, oświetlenie, drogę Księżyca po orbicie i chwile faz w stopniach doby (np. „Pełnia: 18° od wschodu”). Chwile podajemy w pełnych stopniach (1° = 4 min), bo uproszczony model Księżyca nie daje większej dokładności.
- Obsługa **dnia polarnego** i **nocy polarnej**: doba na tarczy biegnie wtedy od słonecznej północy.

### Wizualizacja 3D
Sfera niebieska, którą można obracać, przeciągając rysunek: horyzont, droga Słońca, oś Ziemi i ekliptyka. Suwaki zmieniają obrót Ziemi, szerokość geograficzną i deklinację Słońca. Przyciski ustawiają *teraz*, przesilenia (21 cze, 21 gru) i równonoc.

## Rok
- **Orbita**: koło orbity, które czyta się jak tarczę doby (wschód roku, czyli równonoc marcowa, po lewej, południe roku u góry). Datą jest kąt przebyty w porze roku, np. „32,46° wieczoru roku”. Lupa pokazuje 4° orbity, w których każda doba to pas noc / dzień / noc. Koło można przeciągać, a przyciski przesuwają czas o godzinę albo dobę.
- **Długość dnia**: długość dnia w ciągu całego roku jako **wykres** lub **pętla**. Pokazuje, czy światła przybywa, czy ubywa (i o ile stopni na dobę), oraz ile dni zostało do najdłuższego i najkrótszego dnia.

## Kalendarz
Kalendarz klimatyczny: rok zaczyna się wiosną, w dniu równonocy: na półkuli północnej marcowej (kąt roku 0°), na południowej wrześniowej (180°). Półkula wynika z wybranego miejsca, a w urodzinach z miejsca urodzenia. Rok podpisany jest jak „2026/27”, bo obejmuje dwa lata gregoriańskie. Każda pora roku to 90° drogi Ziemi wokół Słońca, podzielone na 3 miesiące po 30°: **wczesna**, **pełna** i **późna** (np. wczesna wiosna, pełna wiosna, późna wiosna). Na półkuli południowej pory roku są odwrócone. Między zwrotnikami nazwy są takie jak na danej półkuli, bo kalendarz jest wspólny dla całej Ziemi. Miesiące mają od 29 do 32 dni. Doba zaczyna się o słonecznej północy (połowa drogi między dwoma górowaniami), więc daty prawie zawsze zgadzają się z gregoriańskimi: dzień 1 miesiąca to doba, w której Ziemia przechodzi przez jego granicę.
- **Kalendarz** (widok domyślny): cały rok, 12 miesięcy w rzędach po 10 dni. Kliknięcie w rok pozwala wpisać dowolny rok (1000–3000).
- **Koło**: rok jako koło kąta roku, które obraca się palcem, myszą albo strzałkami, i dni wybranego miesiąca.
- Kropka oznacza równonoc lub przesilenie, ◆ dzień, w którym Ziemia jest najdalej lub najbliżej Słońca (aphelium, peryhelium).
- Przy wybranym dniu: data, światło dnia, faza Księżyca i dzień cyklu księżycowego. Zdarzenia tego dnia (równonoc, przesilenie, początek miesiąca, aphelium, peryhelium, główne fazy Księżyca) mają podaną chwilę w stopniach doby, np. „Równonoc: 299° od wschodu”.
- **Urodziny na orbicie**: data, godzina i miejsce urodzenia dają datę w kalendarzu klimatycznym, dokładny kąt w porze roku i porę doby. Tabela i „drabina lat” pokazują, w który dzień Ziemia wraca co roku na kąt urodzin.
- **Dlaczego żaden kalendarz nie jest idealny**: tabela kompromisów między rokiem, miesiącem i dobą.

## Astrologia (panel ☰)
Wysuwany panel z filtrami (przy przewiniętej stronie ☰ czeka w rogu ekranu), domyślnie wszystko wyłączone (w przyszłości funkcje płatne):
- **Znak Słońca** i **znak Księżyca**: symbol w kółku Słońca (zamiast liczby stopni, która zostaje w kafelku i w środku tarczy) i na ikonie Księżyca, nazwa i stopień w nagłówkach „Słońce” / „Księżyc”, a przy urodzinach znaki w chwili urodzenia.
- **Zmiany znaków**: w nagłówkach także najbliższa zmiana, np. „→ ♐ 22 lis 08:23” (godzina w wybranym mieście).
- **Znaki na tarczach i w kalendarzu** (przy „Zmianach znaków”): na tarczy doby kreska tam, gdzie Księżyc zmieni znak (ikona Księżyca dotyka jej w chwili zmiany); w zakładce Rok pierścień znaków na kole orbity (kolory: żywioły, a w gwiazdozbiorach tęcza), nazwa bieżącego znaku pod kołem i granice znaków w lupie. W Kalendarzu kliknięcie nazwy miesiąca otwiera widok miesiąca z dużymi kafelkami: przeskoki Księżyca i Słońca z kątem Słońca w chwili zmiany; w widoku roku i w Kole kropki w dniach przeskoków.
- Jeden z trzech systemów: **zachodni** (12 równych znaków od równonocy), **wedyjski** (12 równych znaków od gwiazd, ajanamsa Lahiri; inne warianty ajanamsy dają granice przesunięte nawet o ok. 1,5°, notatka jest w panelu i w `js/zodiac.js`) i **gwiazdozbiory** (13, z Wężownikiem, granice IAU na ekliptyce). Przy gwiazdozbiorach podfiltr **Księżyc według nieba**: Księżyc w gwiazdozbiorze, w którym naprawdę go widać z wybranego miejsca (odchodzi od ekliptyki do 5°, więc bywa też w Orionie, Wielorybie, Woźnicy, Kruku albo Sekstansie). Dla Słońca nie ma różnicy, bo leży na ekliptyce.
- Dokładność w latach 1900-2100: Księżyc ok. 20" (Meeus, rozdz. 47), Słońce ok. 2" (VSOP87), czyli zmiana znaku z dokładnością do ok. minuty. Dla lat 1000-1900 i 2100-3000 tylko orientacyjnie (Księżyc do kilku minut kątowych), bo spowolnienie obrotu Ziemi (ΔT) znamy tam w przybliżeniu. Granice gwiazdozbiorów według Roman (1987). Testy: `npm test` (porównanie z biblioteką astronomy-engine).

## Miejsce
- Wyszukiwanie miasta po nazwie,
- „Użyj mojej lokalizacji”,
- albo ręczne wpisanie współrzędnych.
- ☆ zapisuje miejsce na liście, a kliknięcie nazwy miejsca rozwija listę zapisanych miejsc do szybkiego podglądu. ⌂ ustawia oglądane miejsce jako Twoje.

## Języki
Polski, English, Español, Deutsch, Français, Italiano, Português, Українська, العربية.

## Prywatność
Wybrane miejsca, wydarzenia, język i ustawienia widoku zostają tylko w Twojej przeglądarce (`localStorage`). Wyszukiwanie miast korzysta z darmowego [Open-Meteo Geocoding API](https://open-meteo.com/). Wysyłana jest tylko wpisana nazwa miasta. Pełna polityka prywatności: [privacy.html](privacy.html).

## Uruchomienie lokalnie
Wystarczy otworzyć `index.html` w przeglądarce. Projekt to czysty HTML, CSS i JavaScript, bez bibliotek i bez budowania (biblioteka astronomy-engine służy tylko testom).

```
index.html          – układ strony
css/style.css       – wygląd
js/I18n.js          – tłumaczenia (PL, EN, ES) i funkcje języka (t, setLang)
js/I18n-more.js     – pozostałe języki
js/I18n-astro.js    – tłumaczenia astrologii (panel ☰, nazwy znaków i gwiazdozbiorów)
js/zodiac.js        – dokładny Księżyc (Meeus), znaki w czterech systemach, granice gwiazdozbiorów IAU
js/main.js          – obliczenia Słońca i Księżyca, doby, tarcza, wydarzenia, miejsce, miesiąc księżycowy, zakładki
js/view3d.js        – wizualizacja 3D
js/year.js          – zakładka Rok: przełącznik Orbita / Długość dnia, wykres i pętla
js/orbit.js         – obliczenia kalendarza orbity (granice miesięcy, apsydy, daty)
js/astro-ui.js      – panel ☰ z filtrami astrologii, symbole znaków na tarczy
js/calendar.js      – zakładka Kalendarz, urodziny
js/orbitwheel.js    – zakładka Rok, widok Orbita: koło orbity i lupa
sw.js               – działanie bez internetu (service worker; po zmianie podnieś w nim CACHE)
manifests/          – manifesty aplikacji do zainstalowania, po jednym na język
assets/             – ikony aplikacji (icon.svg i PNG)
privacy.html        – polityka prywatności (PL, EN)
scripts/icons.ps1   – tworzy ikony strony i aplikacji (PowerShell)
scripts/copy-web.js – kopiuje pliki strony do www/ dla aplikacji
test/               – testy obliczeń (npm test)
capacitor.config.json, package.json, android/ – aplikacja na Androida (Capacitor)
```

Skrypty ładują się w tej kolejności i korzystają ze wspólnych zmiennych globalnych z `main.js` (`lat`, `lon`, `tz`, `R`) oraz funkcji obliczeń (`sunDay`, `sunLonDeg`, `elong`…).

Po zmianie plików CSS lub JS podnieś numer `?v=` w `index.html`, żeby przeglądarki pobrały nową wersję.

### Aplikacja na Androida
Aplikacja to ta sama strona opakowana w [Capacitor](https://capacitorjs.com/) (identyfikator `app.lightclock`). Potrzebne są Node.js i Android Studio. Raz: `npm install`. Potem `npm run android` kopiuje pliki strony do aplikacji i otwiera projekt w Android Studio, gdzie przyciskiem Run uruchamia się ją na telefonie albo w emulatorze. Szczegóły w [NASTEPNE-KROKI.md](NASTEPNE-KROKI.md).

Otwarte i podjęte decyzje projektowe są opisane w [OTWARTE-PYTANIA.md](OTWARTE-PYTANIA.md), a ważne kroki przed wydaniem aplikacji w [NASTEPNE-KROKI.md](NASTEPNE-KROKI.md).

## Plan rozwoju
- [ ] Równanie czasu
- [ ] Reguły i nazwy okresów w kalendarzu „kąta roku”
- [ ] Nowa grafika tarczy
- [x] Dni miesiąca księżycowego liczone od słonecznej północy (zob. [OTWARTE-PYTANIA.md](OTWARTE-PYTANIA.md))
