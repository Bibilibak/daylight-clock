/* ===== Zakładka Rok, widok Wenus: róża Wenus (8 lat = 5 cykli po ok. 584 dni) =====
   Ziemia w środku, a wokół droga Wenus widziana z Ziemi przez 8 lat (płaszczyzna ekliptyki, 100 jednostek rysunku = 1 AU).
   Kolor drogi = część cyklu (jak w kafelku pod Księżycem); minione części mocniej, przyszłe jaśniej.
   Małe pętle blisko Ziemi = koniunkcje dolne. Kierunki tych pięciu spotkań, odłożone na zewnętrznym okręgu i połączone
   po kolei, dają pięciokąt (gwiazdę). Okno: dwa cykle przed bieżącym i dwa po nim.
   Kierunki jak na kole orbity: 0° (równonoc marcowa) po lewej, 90° u góry; na półkuli południowej obrócone o 180°. */
var VenusRose = (function () {
  var S = 100, RO = 186, DAY = 864e5, memo = null;
  function rot() { return lat < 0 ? 180 : 0 }
  function xy(x, y) { var a = rot() * R, X = x * Math.cos(a) - y * Math.sin(a), Y = x * Math.sin(a) + y * Math.cos(a); return [200 - S * X, 200 - S * Y] }
  function P(l, r) { var th = (l + rot()) * R; return [200 - r * Math.cos(th), 200 - r * Math.sin(th)] }
  function f(p) { return p[0].toFixed(1) + "," + p[1].toFixed(1) }

  // sześć koniunkcji dolnych (5 cykli) i droga co 2 doby; liczone raz na dobę
  function data(now) {
    var day = Math.floor(now / DAY) + "|" + rot();
    if (memo && memo.day === day) return memo;
    var C = 583.92 * DAY, cj = Venus.infConj(now - 3 * C, now + 6 * C), i, k = -1, tr = [], t;
    for (i = 0; i < cj.length; i++) if (cj[i].ms <= now) k = i;
    var s = Math.min(Math.max(0, k - 2), cj.length - 6), six = cj.slice(s, s + 6);
    for (t = six[0].ms; t <= six[5].ms; t += 2 * DAY) { var g = Venus.geo(t); tr.push({ t: t, p: xy(g.x, g.y), k: Venus.part(t) }) }
    return (memo = { day: day, cj: six, tr: tr, cyc: k - s + 1 })
  }

  function svg(now) {
    var d = data(now), h = '', seg = [], cur = null, j;
    h += '<circle cx="200" cy="200" r="' + RO + '" fill="none" stroke="var(--mut)" stroke-opacity=".3"/>';
    h += '<circle cx="200" cy="200" r="' + S + '" fill="none" stroke="var(--sun)" stroke-opacity=".5" stroke-dasharray="3 4"/>';   // droga Słońca (1 AU)
    // pięciokąt: kierunki koniunkcji po kolei
    h += '<polyline points="' + d.cj.map(function (c) { return f(P(c.lon, RO)) }).join(" ") + '" fill="none" stroke="var(--fg)" stroke-opacity=".35" stroke-width="1"/>';
    // droga Wenus odcinkami tego samego koloru (część cyklu) i tej samej strony „teraz”
    function flush() {
      if (seg.length > 1) h += '<polyline points="' + seg.map(f).join(" ") + '" fill="none" stroke="' + Venus.COL[cur.k] + '" stroke-width="' + (cur.past ? 2 : 1.4) +
        '" stroke-opacity="' + (cur.past ? 1 : .4) + '" stroke-linejoin="round" stroke-linecap="round"/>'
    }
    d.tr.forEach(function (q) {
      var past = q.t <= now;
      if (!cur || cur.k !== q.k || cur.past !== past) { var last = seg[seg.length - 1]; flush(); seg = last ? [last] : []; cur = { k: q.k, past: past } }
      seg.push(q.p)
    });
    flush();
    // koniunkcje na zewnętrznym okręgu z miesiącem i rokiem (szósta to prawie ta sama, co pierwsza: bez podpisu)
    for (j = 0; j < 5; j++) {
      var c = d.cj[j], p = P(c.lon, RO), lp = P(c.lon, RO + 22), past = c.ms <= now;
      h += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="5" fill="' + (past ? "var(--fg)" : "var(--bg)") + '" stroke="var(--fg)" stroke-width="1.5"/>' +
        '<text class="vrl" x="' + lp[0].toFixed(1) + '" y="' + (lp[1] + 4).toFixed(1) + '" text-anchor="middle">' +
        esc(new Date(c.ms).toLocaleDateString(loc(), { month: "short", year: "numeric" })) + '</text>'
    }
    // teraz: Słońce na swoim okręgu, Wenus na drodze, Ziemia w środku
    var g = Venus.geo(now), vp = xy(g.x, g.y), sp = P(sunLonDeg(now), S);
    h += '<line x1="200" y1="200" x2="' + vp[0].toFixed(1) + '" y2="' + vp[1].toFixed(1) + '" stroke="var(--fg)" stroke-opacity=".5" stroke-width="1"/>' +
      '<circle cx="' + sp[0].toFixed(1) + '" cy="' + sp[1].toFixed(1) + '" r="8" fill="var(--sun)" stroke="var(--bg)" stroke-width="2"/>' +
      '<circle cx="' + vp[0].toFixed(1) + '" cy="' + vp[1].toFixed(1) + '" r="6.5" fill="' + Venus.COL[Venus.part(now)] + '" stroke="var(--bg)" stroke-width="2"/>' +
      '<circle cx="200" cy="200" r="6" fill="#3b82c4" stroke="var(--bg)" stroke-width="2"/>';
    return { h: h, cyc: d.cyc }
  }

  function render(box) {
    var now = Date.now(), r = svg(now), k = Venus.part(now);
    function lg(col, txt) { return '<span><i style="background:' + col + '"></i>' + esc(txt) + '</span>' }
    box.innerHTML = '<svg class="vrose" viewBox="-70 -36 540 472" role="img" aria-label="' + esc(t("vrAria")) + '">' + r.h + '</svg>' +
      '<div class="vrnow">' + esc(t("vrNow").replace("{i}", r.cyc)) + ' · <b>' + esc(t("venK" + k)) + '</b></div>' +
      '<div class="vrlg">' + lg(Venus.COL[1], t("venK1")) + lg(Venus.COL[3], t("venK3")) + lg(Venus.COL[0], t("vrConj")) +
      lg("#3b82c4", t("vrEarth")) + lg("var(--sun)", t("sunH")) + '</div>' +
      '<p class="cnote">' + esc(t("vrNote")) + '</p>'
  }
  return { render: render }
})();
