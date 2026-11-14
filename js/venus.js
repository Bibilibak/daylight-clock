/* ===== Wenus: cykl synodyczny (ok. 584 dni) =====
   Cztery części cyklu, w kolejności:
     0 koniunkcja dolna  – Wenus między Ziemią a Słońcem, ginie w blasku (ok. 8 dni),
     1 Lucyfer           – gwiazda poranna, na zachód od Słońca, wschodzi przed nim (ok. 263 dni),
     2 koniunkcja górna  – Wenus za Słońcem (ok. 50 dni),
     3 Hesperus          – gwiazda wieczorna, na wschód od Słońca, świeci po zachodzie (ok. 263 dni).
   Granica: różnica długości ekliptycznych Wenus i Słońca mniejsza niż PROG stopni = koniunkcja. 6° daje
   długości części bliskie tym z obserwacji (8 i 50 dni); to umowa, bo widoczność zależy też od miejsca i pogody.
   Położenie: elementy keplerowskie JPL (E. M. Standish, „Approximate Positions of the Planets”, tabela 1,
   lata 1800–2050, błąd Wenus ok. 1'), Ziemia = środek masy Ziemia–Księżyc. Jasność: Meeus, rozdz. 41.
   Plik potrzebuje ZD (js/zodiac.js): czas TT, nutacja i przeliczenie na współrzędne równikowe (znaki zodiaku). */
