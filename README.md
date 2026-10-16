# Zegar słoneczny (daylight-clock)

Interaktywny zegar słoneczny w przeglądarce. Czas pokazuje w **stopniach obrotu Ziemi**, a nie w godzinach: liczy od wschodu Słońca w wybranym miejscu na Ziemi.

**▶ Otwórz: https://bibilibak.github.io/daylight-clock/**

Strona działa na komputerze i telefonie. Nic nie trzeba instalować.

## Co pokazuje strona

### Tarcza zegara
- **Pierścień dnia i nocy**: jasny łuk to dzień, ciemny to noc, w wybranym miejscu i w dzisiejszym dniu.
- **Wskazówka Słońca** pokazuje kąt Słońca. Nad tarczą widać, ile **stopni światła** ma dziś dzień, a w dzień także, ile ich jeszcze zostało.
- Tarcza liczy od wschodu: wschód to 0° po lewej stronie.
- Na tarczy są zaznaczone **wschód**, **górowanie**, **zachód** i **środek nocy**.
- **Księżyc**: srebrna wskazówka oraz łuk pokazujący, kiedy Księżyc jest nad horyzontem.
- **Wydarzenia**: możesz dodać własne punkty dnia, np. „Lekcja 08:00”, i zobaczyć je na tarczy. Przy każdym wydarzeniu widać, ile stopni dzieli je od najbliższego punktu doby, np. „14° 56′ po wschodzie”. Godzina odnosi się do strefy czasowej wybranego miasta.

### Słońce i Księżyc w liczbach
- Kąt Słońca od wschodu (kąt doby), wysokość Słońca nad horyzontem i największa wysokość Słońca dzisiaj (w chwili górowania).
- Faza Księżyca (nów, kwadry, pełnia…), procent oświetlenia, dzień cyklu i pasek miesiąca księżycowego.
- **Miesiąc księżycowy** jako siatka dni w dwóch rzędach: *przybywa* (od nowiu do pełni) i *ubywa* (od pełni do nowiu). Dni liczą się od północy w strefie czasowej wybranego miasta: dzień 1 to dzień nowiu, a cykl ma 29 albo 30 dni. Ikony faz stoją w dniach, w których fazy naprawdę wypadają. Dzisiejszy dzień jest wyróżniony.
- Obsługa **dnia polarnego** i **nocy polarnej**.

### Wizualizacja 3D
Sfera niebieska, którą można obracać, przeciągając rysunek: horyzont, droga Słońca, ekliptyka i orbita Księżyca z węzłami. Suwaki zmieniają obrót Ziemi, szerokość geograficzną i deklinację Słońca. Przyciski ustawiają *teraz*, przesilenia (21 cze, 21 gru) i równonoc.

### Zegar roku
Długość dnia w ciągu całego roku jako **wykres** lub **pętla**. Pokazuje, czy światła przybywa, czy ubywa (i o ile stopni na dobę), ile trwa dzień oraz ile dni zostało do najdłuższego i najkrótszego dnia.

### Kalendarz
Kalendarz orbity: rok zaczyna się w dniu równonocy marcowej (kąt roku 0°), tym samym dla całej Ziemi. Każda pora roku to 90° drogi Ziemi wokół Słońca, podzielone na 3 miesiące po 30°: **wczesna**, **pełna** i **późna** (np. wczesna wiosna, pełna wiosna, późna wiosna). Na półkuli południowej pory roku są odwrócone. Między zwrotnikami nazwy są takie jak na danej półkuli, bo kalendarz jest wspólny dla całej Ziemi. Miesiące mają od 29 do 32 dni.
- **Kalendarz** (widok domyślny): cały rok orbity, 12 miesięcy w rzędach po 10 dni. Kliknięcie w rok pozwala wpisać dowolny rok.
- **Koło**: rok jako koło kąta roku i dni wybranego miesiąca.
- Kropka oznacza równonoc lub przesilenie, ◆ aphelium lub peryhelium.
- Przy wybranym dniu: data, kąt roku, dzień roku orbity, światło dnia, faza Księżyca i dzień cyklu księżycowego.

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
- [ ] Od kiedy liczyć dni miesiąca księżycowego: od północy czy od nowiu? (zob. [OTWARTE-PYTANIA.md](OTWARTE-PYTANIA.md))
