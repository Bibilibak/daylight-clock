/* ===== Kalendarz: kalendarz orbity (koło i siatka) oraz zwykły kalendarz (miesiąc i rok) =====
   Daty kalendarza orbity liczy js/orbit.js. Widoki gregoriańskie pokazują przy każdym dniu kąt roku. */
(function () {
  function $(i) { return document.getElementById(i) }
  function dayStart() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()) }
  var today = dayStart();
  var sel = today, vy = today.getFullYear(), vm = today.getMonth();
  var sys = "orbit", cvO = "ring", cvG = "month";   // system (orbita / gregoriański) i widok w każdym z nich, zapamiętane w przeglądarce
  try {
    var cw = JSON.parse(localStorage.getItem("cviews") || "null");
    if (cw) { sys = cw.s === "greg" ? "greg" : "orbit"; cvO = cw.o === "grid" ? "grid" : "ring"; cvG = cw.g === "year" ? "year" : "month" }
  } catch (e) {}
  try {   // ostatnio oglądany miesiąc i wybrany dzień (po przeładowaniu strony widok zostaje)
    var cs = JSON.parse(localStorage.getItem("calsel") || "null");
    if (cs && isFinite(cs.y) && isFinite(cs.sy) && isFinite(cs.sm) && cs.m >= 0 && cs.m < 12 && isFinite(cs.d)) { vy = cs.y; vm = cs.m; sel = new Date(cs.sy, cs.sm, cs.d) }
  } catch (e) {}
  var od = OrbitCal.date(sel), oy = od.year, om = od.month;   // oglądany rok i miesiąc orbity
  if (cs && isFinite(cs.oy) && cs.om >= 0 && cs.om < 12) { oy = cs.oy; om = cs.om }

  // Po północy "dziś" przesuwa się samo. Jeśli patrzyłeś na dzisiejszy dzień, zaznaczenie idzie razem z nim.
  setInterval(function () {
    var n = dayStart();
    if (same(n, today)) return;
    if (same(sel, today)) { sel = n; vy = n.getFullYear(); vm = n.getMonth(); var o = OrbitCal.date(n); oy = o.year; om = o.month }
    today = n;
    if ($("calView") && !$("calView").hidden) render()
  }, 30000);

  function deg(l) { return Math.round(l) % 360 + "°" }
  window.CalendarSystem = window.CalendarSystem || {
    label: function (d) { return deg(OrbitCal.lonAt(OrbitCal.dayN(d))) }
  };
  function doy(d) { return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 1)) / 864e5) + 1 }
  function daysInYear(y) { return (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 864e5 }
  function isoWeek(d) {   // tydzień wg ISO 8601: od poniedziałku, tydzień 1 zawiera pierwszy czwartek roku
    var u = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), wd = (new Date(u).getUTCDay() + 6) % 7,
      th = new Date(u + (3 - wd) * 864e5);   // czwartek tego tygodnia decyduje, do którego roku należy tydzień
    return 1 + Math.floor((th - Date.UTC(th.getUTCFullYear(), 0, 1)) / 6048e5)
  }
  function isoWeeksIn(y) { return isoWeek(new Date(y, 11, 28)) }   // 28 grudnia zawsze leży w ostatnim tygodniu roku
  // Dzień, w którym Słońce przechodzi przez 0°, 90°, 180° lub 270° kąta roku (równonoc / przesilenie)
  function season(d) { var o = OrbitCal.date(d); return o.day === 1 && o.month % 3 === 0 }
  function same(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
  function num(x, d) { return x.toFixed(d).replace(".", lang === "en" ? "." : ",") }
  function short(d) { return d.toLocaleDateString(loc(), { day: "numeric", month: "short" }) }

  /* Nazwy i kolory pór roku. Ćwiartka q = 0…3 to kąt orbity 0–90°, 90–180°… Na półkuli północnej ćwiartka 0
     to wiosna, na południowej jesień. Między zwrotnikami czterech pór roku nie ma, więc zostaje sam kąt. */
  var SC = ["#4c9a3f", "#e0a000", "#c8623a", "#4f7fc4"];   // wiosna, lato, jesień, zima
  function sIdx(q) { return OrbitCal.zone() === "S" ? (q + 2) % 4 : q }
  function qColor(q) { return OrbitCal.zone() === "T" ? "var(--mut)" : SC[sIdx(q)] }
  function qName(q) { return OrbitCal.zone() === "T" ? t("calQuad").replace("{a}", q * 90 + "–" + (q + 1) * 90 + "°") : t("os" + sIdx(q)) }
  function mName(k) { return qName(k / 3 | 0) + " · " + t("calMon").replace("{m}", k % 3 + 1) }

  function detail(d) {   // dane wybranego dnia: data orbity, kąt roku i dane astronomiczne (wspólne funkcje z zegarem dobowym)
    var y = d.getFullYear(), m = d.getMonth(), dd = d.getDate(), T = times(new Date(y, m, dd)), T2 = times(new Date(y, m, dd + 1)),
      noon = new Date(y, m, dd, 12), ph = elong(noon.getTime()), il = Math.round((1 - Math.cos(ph * R)) / 2 * 100), lc = lunarCycle(noon),
      light = T && T2 ? Math.round(360 * (T.set - T.rise) / (T2.rise - T.rise)) : null,
      o = OrbitCal.date(d), ap = OrbitCal.apsisOn(OrbitCal.dayN(d)), ring = sys === "orbit" && cvO === "ring";
    return '<div class="cdet"><div class="cg1">' + d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + '</div>' +
      '<div class="cp">' + mName(o.month) + ' · ' + t("calDay").replace("{d}", o.day) + '</div>' +
      '<div>' + (ring ? "" : t("calAngle").replace("{a}", CalendarSystem.label(d)) + ' · ') +
      t("calODay").replace("{n}", o.yday).replace("{d}", o.ylen).replace("{y}", o.year) + '</div>' +
      (ap ? '<div class="cap">' + t(ap.far ? "calAph" : "calPeri").replace("{k}", num(ap.km / 1e6, 1)) + '</div>' : '') +
      '<div>' + t("calDoy").replace("{n}", doy(d)).replace("{d}", daysInYear(y)).replace("{w}", isoWeek(d)) + '</div>' +
      '<div>' + (light === null ? t("calPolar") : t("lightHead").replace("{a}", light)) + '</div>' +
      '<div>' + t("ph" + phaseIdx(ph)) + ' · ' + t("moonIll").replace("{i}", il) + '</div>' +
      '<div>' + t("moonDayLine").replace("{d}", lc.day).replace("{l}", lc.length.toFixed(1).replace(".", lang === "en" ? "." : ",")) + '</div>' +
      '<p class="cnote">' + t("moonNote") + '</p></div>'
  }

  function seg(attr, list, cur) {
    return '<div class="seg cseg" role="group">' + list.map(function (v) {
      return '<button ' + attr + '="' + v[0] + '" aria-pressed="' + (cur === v[0]) + '">' + t(v[1]) + '</button>'
    }).join("") + '</div>'
  }
  function segs() {
    return seg("data-cs", [["orbit", "calOrbit"], ["greg", "calGreg"]], sys) +
      (sys === "orbit" ? seg("data-cv", [["ring", "calRing"], ["grid", "calGrid"]], cvO) : seg("data-cv", [["month", "calMonthV"], ["year", "calYearV"]], cvG))
  }
  function yearNav(label) {
    return '<div class="cnav"><button data-a="py" aria-label="-1">«</button><b>' + label + '</b><button data-a="ny" aria-label="+1">»</button></div>'
  }
  function oNote() { return '<p class="cnote">' + t("calONote") + (OrbitCal.zone() === "T" ? " " + t("calTrop") : "") + '</p>' }

  /* Koło roku orbity: kąt na kole = kąt roku (jak w pętli zegara roku: przesilenie letnie u góry, zgodnie z ruchem wskazówek).
     Pierścień = 12 miesięcy po 30° w kolorach pór roku; kreski = granice dób; ◆ = aphelium i peryhelium.
     Kliknięcie w pierścień wybiera dzień. W środku kąt roku wybranego dnia. */
  var top0 = 90;
  function ringSvg() {
    var o = OrbitCal.year(oy), s = OrbitCal.starts(oy), C = 180, h = "", k, n;
    top0 = lat >= 0 ? 90 : 270;
    var P = function (l, r) { var th = (l - top0) * R; return [C + r * Math.sin(th), C - r * Math.cos(th)] },
      f = function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1) },
      arc = function (l0, l1, r) { return "M" + f(P(l0, r)) + " A" + r + " " + r + " 0 0 1 " + f(P(l1, r)) };
    for (k = 0; k < 12; k++) {
      var q = k / 3 | 0, c = P(k * 30 + 15, 118);
      h += '<path d="' + arc(k * 30 + 0.7, k * 30 + 29.3, 118) + '" fill="none" stroke="' + qColor(q) + '" stroke-width="24" stroke-opacity="' + (k === om ? 1 : 0.35) + '"/>' +
        '<text class="ylb" x="' + c[0].toFixed(1) + '" y="' + (c[1] + 4).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + (k === om ? "#fff" : "var(--fg)") + '">' + (k % 3 + 1) + '</text>'
    }
    for (q = 0; q < 4; q++) {
      var a = P(q * 90, 92), b = P(q * 90 + 45, 66);
      h += '<line x1="' + f(P(q * 90, 100)).replace(",", '" y1="') + '" x2="' + f(P(q * 90, 148)).replace(",", '" y2="') + '" stroke="var(--fg)" stroke-opacity=".5"/>' +
        '<text class="ylb" x="' + a[0].toFixed(1) + '" y="' + (a[1] + 3).toFixed(1) + '" text-anchor="middle">' + q * 90 + '°</text>' +
        '<text x="' + b[0].toFixed(1) + '" y="' + (b[1] + 4).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + qColor(q) + '">' + qName(q) + '</text>'
    }
    var off = tzOffset(o.b[0]), tk = "";                                // granice dób (północ w mieście); co 10 dni miesiąca dłuższa kreska
    for (k = 0; k < 12; k++) for (n = s[k]; n < s[k + 1]; n++) {
      var l = sunLonDeg(n * 864e5 - off), d0 = n - s[k];
      tk += "M" + f(P(l, 132)) + "L" + f(P(l, d0 % 10 ? 135 : 139))
    }
    h += '<path d="' + tk + '" stroke="var(--mut)" stroke-width=".8" fill="none"/>';
    [[o.aph, "calAphS"], [o.peri, "calPeriS"]].forEach(function (e) {
      var l = sunLonDeg(e[0].ms), p = P(l, 146), q2 = P(l, 160);
      h += '<path d="M' + p[0].toFixed(1) + ',' + (p[1] - 5).toFixed(1) + 'l4,5l-4,5l-4,-5z" fill="var(--fg)"/>' +
        '<text class="ylb" x="' + q2[0].toFixed(1) + '" y="' + (q2[1] + 4).toFixed(1) + '" text-anchor="middle">' + t(e[1]) + '</text>'
    });
    var tn = OrbitCal.dayN(today), sn = OrbitCal.dayN(sel), ls = OrbitCal.lonAt(sn);
    if (tn >= s[0] && tn < s[12]) { var pt0 = P(sunLonDeg(Date.now()), 118); h += '<circle cx="' + pt0[0].toFixed(1) + '" cy="' + pt0[1].toFixed(1) + '" r="6.5" fill="#f08a00" stroke="var(--bg)" stroke-width="2.5"/>' }
    if (sn >= s[0] && sn < s[12]) {
      var ps = P(ls, 118);
      h += '<circle cx="' + ps[0].toFixed(1) + '" cy="' + ps[1].toFixed(1) + '" r="10" fill="none" stroke="var(--fg)" stroke-width="2.5"/>' +
        '<text x="180" y="186" text-anchor="middle" font-size="28" font-weight="700" fill="var(--fg)">' + deg(ls) + '</text>' +
        '<text class="ylb" x="180" y="202" text-anchor="middle">' + t("yAxX") + '</text>'
    }
    return '<svg class="oring" viewBox="0 0 360 360" role="img" aria-label="' + t("calRing") + '">' + h + '</svg>'
  }

  function dayCls(dt, n) {
    var ap = OrbitCal.apsisOn(n);
    return (same(dt, today) ? " today" : "") + (same(dt, sel) ? " sel" : "") + (ap ? " ap" : "")
  }
  function renderRing(box) {
    var s = OrbitCal.starts(oy), a = OrbitCal.dateOf(s[om]), z = OrbitCal.dateOf(s[om + 1] - 1), len = s[om + 1] - s[om], i, h =
      segs() + yearNav(t("calOYear").replace("{y}", oy)) + ringSvg() +
      '<div class="cnav onav"><button data-a="pm" aria-label="-">‹</button><b style="color:' + qColor(om / 3 | 0) + '">' + mName(om) +
      '<small>' + short(a) + ' – ' + short(z) + ' · ' + len + ' ' + t(dayKey(len)) + '</small></b><button data-a="nm" aria-label="+">›</button></div><div class="cgrid ogrid">';
    for (i = 0; i < len; i++) {
      var n = s[om] + i, dt = OrbitCal.dateOf(n);
      h += '<button class="cc' + dayCls(dt, n) + '" data-n="' + n + '"><small>' + (i === 0 || dt.getDate() === 1 ? short(dt) : dt.getDate()) + '</small><b>' + (i + 1) + '</b></button>'
    }
    box.innerHTML = h + '</div><div class="ctoolbar"><button class="ctoday" data-a="t">' + t("calToday") + '</button></div>' + detail(sel) + oNote()
  }

  /* Siatka roku orbity: 12 miesięcy, rzędami po 10 dni (1–10, 11–20, 21–30, 31–32). Na szerokim ekranie
     jeden rząd = jedna pora roku. Kropka = równonoc / przesilenie, ◆ = aphelium / peryhelium. */
  function renderGrid(box) {
    var s = OrbitCal.starts(oy), o = OrbitCal.year(oy), k, i, h = segs() + yearNav(t("calOYear").replace("{y}", oy)) +
      '<div class="ysum">' + t("calOYearSum").replace("{d}", s[12] - s[0]).replace("{a}", short(OrbitCal.dateOf(s[0]))).replace("{b}", short(OrbitCal.dateOf(s[12] - 1))) +
      ' · ◆ ' + t("calAphS") + ' ' + short(OrbitCal.dateOf(localDay(o.aph.ms))) + ' · ◆ ' + t("calPeriS") + ' ' + short(OrbitCal.dateOf(localDay(o.peri.ms))) + '</div><div class="cyear oyear">';
    for (k = 0; k < 12; k++) {
      var len = s[k + 1] - s[k];
      h += '<div class="ym"><button class="ymh" data-om="' + k + '" style="border-bottom:3px solid ' + qColor(k / 3 | 0) + '">' + mName(k) + '</button>' +
        '<div class="ymsub">' + short(OrbitCal.dateOf(s[k])) + ' · ' + len + ' ' + t(dayKey(len)) + '</div><div class="ymg oymg">';
      for (i = 0; i < len; i++) {
        var n = s[k] + i, dt = OrbitCal.dateOf(n);
        h += '<button class="yd' + dayCls(dt, n) + (i === 0 && k % 3 === 0 ? " sn" : "") + '" data-n="' + n + '" title="' +
          dt.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + ' · ' + CalendarSystem.label(dt) + '">' + (i + 1) + '</button>'
      }
      h += '</div></div>'
    }
    box.innerHTML = h + '</div><p class="cnote">' + t("calOMarks") + '</p><div class="ctoolbar"><button class="ctoday" data-a="t">' + t("calToday") + '</button></div>' +
      detail(sel) + oNote()
  }

  /* Widok roku: 12 małych miesięcy obok siebie. W każdym: numer tygodnia (ISO), skróty nazw dni,
     numery dni miesiąca. Kropka = równonoc lub przesilenie. Po najechaniu: nazwa dnia, numer dnia w roku, kąt roku. */
  function renderYear(box) {
    var i, m, h = segs() + yearNav(vy) +
      '<div class="ysum">' + t("calYearSum").replace("{d}", daysInYear(vy)).replace("{w}", isoWeeksIn(vy)).replace("{l}", t(daysInYear(vy) === 366 ? "calLeap" : "calCommon")) + '</div><div class="cyear">',
      wdS = [], wdL = [];
    for (i = 0; i < 7; i++) {
      var w0 = new Date(2024, 0, 1 + i);
      wdS.push(w0.toLocaleDateString(loc(), { weekday: "narrow" })); wdL.push(w0.toLocaleDateString(loc(), { weekday: "long" }))
    }
    for (m = 0; m < 12; m++) {
      var first = new Date(vy, m, 1), lead = (first.getDay() + 6) % 7, days = new Date(vy, m + 1, 0).getDate();
      h += '<div class="ym"><button class="ymh" data-m="' + m + '">' + first.toLocaleDateString(loc(), { month: "long" }) + '</button><div class="ymg">' +
        '<span class="wk">' + t("calWk") + '</span>';
      for (i = 0; i < 7; i++) h += '<span class="wd' + (i > 4 ? " we" : "") + '" title="' + wdL[i] + '">' + wdS[i] + '</span>';
      for (i = 1 - lead; i <= days; i++) {
        var dt = new Date(vy, m, Math.max(i, 1)), col = (i + lead - 1) % 7;
        if (col === 0) h += '<span class="wk">' + isoWeek(new Date(vy, m, i < 1 ? 1 : i)) + '</span>';
        if (i < 1) { h += '<span></span>'; continue }
        dt = new Date(vy, m, i);
        h += '<button class="yd' + (col > 4 ? " we" : "") + (same(dt, today) ? " today" : "") + (same(dt, sel) ? " sel" : "") + (season(dt) ? " sn" : "") +
          '" data-m="' + m + '" data-d="' + i + '" title="' + dt.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" }) +
          ' · ' + doy(dt) + '/' + daysInYear(vy) + ' · ' + CalendarSystem.label(dt) + '">' + i + '</button>'
      }
      h += '</div></div>'
    }
    box.innerHTML = h + '</div><p class="cnote">' + t("calSeasons") + '</p><div class="ctoolbar"><button class="ctoday" data-a="t">' + t("calToday") + '</button></div>' +
      detail(sel) + '<p class="cnote">' + t("calNote") + '</p>'
  }

  function render() {
    var box = $("calView"); if (!box) return;
    try {
      localStorage.setItem("calsel", JSON.stringify({ y: vy, m: vm, sy: sel.getFullYear(), sm: sel.getMonth(), d: sel.getDate(), oy: oy, om: om }));
      localStorage.setItem("cviews", JSON.stringify({ s: sys, o: cvO, g: cvG }))
    } catch (e) {}
    box.classList.toggle("yearMode", sys === "greg" && cvG === "year" || sys === "orbit" && cvO === "grid");
    if (sys === "orbit") return cvO === "ring" ? renderRing(box) : renderGrid(box);
    if (cvG === "year") return renderYear(box);
    var first = new Date(vy, vm, 1), lead = (first.getDay() + 6) % 7, days = new Date(vy, vm + 1, 0).getDate(), i, h =
      '<div class="cnav"><button data-a="py" aria-label="-1">«</button><button data-a="pm" aria-label="-">‹</button><b>' +
      first.toLocaleDateString(loc(), { month: "long", year: "numeric" }) + '</b><button data-a="nm" aria-label="+">›</button><button data-a="ny" aria-label="+1">»</button></div><div class="cgrid">';
    h = segs() + h;
    for (i = 0; i < 7; i++) h += '<span class="wd">' + new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: "short" }) + '</span>';
    for (i = 0; i < lead; i++) h += '<span></span>';
    for (i = 1; i <= days; i++) {
      var dt = new Date(vy, vm, i);
      h += '<button class="cc' + (same(dt, today) ? " today" : "") + (same(dt, sel) ? " sel" : "") + '" data-d="' + i + '"><small>' + i + '</small><b>' + CalendarSystem.label(dt) + '</b></button>'
    }
    box.innerHTML = h + '</div><div class="ctoolbar"><button class="ctoday" data-a="t">' + t("calToday") + '</button></div>' + detail(sel) +
      '<p class="cnote">' + t("calNote") + '</p>'
  }

  // wybór dnia: kalendarz gregoriański i orbity idą za wybranym dniem
  function pick(d, keepView) {
    sel = d;
    if (!keepView) { vy = d.getFullYear(); vm = d.getMonth() }
    var o = OrbitCal.date(d); oy = o.year; om = o.month
  }

  if ($("calView")) $("calView").onclick = function (e) {
    var ring = e.target.closest(".oring");
    if (ring) {   // kliknięcie w pierścień: dzień o tym kącie roku
      var rc = ring.getBoundingClientRect(), dx = (e.clientX - rc.left) / rc.width * 360 - 180, dy = (e.clientY - rc.top) / rc.height * 360 - 180,
        rr = Math.sqrt(dx * dx + dy * dy);
      if (rr < 100 || rr > 150) return;
      pick(OrbitCal.dayAt(oy, Math.atan2(dx, -dy) / R + top0));
      return render()
    }
    var b = e.target.closest("button"); if (!b) return;
    var a = b.getAttribute("data-a"), d = b.getAttribute("data-d"), m = b.getAttribute("data-m"), v = b.getAttribute("data-cv"),
      s = b.getAttribute("data-cs"), n = b.getAttribute("data-n"), k = b.getAttribute("data-om");
    if (s) sys = s;
    else if (v) { if (sys === "orbit") cvO = v; else cvG = v }
    else if (n !== null) pick(OrbitCal.dateOf(+n));
    else if (k !== null) { om = +k; cvO = "ring" }                         // nazwa miesiąca orbity -> koło z tym miesiącem
    else if (m !== null && !d) { vm = +m; cvG = "month" }                  // nazwa miesiąca -> widok miesiąca
    else if (m !== null) { vm = +m; pick(new Date(vy, vm, +d), true) }
    else if (d) pick(new Date(vy, vm, +d), true);
    else if (a === "t") pick(today);
    else if (sys === "orbit") {
      if (a === "py") oy--; else if (a === "ny") oy++;
      else if (a === "pm") { om--; if (om < 0) { om = 11; oy-- } }
      else if (a === "nm") { om++; if (om > 11) { om = 0; oy++ } }
    }
    else if (a === "py") vy--; else if (a === "ny") vy++;
    else if (a === "pm") { vm--; if (vm < 0) { vm = 11; vy-- } }
    else if (a === "nm") { vm++; if (vm > 11) { vm = 0; vy++ } }
    render()
  };
  window.Cal = { render: render, selected: function () { return sel } };
})();