var Venus = (function () {
  var R = Math.PI / 180, PROG = 6, DAY = 864e5;
  function nd(x) { return (x % 360 + 360) % 360 }
  // a, e, I, L, ϖ, Ω: wartość w J2000 i zmiana na stulecie
  var VE = [0.72333566, 0.00000390, 0.00677672, -0.00004107, 3.39467605, -0.00078890, 181.97909950, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418],
    EE = [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0];
  function helio(E, T) {   // położenie heliocentryczne w AU, ekliptyka J2000
    var a = E[0] + E[1] * T, e = E[2] + E[3] * T, I = (E[4] + E[5] * T) * R, L = E[6] + E[7] * T, w = E[8] + E[9] * T, O = E[10] + E[11] * T,
      M = nd(L - w), om = (w - O) * R, k, i;
    if (M > 180) M -= 360;
    M *= R; k = M + e * Math.sin(M);
    for (i = 0; i < 6; i++) k -= (k - e * Math.sin(k) - M) / (1 - e * Math.cos(k));
    var xp = a * (Math.cos(k) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(k),
      co = Math.cos(om), so = Math.sin(om), cO = Math.cos(O * R), sO = Math.sin(O * R), cI = Math.cos(I), sI = Math.sin(I);
    return { x: (co * cO - so * sO * cI) * xp + (-so * cO - co * sO * cI) * yp,
      y: (co * sO + so * cO * cI) * xp + (-so * sO + co * cO * cI) * yp,
      z: so * sI * xp + co * sI * yp }
  }
  /* Wenus widziana z Ziemi w chwili ms: lon / lat (ekliptyka, średnia równonoc daty), d = lon Wenus − lon Słońca
     (−180…180; ujemne = na zachód od Słońca, gwiazda poranna), dist (AU), mag (jasność w magnitudo, mniej = jaśniej). */
  function pos(ms) {
    var T = ZD.TT(ms), v = helio(VE, T), e = helio(EE, T),
      x = v.x - e.x, y = v.y - e.y, z = v.z - e.z, D = Math.sqrt(x * x + y * y + z * z),
      r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z), Re = Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z),
      pr = 5028.796195 * T / 3600,   // precesja w długości od J2000 do daty
      lon = nd(Math.atan2(y, x) / R + pr), sun = nd(Math.atan2(-e.y, -e.x) / R + pr), d = nd(lon - sun),
      i = Math.acos(Math.max(-1, Math.min(1, (r * r + D * D - Re * Re) / (2 * r * D)))) / R;
    if (d > 180) d -= 360;
    return { lon: lon, lat: Math.asin(z / D) / R, d: d, dist: D,
      mag: -4.40 + 5 * Math.log10(r * D) + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i * i * i }
  }
  function partOf(p) { return Math.abs(p.d) < PROG ? (p.dist < 1 ? 0 : 2) : p.d < 0 ? 1 : 3 }
  function part(ms) { return partOf(pos(ms)) }

  /* Przejścia między częściami w [a, b): krok co dobę (najkrótsza część ma kilka dni), potem dzielenie na pół do 1 min.
     Lista { ms, k: część, która się zaczyna }. Doby liczone raz (pamięć na kilka zakresów). */
  var memo = {};
  function events(a, b) {
    var key = Math.floor(a / DAY) + "|" + Math.ceil(b / DAY);
    if (memo[key]) return memo[key];
    var out = [], t = Math.floor(a / DAY) * DAY, c = part(t), n;
    for (; t < b; t += DAY) {
      n = part(t + DAY);
      if (n !== c) {
        var lo = t, hi = t + DAY;
        while (hi - lo > 6e4) { var m = (lo + hi) / 2; if (part(m) === c) lo = m; else hi = m }
        if (hi >= a && hi < b) out.push({ ms: hi, k: n });
        c = n
      }
    }
    if (Object.keys(memo).length > 12) memo = {};
    return (memo[key] = out)
  }
  /* Cykl, w którym leży chwila ms: b = [początek koniunkcji dolnej, Lucyfera, koniunkcji górnej, Hesperusa,
     następnej koniunkcji dolnej], k = bieżąca część, from / to = jej początek i koniec, next = następne przejście. */
  function cycle(ms) {
    var ev = events(ms - 640 * DAY, ms + 640 * DAY), i, s = -1;
    for (i = 0; i < ev.length; i++) if (ev[i].k === 0 && ev[i].ms <= ms) s = i;
    if (s < 0 || s + 4 >= ev.length) return null;
    var b = [0, 1, 2, 3, 4].map(function (j) { return ev[s + j].ms }), k = 0;
    while (k < 3 && ms >= b[k + 1]) k++;
    return { b: b, k: k, from: b[k], to: b[k + 1], next: ev[s + k + 1] }
  }
  // znak zodiaku Wenus w systemie sys (jak ZD.sunSign; „sky” = gwiazdozbiór na niebie, z szerokością ekliptyczną)
  function sign(ms, sys) {
    var p = pos(ms), n = ZD.nut(ZD.TT(ms)), q = ZD.toEq(p.lon, p.lat, n.eps0);
    return ZD.signOf({ lonM: p.lon, lon: nd(p.lon + n.dpsi), ra: q.ra, dec: q.dec }, sys, ms)
  }
  // Wenus widziana z Ziemi jako wektor na płaszczyźnie ekliptyki (AU), do róży Wenus
  function geo(ms) { var T = ZD.TT(ms), v = helio(VE, T), e = helio(EE, T), pr = 5028.796195 * T / 3600 * R,
    x = v.x - e.x, y = v.y - e.y; return { x: x * Math.cos(pr) - y * Math.sin(pr), y: x * Math.sin(pr) + y * Math.cos(pr) } }
  /* Koniunkcje dolne w [a, b): d przechodzi z plusa (wieczorem) na minus (rano), Wenus bliżej niż 1 AU.
     Lista { ms, lon: kierunek Wenus i Słońca w tej chwili }. */
  function infConj(a, b) {
    var out = [], t = a, d0 = pos(t).d, p, d1;
    for (; t < b; t += DAY) {
      p = pos(t + DAY); d1 = p.d;
      if (d0 > 0 && d1 <= 0 && p.dist < 1) {
        var lo = t, hi = t + DAY;
        while (hi - lo > 6e4) { var m = (lo + hi) / 2; if (pos(m).d > 0) lo = m; else hi = m }
        out.push({ ms: hi, lon: pos(hi).lon })
      }
      d0 = d1
    }
    return out
  }
  // współrzędne równikowe (średni równik daty), do kąta godzinnego na tarczy
  function eq(ms) { var p = pos(ms); return ZD.toEq(p.lon, p.lat, ZD.nut(ZD.TT(ms)).eps0) }
  // kolory części cyklu: koniunkcje szare, Lucyfer złoty (świt), Hesperus fioletowy (zmierzch)
  var COL = ["#9aa3b2", "#e8b04a", "#9aa3b2", "#8a6cc4"];
  return { pos: pos, part: part, events: events, cycle: cycle, sign: sign, eq: eq, geo: geo, infConj: infConj, COL: COL, PROG: PROG }
})();
if (typeof module !== "undefined") module.exports = Venus;
