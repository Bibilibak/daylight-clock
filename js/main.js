/* ===== Stałe i stan ===== */
var R = Math.PI / 180, cx = 170, cy = 170, r = 140, lat = 52.23, lon = 21.01, place = "", tz = "";

try {
  var s = JSON.parse(localStorage.getItem("sw") || "null");
  if (s) { lat = s.lat; lon = s.lon; place = s.name || ""; tz = s.tz || "" }
} catch (e) {}

// Tryb tarczy: "noon" = od południa (tarcza stała, południe u góry), "rise" = od wschodu (0° po lewej)
var mode = "noon";
try { if (localStorage.getItem("mode") === "rise") mode = "rise" } catch (e) {}

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
// kąt od południa w zakresie -180..180 (g = stopnie od wschodu, nd = stopień górowania)
function hourAngle(g, nd) { var h = g - nd; return h > 180 ? h - 360 : h }
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
  var n = Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 864e5);
  return 2 * Math.PI / 365 * (n - 1 + (d.getUTCHours() - 12) / 24)
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

/* ===== TRZY RÓŻNE WARTOŚCI KSIĘŻYCA (nie mylić) =====
   1. kąt fazy ph (0-360°): miejsce w cyklu synodycznym od nowiu do nowiu. Pokazuje go pasek miesiąca.
   2. oświetlenie illum (0-1): jaka część widocznej tarczy jest jasna (tekst "5% oświetlenia").
   3. kąt na tarczy dobowej: położenie względem lokalnego południka, w tym samym układzie co Słońce
      (H z moonPos, odłożone od znacznika górowania Słońca nd + off). Pokazuje go wskazówka i znacznik na tarczy. */
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
  return { H: normDeg(H / R), alt: alt / R, dec: dc / R, ph: ph, illum: (1 - Math.cos(ph * R)) / 2 }
}

// faza Księżyca = o ile jego długość ekliptyczna wyprzedza Słońce (0 nów, 90 pierwsza kwadra, 180 pełnia, 270 ostatnia)
function sunLonDeg(ms) {   // długość ekliptyczna Słońca w stopniach (0° = równonoc wiosenna)
  var d = ms / 864e5 - 10957.5, Ms = R * (357.5291 + 0.98560028 * d);
  return (((Ms + R * (1.9148 * Math.sin(Ms) + 0.02 * Math.sin(2 * Ms)) + R * 102.9372 + Math.PI) / R) % 360 + 360) % 360
}
function elong(ms) {
  var d = ms / 864e5 - 10957.5, M = R * (134.963 + 13.064993 * d), l = R * (218.316 + 13.176396 * d) + R * 6.289 * Math.sin(M);
  return ((l / R - sunLonDeg(ms)) % 360 + 360) % 360
}
// moment nowiu: poprawiamy przybliżenie kilkoma krokami (Księżyc oddala się od Słońca o ok. 12,19° na dobę)
function newMoonNear(ms) { for (var i = 0; i < 4; i++) ms -= normDeg(elong(ms)) / 12.19 * 864e5; return ms }
// dzień cyklu liczony z CZASU od ostatniego nowiu (nów = początek dnia 1), nie z położenia na tarczy dobowej
function lunarCycle(now) {
  var t = now.getTime(), last = newMoonNear(t - elong(t) / 12.19 * 864e5);
  if (last > t) last = newMoonNear(last - 29.53 * 864e5);
  var next = newMoonNear(last + 29.53 * 864e5);
  if (next <= t) { last = next; next = newMoonNear(last + 29.53 * 864e5) }
  return { day: Math.floor((t - last) / 864e5) + 1, elapsed: (t - last) / 864e5, length: (next - last) / 864e5 }
}
function phaseIdx(p) {   // 0 nów, 1 sierp przyb., 2 I kwadra, 3 garb przyb., 4 pełnia, 5 garb ubyw., 6 III kwadra, 7 sierp ubyw.
  return p < 12 || p >= 348 ? 0 : p < 78 ? 1 : p < 102 ? 2 : p < 168 ? 3 : p < 192 ? 4 : p < 258 ? 5 : p < 282 ? 6 : 7
}
function phaseGlyph(p, cx, cy, rr) {   // ikona fazy: ciemna tarcza + jasna część (limb + terminator)
  var c = Math.cos(p * R), wax = p < 180, top = cy - rr, bot = cy + rr,
    lit = "M" + cx + " " + top + "A" + rr + " " + rr + " 0 0 " + (wax ? 1 : 0) + " " + cx + " " + bot +
      "A" + Math.abs(rr * c).toFixed(2) + " " + rr + " 0 0 " + (wax ? (c > 0 ? 0 : 1) : (c > 0 ? 1 : 0)) + " " + cx + " " + top + "Z";
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="#4a5068" stroke="#8ea3c2" stroke-width="1.2"/><path d="' + lit + '" fill="#e6ebf5"/>'
}
var lastGlyph = "", lastIcon = "";

