/* ===== Stałe i stan ===== */
var R = Math.PI / 180, cx = 170, cy = 170, r = 140, lat = 52.23, lon = 21.01, place = "", tz = "";

try {
  var s = JSON.parse(localStorage.getItem("sw") || "null");
  if (s && validCoords(s.lat, s.lon)) { lat = s.lat; lon = s.lon; place = s.name || ""; tz = s.tz || "" }
} catch (e) {}
function validCoords(a, b) {   // tylko prawdziwe liczby (tekst "21" z uszkodzonego localStorage psułby obliczenia)
  return typeof a === "number" && typeof b === "number" && isFinite(a) && isFinite(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180
}


function $(i) { return document.getElementById(i) }

// Komunikat pod odczytem stopni zapamiętujemy jako klucz tłumaczenia,
// żeby zmiana języka mogła go przetłumaczyć.
var msgKey = "sinceRise";
var live = null;   // bieżące dane słońca dla widoku 3D: { lat, dec (stopnie), deg }
function setMsg(k) { msgKey = k; $("msg").textContent = k === "sinceRise" ? "" : t(k) }

/* ===== Strefa czasowa miejsca - tylko do wydarzeń, niczego nie wyświetla =====
   Godzina wydarzenia ("08:00") znaczy godzinę zegara w wybranym mieście, a nie w Twoim
   urządzeniu. tz = nazwa strefy IANA z wyszukiwarki miast; pusta = strefa urządzenia. */
var fmtCache = {};
function tzFmt() {
  if (!fmtCache[tz]) {
    var o = { hour12: false, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" };
    try { if (tz) o.timeZone = tz; fmtCache[tz] = new Intl.DateTimeFormat("en-GB", o) }
    catch (e) { delete o.timeZone; fmtCache[tz] = new Intl.DateTimeFormat("en-GB", o) }   // nieznana strefa -> urządzenie
  }
  return fmtCache[tz]
}
function tzParts(ms) {   // data i godzina w mieście dla chwili ms (UTC)
  var o = {};
  tzFmt().formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = +p.value });
  if (o.hour === 24) o.hour = 0;
  return o
}
function tzOffset(ms) {
  var o = tzParts(ms);
  return Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second) - Math.floor(ms / 1000) * 1000
}
function zoned(y, mo, d, h, mi) {   // "dzień, godzina:minuta według zegara miasta" -> chwila (ms UTC)
  var g = Date.UTC(y, mo, d, h, mi), t1 = g - tzOffset(g);
  return g - tzOffset(t1)
}

/* ===== Geometria tarczy ===== */
function pt(t, rr) { rr = rr || r; return [cx - rr * Math.cos(t * R), cy - rr * Math.sin(t * R)] }
// łuk pierścienia o promieniu rad (domyślnie r) od kąta a0 do a1, zgodnie z ruchem wskazówek
function arcSeg(a0, a1, rad) {
  rad = rad || r;
  var p = pt(a0, rad), q = pt(Math.min(a1, a0 + 359.99), rad);
  return "M" + p[0] + " " + p[1] + " A" + rad + " " + rad + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + q[0] + " " + q[1]
}
function normDeg(x) { return ((x + 180) % 360 + 360) % 360 - 180 }   // do zakresu -180..180
// liczba ze znakiem: "+" nad horyzontem, "−" pod
function signedTxt(h, d) { return (h > 0.05 ? "+" : h < -0.05 ? "−" : "") + Math.abs(h).toFixed(d) }
function put(id, a) { var p = pt(a); $(id).setAttribute("cx", p[0]); $(id).setAttribute("cy", p[1]) }

/* ===== Podziałka (rysowana raz) =====
   Tylko 12 kresek co 30° (4 dłuższe). Dokładny stopień jest w kółku ze Słońcem,
   a liczby przy pierścieniu opisują znaczniki doby (dodawane w tick()). */
var tk = "";
for (var a = 0; a < 360; a += 30) {
  var len = a % 90 == 0 ? 16 : 10, w = a % 90 == 0 ? 2 : 1.5,
    p = pt(a, r - 7), q = pt(a, r - 7 - len);   // kreski zaczynają się przy wewnętrznej krawędzi pierścienia
  tk += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke-width="' + w + '"/>'
}
$("ticks").innerHTML = tk;
var lastML = "";   // ostatnio narysowane opisy znaczników

/* ===== Obliczenia astronomiczne (algorytm NOAA) ===== */
// gam: kąt ułamkowy roku (w radianach)
function gam(d) {
  var y = d.getUTCFullYear(), n = Math.floor((d - Date.UTC(y, 0, 0)) / 864e5),
    yl = (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 864e5;   // 365 albo 366 dni (NOAA: w roku przestępnym 366)
  return 2 * Math.PI / yl * (n - 1 + (d.getUTCHours() - 12) / 24)
}

// sol: równanie czasu (eq, minuty) i deklinacja Słońca (dc, radiany)
function sol(g) {
  return {
    eq: 229.18 * (.000075 + .001868 * Math.cos(g) - .032077 * Math.sin(g) - .014615 * Math.cos(2 * g) - .040849 * Math.sin(2 * g)),
    dc: .006918 - .399912 * Math.cos(g) + .070257 * Math.sin(g) - .006758 * Math.cos(2 * g) + .000907 * Math.sin(2 * g) - .002697 * Math.cos(3 * g) + .00148 * Math.sin(3 * g)
  }
}

// times: wschód i zachód Słońca (ms UTC) dla danego dnia i położenia
function times(day) {
  var m0 = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()),
    at = function (ms) { return sol(gam(new Date(ms))) },
    haOf = function (S) {
      var c = Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(S.dc)) - Math.tan(lat * R) * Math.tan(S.dc);
      return c > 1 || c < -1 ? null : Math.acos(c) / R
    },
    S0 = at(m0 + 12 * 36e5), ha0 = haOf(S0);
  if (ha0 === null) return null;
  var Sn = at(m0 + (720 - 4 * lon - S0.eq) * 6e4),
    noon = m0 + (720 - 4 * lon - Sn.eq) * 6e4,                     // rzeczywiste górowanie: przejście Słońca przez południk
    Sr = at(noon - ha0 * 4 * 6e4), Ss = at(noon + ha0 * 4 * 6e4),  // deklinacja i równanie czasu w chwili wschodu i zachodu
    hr = haOf(Sr), hs = haOf(Ss);
  if (hr === null || hs === null) return null;
  return { rise: m0 + (720 - 4 * (lon + hr) - Sr.eq) * 6e4, set: m0 + (720 - 4 * (lon - hs) - Ss.eq) * 6e4, noon: noon }
}

