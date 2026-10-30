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
Kalendarz klimatyczny: rok zaczyna się w dniu równonocy marcowej (kąt roku 0°), tym samym dla całej Ziemi. Każda pora roku to 90° drogi Ziemi wokół Słońca, podzielone na 3 miesiące po 30°: **wczesna**, **pełna** i **późna** (np. wczesna wiosna, pełna wiosna, późna wiosna). Na półkuli południowej pory roku są odwrócone. Między zwrotnikami nazwy są takie jak na danej półkuli, bo kalendarz jest wspólny dla całej Ziemi. Miesiące mają od 29 do 32 dni. Doba zaczyna się o słonecznej północy (połowa drogi między dwoma górowaniami), więc daty prawie zawsze zgadzają się z gregoriańskimi: dzień 1 miesiąca to doba, w której Ziemia przechodzi przez jego granicę.
- **Kalendarz** (widok domyślny): cały rok, 12 miesięcy w rzędach po 10 dni. Kliknięcie w rok pozwala wpisać dowolny rok (1000–3000).
- **Koło**: rok jako koło kąta roku, które obraca się palcem, myszą albo strzałkami, i dni wybranego miesiąca.
- Kropka oznacza równonoc lub przesilenie, ◆ dzień, w którym Ziemia jest najdalej lub najbliżej Słońca (aphelium, peryhelium).
- Przy wybranym dniu: data, światło dnia, faza Księżyca i dzień cyklu księżycowego. Zdarzenia tego dnia (równonoc, przesilenie, początek miesiąca, aphelium, peryhelium, główne fazy Księżyca) mają podaną chwilę w stopniach doby, np. „Równonoc: 299° od wschodu”.
- **Urodziny na orbicie**: data, godzina i miejsce urodzenia dają datę w kalendarzu klimatycznym, dokładny kąt w porze roku i porę doby. Tabela i „drabina lat” pokazują, w który dzień Ziemia wraca co roku na kąt urodzin.
- **Dlaczego żaden kalendarz nie jest idealny**: tabela kompromisów między rokiem, miesiącem i dobą.

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
Wystarczy otworzyć `index.html` w przeglądarce. Projekt to czysty HTML, CSS i JavaScript, bez bibliotek i bez budowania.

```
index.html          – układ strony
css/style.css       – wygląd
js/I18n.js          – tłumaczenia (PL, EN, ES) i funkcje języka (t, setLang)
js/I18n-more.js     – pozostałe języki
js/main.js          – obliczenia Słońca i Księżyca, doby, tarcza, wydarzenia, miejsce, miesiąc księżycowy, zakładki
js/view3d.js        – wizualizacja 3D
js/year.js          – zakładka Rok: przełącznik Orbita / Długość dnia, wykres i pętla
js/orbit.js         – obliczenia kalendarza orbity (granice miesięcy, apsydy, daty)
js/calendar.js      – zakładka Kalendarz, urodziny
js/orbitwheel.js    – zakładka Rok, widok Orbita: koło orbity i lupa
sw.js               – działanie bez internetu (service worker; po zmianie podnieś w nim CACHE)
manifests/          – manifesty aplikacji do zainstalowania, po jednym na język
assets/             – ikony aplikacji (icon.svg i PNG)
privacy.html        – polityka prywatności (PL, EN)
```

Skrypty ładują się w tej kolejności i korzystają ze wspólnych zmiennych globalnych z `main.js` (`lat`, `lon`, `tz`, `R`) oraz funkcji obliczeń (`sunDay`, `sunLonDeg`, `elong`…).

Po zmianie plików CSS lub JS podnieś numer `?v=` w `index.html`, żeby przeglądarki pobrały nową wersję.

Otwarte i podjęte decyzje projektowe są opisane w [OTWARTE-PYTANIA.md](OTWARTE-PYTANIA.md), a ważne kroki przed wydaniem aplikacji w [NASTEPNE-KROKI.md](NASTEPNE-KROKI.md).

## Plan rozwoju
- [ ] Równanie czasu
- [ ] Reguły i nazwy okresów w kalendarzu „kąta roku”
- [ ] Nowa grafika tarczy
- [x] Dni miesiąca księżycowego liczone od słonecznej północy (zob. [OTWARTE-PYTANIA.md](OTWARTE-PYTANIA.md))