/* ===== Wydarzenia użytkownika ===== */
var evs = [];
try { evs = JSON.parse(localStorage.getItem("swe") || "[]") } catch (e) {}

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
function drawEv(cyc, k, now, off, nd) {
  var g = "", l = "", c = tzParts(now.getTime());   // dzisiejsza data w wybranym mieście
  evs.forEach(function (v, i) {
    var hh = v.t.split(":"), deg = null;
    for (var o = -1; o <= 1; o++) {
      var dt = zoned(c.year, c.month - 1, c.day + o, +hh[0], +hh[1]);   // godzina wg zegara miasta
      if (dt >= cyc.a && dt < cyc.b) { deg = k * (dt - cyc.a) }
    }
    if (deg === null) return;
    var p = pt(deg + off, r + 32);
    g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="var(--fg)"/><text x="' + p[0] + '" y="' + (p[1] + 4) + '" fill="var(--bg)" font-size="11" font-weight="700" text-anchor="middle">' + (i + 1) + '</text>';
    l += '<div><span>' + (i + 1) + '. ' + (v.n || t("event")).replace(/</g, "&lt;") + ' <i>(' + v.t + ')</i></span><span><b>' + (mode === "noon" ? signedTxt(hourAngle(deg, nd), 1) : deg.toFixed(1)) + '°</b><a data-i="' + i + '">×</a></span></div>'
  });
  $("evs").innerHTML = g;
  if (l !== lastL) { $("evl").innerHTML = l; lastL = l }
}

/* ===== Odczyt względem najbliższego znacznika =====
   Znaczniki doby: wschód (0°), południe, zachód, północ (środek nocy).
   Zamiast dużej liczby od wschodu: małe "12° 30′ do południa". 1′ (minuta łuku) = 4 s. */
function nearText(deg, nd, sd) {
  var m = [[0, 0], [nd, 1], [sd, 2], [(sd + 360) / 2, 3], [360, 0]], best = m[0];
  m.forEach(function (x) { if (Math.abs(deg - x[0]) < Math.abs(deg - best[0])) best = x });
  var diff = deg - best[0], am = Math.round(Math.abs(diff) * 60), d = Math.floor(am / 60), mm = am % 60,
    val = d ? d + "°" + (mm ? " " + mm + "′" : "") : mm + "′";
  return val + " " + t((diff < 0 ? "nb" : "na") + best[1])
}