// górowanie Słońca (ms UTC) - istnieje zawsze, także w dzień i noc polarną
function solarNoon(day) {
  var m0 = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()),
    S = sol(gam(new Date(m0 + (720 - 4 * lon) * 6e4)));
  return m0 + (720 - 4 * lon - S.eq) * 6e4
}

// Dzień / noc polarna: nie ma wschodu, więc doba na tarczy biegnie od słonecznej północy do następnej
// (północ = połowa drogi między kolejnymi górowaniami). Wschód i zachód "leżą" na początku cyklu.
// Gdy Słońce nie wschodzi lub nie zachodzi: dzień polarny, jeśli Słońce jest po stronie naszej półkuli
// (albo przy biegunie nawet o północy stoi nad horyzontem). Sama wysokość w górowaniu myliła się
// w pierwszym/ostatnim dniu nocy polarnej, gdy Słońce ledwo nie dochodzi do horyzontu.
function sunAlwaysUp(dc) { return lat * dc > 0 || Math.abs(lat + dc) - 90 > -0.833 }

function polarCycle(now) {
  var n = [];   // ±3 dni: wystarcza też, gdy strefa urządzenia i miasta różnią się o ponad dobę
  for (var o = -3; o <= 3; o++) n.push(solarNoon(new Date(now.getFullYear(), now.getMonth(), now.getDate() + o)));
  for (var i = 0; i < 5; i++) {
    var a = (n[i] + n[i + 1]) / 2, b = (n[i + 1] + n[i + 2]) / 2;
    if (now >= a && now < b) {
      // deklinacja na obu końcach cyklu: przy samym biegunie Słońce może w tej dobie przejść przez równik
      var up = sunAlwaysUp(sol(gam(new Date(a))).dc / R) || sunAlwaysUp(sol(gam(new Date(b))).dc / R);
      return { a: a, b: b, noon: n[i + 1], rise: a, set: up ? b : a, polar: up ? "polarDay" : "polarNight" }
    }
  }
  return null
}

// Doba tarczy, w której leży chwila now: od wschodu do następnego wschodu, a w dzień / noc polarną od słonecznej północy.
// Wschody z pięciu kolejnych dni; szukamy cyklu [wschód, następny wschód), w którym leży "now".
// (Działa dla każdego miasta, także gdy data u Ciebie i w mieście się różni.) Zwraca { a, b, set, rise, noon, … } albo null.
function dayCycle(now) {
  var days = [], noons = [], cyc = null, A, B;
  for (var o = -2; o <= 2; o++) {
    var dd0 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + o);
    days.push(times(dd0)); noons.push(solarNoon(dd0))
  }
  for (var i = 0; i < 4 && !cyc; i++) {
    A = days[i]; B = days[i + 1];
    if (A && B && now >= A.rise && now < B.rise) cyc = { a: A.rise, b: B.rise, set: A.set, rise: A.rise, noon: A.noon }
    // Dni przejściowe (sąsiedni dzień bez wschodu, np. ostatni dzień przed nocą polarną): brakujący wschód
    // szacujemy o jedną dobę słoneczną od znanego, żeby tarcza nie przeskakiwała na tryb polarny za wcześnie.
    // Gdy brakuje tylko jednego dnia, oba szacunki stykają się w połowie między znanymi wschodami (bez dziury).
    else if (A && !B) {
      var bEnd = i + 2 < days.length && days[i + 2] ? (A.rise + days[i + 2].rise) / 2 : A.rise + (noons[i + 1] - noons[i]);
      if (now >= A.rise && now < bEnd) cyc = { a: A.rise, b: bEnd, set: A.set, rise: A.rise, noon: A.noon }
    } else if (!A && B) {
      var a0 = i > 0 && days[i - 1] ? (days[i - 1].rise + B.rise) / 2 : B.rise - (noons[i + 1] - noons[i]);
      if (now >= a0 && now < B.rise) {
        var prevUp = sunAlwaysUp(sol(gam(new Date(noons[i]))).dc / R),               // poprzedni dzień był polarnym dniem?
          set0 = prevUp ? Math.max(a0, Math.min(B.rise, noons[i] + (B.set - B.noon))) : a0;   // wtedy wieczorny zachód symetrycznie do górowania
        cyc = { a: a0, b: B.rise, set: set0, rise: a0, noon: noons[i], noDay: !prevUp }   // noDay: koniec nocy polarnej, bez zachodu
      }
    }
  }
  return cyc || polarCycle(now)
}
// numer doby tarczy (od wschodu do wschodu), w której leży chwila ms: dzień kalendarzowy jej górowania w strefie miasta
function sunDay(ms) { var c = dayCycle(new Date(ms)); return dayNum(c ? c.noon : ms) }
// numer daty chwili ms: w strefie miasta, a bez strefy (współrzędne wpisane ręcznie albo z lokalizacji) według
// czasu słonecznego miejsca, a nie strefy urządzenia (inaczej przy zmianie czasu doba mogłaby zniknąć albo się zdublować)
function dayNum(ms) { return tz ? localDay(ms) : Math.floor((ms + lon * 24e4) / 864e5) }
// górowanie w dobie n. Górowanie na dacie UTC n nie zawsze wypada w dacie lokalnej n (np. Samoa, UTC+13), więc poprawiamy o różnicę.
function sunNoon(n) {
  function at(m) { var x = new Date(m * 864e5); return solarNoon(new Date(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate())) }
  var ms = at(n), k = n - dayNum(ms);
  return k ? at(n + k) : ms
}
// chwila wschodu, od której zaczyna się doba n (w dzień / noc polarną: słoneczna północ); zaokrąglona w górę do ms,
// żeby sunDay(sunDayStart(n)) === n (new Date() obcina ułamki ms)
function sunDayStart(n) { var c = dayCycle(new Date(sunNoon(n))); return c ? Math.ceil(c.a) : n * 864e5 }

/* ===== TRZY RÓŻNE WARTOŚCI KSIĘŻYCA (nie mylić) =====
   1. kąt fazy ph (0-360°): miejsce w cyklu synodycznym od nowiu do nowiu. Pokazuje go pasek miesiąca.
   2. oświetlenie illum (0-1): jaka część widocznej tarczy jest jasna (tekst "5% oświetlenia").
   3. kąt na tarczy dobowej: położenie względem lokalnego południka, w tym samym układzie co Słońce
      (H z moonPos, odłożone od znacznika górowania Słońca nd). Pokazuje go wskazówka i znacznik na tarczy. */
/* ===== Księżyc: uproszczone położenie (kilka wyrazów wzoru, dokładność rzędu 1°) =====
   Zwraca kąt godzinny Księżyca H (stopnie od jego górowania, na zachód dodatni),
   wysokość nad horyzontem i deklinację. */
