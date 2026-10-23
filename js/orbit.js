/* ===== Kalendarz orbity: obliczenia =====
   Rok orbity zaczyna się w dniu równonocy marcowej (kąt roku 0°), wspólnym dla całej Ziemi.
   4 pory roku po 90°, w każdej 3 miesiące po 30° kąta orbity. Ziemia biegnie po orbicie nierówno
   (najszybciej w peryhelium), więc miesiące mają 29–32 dni. Doba zaczyna się od wschodu Słońca, jak na tarczy
   (w dzień / noc polarną od słonecznej północy): dzień 1 miesiąca to doba, w której Słońce przechodzi przez
   granicę 30°·k. Dobę nazywamy datą jej górowania (strefa miasta). Zob. OTWARTE-PYTANIA.md. */
var OrbitCal = (function () {
  var cache = {}, local = {};

  // chwila, w której Słońce przechodzi przez kąt a (Newton; Słońce idzie ok. 0,9856° na dobę)
  function cross(a, ms) { for (var i = 0; i < 6; i++) ms -= normDeg(sunLonDeg(ms) - a) / 0.9856 * 864e5; return ms }

  // odległość Ziemia–Słońce (km): orbita środka masy Ziemi i Księżyca + kołysanie Ziemi wokół niego (4671 km)
  function km(ms) {
    var d = ms / 864e5 - 10957.5, M = R * (357.5291 + 0.98560028 * d), e = 0.016709;
    return 149598023 * (1 - e * Math.cos(M) - e * e / 2 * (Math.cos(2 * M) - 1)) + 4671 * Math.cos(elong(ms) * R)
  }
  // aphelium (far = true) albo peryhelium: najdalszy / najbliższy punkt w promieniu 6 dni od ms0, co godzinę
  function apsis(ms0, far) {
    var best = ms0, bv = km(ms0), i, v;
    for (i = -144; i <= 144; i++) { v = km(ms0 + i * 36e5); if (far ? v > bv : v < bv) { bv = v; best = ms0 + i * 36e5 } }
    return { ms: best, km: bv }
  }

  // granice miesięcy roku orbity Y (13 chwil: 0°, 30°, … 330°, następna równonoc) i apsydy tego roku
  function year(Y) {
    if (cache[Y]) return cache[Y];
    var b = [], ms = cross(0, Date.UTC(Y, 2, 20, 12));
    for (var k = 0; k <= 12; k++) { if (k) ms = cross(k * 30 % 360, ms + 30.4 * 864e5); b.push(ms) }
    return cache[Y] = { b: b, aph: apsis(Date.UTC(Y, 6, 4), true), peri: apsis(Date.UTC(Y + 1, 0, 3), false) }
  }

  function dayN(d) { return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) }
  function dateOf(n) { var u = new Date(n * 864e5); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()) }
  // doby roku Y w wybranym miejscu: s = numery dób, w których zaczynają się miesiące (ostatni = następny rok),
  // aph / peri = doby aphelium i peryhelium. Zależą od miejsca (wschody Słońca), więc pamiętane osobno dla miejsca.
  function days(Y) {
    var key = Y + "|" + lat + "|" + lon + "|" + tz, o = year(Y);
    return local[key] || (local[key] = { s: o.b.map(sunDay), aph: sunDay(o.aph.ms), peri: sunDay(o.peri.ms) })
  }
  function starts(Y) { return days(Y).s }

  // data w kalendarzu orbity dla doby d (data jej górowania w strefie miasta)
  function date(d) {
    var n = dayN(d), Y = d.getFullYear(), s = starts(Y), k = 11;
    if (n < s[0]) { Y--; s = starts(Y) }
    while (s[k] > n) k--;
    return { year: Y, month: k, season: k / 3 | 0, day: n - s[k] + 1, len: s[k + 1] - s[k], start: s[k], yday: n - s[0] + 1, ylen: s[12] - s[0] }
  }
  // chwila wschodu, od której zaczyna się doba n (w dzień / noc polarną: słoneczna północ)
  function dayStart(n) { return sunDayStart(n) }
  // kąt roku w chwili górowania Słońca w dobie n
  function lonAt(n) { return sunLonDeg(sunNoon(n)) }
  // doba, w której Słońce jest na kącie l w roku orbity Y
  function dayAt(Y, l) { var b = year(Y).b; l = (l % 360 + 360) % 360; return dateOf(sunDay(cross(l, b[Math.floor(l / 30)] + (l % 30) / 0.9856 * 864e5))) }
  // chwila, w której Słońce jest na kącie l w roku orbity Y
  function momentAt(Y, l) { var b = year(Y).b; l = (l % 360 + 360) % 360; return cross(l, b[Math.floor(l / 30)] + (l % 30) / 0.9856 * 864e5) }
  // aphelium albo peryhelium w danej dobie: { far, km, ms } lub null
  function apsisOn(n) {
    var Y = dateOf(n).getFullYear(); if (n < starts(Y)[0]) Y--;
    var o = year(Y), d = days(Y);
    if (d.aph === n) return { far: true, km: o.aph.km, ms: o.aph.ms };
    if (d.peri === n) return { far: false, km: o.peri.km, ms: o.peri.ms };
    return null
  }
  // doby aphelium i peryhelium roku orbity Y
  function apsisDays(Y) { var d = days(Y); return { aph: d.aph, peri: d.peri } }
  // strefa: "N" i "S" poza zwrotnikami, "T" między zwrotnikami (tam pod kalendarzem dopisek o porach roku)
  function zone() { return lat >= 23.44 ? "N" : lat <= -23.44 ? "S" : "T" }

  return { year: year, starts: starts, date: date, dayN: dayN, dateOf: dateOf, dayStart: dayStart, lonAt: lonAt, dayAt: dayAt,
    apsisOn: apsisOn, apsisDays: apsisDays, zone: zone, momentAt: momentAt }
})();
