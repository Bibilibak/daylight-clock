# Otwarte pytania

Decyzje, które nie zostały jeszcze podjęte. Każde pytanie opisuje możliwości, stan obecny i miejsce w kodzie, żeby można było wrócić do tematu i go rozbudować.

---

## ✅ Od kiedy liczyć dni miesiąca księżycowego: od północy, od wschodu czy od chwili nowiu?

**Decyzja (17 października 2026): od wschodu Słońca.** Tak samo jak tarcza i kalendarz orbity: dzień 1 to doba (od wschodu do wschodu), w której wypada nów, a cykl kończy się dobą przed dobą następnego nowiu, więc ma 29 albo 30 pełnych dni. Dzięki temu każdy dzień księżycowy to jedna doba kalendarza orbity, a chwile faz podajemy w stopniach od wschodu tej doby. Wynik zależy od miejsca (od godziny wschodu). Historia: 16 października od północy, potem krótko od chwili nowiu (możliwość B, commit `17a86c6`).

**Uzupełnienie (24 października 2026):** doby nadal liczą się od wschodu, ale siatka pokazuje ułamki. Doba 1 jest podzielona w chwili nowiu. Doba, w której Księżyc kończy pełną orbitę (miesiąc syderyczny, ok. 27,32 doby od nowiu, znak ↻), jest podzielona w chwili powrotu. Niebieskie części to czas, w którym Księżyc dogania Słońce, łącznie ok. 2,2 doby. Kod: `orbitDone()`, `orbitFrom()` i `buildMonthScale()` w `js/main.js`.

### Możliwość A: od północy
- Dzień 1 to dzień kalendarzowy, w którym wypada nów. Północ liczy się w strefie czasowej wybranego miasta.
- Cykl kończy się dniem przed dniem następnego nowiu, więc ma **29 albo 30 pełnych dni**. W 2026 roku jest 6 cykli 30-dniowych i 7 cykli 29-dniowych.
- ✅ Numer dnia zmienia się o stałej porze, tak jak w zwykłym kalendarzu.
- ✅ Każdy dzień w siatce jest pełny.
- ⚠️ Wynik zależy od strefy czasowej. Ten sam nów może wypaść w różnych miejscach na Ziemi w różne dni, więc numer dnia może się różnić o 1 między miastami.
- ⚠️ Faza na krawędzi doby, np. o 0:09, trafia do innego dnia niż kilka minut wcześniej.

### Możliwość B: od chwili nowiu
- Dzień 1 zaczyna się dokładnie w chwili nowiu, a każdy dzień trwa 24 h od tej chwili.
- Cykl ma zawsze **30 dni**, ale ostatni jest niepełny: trwa od ok. 6 do ok. 20 h, zależnie od długości cyklu (29,27–29,83 doby).
- ✅ Wynik jest jeden dla całej Ziemi i nie zależy od strefy czasowej.
- ✅ Jest dokładniejszy astronomicznie, bo dzień cyklu odpowiada rzeczywistemu wiekowi Księżyca.
- ⚠️ Numer dnia zmienia się codziennie o innej godzinie, w godzinie nowiu, np. około 15:20.
- ⚠️ Ostatni, 30. dzień jest niepełny i trudniej to wytłumaczyć.

### Inne warianty do rozważenia
- **Od zachodu Słońca**, jak w tradycyjnych kalendarzach księżycowych (np. islamskim czy hebrajskim). Wtedy dzień cyklu zależy także od miejsca na Ziemi.
- **Od pierwszej widocznej sierpowej fazy** po nowiu, a nie od samego nowiu. To podejście obserwacyjne, przez co przesuwa początek o 1–2 dni.
- **Przełącznik w ustawieniach strony**, który pozwala wybrać jeden ze sposobów liczenia.
- **Wspólna zasada z kalendarzem „kąta roku”.** Przy projektowaniu kalendarza dla całego świata warto ustalić, czy doba w ogóle zaczyna się od północy, i trzymać się tego samego w obu kalendarzach.

### Gdzie to jest w kodzie
- `js/main.js`, funkcja `lunarCycle()`: zwraca `day` (dzień cyklu) i `days` (liczbę dni w cyklu). Tutaj zmienia się zasadę liczenia.
- `js/main.js`, funkcje `dayCycle()`, `sunDay()` i `sunDayStart()`: doba od wschodu do wschodu (wspólna z tarczą i kalendarzem orbity).
- `js/main.js`, funkcja `buildMonthScale()`: buduje siatkę dni i przypisuje fazy do dni.
- Wersja liczona od północy jest w historii gita w commicie `ba33f75`.