function moonPos(now) {
  var d = now.getTime() / 864e5 - 10957.5,   // dni od J2000
    L = R * (218.316 + 13.176396 * d), M = R * (134.963 + 13.064993 * d), F = R * (93.272 + 13.22935 * d),
    l = L + R * 6.289 * Math.sin(M), b = R * 5.128 * Math.sin(F), e = R * 23.4397,
    ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)),
    dc = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)),
    H = R * (280.16 + 360.9856235 * d) + lon * R - ra,
    alt = Math.asin(Math.sin(lat * R) * Math.sin(dc) + Math.cos(lat * R) * Math.cos(dc) * Math.cos(H));
  var ph = elong(now.getTime());
  return { H: normDeg(H / R), alt: alt / R, dec: dc / R, ph: ph, illum: (1 - Math.cos(ph * R)) / 2,
    lon: normDeg(l / R), node: normDeg(125.044 - 0.0529539 * d) }   // długość ekliptyczna Księżyca i węzła wstępującego (L - F)
}

// faza Księżyca = o ile jego długość ekliptyczna wyprzedza Słońce (0 nów, 90 pierwsza kwadra, 180 pełnia, 270 ostatnia)
function sunLonDeg(ms) {   // długość ekliptyczna Słońca w stopniach (0° = równonoc wiosenna, na dany rok)
  // peryhelium liczone od równonocy danej daty (precesja ok. 1,7° na stulecie), -0,0057° = aberracja
  var d = ms / 864e5 - 10957.5, Ms = R * (357.5291 + 0.98560028 * d);
  return (((Ms + R * (1.9148 * Math.sin(Ms) + 0.02 * Math.sin(2 * Ms)) + R * (102.9372 + 4.70935e-5 * d - 0.0057) + Math.PI) / R) % 360 + 360) % 360
}
function elong(ms) {
  var d = ms / 864e5 - 10957.5, M = R * (134.963 + 13.064993 * d), l = R * (218.316 + 13.176396 * d) + R * 6.289 * Math.sin(M);
  return ((l / R - sunLonDeg(ms)) % 360 + 360) % 360
}
// moment nowiu: poprawiamy przybliżenie kilkoma krokami (Księżyc oddala się od Słońca o ok. 12,19° na dobę)
function newMoonNear(ms) { for (var i = 0; i < 4; i++) ms -= normDeg(elong(ms)) / 12.19 * 864e5; return ms }
// numer dnia kalendarzowego (od północy do północy) w strefie czasowej wybranego miasta
function localDay(ms) { var o = tzParts(ms); return Math.round(Date.UTC(o.year, o.month - 1, o.day) / 864e5) }
/* Dni cyklu to doby tarczy, OD WSCHODU do wschodu (jak w kalendarzu orbity): dzień 1 = doba, w której wypada nów;
   cykl kończy się dobą przed dobą następnego nowiu, więc ma 29 albo 30 pełnych dni. Wynik zależy od miejsca (wschód).
   d0: numer doby dnia 1 (sunDay); elapsed/length: dokładny czas od chwili nowiu i długość cyklu (doby). */
function lunarCycle(now) {
  var t = now.getTime(), last = newMoonNear(t - elong(t) / 12.19 * 864e5);
  if (last > t) last = newMoonNear(last - 29.53 * 864e5);
  var next = newMoonNear(last + 29.53 * 864e5);
  if (next <= t) { last = next; next = newMoonNear(last + 29.53 * 864e5) }
  var n = sunDay(t);
  if (sunDay(next) <= n) { last = next; next = newMoonNear(last + 29.53 * 864e5) }   // dziś jest doba nowiu: od wschodu nowy cykl
  var d0 = sunDay(last);
  return { day: n - d0 + 1, days: sunDay(next) - d0, d0: d0,
    elapsed: (t - last) / 864e5, length: (next - last) / 864e5, last: last, next: next }
}
// moment fazy k (1 = I kwadra, 2 = pełnia, 3 = III kwadra) w cyklu zaczętym nowiem "last"
function quarterAt(last, len, k) {
  var ms = last + len * k / 4 * 864e5;
  for (var i = 0; i < 4; i++) ms -= normDeg(elong(ms) - 90 * k) / 12.19 * 864e5;
  return ms
}
function phaseIdx(p) {   // 0 nów, 1 sierp przyb., 2 I kwadra, 3 garb przyb., 4 pełnia, 5 garb ubyw., 6 III kwadra, 7 sierp ubyw.
  return p < 12 || p >= 348 ? 0 : p < 78 ? 1 : p < 102 ? 2 : p < 168 ? 3 : p < 192 ? 4 : p < 258 ? 5 : p < 282 ? 6 : 7
}
function moonTilt() {   // obrót ikony Księżyca: północ 0° (jasna strona przybywającego po prawej), równik 90° ("łódka"), południe 180° (odwrotnie)
    return Math.round(Math.max(0, Math.min(1, (23.5 - lat) / 47)) * 180)
    }
    function phaseGlyph(p, cx, cy, rr) {   // ikona fazy: ciemna tarcza + jasna część (limb + terminator), obrócona wg półkuli obserwatora
      var c = Math.cos(p * R), wax = p < 180, top = cy - rr, bot = cy + rr, tilt = moonTilt(),
          lit = "M" + cx + " " + top + "A" + rr + " " + rr + " 0 0 " + (wax ? 1 : 0) + " " + cx + " " + bot +
                "A" + Math.abs(rr * c).toFixed(2) + " " + rr + " 0 0 " + (wax ? (c > 0 ? 0 : 1) : (c > 0 ? 1 : 0)) + " " + cx + " " + top + "Z";
                  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="#4a5068" stroke="#8ea3c2" stroke-width="1.2"/><path d="' + lit + '" fill="#e6ebf5"' +
                      (tilt ? ' transform="rotate(' + tilt + ' ' + cx + ' ' + cy + ')"' : '') + '/>'
                      }
var lastGlyph = "", lastIcon = "";

/* ===== Wydarzenia użytkownika ===== */
var evs = [];
try { evs = JSON.parse(localStorage.getItem("swe") || "[]") } catch (e) {}
// uszkodzony zapis (nie lista albo puste wpisy) nie może wywrócić odświeżania tarczy
evs = Array.isArray(evs) ? evs.filter(function (v) { return v && typeof v === "object" }) : [];

function saveEv() {
  try { localStorage.setItem("swe", JSON.stringify(evs)) } catch (e) {}
  tick()
}

$("add").onclick = function () {
  var tm = $("et").value;
  if (!tm) return;
  evs.push({ n: $("en").value, t: tm });
  $("en").value = "";
  saveEv()
};

