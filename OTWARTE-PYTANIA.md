# Otwarte pytania

Decyzje, które nie zostały jeszcze podjęte. Każde pytanie opisuje możliwości, stan obecny i miejsce w kodzie, żeby można było wrócić do tematu i go rozbudować.

---

## ✅ Od kiedy liczyć dni miesiąca księżycowego: od północy, od wschodu czy od chwili nowiu?

**Decyzja (17 października 2026): od wschodu Słońca.** Tak samo jak tarcza i kalendarz orbity: dzień 1 to doba (od wschodu do wschodu), w której wypada nów, a cykl kończy się dobą przed dobą następnego nowiu, więc ma 29 albo 30 pełnych dni. Dzięki temu każdy dzień księżycowy to jedna doba kalendarza orbity, a chwile faz podajemy w stopniach od wschodu tej doby. Wynik zależy od miejsca (od godziny wschodu). Historia: 16 października od północy, potem krótko od chwili nowiu (możliwość B, commit `17a86c6`).

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