---

## ✅ Kalendarz orbity: od kiedy liczyć dni miesiąca (północ, wschód czy chwila przejścia przez 30°)?

**Decyzja (17 października 2026): całe doby od wschodu Słońca.** W tym systemie doba zaczyna się o wschodzie, tak jak na tarczy (w dzień i noc polarną od słonecznej północy). Dzień 1 miesiąca lub pory roku to doba, w której Słońce przechodzi przez granicę 30°·k. Wszystkie dni są pełne, a granica zależy od miejsca (od godziny wschodu). Przykład: równonoc wrześniowa 2026 wypada 23 września około 2:05 czasu polskiego, czyli przed wschodem, więc w Warszawie jesień zaczyna się dobą 22 września. (Od 16 do 17 października 2026 dni liczono od północy.)

**Zmiana (24 października 2026): dwa kalendarze.** Przełącznik **Klimatyczny / Świetlny** (od 25 października: Orbitalny), a Kalendarz i Koło to dwa sposoby pokazania każdego z nich.
- **Klimatyczny:** wiosna, lato, jesień, zima, każda podzielona na 3 miesiące po 30° (wczesna / pełna / późna), na wzór 12 miesięcy gregoriańskich, np. „Pełna jesień · dzień 2”.
- **Świetlny:** 4 pory roku po 90° (89–94 doby) bez dalszego podziału, np. „Wieczór roku · dzień 33 z 90”. Punkty: wschód, południe, zachód i północ roku (równonoce i przesilenia), a między nimi przedpołudnie, popołudnie, wieczór i noc roku. Pomysł rodzica użytkownika: tak jak 10. dzień miesiąca to 1/3 miesiąca, tak 30. dzień pory to 1/3 pory, więc dalszy podział nie jest potrzebny. Inspiracja nazw: po polsku strony świata to zarazem pory doby.

**Zmiana (25 października 2026): „Świetlny” to teraz „Orbitalny”, a data jest w stopniach, nie w dniach.** Data to kąt przebyty od początku pory roku, z ułamkiem, np. „Wieczór roku · 30,56° z 90°” (to możliwość C niżej, liczona w porze roku). Powód: równonoce i przesilenia nie wypadają o wschodzie, a położenie Ziemi na orbicie da się podać dokładnie i jednakowo dla całej Ziemi. Doba (od wschodu do wschodu) to zakres kąta, np. „31,8°–32,8° z 90°”. W kratce jest pełny stopień na koniec doby, więc latem numery czasem się powtarzają, a zimą jakiś wypada (Ziemia przechodzi 0,95–1,02° na dobę). Nazwy pór zostały. Urodziny: dokładny kąt w porze roku z miejsca urodzenia; tabela powrotów zawsze w dniach kalendarza klimatycznego, bo kąt jest co roku ten sam.

### Możliwość A: od północy
- Dzień 1 miesiąca to dzień kalendarzowy, w którym Słońce przechodzi przez granicę 30°·k (równonoc, przesilenie albo granicę miesiąca).
- Miesiące mają **29–32 pełnych dni**, a rok orbity ma 365 albo 366 dni.
- ✅ Każdy dzień jest pełny, a numer zmienia się o północy.
- ⚠️ Gdy przejście wypada blisko północy, wynik zależy od strefy czasowej. W różnych miastach ten sam miesiąc może zacząć się o dzień wcześniej albo później.

### Możliwość B: od chwili przejścia przez granicę
- Dzień 1 zaczyna się dokładnie w chwili, gdy kąt roku osiąga 30°·k. Taki wynik jest jeden dla całej Ziemi.
- ⚠️ Ostatni dzień miesiąca jest niepełny, a numer dnia zmienia się codziennie o innej godzinie.

### Możliwość C: sam kąt zamiast dni
- Datą jest sam kąt roku, np. 213,4°, bez podziału na doby.

### Do ustalenia przy okazji
- Ta sama zasada co dla dni miesiąca księżycowego (pytanie wyżej). Oba kalendarze powinny liczyć dobę tak samo.
- ✅ **Nazwy miesięcy:** wczesna / pełna / późna pora roku (np. „Pełne lato”); między zwrotnikami zakres kąta, np. „Miesiąc 0–30°”.
- ✅ **Tropiki:** granica |szerokość| < 23,44° (zwrotniki). Kalendarz jest wspólny dla całej Ziemi, więc między zwrotnikami nazwy i kolory pór roku są takie jak na danej półkuli (pory deszczowa i sucha to sprawa pogody, nie orbity). Pod kalendarzem jest dopisek, że klimatycznie pory roku prawie się tam nie różnią.