$("evl").onclick = function (e) {
  var i = e.target.getAttribute("data-i");
  if (i !== null) { evs.splice(+i, 1); saveEv() }
};

var lastL = "";
// tekst z przeglądarki (nazwa i godzina wydarzenia) wstawiany do HTML: bez znaków, które tworzą znaczniki
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") }
function drawEv(cyc, k, now, nd, sd, noSet) {
  var g = "", l = "", c = tzParts(now.getTime());   // dzisiejsza data w wybranym mieście
  evs.forEach(function (v, i) {
    var hh = /^(\d{1,2}):(\d{2})$/.exec(v.t), deg = null;   // zepsuta godzina (np. ręcznie zmieniony zapis): bez miejsca na tarczy
    if (hh) for (var o = -1; o <= 1; o++) {
      var dt = zoned(c.year, c.month - 1, c.day + o, +hh[1], +hh[2]);   // godzina wg zegara miasta
      if (dt >= cyc.a && dt < cyc.b) { deg = k * (dt - cyc.a) }
    }
    if (deg === null && hh) return;
    var near = "--";                                          // zostaje na liście, żeby dało się je usunąć
    if (deg !== null) {
      var p = pt(deg, r + 32);   // kąt Słońca od wschodu (w dzień / noc polarną od słonecznej północy), jak na tarczy
      near = t(cyc.polar ? "degPolar" : "degRise").replace("{a}", '<b>' + degTxt(deg) + '</b>');
      g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="var(--fg)"/><text x="' + p[0] + '" y="' + (p[1] + 4) + '" fill="var(--bg)" font-size="11" font-weight="700" text-anchor="middle">' + (i + 1) + '</text>'
    }
    l += '<div><span>' + (i + 1) + '. ' + esc(v.n || t("event")) + ' <i>(' + esc(v.t) + ')</i></span><span>' + near + '<a data-i="' + i + '">×</a></span></div>'
  });
  $("evs").innerHTML = g;
  if (l !== lastL) { $("evl").innerHTML = l; lastL = l }
}

/* ===== Pierścień tarczy: kolor według wysokości Słońca =====
   Każdy kawałek pierścienia (1,5°) ma kolor wysokości Słońca w tej chwili doby: noc, zmierzch astronomiczny
   i żeglarski, niebieska godzina, świt / zmierzch (różowo-pomarańczowy), złota godzina, pełny dzień.
   Pierścień zmienia się tylko z nową dobą (albo motywem), więc rysujemy go raz na dobę. */
function sunAlt(ms) {   // wysokość Słońca (stopnie) w chwili ms w wybranym miejscu
  var d = new Date(ms), S = sol(gam(d)),
    H = ((d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + S.eq + 4 * lon) / 4 - 180) * R;
  return Math.asin(Math.sin(lat * R) * Math.sin(S.dc) + Math.cos(lat * R) * Math.cos(S.dc) * Math.cos(H)) / R
}
function hexRgb(h) { h = h.trim().replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16) }) }
function skyColor(h, night, day) {   // wysokość Słońca -> kolor; noc i dzień z motywu (--night, --day)
  var st = [[-18, night], [-12, [62, 63, 126]], [-6, [90, 98, 168]], [-3, [154, 111, 166]], [-0.833, [224, 122, 95]],
    [3, [245, 154, 62]], [8, [255, 191, 79]], [14, day]];
  if (h <= st[0][0]) return st[0][1];
  for (var i = 1; i < st.length; i++) if (h < st[i][0]) {
    var a = st[i - 1], b = st[i], x = (h - a[0]) / (b[0] - a[0]);
    return a[1].map(function (v, j) { return Math.round(v + (b[1][j] - v) * x) })
  }
  return day
}
var lastRing = "";
function drawSky(cyc) {
  var cs = getComputedStyle(document.documentElement), nv = cs.getPropertyValue("--night"), dv = cs.getPropertyValue("--day"),
    key = cyc.a + "|" + cyc.b + "|" + lat + "|" + lon + "|" + nv + dv;
  if (key === lastRing) return;
  lastRing = key;
  var night = hexRgb(nv || "#2f2a5a"), day = hexRgb(dv || "#ffd36a"), g = "", step = 1.5;
  for (var a = 0; a < 360; a += step) {
    var c = skyColor(sunAlt(cyc.a + (a + step / 2) / 360 * (cyc.b - cyc.a)), night, day);
    // kawałki lekko na siebie zachodzą, żeby między nimi nie było widać szwów
    g += '<path d="' + arcSeg(a, Math.min(360, a + step + 0.4)) + '" stroke="rgb(' + c.join(",") + ')"/>'
  }
  $("ring").innerHTML = g
}

/* ===== Odczyt względem najbliższego znacznika =====
   Znaczniki doby: wschód (0°), południe, zachód, północ (środek nocy).
   Zamiast dużej liczby od wschodu: małe "12° 30′ do południa". 1′ (minuta łuku) = 4 s. */
function nearParts(deg, nd, sd) {
  var m = [[0, 0], [nd, 1], [sd, 2], [(sd + 360) / 2, 3], [360, 0]], best = m[0];
  m.forEach(function (x) { if (Math.abs(deg - x[0]) < Math.abs(deg - best[0])) best = x });
  var diff = deg - best[0], am = Math.round(Math.abs(diff) * 60), d = Math.floor(am / 60), mm = am % 60,
    val = "⁦" + (d ? d + "°" + (mm ? " " + mm + "′" : "") : mm + "′") + "⁩";   // izolacja LTR: w arabskim "7° 32′" się nie rozsypie
  return [val, t((diff < 0 ? "nb" : "na") + best[1])]
}
function showNear(np) {   // w środku tarczy: wartość nad nazwą znacznika
  if (!$("nearV")) return;
  $("nearV").textContent = np ? np[0] : ""; $("nearL").textContent = np ? np[1] : ""
}

