# Zegar słoneczny (daylight-clock)

Interaktywny zegar słoneczny w przeglądarce. Czas pokazuje w **stopniach obrotu Ziemi**, a nie w godzinach: liczy od wschodu albo od południa słonecznego w wybranym miejscu na Ziemi.

**▶ Otwórz: https://bibilibak.github.io/daylight-clock/**

Strona działa na komputerze i telefonie. Nic nie trzeba instalować.

## Co pokazuje strona

### Tarcza zegara
- **Pierścień dnia i nocy**: jasny łuk to dzień, ciemny to noc, w wybranym miejscu i w dzisiejszym dniu.
- **Wskazówka Słońca** pokazuje kąt Słońca. Nad tarczą widać, ile **stopni światła** ma dziś dzień, a w dzień także, ile ich jeszcze zostało.
- **Dwa tryby tarczy**: *od południa* (górowanie Słońca u góry) albo *od wschodu* (0° po lewej).
- Na tarczy są zaznaczone **wschód**, **górowanie**, **zachód** i **środek nocy**.
- **Księżyc**: srebrna wskazówka oraz łuk pokazujący, kiedy Księżyc jest nad horyzontem.
- **Wydarzenia**: możesz dodać własne punkty dnia, np. „Lekcja 08:00”, i zobaczyć je na tarczy. Godzina odnosi się do strefy czasowej wybranego miasta.

### Słońce i Księżyc w liczbach
- Kąt Słońca, wysokość Słońca nad horyzontem, kąt górowania i zachodu na tarczy.
- Faza Księżyca (nów, kwadry, pełnia…), procent oświetlenia, dzień cyklu i pasek miesiąca księżycowego.
- Pasek miesiąca księżycowego jest osią **dni** od nowiu do nowiu, z rzeczywistą długością tego cyklu. Ma kreskę co dobę i obrysowany dzisiejszy dzień. Ikony faz stoją tam, gdzie fazy naprawdę wypadają.
- Obsługa **dnia polarnego** i **nocy polarnej**.

### Wizualizacja 3D
Sfera niebieska, którą można obracać, przeciągając rysunek: horyzont, droga Słońca, ekliptyka i orbita Księżyca z węzłami. Suwaki zmieniają obrót Ziemi, szerokość geograficzną i deklinację Słońca. Przyciski ustawiają *teraz*, przesilenia (21 cze, 21 gru) i równonoc.

### Zegar roku
Długość dnia w ciągu całego roku jako **wykres** lub **pętla**. Pokazuje, czy światła przybywa, czy ubywa (i o ile stopni na dobę), ile trwa dzień oraz ile dni zostało do najdłuższego i najkrótszego dnia.

### Kalendarz
Nawigacja po dniach z podwójną datą: zwykłą i roboczym **kątem roku** (0° = równonoc wiosenna).
- **Widok miesiąca** albo **widok całego roku**: 12 miesięcy z numerami tygodni (ISO 8601), skrótami nazw dni i zaznaczonymi weekendami.
- Kropka oznacza równonoc lub przesilenie (kąt roku 0°, 90°, 180°, 270°).
- Przy każdym dniu: numer dnia w roku, numer tygodnia i kąt roku.

### Miejsce
- Wyszukiwanie miasta po nazwie,
- „Użyj mojej lokalizacji”,
- albo ręczne wpisanie współrzędnych.

### Języki
Polski, English, Español, Deutsch, Français, Italiano, Português, Українська, العربية.

## Prywatność
Wybrane miejsce, wydarzenia, język i ustawienia widoku zostają tylko w Twojej przeglądarce (`localStorage`). Wyszukiwanie miast korzysta z darmowego [Open-Meteo Geocoding API](https://open-meteo.com/). Wysyłana jest tylko wpisana nazwa miasta.

## Uruchomienie lokalnie
Wystarczy otworzyć `index.html` w przeglądarce. Projekt to czysty HTML, CSS i JavaScript, bez bibliotek i bez budowania.

```
index.html        – układ strony
css/style.css     – wygląd
js/main.js        – obliczenia Słońca i Księżyca, tarcza, wydarzenia, wybór miejsca
js/view3d.js      – wizualizacja 3D
js/year.js        – zegar roku
js/calendar.js    – kalendarz
js/I18n.js        – tłumaczenia (PL, EN, ES)
js/I18n-more.js   – pozostałe języki
```

Po zmianie plików CSS lub JS podnieś numer `?v=` w `index.html`, żeby przeglądarki pobrały nową wersję.

## Plan rozwoju
- [ ] Równanie czasu
- [ ] Reguły i nazwy okresów w kalendarzu „kąta roku”
- [ ] Nowa grafika tarczy