/* ===== Odświeżanie zegara (co sekundę) ===== */
function tick() {
  var now = new Date(), S = sol(gam(now));
  var u = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60,
    H = ((u + S.eq + 4 * lon) / 4 - 180) * R;
  var alt = Math.asin(Math.sin(lat * R) * Math.sin(S.dc) + Math.cos(lat * R) * Math.cos(S.dc) * Math.cos(H)) / R;
  $("alt").textContent = signedTxt(alt, 1) + "°";   // + nad horyzontem, − pod

  // Wschody z pięciu kolejnych dni; szukamy cyklu [wschód, następny wschód), w którym leży "teraz".
  // (Działa dla każdego miasta, także gdy data u Ciebie i w mieście się różni.)
  var days = [], cyc = null, A, B;
  for (var o = -2; o <= 2; o++) days.push(times(new Date(now.getFullYear(), now.getMonth(), now.getDate() + o)));
  for (var i = 0; i < 4 && !cyc; i++) {
    A = days[i]; B = days[i + 1];
    if (A && B && now >= A.rise && now < B.rise) cyc = { a: A.rise, b: B.rise, set: A.set, rise: A.rise, noon: A.noon }
  }
  if (!cyc) {
    live = null;
    $("deg").textContent = "--°";
    if ($("near")) $("near").textContent = "";
    if ($("light")) $("light").textContent = "";
    setMsg("noSun");
    return
  }
  if (msgKey === "noSun") setMsg("sinceRise");

  var k = 360 / (cyc.b - cyc.a),
    deg = Math.min(359.99, k * (now - cyc.a)),
    sd = k * (cyc.set - cyc.a),
    nd = k * (cyc.noon - cyc.a)   // górowanie to nie zawsze dokładny środek łuku;

  var off = mode === "noon" ? 90 - nd : 0,    // obrót tarczy: "od południa" = południe zawsze u góry (90° na tarczy)
    hh = hourAngle(deg, nd);                  // kąt Słońca od południa
  drawEv(cyc, k, now, off, nd);
  put("sun", deg + off); put("set", sd + off); put("noon", nd + off);
  if ($("sunnum")) {
    put("mid", (sd + 360) / 2 + off);         // środek nocy
    if ($("rise0")) put("rise0", off);        // wschód
    var sp = pt(deg + off);                   // dokładny stopień w kółku ze Słońcem
    $("sunnum").setAttribute("x", sp[0]); $("sunnum").setAttribute("y", sp[1] + 3.5);
    $("sunnum").textContent = mode === "noon" ? (hh < -0.5 ? "−" : "") + Math.abs(Math.round(hh)) : Math.round(deg);
    var nz = mode === "noon", ml = "";        // liczby przy znacznikach: wschód, górowanie, zachód, północ
    [[off, nz ? "−" + Math.round(nd) : "0"], [nd + off, nz ? "0" : Math.round(nd)],
     [sd + off, nz ? "+" + Math.round(sd - nd) : Math.round(sd)], [(sd + 360) / 2 + off, nz ? "180" : Math.round((sd + 360) / 2)]
    ].forEach(function (m) {
      var q = pt(m[0], r - 36);
      ml += '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] + 4).toFixed(1) + '">' + m[1] + '°</text>'
    });
    if (ml !== lastML) { $("labels").innerHTML = ml; lastML = ml }
  }
  if ($("light")) $("light").textContent = deg < sd ? t("lightDay").replace("{b}", Math.round(sd - deg)) : "";
  // wskazówka centralna: obrót o kąt Słońca na tarczy
  $("hand").setAttribute("transform", "rotate(" + (deg + off) + " " + cx + " " + cy + ")");
  $("day").setAttribute("d", arcSeg(off, sd + off));
  $("prog").setAttribute("d", deg > 0.1 ? arcSeg(off, deg + off) : "");
  if ($("moonhand")) {                        // Księżyc na TEJ SAMEJ tarczy co Słońce: ten sam środek, skala i obrót "off"
    var mp = moonPos(now), c = nd + off,      // c = miejsce lokalnego górowania Słońca na tarczy (tam Księżyc ma H = 0)
      dialAng = c + mp.H,                     // kąt Księżyca na tarczy dobowej (nie to samo co faza ani oświetlenie)
      dd = Math.abs(normDeg(dialAng - (deg + off))),   // odstęp od Słońca na tarczy
      mr = dd < 10 ? 158 : r,                 // blisko Słońca znacznik wysuwamy poza pierścień (kąt zostaje prawdziwy)
      cH = (Math.sin(0.125 * R) - Math.sin(lat * R) * Math.sin(mp.dec * R)) / (Math.cos(lat * R) * Math.cos(mp.dec * R)),
      h0 = cH > 1 ? -1 : cH < -1 ? 181 : Math.acos(cH) / R, mq = pt(dialAng, mr), gl = phaseGlyph(mp.ph, 0, 0, 8);
    $("moonhand").setAttribute("transform", "rotate(" + dialAng + " " + cx + " " + cy + ")");
    if (gl !== lastGlyph) { $("moonmark").innerHTML = gl; lastGlyph = gl }
    $("moonmark").setAttribute("transform", "translate(" + mq[0] + " " + mq[1] + ")");
    $("moonup").setAttribute("d", h0 < 0 ? "" : h0 > 180 ? arcSeg(c, c + 359.9, 152) : arcSeg(c - h0, c + h0, 152));
    if ($("mname")) {                         // sekcja Księżyca
      var pct = mp.ph / 360 * 100, ig = phaseGlyph(mp.ph, 0, 0, 18);
      $("mname").textContent = t("ph" + phaseIdx(mp.ph));
      $("mdeg2").textContent = t("moonIll").replace("{i}", Math.round(mp.illum * 100));          // oświetlenie
      $("mfill").style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)"; $("mnow").style.left = pct + "%";   // pasek = kąt fazy
      $("mval").textContent = Math.round(mp.ph) + "°";
      $("mval").style.left = pct + "%"; $("mval").style.transform = pct > 80 ? "translateX(calc(-100% - 6px))" : "translateX(6px)";
      if (ig !== lastIcon) { $("mico").innerHTML = ig; lastIcon = ig }
    }
  }
  if ($("sinceL")) { $("sinceL").textContent = t("angleSun"); $("sinceD").textContent = t(nz ? "modeNoon" : "modeRise") }
  if ($("lightH")) $("lightH").textContent = t("lightHead").replace("{a}", Math.round(sd));   // stopnie światła = łuk dnia na tarczy
  $("deg").textContent = nz ? signedTxt(hh, 1) + "°" : deg.toFixed(1) + "°";
  $("nd").textContent = (90 - Math.abs(lat - sol(gam(new Date(cyc.noon))).dc / R)).toFixed(1) + "°";   // największa wysokość tego dnia (deklinacja w chwili górowania)
  $("sd").textContent = nz ? "+" + (sd - nd).toFixed(1) + "°" : sd.toFixed(1) + "°";
  if ($("near")) $("near").textContent = nearText(deg, nd, sd);

  live = { lat: lat, dec: S.dc / R, deg: deg, sH: normDeg(H / R), mH: mp ? mp.H : null, mDec: mp ? mp.dec : null };   // dla js/view3d.js
}