/* ===== Odświeżanie zegara (co sekundę) ===== */
function tick() {
  var now = new Date(), S = sol(gam(now));
  var u = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60,
    H = ((u + S.eq + 4 * lon) / 4 - 180) * R;
  var alt = Math.asin(Math.sin(lat * R) * Math.sin(S.dc) + Math.cos(lat * R) * Math.cos(S.dc) * Math.cos(H)) / R;
  $("alt").textContent = signedTxt(alt, 1) + "°";   // + nad horyzontem, − pod

  var cyc = dayCycle(now);
  if (!cyc) {
    live = null;
    $("deg").textContent = "--°";
    showNear(null);
    if ($("light")) $("light").textContent = "";
    setMsg("noSun");
    return
  }
  var polar = cyc.polar || "";
  var autoMsg = msgKey === "sinceRise" || msgKey === "noSun" || msgKey === "polarDay" || msgKey === "polarNight";   // błędów (np. złe współrzędne) nie nadpisujemy
  if (polar) { if (autoMsg && msgKey !== polar) setMsg(polar) }
  else if (autoMsg && msgKey !== "sinceRise") setMsg("sinceRise");

  var k = 360 / (cyc.b - cyc.a),
    deg = Math.min(359.99, k * (now - cyc.a)),
    sd = k * (cyc.set - cyc.a),
    nd = k * (cyc.noon - cyc.a)   // górowanie to nie zawsze dokładny środek łuku;

  var noSet = polar || cyc.noDay;             // brak zachodu w tym cyklu (polarna albo ostatnia doba nocy polarnej)
  drawEv(cyc, k, now, nd, sd, noSet);
  put("sun", deg); put("set", sd); put("noon", nd);
  ["set", "rise0", "mid"].forEach(function (id) { if ($(id)) $(id).style.display = polar || (noSet && id !== "rise0") ? "none" : "" });
  if ($("sunnum")) {
    put("mid", (sd + 360) / 2);         // środek nocy
    if ($("rise0")) put("rise0", 0);          // wschód
    var sp = pt(deg);                   // dokładny stopień w kółku ze Słońcem
    $("sunnum").setAttribute("x", sp[0]); $("sunnum").setAttribute("y", sp[1] + 3.5);
    $("sunnum").textContent = Math.round(deg);
    var ml = "";                              // liczby przy znacznikach: wschód, górowanie, zachód, północ
    (polar ? [[nd, Math.round(nd)], [0, "0"]] :   // polarna: tylko górowanie i północ
    noSet ? [[0, "0"], [nd, Math.round(nd)]] :   // bez zachodu: wschód i górowanie
    [[0, "0"], [nd, Math.round(nd)], [sd, Math.round(sd)], [(sd + 360) / 2, Math.round((sd + 360) / 2)]
    ]).forEach(function (m) {
      var q = pt(m[0], r - 36);
      ml += '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] + 4).toFixed(1) + '">' + m[1] + '°</text>'
    });
    if (ml !== lastML) { $("labels").innerHTML = ml; lastML = ml }
  }
  if ($("light")) $("light").textContent = !polar && deg < sd ? t("lightDay").replace("{b}", Math.round(sd - deg)) : "";
  // wskazówka centralna: obrót o kąt Słońca na tarczy
  $("hand").setAttribute("transform", "rotate(" + (deg) + " " + cx + " " + cy + ")");
  drawSky(cyc);
  if ($("moonhand")) {                        // Księżyc na TEJ SAMEJ tarczy co Słońce: ten sam środek i skala
    var mp = moonPos(now), c = nd,      // c = miejsce lokalnego górowania Słońca na tarczy (tam Księżyc ma H = 0)
      dialAng = c + mp.H,                     // kąt Księżyca na tarczy dobowej (nie to samo co faza ani oświetlenie)
      dd = Math.abs(normDeg(dialAng - (deg))),   // odstęp od Słońca na tarczy
      mr = dd < 10 ? 158 : r,                 // blisko Słońca znacznik wysuwamy poza pierścień (kąt zostaje prawdziwy)
      cH = (Math.sin(0.125 * R) - Math.sin(lat * R) * Math.sin(mp.dec * R)) / (Math.cos(lat * R) * Math.cos(mp.dec * R)),
      h0 = cH > 1 ? -1 : cH < -1 ? 181 : Math.acos(cH) / R, mq = pt(dialAng, mr), gl = phaseGlyph(mp.ph, 0, 0, 8);
    $("moonhand").setAttribute("transform", "rotate(" + dialAng + " " + cx + " " + cy + ")");
    if (gl !== lastGlyph) { $("moonmark").innerHTML = gl; lastGlyph = gl }
    $("moonmark").setAttribute("transform", "translate(" + mq[0] + " " + mq[1] + ")");
    $("moonup").setAttribute("d", h0 < 0 ? "" : h0 > 180 ? arcSeg(c, c + 359.9, 152) : arcSeg(c - h0, c + h0, 152));
    if ($("mname")) {                         // sekcja Księżyca
      var lc = lunarCycle(now), ig = phaseGlyph(mp.ph, 0, 0, 18);
      if (newCycle(lc)) buildMonthScale(lc);   // nowy cykl: inne położenie kwadr i inna liczba dni
      $("mname").textContent = t("ph" + phaseIdx(mp.ph));
      $("mdeg2").textContent = t("moonIll").replace("{i}", Math.round(mp.illum * 100));          // oświetlenie
      if (lc.day !== monthDay) {                          // dzisiejszy dzień cyklu w siatce, minione dni przygaszone
        monthDay = lc.day;
        markMoonSel(); renderMoonDet()
      }
      if (ig !== lastIcon) { $("mico").innerHTML = ig; lastIcon = ig }
    }
  }
  if ($("sinceL")) { $("sinceL").textContent = t("angleSun"); $("sinceD").textContent = t("modeRise") }
  if ($("lightH")) $("lightH").textContent = t("lightHead").replace("{a}", Math.round(sd));   // stopnie światła = łuk dnia na tarczy
  $("deg").textContent = deg.toFixed(1) + "°";
  $("nd").textContent = (90 - Math.abs(lat - sol(gam(new Date(cyc.noon))).dc / R)).toFixed(1) + "°";   // największa wysokość tego dnia (deklinacja w chwili górowania)
  showNear(noSet ? null : nearParts(deg, nd, sd));

  live = { lat: lat, dec: S.dc / R, deg: deg, polar: !!polar, sH: normDeg(H / R), sLon: sunLonDeg(now.getTime()) };   // dla js/view3d.js
}

/* ===== Lokalizacja ===== */
function refreshViews() { if (window.YearClock) YearClock.render(); if (window.Cal) Cal.render() }
function apply() {
  $("lat").value = lat; $("lon").value = lon;
  try { localStorage.setItem("sw", JSON.stringify({ lat: lat, lon: lon, name: place, tz: tz })) } catch (e) {}
  if ($("where")) $("where").textContent = "📍 " + (place ? place + " · " : "") + lat + "°, " + lon + "°";
  setMsg("sinceRise");
  monthSel = null;                       // nowe miejsce: cykl może mieć inną liczbę dni, zaznaczenie wraca na dziś
  if ($("mgrid")) buildMonthScale();   // ikony faz zależą od półkuli
  tick();
  refreshViews()
}

