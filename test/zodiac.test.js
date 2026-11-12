/* Testy js/zodiac.js: porównanie z biblioteką astronomy-engine (dokładność rzędu sekund łuku).
   Uruchom: node test/zodiac.test.js   (wymaga npm install; astronomy-engine jest tylko w devDependencies) */
const A = require("astronomy-engine"), ZD = require("../js/zodiac.js");
let fails = 0;
function check(name, ok, info) { if (!ok) { fails++; console.log("BŁĄD  " + name + (info ? "  " + info : "")) } }
function dif(a, b) { return Math.abs(((a - b) % 360 + 540) % 360 - 180) }
const DAY = 864e5, from = Date.UTC(1900, 0, 1), to = Date.UTC(2100, 0, 1);

// 1. Księżyc: długość i szerokość ekliptyczna (prawdziwa równonoc daty) w latach 1900-2040
//    (dalej ΔT, czyli spowolnienie obrotu Ziemi, jest tylko przewidywane i wzorzec przyjmuje inne wartości)
let maxL = 0, maxB = 0;
for (let t = from; t < Date.UTC(2040, 0, 1); t += DAY * 1.37) {
  const e = A.EclipticGeoMoon(new Date(t)), m = ZD.moon(t);
  maxL = Math.max(maxL, dif(m.lon, e.lon)); maxB = Math.max(maxB, Math.abs(m.lat - e.lat))
}
console.log("Księżyc: największy błąd długości " + (maxL * 3600).toFixed(1) + '", szerokości ' + (maxB * 3600).toFixed(1) + '"');
check("długość Księżyca < 30\"", maxL * 3600 < 30); check("szerokość Księżyca < 15\"", maxB * 3600 < 15);

// 2. Księżyc z paralaksą (Warszawa, Sydney, Tromsø): RA/Dec względem wzorca
const places = [[52.23, 21.01], [-33.87, 151.21], [69.65, 18.96]];
let maxQ = 0;
for (const [la, lo] of places) {
  const ob = new A.Observer(la, lo, 0);
  for (let t = Date.UTC(2020, 0, 1); t < Date.UTC(2030, 0, 1); t += DAY * 0.71) {
    const q = ZD.moonEq(t, la, lo), w = A.Equator(A.Body.Moon, new Date(t), ob, true, false);
    maxQ = Math.max(maxQ, dif(q.ra, w.ra * 15) * Math.cos(q.dec * Math.PI / 180), Math.abs(q.dec - w.dec))
  }
}
console.log("Księżyc z miejsca obserwatora: największy błąd " + (maxQ * 3600).toFixed(1) + '"');
check("Księżyc z paralaksą < 60\"", maxQ * 3600 < 60);

// 3. Gwiazdozbiory: ten sam wynik co wzorzec dla losowych punktów nieba (poza pasem 0,02° przy granicach)
let n = 0, bad = 0, seed = 7;
function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
for (let i = 0; i < 20000; i++) {
  const t = from + rnd() * (to - from), ra = rnd() * 360, dec = Math.asin(2 * rnd() - 1) * 180 / Math.PI;
  // wzorzec chce J2000: przeliczamy średni równik daty na J2000 obrotem z biblioteki
  const v = A.VectorFromSphere(new A.Spherical(dec, ra, 1), A.MakeTime(new Date(t)));
  const j = A.EquatorFromVector(A.RotateVector(A.Rotation_EQD_EQJ(A.MakeTime(new Date(t))), v));
  const ours = ZD.constel(ra, dec, t), ref = A.Constellation(j.ra, j.dec).symbol;
  if (ours !== ref) {
    let near = false;   // czy punkt leży tuż przy granicy (wtedy różnica to szum rzędu sekund łuku)
    for (const [dr, dd] of [[0.02, 0], [-0.02, 0], [0, 0.02], [0, -0.02]]) if (A.Constellation(j.ra + dr / 15, j.dec + dd).symbol === ours) near = true;
    if (!near) bad++
  }
  n++
}
check("gwiazdozbiory zgodne ze wzorcem", bad === 0, bad + " / " + n);

// 4. 13 gwiazdozbiorów na ekliptyce, w tej kolejności, w latach 1900-2100
for (const y of [1900, 2000, 2026, 2100]) {
  const t = Date.UTC(y, 0, 1), seq = [];
  for (let l = 0; l < 360; l += 0.05) { const c = ZD.eclConst(l, t); if (seq[seq.length - 1] !== c) seq.push(c) }
  if (seq[0] === seq[seq.length - 1]) seq.pop();
  const s = seq.join(" "), exp = ZD.ECL13.join(" ");
  check("ekliptyka " + y + ": 13 gwiazdozbiorów", s === exp, s)
}

