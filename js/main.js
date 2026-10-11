/* ===== Stałe i stan ===== */
var R = Math.PI / 180, cx = 170, cy = 170, r = 140, lat = 52.23, lon = 21.01, place = "", tz = "";

try {
  var s = JSON.parse(localStorage.getItem("sw") || "null");
  if (s) { lat = s.lat; lon = s.lon; place = s.name || ""; tz = s.tz || "" }
} catch (e) {}

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
function arc(a) { var p = pt(Math.min(a, 359.99)); return "M30 170 A140 140 0 " + (a > 180 ? 1 : 0) + " 1 " + p[0] + " " + p[1] }
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
  var b = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 12)), S = sol(gam(b)),
    c = (Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(S.dc)) - Math.tan(lat * R) * Math.tan(S.dc));
  if (c > 1 || c < -1) return null;
  var ha = Math.acos(c) / R, m0 = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  return {
    rise: m0 + (720 - 4 * (lon + ha) - S.eq) * 6e4,
    set: m0 + (720 - 4 * (lon - ha) - S.eq) * 6e4
  }
}

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
function drawEv(cyc, k, now) {
  var g = "", l = "", c = tzParts(now.getTime());   // dzisiejsza data w wybranym mieście
  evs.forEach(function (v, i) {
    var hh = v.t.split(":"), deg = null;
    for (var o = -1; o <= 1; o++) {
      var dt = zoned(c.year, c.month - 1, c.day + o, +hh[0], +hh[1]);   // godzina wg zegara miasta
      if (dt >= cyc.a && dt < cyc.b) { deg = k * (dt - cyc.a) }
    }
    if (deg === null) return;
    var p = pt(deg, r + 16);
    g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="var(--fg)"/><text x="' + p[0] + '" y="' + (p[1] + 4) + '" fill="var(--bg)" font-size="11" font-weight="700" text-anchor="middle">' + (i + 1) + '</text>';
    l += '<div><span>' + (i + 1) + '. ' + (v.n || t("event")).replace(/</g, "&lt;") + ' <i>(' + v.t + ')</i></span><span><b>' + deg.toFixed(1) + '°</b><a data-i="' + i + '">×</a></span></div>'
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
  $("alt").textContent = alt.toFixed(1) + "°";

  // Wschody z pięciu kolejnych dni; szukamy cyklu [wschód, następny wschód), w którym leży "teraz".
  // (Działa dla każdego miasta, także gdy data u Ciebie i w mieście się różni.)
  var days = [], cyc = null, A, B;
  for (var o = -2; o <= 2; o++) days.push(times(new Date(now.getFullYear(), now.getMonth(), now.getDate() + o)));
  for (var i = 0; i < 4 && !cyc; i++) {
    A = days[i]; B = days[i + 1];
    if (A && B && now >= A.rise && now < B.rise) cyc = { a: A.rise, b: B.rise, set: A.set, rise: A.rise }
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
    nd = k * ((cyc.rise + cyc.set) / 2 - cyc.a);

  drawEv(cyc, k, now);
  put("sun", deg); put("set", sd); put("noon", nd);
  if ($("sunnum")) {
    put("mid", (sd + 360) / 2);                          // środek nocy
    var sp = pt(deg);                                    // dokładny stopień w kółku ze Słońcem
    $("sunnum").setAttribute("x", sp[0]); $("sunnum").setAttribute("y", sp[1] + 3.5);
    $("sunnum").textContent = Math.round(deg);
    var ml = "";                                         // liczby przy znacznikach: wschód, górowanie, zachód, północ
    [0, nd, sd, (sd + 360) / 2].forEach(function (g) {
      var q = pt(g, r + 22);
      ml += '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] + 4).toFixed(1) + '">' + Math.round(g) + '°</text>'
    });
    if (ml !== lastML) { $("labels").innerHTML = ml; lastML = ml }
  }
  if ($("light")) $("light").textContent = deg < sd
    ? t("lightDay").replace("{a}", Math.round(sd)).replace("{b}", Math.round(sd - deg))
    : t("lightNight").replace("{a}", Math.round(sd));
  // wskazówka centralna: obrót o kąt "deg" wokół środka tarczy
  $("hand").setAttribute("transform", "rotate(" + deg + " " + cx + " " + cy + ")");
  $("day").setAttribute("d", arc(sd));
  $("prog").setAttribute("d", deg > 0.1 ? arc(deg) : "");
  $("deg").textContent = deg.toFixed(1) + "°";
  $("nd").textContent = nd.toFixed(1) + "°";
  $("sd").textContent = sd.toFixed(1) + "°";
  if ($("near")) $("near").textContent = nearText(deg, nd, sd);

  live = { lat: lat, dec: S.dc / R, deg: deg };   // dla js/view3d.js
}

/* ===== Lokalizacja ===== */
function apply() {
  $("lat").value = lat; $("lon").value = lon;
  try { localStorage.setItem("sw", JSON.stringify({ lat: lat, lon: lon, name: place, tz: tz })) } catch (e) {}
  if ($("where")) $("where").textContent = "📍 " + (place ? place + " · " : "") + lat + "°, " + lon + "°";
  setMsg("sinceRise");
  tick()
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
    tick()
  }
});

/* ===== Przycisk widoku 3D =====
   Obsługę przycisku dodaje js/view3d.js. Jeśli ten plik się nie załadował
   (brak na serwerze albo błąd), pokaż komunikat zamiast "nic się nie dzieje". */
if ($("viewBtn")) $("viewBtn").addEventListener("click", function () {
  if (!window.Sun3D) setMsg("no3d")
});

/* ===== Start ===== */
setLang(detectLang());
apply();
setInterval(tick, 1000);