$("go").onclick = function () {
  var a = parseFloat($("lat").value), b = parseFloat($("lon").value),
    okA = isFinite(a) && a >= -90 && a <= 90, okB = isFinite(b) && b >= -180 && b <= 180;
  $("lat").setAttribute("aria-invalid", okA ? "false" : "true");
  $("lon").setAttribute("aria-invalid", okB ? "false" : "true");
  if (!okA || !okB) { setMsg("badCoord"); return }   // szerokość -90..90, długość -180..180
  lat = a; lon = b; place = ""; tz = ""; apply()
};

$("loc").onclick = function () {
  if (!navigator.geolocation) { setMsg("noGeo"); return }
  navigator.geolocation.getCurrentPosition(
    function (p) { lat = +p.coords.latitude.toFixed(3); lon = +p.coords.longitude.toFixed(3); place = ""; tz = ""; apply() },
    function () { setMsg("geoDenied") }
  )
};

/* ===== Wyszukiwanie miasta po nazwie =====
   Open-Meteo Geocoding API: darmowe, bez klucza, działa z przeglądarki. */
var searchTimer = null, searchId = 0;

function showHint(txt) {
  var box = $("cityres"), d = document.createElement("div");
  d.className = "hint"; d.textContent = txt;
  box.innerHTML = ""; box.appendChild(d)
}

function showResults(list) {
  var box = $("cityres"); box.innerHTML = "";
  list.forEach(function (c) {
    var b = document.createElement("button");
    b.textContent = [c.name, c.admin1 && c.admin1 !== c.name ? c.admin1 : "", c.country || ""].filter(Boolean).join(", ");
    b.onclick = function () {
      lat = +(+c.latitude).toFixed(3);
      lon = +(+c.longitude).toFixed(3);
      place = [c.name, c.country || ""].filter(Boolean).join(", ");
      tz = c.timezone || "";
      $("city").value = ""; box.innerHTML = "";
      apply()
    };
    box.appendChild(b)
  })
}

function searchCity(q) {
  var id = ++searchId;   // numer zapytania: ignorujemy spóźnione odpowiedzi
  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=5&format=json&language=" + lang)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json() })
    .then(function (d) {
      if (id !== searchId) return;
      if (!d.results || !d.results.length) showHint(t("noResults")); else showResults(d.results)
    })
    .catch(function (err) {
      if (id !== searchId) return;
      console.error("Geocoding:", err);   // szczegóły w konsoli (F12)
      showHint(t("searchErr") + " (" + ((err && err.message) || err) + ")")
    })
}

if ($("city")) $("city").oninput = function () {
  clearTimeout(searchTimer);
  var q = this.value.trim();
  if (q.length < 2) { searchId++; $("cityres").innerHTML = ""; return }
  searchTimer = setTimeout(function () { searchCity(q) }, 350)   // czekaj aż skończysz pisać
};

if ($("city")) $("city").onkeydown = function (e) {
  if (e.key === "Enter") { var f = $("cityres").querySelector("button"); if (f) f.click() }
};

/* ===== Przełącznik języka ===== */
function pickLang(l) {
  setLang(l);
  setMsg(msgKey);   // przetłumacz komunikat pod odczytem
  lastL = "";       // wymuś odrysowanie listy wydarzeń
  if ($("cityres")) $("cityres").innerHTML = "";   // stare wyniki były w poprzednim języku
  if ($("mgrid")) buildMonthScale();            // nazwy rzędów i faz w siatce
  if (window.Sun3D) Sun3D.refresh();               // przetłumacz widok 3D
  tick();
  refreshViews()
}

/* ===== Lista języków (własna, zaokrąglona; obsługa myszą i klawiaturą) ===== */
(function () {
  var btn = $("langBtn"), list = $("langList"), box = $("langBox");
  if (!btn || !list) return;
  var opts = [].slice.call(list.querySelectorAll("[data-lang]")), act = 0;
  function mark(i) {
    act = (i + opts.length) % opts.length;
    opts.forEach(function (o, k) { o.classList.toggle("active", k === act) });
    list.setAttribute("aria-activedescendant", opts[act].id)
  }
  function open(on) {
    list.hidden = !on; btn.setAttribute("aria-expanded", on ? "true" : "false");
    if (on) {
      mark(Math.max(0, opts.findIndex ? opts.findIndex(function (o) { return o.getAttribute("data-lang") === lang }) : 0));
      list.focus()
    }
  }
  function choose(i) { open(false); btn.focus(); if (opts[i].getAttribute("data-lang") !== lang) pickLang(opts[i].getAttribute("data-lang")) }
  btn.onclick = function () { open(list.hidden) };
  btn.onkeydown = function (e) { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(true) } };
  list.onclick = function (e) { var o = e.target.closest("[data-lang]"); if (o) choose(opts.indexOf(o)) };
  list.onmousemove = function (e) { var o = e.target.closest("[data-lang]"); if (o && opts.indexOf(o) !== act) mark(opts.indexOf(o)) };
  list.onkeydown = function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); mark(act + 1) }
    else if (e.key === "ArrowUp") { e.preventDefault(); mark(act - 1) }
    else if (e.key === "Home") { e.preventDefault(); mark(0) }
    else if (e.key === "End") { e.preventDefault(); mark(opts.length - 1) }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(act) }
    else if (e.key === "Escape") { e.preventDefault(); open(false); btn.focus() }
    else if (e.key === "Tab") open(false)
  };
  document.addEventListener("click", function (e) { if (!list.hidden && !box.contains(e.target)) open(false) });
})();

/* ===== Przycisk widoku 3D =====
   Obsługę przycisku dodaje js/view3d.js. Jeśli ten plik się nie załadował
   (brak na serwerze albo błąd), pokaż komunikat zamiast "nic się nie dzieje". */
if ($("viewBtn")) $("viewBtn").addEventListener("click", function () {
  if (!window.Sun3D) setMsg("no3d")
});

/* ===== Miesiąc księżycowy jako siatka dni =====
   Dni od wschodu: dzień 1 = doba nowiu, ostatni = doba przed następnym nowiem (29 albo 30 dni).
   Ikona fazy stoi w dobie, w której faza naprawdę wypada. Przerwa między rzędami przy pełni:
   górny rząd = Księżyca przybywa (nów -> dzień przed pełnią), dolny = ubywa (pełnia -> nów). */