/* ===== Lokalizacja ===== */
function refreshViews() { if (window.YearClock) YearClock.render(); if (window.Cal) Cal.render() }
function apply() {
  $("lat").value = lat; $("lon").value = lon;
  try { localStorage.setItem("sw", JSON.stringify({ lat: lat, lon: lon, name: place, tz: tz })) } catch (e) {}
  if ($("where")) $("where").textContent = "📍 " + (place ? place + " · " : "") + lat + "°, " + lon + "°";
  setMsg("sinceRise");
  tick();
  refreshViews()
}

$("go").onclick = function () {
  var a = parseFloat($("lat").value), b = parseFloat($("lon").value);
  if (!isNaN(a) && !isNaN(b)) { lat = a; lon = b; place = ""; tz = ""; apply() }
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
document.querySelectorAll(".lang button").forEach(function (b) {
  b.onclick = function () {
    setLang(b.getAttribute("data-lang"));
    setMsg(msgKey);   // przetłumacz komunikat pod odczytem
    lastL = "";       // wymuś odrysowanie listy wydarzeń
    if ($("cityres")) $("cityres").innerHTML = "";   // stare wyniki były w poprzednim języku
    if (window.Sun3D) Sun3D.refresh();               // przetłumacz widok 3D
    tick();
    refreshViews()
  }
});

/* ===== Przycisk widoku 3D =====
   Obsługę przycisku dodaje js/view3d.js. Jeśli ten plik się nie załadował
   (brak na serwerze albo błąd), pokaż komunikat zamiast "nic się nie dzieje". */
if ($("viewBtn")) $("viewBtn").addEventListener("click", function () {
  if (!window.Sun3D) setMsg("no3d")
});

/* ===== Przełącznik tarczy: od południa (stała) / od wschodu ===== */
function setMode(m) {
  mode = m; lastML = "";
  try { localStorage.setItem("mode", m) } catch (e) {}
  document.querySelectorAll(".seg button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === m ? "true" : "false") });
  tick()
}
document.querySelectorAll(".seg button").forEach(function (b) { b.onclick = function () { setMode(b.getAttribute("data-mode")) } });

/* ===== Skala paska miesiąca: ikony faz i stopnie w pozycjach 0, 25, 50, 75, 100% ===== */
function buildMonthScale() {
  var ph = "", dg = "", P = [0, 25, 50, 75, 100], A = [0, 90, 180, 270, 0];
  P.forEach(function (p, i) {
    var pos = "position:absolute;left:" + p + "%;transform:translateX(-" + p + "%)";
    ph += '<svg viewBox="-9 -9 18 18" width="18" height="18" style="' + pos + '">' + phaseGlyph(A[i], 0, 0, 8) + '</svg>';
    dg += '<span style="' + pos + '">' + (p * 3.6) + '°</span>'
  });
  $("mphases").innerHTML = ph; $("mdegs").innerHTML = dg
}

/* ===== Widoki: zegar dobowy / 3D / zegar roku / kalendarz ===== */
var curView = "dial";
function showView(v) {
  curView = v;
  $("dialView").hidden = v !== "dial"; $("v3").hidden = v !== "3d";
  if ($("yearView")) $("yearView").hidden = v !== "year";
  if ($("calView")) $("calView").hidden = v !== "cal";
  if ($("dialExtras")) $("dialExtras").hidden = v === "year" || v === "cal";   // kafelki i Księżyc tylko przy zegarze i 3D
  if ($("modeSeg")) $("modeSeg").hidden = v !== "dial";
  [["yearBtn", "year"], ["calBtn", "cal"]].forEach(function (x) { if ($(x[0])) $(x[0]).setAttribute("aria-pressed", v === x[1] ? "true" : "false") });
  if (v === "year" && window.YearClock) YearClock.render();
  if (v === "cal" && window.Cal) Cal.render();
  if (window.Sun3D) Sun3D.refresh()
}
if ($("yearBtn")) $("yearBtn").onclick = function () { showView(curView === "year" ? "dial" : "year") };
if ($("calBtn")) $("calBtn").onclick = function () { showView(curView === "cal" ? "dial" : "cal") };

/* ===== Start ===== */
setLang(detectLang());
if ($("mphases")) buildMonthScale();
setMode(mode);
apply();
setInterval(tick, 1000);