// 5. Ajanamsa Lahiri: 23°51'26" ±30" na 1.01.2000 (Indian Astronomical Ephemeris, średnia ok. 23°51'41" bez nutacji)
const ay = ZD.ayan(ZD.TT(Date.UTC(2000, 0, 1)));
console.log("Ajanamsa Lahiri 2000-01-01: " + ay.toFixed(4) + "°");
check("ajanamsa 2000", Math.abs(ay - (23 + 51 / 60 + 41 / 3600)) < 30 / 3600, ay);

// 6. Słońce (VSOP87): długość względem wzorca w latach 1900-2100; zachodni znak tuż przed i po równonocy i przesileniu
// (wzorzec daje długość z nutacją, nasza sunLon jest bez niej)
const sunRef = t => A.SunPosition(new Date(t)).elon - ZD.nut(ZD.TT(t)).dpsi;
let maxS = 0;
for (let t = from; t < to; t += DAY * 3.3) maxS = Math.max(maxS, dif(ZD.sunLon(t), sunRef(t)));
console.log("Słońce: największy błąd długości " + (maxS * 3600).toFixed(2) + '"');
check("długość Słońca < 3\"", maxS * 3600 < 3);
for (const y of [1990, 2026, 2050]) {
  const eq = A.Seasons(y), sMar = eq.mar_equinox.date.getTime(), sJun = eq.jun_solstice.date.getTime();
  check(y + ": Słońce 1 min przed równonocą w Rybach", ZD.sunSign(sMar - 6e4, "trop").id === "Psc");
  check(y + ": Słońce 1 min po równonocy w Baranie", ZD.sunSign(sMar + 6e4, "trop").id === "Ari");
  check(y + ": Słońce 1 min po przesileniu w Raku", ZD.sunSign(sJun + 6e4, "trop").id === "Cnc")
}

// 7. Księżyc na niebie: z całego okresu 1900-2100 zbieramy gwiazdozbiory spoza zodiaku; wszystkie muszą mieć tłumaczenie
const extra = {};
for (let t = Date.UTC(1900, 0, 1); t < Date.UTC(2100, 0, 1); t += 36e5 * 3) {
  for (const [la, lo] of [[70, 0], [-70, 0], [0, 0]]) { const c = ZD.moonSign(t, "sky", la, lo).id; if (ZD.ECL13.indexOf(c) < 0) extra[c] = 1 }
}
console.log("Księżyc bywa też w: " + Object.keys(extra).sort().join(", "));
check("nazwy gwiazdozbiorów spoza zodiaku", Object.keys(extra).every(c => ["Aur", "Cet", "Crv", "Ori", "Sex"].indexOf(c) >= 0), Object.keys(extra).join(","));

// 8. Bez NaN; stopnie w znaku 0..30 (w gwiazdozbiorach do 50, najdłuższa jest Panna, ok. 44°)
for (const sys of ZD.SYS) for (let t = from; t < to; t += DAY * 97) {
  const m = ZD.moonSign(t, sys, 52, 21), s = ZD.sunSign(t, sys), lim = sys === "trop" || sys === "sid" ? 30 : 50;
  check(sys + " wynik bez NaN", m && s && m.id && s.id && [m, s].every(z => z.deg === null || (z.deg >= 0 && z.deg < lim)), new Date(t).toISOString())
}

// 9. Złe współrzędne: brak wyniku zamiast zmyślonego gwiazdozbioru
check("NaN -> brak gwiazdozbioru", ZD.constel(NaN, 10, Date.now()) === null);
check("zepsute miejsce -> brak znaku Księżyca na niebie", ZD.moonSign(Date.now(), "sky", NaN, 21) === null);
check("zepsute miejsce nie psuje innych systemów", ZD.moonSign(Date.now(), "trop", NaN, NaN).id.length === 3);

// 10. Zmiany znaków: chwila zmiany zgadza się co do 30 s ze zmianą wyliczoną z położenia wzorca
for (const sys of ["trop", "sid", "ecl13"]) {
  let t = Date.UTC(2026, 0, 1);
  for (let k = 0; k < 6; k++) {
    const c = ZD.nextChange("moon", t, sys, 52, 21);
    if (!c) { check(sys + ": jest następna zmiana Księżyca", false); break }
    const before = ZD.moonSign(c.ms - 3e4, sys, 52, 21).id, after = ZD.moonSign(c.ms + 3e4, sys, 52, 21).id;
    check(sys + ": zmiana Księżyca w dobrej chwili", before !== after && after === c.to.id, new Date(c.ms).toISOString());
    t = c.ms + 6e4
  }
}
{ // Słońce wchodzi w Barana dokładnie w równonocy (wzorzec), co do 1 min
  const eq = A.Seasons(2027).mar_equinox.date.getTime(), c = ZD.nextChange("sun", eq - 5 * DAY, "trop");
  check("Słońce wchodzi w Barana w chwili równonocy", c && c.to.id === "Ari" && Math.abs(c.ms - eq) < 6e4, c && ((c.ms - eq) / 1e3 + " s"))
}

console.log(fails ? fails + " błędów" : "Wszystko w porządku");
process.exit(fails ? 1 : 0);