var monthLast = null, monthDay = null, monthSel = null, monthCyc = null;   // monthSel: kliknięty dzień (null = dziś)
// inny cykl niż w siatce? Chwila nowiu liczona za każdym razem od innego punktu startowego różni się o ułamki ms,
// więc porównujemy z tolerancją (kolejne nowie dzieli ok. 29,5 doby)
function newCycle(cyc) { return monthLast === null || Math.abs(cyc.last - monthLast) > 36e5 }
function dnum(x) { return x.toFixed(2).replace(".", lang === "en" ? "." : ",") }
function buildMonthScale(cyc) {
  cyc = cyc || lunarCycle(new Date());
  if (newCycle(cyc)) monthSel = null;   // nowy cykl: zaznaczenie wraca na dziś
  monthLast = cyc.last; monthDay = null; monthCyc = cyc;
  var N = cyc.days, ph = {}, h = "", d,
    T = [cyc.last].concat([1, 2, 3].map(function (k) { return quarterAt(cyc.last, cyc.length, k) }));
  T.forEach(function (ms, k) { ph[sunDay(ms) - cyc.d0 + 1] = k });   // dzień cyklu -> faza (0 nów, 1 I kw., 2 pełnia, 3 III kw.)
  cyc.orbit = orbitDone(cyc.last);
  var od = sunDay(cyc.orbit) - cyc.d0 + 1;   // doba, w której Księżyc kończy pełną orbitę od nowiu (zwykle 28.)
  // ułamki dób: jaka część doby 1 minęła przed nowiem i jaka część doby od przed powrotem na orbitę (0–100%)
  function frac(ms, d) { var a = sunDayStart(cyc.d0 + d - 1), b = sunDayStart(cyc.d0 + d); return Math.round(Math.max(0, Math.min(1, (ms - a) / (b - a))) * 100) }
  var f1 = frac(cyc.last, 1), fo = frac(cyc.orbit, od);
  var full = sunDay(T[2]) - cyc.d0 + 1,
    cols = Math.max(full - 1, N - full + 1);
  function row(from, to, key) {
    var r = '<div class="mrow"><span class="mrl">' + t(key) + '</span><div class="mcells" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">';
    for (d = from; d <= to; d++)
      // niebieskie = Księżyc dogania Słońce: od chwili powrotu na orbitę do nowiu; w dobie 1 część przed nowiem (koniec poprzedniego cyklu)
      r += '<button class="md' + (d === od ? " orb part" : d > od ? " chase" : d === 1 ? " pre" : "") + '"' +
        (d === od ? ' style="--f:' + fo + '%"' : d === 1 ? ' style="--f:' + f1 + '%"' : '') + ' data-d="' + d + '"' + (d in ph ? ' title="' + t("ph" + ph[d] * 2) + '"' : d === od ? ' title="' + t("orbDone") + '"' : '') + '><b>' + d + '</b>' +
        (d in ph ? '<svg viewBox="-9 -9 18 18" aria-hidden="true">' + phaseGlyph(90 * ph[d], 0, 0, 8) + '</svg>' : d === od ? '<i class="orbi">↻</i>' : '') + '</button>';
    return r + '</div></div>'
  }
  $("mgrid").innerHTML = row(1, full - 1, "moonWax") + row(full, N, "moonWane") +
    '<p class="cnote mleg">' + t("orbLeg").split("{d}").join(od).replace("{l}", dnum((cyc.orbit - cyc.last) / 864e5)).replace("{c}", dnum((cyc.next - cyc.orbit) / 864e5)) + '</p>'
}

/* ===== Chwile w stopniach doby =====
   Każde zdarzenie (faza Księżyca, równonoc, aphelium…) podajemy tak jak tarcza: kąt Słońca od wschodu
   w dobie, w której wypada (w dzień / noc polarną od słonecznej północy). */
// 137.4 -> "137°" (izolacja LTR jak w nearParts). Pełne stopnie (1° = 4 min): uproszczony model Księżyca
// myli się nawet o kilka godzin, więc minuty łuku udawałyby dokładność, której nie ma.
function degTxt(x) { return "⁦" + Math.min(359, Math.round(x)) + "°⁩" }
// "137° 24′ od wschodu": kąt Słońca w dobie, w której wypada chwila ms
function whenTxt(ms) {
  var c = dayCycle(new Date(ms));
  return c ? t(c.polar ? "degPolar" : "degRise").replace("{a}", degTxt(Math.min(359.99, 360 * (ms - c.a) / (c.b - c.a)))) : ""
}
// główne fazy Księżyca (0 nów, 1 I kwadra, 2 pełnia, 3 III kwadra) w przedziale [a, b): [{ k, ms }]
// c: cykl, z którego brać fazy (domyślnie ten, w którym leży a)
function moonPhasesIn(a, b, c) {
  c = c || lunarCycle(new Date(a));
  var out = [], T = [c.last].concat([1, 2, 3].map(function (k) { return quarterAt(c.last, c.length, k) }), [c.next]);
  T.forEach(function (ms, k) { if (ms >= a && ms < b) out.push({ k: k % 4, ms: ms }) });
  return out
}

/* Kafelek wybranego dnia miesiąca księżycowego (pod siatką). Dzień d to doba d0 + d − 1 (od wschodu do wschodu),
   podpisana datą kalendarza orbity. Bez powtórzeń z kartą Księżyca: tu zakresy w ciągu doby i chwile faz w stopniach. */
function renderMoonDet() {
  var c = monthCyc, d = monthSel || monthDay;
  if (!c || !d || !$("mdet")) return;
  var n = c.d0 + d - 1, a = sunDayStart(n), b = sunDayStart(n + 1),
    pa = elong(a), pb = elong(b), ev = moonPhasesIn(a, b, c), h;
  function ill(p) { return Math.round((1 - Math.cos(p * R)) / 2 * 100) }
  function ang(p) { return Math.round(p) % 360 + "°" }                   // doba z nowiem: "355° → 7°", nie "360°"
  h = '<div class="mdt">' + t("moonDayT").replace("{d}", d) + (d === monthDay ? ' <small>' + t("moonToday") + '</small>' : '') + '</div>' +
    (window.Cal ? '<div class="mdsub">' + Cal.orbitName(n) + '</div>' : '') +   // data w kalendarzu orbity, np. "Pełna jesień · dzień 3"
    '<div>' + t("moonAngleL") + ': ' + ang(pa) + ' → ' + ang(pb) + '</div>' +
    '<div>' + t("moonIllL") + ': ' + ill(pa) + '% → ' + ill(pb) + '%</div>' +
    '<div>' + t("orbL") + ': ' + Math.round(orbitFrom(c, a)) + '° → ' + Math.round(orbitFrom(c, b)) + '°</div>';
  ev.forEach(function (e) { h += '<div><b>' + t("ph" + e.k * 2) + '</b>: ' + whenTxt(e.ms) + '</div>' });
  if (c.orbit >= a && c.orbit < b) h += '<div><b>↻ ' + t("orbDone") + '</b>: ' + whenTxt(c.orbit) + '</div>';
  h = orbitSvg(c, (a + b) / 2) + h;
  $("mdet").innerHTML = h
}
function markMoonSel() {   // dziś: pomarańczowe obramowanie; wybrany dzień: pomarańczowe tło
  [].forEach.call($("mgrid").querySelectorAll(".md"), function (el) {
    var d = +el.getAttribute("data-d");
    el.classList.toggle("today", d === monthDay); el.classList.toggle("past", d < monthDay);
    el.classList.toggle("sel", d === (monthSel || monthDay)); el.setAttribute("aria-pressed", d === (monthSel || monthDay))
  })
}
if ($("mgrid")) $("mgrid").onclick = function (e) {
  var b = e.target.closest(".md"); if (!b) return;
  var d = +b.getAttribute("data-d");
  monthSel = d === monthDay ? null : d;   // klik w dziś = powrót do śledzenia bieżącego dnia
  markMoonSel(); renderMoonDet()
};

