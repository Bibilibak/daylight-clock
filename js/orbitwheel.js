/* ===== Zakładka Rok, widok Orbita: precyzyjne koło orbity i lupa z dobami =====
   Koło stoi w miejscu i czyta się je jak tarczę doby: wschód roku (0°, równonoc marcowa) po lewej, południe roku (90°)
   u góry, zachód roku (180°) po prawej, północ roku (270°) na dole; Ziemia idzie zgodnie z ruchem wskazówek.
   Na półkuli południowej koło jest obrócone o 180°, żeby południe roku (najdłuższy dzień) było zawsze u góry.
   Datą jest kąt przebyty w porze roku (kalendarz orbitalny), np. „32,46° wieczoru roku”.
   Lupa pokazuje 4° orbity: każda doba (od słonecznej północy do następnej) to pas noc / dzień / noc, ok. 1° szerokości. */
(function () {
  function $(i) { return document.getElementById(i) }
  // kolory pór roku jak w kalendarzu (wiosna, lato, jesień, zima); BDC: kąt urodzin, jak w drabinie lat w Kalendarzu
  var SC = ["#4c9a3f", "#e0a000", "#c8623a", "#4f7fc4"], BDC = "#d6457a";
  function sIdx(q) { return lat < 0 ? (q + 2) % 4 : q }   // nazwy idą za światłem, na południu przesunięte o pół roku
  function part(key, i) { return t(key).split("|")[i] }
  // ucięte, nie zaokrąglone: 33,996° to jeszcze 33,99°, bo Ziemia nie doszła do 34°
  function trunc(x) { return num(Math.floor(x * 100 + 1e-9) / 100, 2) + "°" }
  function relQ(l) { var q = Math.floor(l / 90) % 4; return { q: q, a: l - q * 90 } }
  function short(n) { return OrbitCal.dateOf(n).toLocaleDateString(loc(), { day: "numeric", month: "short" }) }
  function rot() { return lat < 0 ? 180 : 0 }
  // punkt koła: 0° po lewej, 90° u góry, 180° po prawej, 270° na dole (rysunek 400×400, środek 200,200)
  function P(a, r) { var th = (a + rot()) * R; return [200 - r * Math.cos(th), 200 - r * Math.sin(th)] }
  function f(p) { return p[0].toFixed(1) + "," + p[1].toFixed(1) }
  function arc(a0, a1, r) { return "M" + f(P(a0, r)) + " A" + r + " " + r + " 0 " + (((a1 - a0) % 360 + 360) % 360 > 180 ? 1 : 0) + " 1 " + f(P(a1, r)) }

  var tm = Date.now(), live = true;   // pokazywana chwila; live: idzie za zegarem
  // doby n-k…n+k wokół doby n: { n, a, rise, set, b } (słoneczna północ, wschód, zachód, następna północ; sunDayParts w main.js)
  function days(n, k) {
    var list = [];
    for (var i = n - k; i <= n + k; i++) { var p = sunDayParts(i); p.n = i; list.push(p) }
    return list
  }

  function wheel(L, Q, d) {
    var h = '<defs><radialGradient id="owE" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#9fd3ff"/><stop offset=".55" stop-color="#3b82c4"/>' +
      '<stop offset="1" stop-color="#1d4f86"/></radialGradient></defs>', a, q, p;
    for (q = 0; q < 4; q++)   // pory roku: kolorowy pas, bieżąca mocniej
      h += '<path d="' + arc(q * 90 + 0.4, q * 90 + 89.6, 160) + '" fill="none" stroke="' + SC[sIdx(q)] + '" stroke-width="12" stroke-opacity="' + (q === Q.q ? 1 : .35) + '"/>';
    var tk = "";   // kreski co 1°, dłuższe co 5° i 10°
    for (a = 0; a < 360; a++) tk += "M" + f(P(a, 152)) + "L" + f(P(a, 152 - (a % 10 ? a % 5 ? 5 : 9 : 14)));
    h += '<path d="' + tk + '" stroke="var(--mut)" stroke-width=".8" fill="none"/>';
    for (a = 10; a < 360; a += 10) if (a % 90) { p = P(a, 129); h += '<text class="ylb" x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" text-anchor="middle">' + a % 90 + '</text>' }
    // bieżąca doba (ok. 1°)
    var l0 = sunLonDeg(d.a), l1 = sunLonDeg(d.b);
    h += '<path d="' + arc(l0, l1 < l0 ? l1 + 360 : l1, 147) + '" fill="none" stroke="var(--sun)" stroke-width="10"/>';
    // aphelium i peryhelium tego roku orbity
    var o = OrbitCal.year(OrbitCal.date(OrbitCal.dateOf(d.n)).year);
    [o.aph, o.peri].forEach(function (e) { var p2 = P(sunLonDeg(e.ms), 172); h += '<text class="ylb" x="' + p2[0].toFixed(1) + '" y="' + (p2[1] + 4).toFixed(1) + '" text-anchor="middle">◆</text>' });
    // cztery punkty roku z datą w tym roku orbity; u góry i na dole napis nad / pod kreską, z boku obok niej
    for (q = 0; q < 4; q++) {
      var ms = o.b[q * 3], p1 = P(q * 90, 167), p0 = P(q * 90, 138), cs = Math.round(Math.cos((q * 90 + rot()) * R)),
        sn = Math.round(Math.sin((q * 90 + rot()) * R)), tx = P(q * 90, cs ? 172 : 174), anc = cs ? (cs > 0 ? "end" : "start") : "middle",
        ty = tx[1] + (sn > 0 ? -18 : sn < 0 ? 14 : -2);
      // z boku nazwa w dwóch wierszach (np. „Wschód / roku”), żeby dłuższe tłumaczenia nie wychodziły poza rysunek
      var nm = part("lpN", sIdx(q)), sp = nm.indexOf(" "), ln = cs && sp > 0 ? [nm.slice(0, sp), nm.slice(sp + 1)] : [nm];
      if (cs && ln.length > 1) ty -= 12;
      h += '<line x1="' + p0[0].toFixed(1) + '" y1="' + p0[1].toFixed(1) + '" x2="' + p1[0].toFixed(1) + '" y2="' + p1[1].toFixed(1) + '" stroke="var(--fg)" stroke-width="1.6"/>' +
        '<text class="owpt" y="' + ty.toFixed(1) + '" text-anchor="' + anc + '">' +
        ln.map(function (x, i) { return '<tspan x="' + tx[0].toFixed(1) + '" dy="' + (i ? 13 : 0) + '">' + x + '</tspan>' }).join("") + '</text>' +
        '<text class="ylb" x="' + tx[0].toFixed(1) + '" y="' + (ty + 13 * ln.length).toFixed(1) + '" text-anchor="' + anc + '">' + q * 90 + '° · ' + short(sunDay(ms)) + '</text>'
    }
    // kąt urodzin (z zakładki Kalendarz), co roku ten sam: kreska na podziałce
    var ba = window.Cal && Cal.birthAngle();
    if (ba !== null && ba !== undefined) { var q1 = P(ba, 137), q2 = P(ba, 153); h += '<line x1="' + q1[0].toFixed(1) + '" y1="' + q1[1].toFixed(1) + '" x2="' + q2[0].toFixed(1) + '" y2="' + q2[1].toFixed(1) + '" stroke="' + BDC + '" stroke-width="2.5"/>' }
    // Ziemia: smukła wskazówka w kolorze pory roku (czubek na kreskach stopni) i Ziemia z poświatą na pasie pór roku
    var sc = SC[sIdx(Q.q)], u = P(L, 1), nx = -(u[1] - 200), ny = u[0] - 200, b0 = P(L, 98), tip = P(L, 151), pe = P(L, 160),
      w = function (p3, k) { return (p3[0] + nx * k).toFixed(1) + "," + (p3[1] + ny * k).toFixed(1) };
    h += '<polygon points="' + w(b0, 3.2) + ' ' + f(tip) + ' ' + w(b0, -3.2) + '" fill="' + sc + '"/>' +
      '<circle cx="' + b0[0].toFixed(1) + '" cy="' + b0[1].toFixed(1) + '" r="4.5" fill="var(--bg)" stroke="' + sc + '" stroke-width="2.2"/>' +
      '<circle cx="' + pe[0].toFixed(1) + '" cy="' + pe[1].toFixed(1) + '" r="14" fill="' + sc + '" opacity=".22"/>' +
      '<circle cx="' + pe[0].toFixed(1) + '" cy="' + pe[1].toFixed(1) + '" r="8" fill="url(#owE)" stroke="var(--bg)" stroke-width="2"/>';
    // środek: kiedy (data doby i pora doby); gdzie (pora roku i stopień) jest w nagłówku zakładki
    return h + '<text x="200" y="186" text-anchor="middle" font-size="15" font-weight="700" fill="var(--fg)">' +
      OrbitCal.dateOf(d.n).toLocaleDateString(loc(), { day: "numeric", month: "long", year: "numeric" }) + '</text>' +
      '<text x="200" y="208" text-anchor="middle" font-size="14" fill="var(--fg)">' + whenTxt(tm) + '</text>' +
      '<text class="ylb" x="200" y="228" text-anchor="middle">' + t("owAngle").replace("{a}", trunc(L)) + '</text>'
  }

  // lupa: 4° orbity wokół Ziemi, doby jako pasy noc / dzień / noc, pełne stopnie pory roku jako przerywane kreski
  function zoom(L, list, n) {
    var W = 4, px = 360 / W, X = function (l) { return 180 + normDeg(l - L) * px }, z = "", k;
    list.forEach(function (d) {
      var a0 = X(sunLonDeg(d.a)), ar = X(sunLonDeg(d.rise)), as = X(sunLonDeg(d.set)), a1 = X(sunLonDeg(d.b)), cur = d.n === n, mx = (a0 + a1) / 2,
        op = cur ? 1 : .55;
      if (a1 < -50 || a0 > 410) return;
      z += '<rect x="' + a0.toFixed(1) + '" y="34" width="' + Math.max(0, ar - a0).toFixed(1) + '" height="44" fill="var(--night)" opacity="' + op + '"/>' +
        '<rect x="' + ar.toFixed(1) + '" y="34" width="' + Math.max(0, as - ar).toFixed(1) + '" height="44" fill="var(--day)" opacity="' + op + '"/>' +
        '<rect x="' + as.toFixed(1) + '" y="34" width="' + Math.max(0, a1 - as).toFixed(1) + '" height="44" fill="var(--night)" opacity="' + op + '"/>' +
        '<line x1="' + a0.toFixed(1) + '" y1="30" x2="' + a0.toFixed(1) + '" y2="82" stroke="var(--fg)"/>' +
        (mx > 18 && mx < 342 ? '<text x="' + mx.toFixed(1) + '" y="96" text-anchor="middle" font-size="11" fill="var(--fg)" font-weight="' + (cur ? 700 : 400) + '">' + short(d.n) + '</text>' : '')
    });
    for (k = Math.ceil(L - W / 2 - 1); k <= L + W / 2 + 1; k++) {
      var x = X(k), kk = (k % 360 + 360) % 360; if (x < 0 || x > 360) continue;
      z += '<line x1="' + x.toFixed(1) + '" y1="22" x2="' + x.toFixed(1) + '" y2="86" stroke="var(--sun)" stroke-width="1.6" stroke-dasharray="3 2"/>' +
        '<text x="' + x.toFixed(1) + '" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="var(--fg)">' + kk % 90 + '°</text>' +
        '<text class="ylb" x="' + x.toFixed(1) + '" y="112" text-anchor="middle">' + t("owYr").replace("{a}", kk) + '</text>'
    }
    var ba = window.Cal && Cal.birthAngle(), bx = ba !== null && ba !== undefined ? X(ba) : -1;   // kąt urodzin, gdy jest w lupie
    if (bx > 0 && bx < 360) z += '<line x1="' + bx.toFixed(1) + '" y1="26" x2="' + bx.toFixed(1) + '" y2="86" stroke="' + BDC + '" stroke-width="2.5"/>';
    return z + '<path d="M180 30 l-6 -8 h12 z" fill="#3b82c4"/><line x1="180" y1="30" x2="180" y2="82" stroke="#3b82c4" stroke-width="2.5"/>'
  }

  // opis doby: zakres kąta, przejścia przez pełne stopnie (stąd numer w kratce), prędkość Ziemi i odległość do następnego punktu
  function info(L, Q, d) {
    var l0 = sunLonDeg(d.a), sp = (sunLonDeg(d.b) - l0 + 360) % 360, r0 = relQ(l0), r1 = relQ((l0 + sp) % 360), h = "", k,
      rate = (sunLonDeg(tm + 432e5) - sunLonDeg(tm - 432e5) + 360) % 360, nq = (Q.q + 1) % 4, left = 90 - Q.a,
      mins = Math.round(24 * 60 / rate);   // 1° orbity w minutach (zaokrąglone całe minuty, żeby nie wyszło „24 h 60 min”)
    for (k = Math.floor(l0) + 1; k <= Math.floor(l0 + sp); k++) {
      var kk = k % 360;
      h += '<div>' + t("calDegCross").replace("{d}", kk % 90) + (kk % 90 ? '' : ' (' + part("lpN", sIdx(kk / 90)) + ')') + ': ' +
        whenTxt(OrbitCal.cross(kk, d.a + (k - l0) / 0.9856 * 864e5)) + '</div>'
    }
    return '<h2>' + t("owDayT") + '</h2><div class="v">' + OrbitCal.dateOf(d.n).toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + '</div>' +
      '<div>' + (r1.q === r0.q ? trunc(r0.a) + '–' + trunc(r1.a) + ' ' + part("lsG", sIdx(r0.q))   // doba z granicą pór: od jednej pory do drugiej
        : trunc(r0.a) + ' ' + part("lsG", sIdx(r0.q)) + ' → ' + trunc(r1.a) + ' ' + part("lsG", sIdx(r1.q))) + '</div>' +
      (h || '<div>' + t("owNoCross") + '</div>') +
      '<div>' + t("owRate").replace("{r}", num(rate, 3)).replace("{h}", Math.floor(mins / 60)).replace("{m}", mins % 60) + '</div>' +
      '<div>' + t("owNext").replace("{p}", part("lpN", sIdx(nq))).replace("{a}", trunc(left)).replace("{d}", num(left / rate, 1)) + '</div>'
  }

  function draw() {
    var box = $("owBox"); if (!box) return;
    var L = sunLonDeg(tm), Q = relQ(L), n = sunDay(tm), list = days(n, 3), d = list[3];
    box.querySelector(".owheel").innerHTML = wheel(L, Q, d);
    box.querySelector(".ozoom").innerHTML = zoom(L, list, n);
    box.querySelector(".oinfo").innerHTML = info(L, Q, d);
    box.querySelector("[data-ow=now]").setAttribute("aria-pressed", live ? "true" : "false");
    if (window.updateHead) updateHead()   // nagłówek zakładki: pora roku i stopień pokazywanej chwili
  }
  function render(box) {
    if (live) tm = Date.now();
    box.innerHTML = '<svg class="owheel" viewBox="-60 -22 520 444" role="img" aria-label="' + t("owAria") + '"></svg>' +
      '<div class="seg ownav" role="group"><button data-ow="-864e5">' + t("owDm") + '</button><button data-ow="-36e5">' + t("owHm") + '</button>' +
      '<button data-ow="now">' + t("v3Now") + '</button><button data-ow="36e5">' + t("owHp") + '</button><button data-ow="864e5">' + t("owDp") + '</button></div>' +
      '<div class="cdet"><h2 class="owh">' + t("owZoomT") + '</h2><svg class="ozoom" viewBox="0 0 360 120" role="img" aria-label="' + t("owZoomT") + '"></svg>' +
      '<div class="olg"><span><i class="lgr"></i>' + t("owLgRise") + '</span><span><i class="lgd"></i>' + t("owLgDeg") + '</span><span><i class="lgn"></i>' + t("owLgNow") + '</span>' +
      (window.Cal && Cal.birthAngle() !== null ? '<span><i class="lgb"></i>' + t("owLgBd") + '</span>' : '') + '</div>' +
      '<p class="cnote">' + t("owZoomN") + '</p></div><div class="cdet oinfo"></div><p class="cnote">' + t("owNote") + '</p>';
    draw()
  }
  function go(ms, lv) { tm = ms; live = lv; draw() }

  // sterowanie: przyciski czasu, klik / przeciąganie po kole (Ziemia na wskazany kąt), przeciąganie paska w lupie
  // (90 jednostek rysunku = 1°; w prawo = wstecz w czasie, jak przewijanie taśmy)
  var yv = $("yearView"), drag = null;
  if (yv) {
    yv.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ow]"); if (!b) return;
      var v = b.getAttribute("data-ow");
      if (v === "now") go(Date.now(), true); else go(tm + +v, false)
    });
    yv.addEventListener("pointerdown", function (e) {
      var g = e.target.closest(".owheel, .ozoom"); if (!g || e.button > 0) return;
      drag = { g: g, x: e.clientX }; g.setPointerCapture(e.pointerId); g.classList.add("drag");
      if (g.classList.contains("owheel")) toAngle(e)
    });
    yv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      if (drag.g.classList.contains("owheel")) return toAngle(e);
      var dd = (e.clientX - drag.x) / drag.g.getBoundingClientRect().width * 4; drag.x = e.clientX;
      if (dd) go(OrbitCal.cross(sunLonDeg(tm) - dd, tm - dd / 0.9856 * 864e5), false)
    });
    var up = function () { if (drag) { drag.g.classList.remove("drag"); drag = null } };
    yv.addEventListener("pointerup", up); yv.addEventListener("pointercancel", up)
  }
  function toAngle(e) {
    var rc = drag.g.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * 520 - 260, y = (e.clientY - rc.top) / rc.height * 444 - 222;
    if (x * x + y * y < 1600) return;   // przy samym środku kąt skacze
    var a = (Math.atan2(-y, -x) / R - rot() + 720) % 360;
    go(OrbitCal.cross(a, tm + normDeg(a - sunLonDeg(tm)) / 0.9856 * 864e5), false)
  }
  setInterval(function () { if (live && $("owBox") && !$("yearView").hidden) go(Date.now(), true) }, 5000);

  // nagłówek zakładki Rok: pokazywana chwila (w widoku Długość dnia: teraz)
  function shown() { return live ? Date.now() : tm }
  window.OrbitWheel = {
    render: render,
    title: function () { return t("calOYear").replace("{y}", OrbitCal.yLabel(OrbitCal.date(OrbitCal.dateOf(sunDay(shown()))).year)) },
    head: function () { var Q = relQ(sunLonDeg(shown())); return trunc(Q.a) + ' ' + part("lsG", sIdx(Q.q)) }   // np. „32,47° wieczoru roku”
  };
})();
