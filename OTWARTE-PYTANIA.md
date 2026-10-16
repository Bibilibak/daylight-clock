# Otwarte pytania

Decyzje, które nie zostały jeszcze podjęte. Każde pytanie opisuje możliwości, stan obecny i miejsce w kodzie, żeby można było wrócić do tematu i go rozbudować.

---

## ✅ Od kiedy liczyć dni miesiąca księżycowego: od północy czy od chwili nowiu?

**Decyzja (17 października 2026): od chwili nowiu (możliwość B).** Miesiąc księżycowy zaczyna się w chwili nowiu, więc tak samo zaczyna się jego dzień 1. Ostatni dzień jest krótszy, bo cykl Księżyca nie jest zgrany z obrotem Ziemi. (Od 16 do 17 października 2026 dni liczono od północy.)

### Możliwość A: od północy
- Dzień 1 to dzień kalendarzowy, w którym wypada nów. Północ liczy się w strefie czasowej wybranego miasta.
- Cykl kończy się dniem przed dniem następnego nowiu, więc ma **29 albo 30 pełnych dni**. W 2026 roku jest 6 cykli 30-dniowych i 7 cykli 29-dniowych.
- ✅ Numer dnia zmienia się o stałej porze, tak jak w zwykłym kalendarzu.
- ✅ Każdy dzień w siatce jest pełny.
- ⚠️ Wynik zależy od strefy czasowej. Ten sam nów może wypaść w różnych miejscach na Ziemi w różne dni, więc numer dnia może się różnić o 1 między miastami.
- ⚠️ Faza na krawędzi doby, np. o 0:09, trafia do innego dnia niż kilka minut wcześniej.

### Możliwość B: od chwili nowiu (wybrana)
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
- `js/main.js`, funkcja `localDay()`: numer doby kalendarzowej w strefie miasta. Miesiąc księżycowy już jej nie używa (używa jej kalendarz orbity).
- `js/main.js`, funkcja `buildMonthScale()`: buduje siatkę dni i przypisuje fazy do dni.
- Wersja liczona od północy jest w historii gita w commicie `ba33f75`.

---

## ❓ Kalendarz orbity: od kiedy liczyć dni miesiąca (północ czy chwila przejścia przez 30°)?

**Stan obecny (tymczasowy):** od północy w strefie miasta, dni miesiąca numerowane od 1. Wybrane 16 października 2026, do przemyślenia.

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
- `js/orbit.js`, funkcje `starts()` i `date()`: tu zaczynają się miesiące i liczone są dni.
- `js/calendar.js`: widoki Kalendarz i Koło oraz nazwy i kolory pór roku i miesięcy (`qName`, `qColor`, `mName`).