/* ===== Miesiąc syderyczny w siatce miesiąca księżycowego =====
   Oba miesiące zaczynamy w chwili nowiu. Po ok. 27,32 doby Księżyc wraca w to samo miejsce orbity (względem gwiazd),
   ale Słońce przesunęło się w tym czasie o ok. 27°, więc do następnego nowiu Księżyc musi je jeszcze dogonić (ok. 2,2 doby).
   Kąt Księżyca na orbicie liczymy od kierunku równonocy, jak kąt roku Słońca (ściśle to miesiąc zwrotnikowy, krótszy o ok. 7 s). */
function moonLonDeg(ms) { return (sunLonDeg(ms) + elong(ms)) % 360 }
// chwila, w której Księżyc po nowiu "last" wraca na swój kąt orbity z chwili nowiu
function orbitDone(last) {
  var L0 = moonLonDeg(last), ms = last + 27.32 * 864e5;
  for (var i = 0; i < 5; i++) ms -= normDeg(moonLonDeg(ms) - L0) / 13.176 * 864e5;
  return ms
}
// droga Księżyca po orbicie od nowiu (stopnie, 0–360+): po pełnej orbicie dalej rośnie
function orbitFrom(c, ms) { var x = ((moonLonDeg(ms) - moonLonDeg(c.last)) % 360 + 360) % 360; return ms >= c.orbit && x < 180 ? x + 360 : x }
/* Rysunek do kafelka dnia: Ziemia w środku, przerywana kreska = kierunek nowiu (tu stały Słońce i Księżyc w chwili nowiu).
   Szary łuk = droga Księżyca po orbicie od nowiu, niebieski = faza (od Słońca do Księżyca); 0° u góry, jak na kole roku. */
function orbitSvg(c, ms) {
  var L0 = moonLonDeg(c.last), m = orbitFrom(c, ms), sA = ((sunLonDeg(ms) - L0) % 360 + 360) % 360, ph = elong(ms);
  function P(a, r) { return [48 + r * Math.sin(a * R), 48 - r * Math.cos(a * R)] }
  function f(p) { return p[0].toFixed(1) + "," + p[1].toFixed(1) }
  function arc(a0, a1, r) { var d = Math.min(a1 - a0, 359.9); return "M" + f(P(a0, r)) + "A" + r + " " + r + " 0 " + (d > 180 ? 1 : 0) + " 1 " + f(P(a0 + d, r)) }
  var mp = P(m, 30), sp = P(sA, 43);
  return '<svg class="osvg" viewBox="0 0 96 96" aria-hidden="true">' +
    '<line x1="48" y1="48" x2="48" y2="2" stroke="var(--mut)" stroke-dasharray="2 2"/>' +
    '<circle cx="48" cy="48" r="30" fill="none" stroke="var(--mut)" stroke-opacity=".35"/>' +
    (m > 0.5 ? '<path d="' + arc(0, m, 30) + '" fill="none" stroke="var(--mut)" stroke-width="3"/>' : '') +
    (ph > 0.5 ? '<path d="' + arc(sA, sA + ph, 17) + '" fill="none" stroke="#8ea3c2" stroke-width="3"/>' : '') +
    '<line x1="48" y1="48" x2="' + sp[0].toFixed(1) + '" y2="' + sp[1].toFixed(1) + '" stroke="var(--sun)" stroke-width="1.2"/>' +
    '<circle cx="' + sp[0].toFixed(1) + '" cy="' + sp[1].toFixed(1) + '" r="5" fill="var(--sun)"/>' +
    '<circle cx="48" cy="48" r="5" fill="#4f7fc4"/>' + phaseGlyph(ph, +mp[0].toFixed(1), +mp[1].toFixed(1), 6) + '</svg>'
}

/* ===== Widoki: zegar dobowy / 3D / zegar roku / kalendarz ===== */
var curView = "dial";
function showView(v) {
  curView = v;
  try { localStorage.setItem("view", v) } catch (e) {}   // po odświeżeniu albo ponownym otwarciu strony wracamy do tego widoku
  $("dialView").hidden = v !== "dial"; $("v3").hidden = v !== "3d";
  if ($("yearView")) $("yearView").hidden = v !== "year";
  if ($("calView")) $("calView").hidden = v !== "cal";
  if ($("dialExtras")) $("dialExtras").hidden = v === "year" || v === "cal";   // kafelki i Księżyc tylko przy zegarze i 3D
  [["dialBtn", "dial"], ["viewBtn", "3d"], ["yearBtn", "year"], ["calBtn", "cal"]].forEach(function (x) { if ($(x[0])) $(x[0]).setAttribute("aria-pressed", v === x[1] ? "true" : "false") });
  if (v === "year" && window.YearClock) YearClock.render();
  if (v === "cal" && window.Cal) Cal.render();
  if (window.Sun3D) Sun3D.refresh()
}
if ($("dialBtn")) $("dialBtn").onclick = function () { showView("dial") };
if ($("yearBtn")) $("yearBtn").onclick = function () { showView(curView === "year" ? "dial" : "year") };
if ($("calBtn")) $("calBtn").onclick = function () { showView(curView === "cal" ? "dial" : "cal") };

/* ===== Start ===== */
setLang(detectLang());
if ($("mgrid")) buildMonthScale();
apply();
setInterval(tick, 1000);
// Przywróć ostatni widok po odświeżeniu - dopiero po załadowaniu wszystkich skryptów (zegar roku, 3D, kalendarz)
window.addEventListener("load", function () {
  renderMoonDet();   // data kalendarza orbity w kafelku Księżyca (calendar.js ładuje się po main.js)
  var sv = null;
  try { sv = localStorage.getItem("view") } catch (e) {}
  if (sv === "year" || sv === "cal") showView(sv)
  else if (sv === "3d" && window.Sun3D) Sun3D.restore()
});