### Gdzie to jest w kodzie
- `js/orbit.js`, funkcje `days()`, `starts()` i `date()`: tu zaczynają się miesiące i liczone są dni.
- `js/main.js`, funkcje `dayCycle()` i `sunDay()`: doba od wschodu do wschodu (wspólna z tarczą).
- `js/calendar.js`: widoki Kalendarz i Koło oraz nazwy i kolory pór roku i miesięcy (`qName`, `qColor`, `mName`).

---

## 🧪 Eksperyment na przyszłość: „doba orbitalna”, czyli równe dni w każdym roku

**Stan (24 października 2026): pomysł do zrobienia później, jeszcze nie zaczęty.**

### Problem
Rok zwrotnikowy ma ok. **365,2422** doby słonecznej. Doby wyznacza obrót Ziemi wokół osi, a rok obieg wokół Słońca. To dwa niezależne ruchy, więc rok nigdy nie dzieli się na całą liczbę dób. Na stronie widać to w dwóch miejscach:
- **Urodziny na orbicie:** Ziemia co rok wraca dokładnie na kąt urodzin, ale ok. 5 h 49 min później. Co kilka lat urodziny przeskakują więc o dzień w kalendarzu orbity.
- **Siatka miesiąca księżycowego:** niebieskie części komórek pokazują ułamki dób.

Równych dni nie da się uzyskać, jeśli doba ma zostać obrotem Ziemi (od wschodu do wschodu). Da się je uzyskać, jeśli dobę zdefiniuje się **orbitą**: jako stałą część obiegu wokół Słońca. Wtedy każdy rok ma identyczne dni i urodziny zawsze wypadają w ten sam dzień. Ceną jest to, że doba orbitalna nie zaczyna się o wschodzie, tylko co roku przesuwa się względem dnia i nocy.

### Warianty (liczby: mimośród orbity 0,0167, rok 365,2422 doby)

**A: 365 równych części czasu**
- Każda doba orbitalna trwa dokładnie 1/365 roku, czyli **24 h 0 min 57 s**.
- ✅ Wszystkie doby są tak samo długie, a rok ma zawsze 365 dób.
- ⚠️ Kąty są nierówne: zimą Ziemia przebiega w jednej dobie więcej stopni niż latem.
- ⚠️ Względem wschodu Słońca doba przesuwa się o 57 s dziennie, czyli o ok. 5 h 49 min w ciągu roku.

**B: 365 równych części kąta (po 0,9863°)**
- Każda doba orbitalna to ten sam kawałek orbity.
- ✅ Kąty są równe, a rok ma zawsze 365 dób.
- ⚠️ Czas trwania jest nierówny: od **23 h 13 min** w peryhelium (początek stycznia) do **24 h 50 min** w aphelium (początek lipca).

**C: 360 równych części kąta (po 1°)**
- Jedna doba orbitalna to jeden stopień kąta roku. Datą jest pełny stopień, np. „dzień 213” to 213–214°.
- ✅ To najprostsze połączenie z resztą strony, bo wszystko jest już liczone w stopniach (zob. Możliwość C w pytaniu o kalendarz orbity).
- ⚠️ Średnio 24 h 21 min, od **23 h 33 min** do **25 h 10 min**. Rok ma 360 dób, więc „dzień” wyraźnie różni się od doby słonecznej.

### Jak to pokazać na stronie (pomysły)
- Trzeci rodzaj daty obok kąta i doby od wschodu, np. w kafelku dnia w Kalendarzu: „Doba orbitalna 218 z 365”.
- Przy Urodzinach na orbicie: kolumna z dobą orbitalną, która co roku jest ta sama, obok doby od wschodu, która się chwieje.
- Rysunek albo pasek pokazujący, jak doba orbitalna przesuwa się względem wschodu Słońca w ciągu roku.

### Do ustalenia
- Który wariant: A, B czy C?
- Od jakiego punktu liczyć: od równonocy marcowej (jak kalendarz orbity) czy od innego punktu orbity?
- Czy doba orbitalna ma być tylko dodatkową informacją, czy osobnym widokiem kalendarza?

### Gdzie to będzie w kodzie
- `js/orbit.js`: `year()` i `momentAt()` dają chwile przejścia przez dowolny kąt, a `cross()` znajduje chwilę dla kąta. Na tym można zbudować granice dób orbitalnych w wariantach B i C.
- `js/calendar.js`: kafelek dnia (`detail()`) i Urodziny na orbicie (`birthOut()`).
