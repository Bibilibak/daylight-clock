/* ===== Kalendarz orbity: widok Kalendarz (siatka roku, domyślny) i Koło =====
   Daty kalendarza orbity liczy js/orbit.js. */
(function () {
  function $(i) { return document.getElementById(i) }
  function dayStart() { return OrbitCal.dateOf(sunDay(Date.now())) }   // dzisiejsza doba (od wschodu Słońca w wybranym miejscu)
  var today = dayStart();
  var sel = today;
  var cvO = "grid";   // widok: "grid" (Kalendarz) albo "ring" (Koło), zapamiętany w przeglądarce
  try { if (localStorage.getItem("cview") === "ring") cvO = "ring"; localStorage.removeItem("cviews") } catch (e) {}   // cviews: zapis starszej wersji (z kalendarzem gregoriańskim)
  try {   // ostatnio oglądany miesiąc i wybrany dzień (po przeładowaniu strony widok zostaje)
    var cs = JSON.parse(localStorage.getItem("calsel") || "null");
    if (cs && isFinite(cs.sy) && isFinite(cs.sm) && isFinite(cs.d)) sel = new Date(cs.sy, cs.sm, cs.d)
  } catch (e) {}
  var od = OrbitCal.date(sel), oy = od.year, om = od.month;   // oglądany rok i miesiąc orbity
  if (cs && isFinite(cs.oy) && cs.om >= 0 && cs.om < 12) { oy = cs.oy; om = cs.om }

  // O wschodzie Słońca "dziś" przesuwa się samo. Jeśli patrzyłeś na dzisiejszy dzień, zaznaczenie idzie razem z nim.
  setInterval(function () {
    var n = dayStart();
    if (same(n, today)) return;
    if (same(sel, today)) { sel = n; var o = OrbitCal.date(n); oy = o.year; om = o.month }
    today = n;
    if ($("calView") && !$("calView").hidden) render()
  }, 30000);

  function deg(l) { return Math.round(l) % 360 + "°" }
  window.CalendarSystem = window.CalendarSystem || {
    label: function (d) { return deg(OrbitCal.lonAt(OrbitCal.dayN(d))) }
  };
  function same(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
  function num(x, d) { return x.toFixed(d).replace(".", lang === "en" ? "." : ",") }
  function short(d) { return d.toLocaleDateString(loc(), { day: "numeric", month: "short" }) }

  /* Nazwy i kolory pór roku. Ćwiartka q = 0…3 to kąt orbity 0–90°, 90–180°… Na półkuli północnej ćwiartka 0
     to wiosna, na południowej jesień. Kalendarz jest wspólny dla całej Ziemi, więc między zwrotnikami nazwy też są
     takie jak na danej półkuli (klimatycznie pory roku się tam prawie nie różnią, ale dni liczymy tak samo). */
  var SC = ["#4c9a3f", "#e0a000", "#c8623a", "#4f7fc4"];   // wiosna, lato, jesień, zima
  function sIdx(q) { return lat < 0 ? (q + 2) % 4 : q }
  function qColor(q) { return SC[sIdx(q)] }
  function qName(q) { return t("os" + sIdx(q)) }
  /* Nazwa miesiąca: wczesna / pełna / późna pora roku (calMonN: 12 nazw rozdzielonych "|", od wczesnej wiosny do późnej zimy).
     Gdy brakuje nazwy w tłumaczeniu: zakres kąta orbity, np. "Miesiąc 0–30°". */
  function mName(k) {
    return t("calMonN").split("|")[sIdx(k / 3 | 0) * 3 + k % 3] || t("calMon").replace("{a}", k * 30 + "–" + (k + 1) * 30 + "°")
  }
  /* Skrót na kole: wczesna / pełna / późna (calMonS: 3 skróty albo 12, gdy forma zależy od pory roku).
     Gdy brakuje skrótu: numer miesiąca w ćwiartce, 1–3. */
  function mShort(k) {
    var s = t("calMonS").split("|");
    return (s.length === 12 ? s[sIdx(k / 3 | 0) * 3 + k % 3] : s[k % 3]) || k % 3 + 1
  }

  function detail(d) {   // dane wybranego dnia: data orbity, kąt roku i dane astronomiczne (wspólne funkcje z zegarem dobowym)
    var y = d.getFullYear(), m = d.getMonth(), dd = d.getDate(), T = times(new Date(y, m, dd)), T2 = times(new Date(y, m, dd + 1)),
      noon = new Date(y, m, dd, 12), ph = elong(noon.getTime()), il = Math.round((1 - Math.cos(ph * R)) / 2 * 100), lc = lunarCycle(noon),
      light = T && T2 ? Math.round(360 * (T.set - T.rise) / (T2.rise - T.rise)) : null,
      o = OrbitCal.date(d), n = OrbitCal.dayN(d), ap = OrbitCal.apsisOn(n), ring = cvO === "ring",
      ev = moonPhasesIn(OrbitCal.dayStart(n), OrbitCal.dayStart(n + 1) - 1), k = o.month,
      // dzień 1 miesiąca: chwila przejścia przez granicę (równonoc 0° / 180°, przesilenie 90° / 270°, inaczej granica 30°·k)
      cross = o.day === 1 ? (k % 3 ? t("calMonStart").replace("{l}", k * 30) : t(k % 6 ? "calSolstice" : "calEquinox")) + ': ' + whenTxt(OrbitCal.year(o.year).b[k]) : "";
    return '<div class="cdet"><div class="cg1">' + d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + '</div>' +
      '<div class="cp">' + mName(o.month) + ' · ' + t("calDay").replace("{d}", o.day) + '</div>' +
      '<div>' + (ring ? "" : t("calAngle").replace("{a}", CalendarSystem.label(d)) + ' · ') +
      t("calODay").replace("{n}", o.yday).replace("{d}", o.ylen).replace("{y}", o.year) + '</div>' +
      (cross ? '<div class="cap">' + cross + '</div>' : '') +
      (ap ? '<div class="cap">' + t(ap.far ? "calAph" : "calPeri").replace("{k}", num(ap.km / 1e6, 1)) + ': ' + whenTxt(ap.ms) + '</div>' : '') +
      '<div>' + (light === null ? t("calPolar") : t("lightHead").replace("{a}", light)) + '</div>' +
      '<div>' + t("ph" + phaseIdx(ph)) + ' · ' + t("moonIll").replace("{i}", il) + '</div>' +
      '<div>' + t("moonDayLine").replace("{d}", lc.day).replace("{l}", lc.length.toFixed(1).replace(".", lang === "en" ? "." : ",")) + '</div>' +
      ev.map(function (e) { return '<div><b>' + t("ph" + e.k * 2) + '</b>: ' + whenTxt(e.ms) + '</div>' }).join("") +
      '<p class="cnote">' + t("moonNote") + '</p></div>'
  }

  function seg(attr, list, cur) {
    return '<div class="seg cseg" role="group">' + list.map(function (v) {
      return '<button ' + attr + '="' + v[0] + '" aria-pressed="' + (cur === v[0]) + '">' + t(v[1]) + '</button>'
    }).join("") + '</div>'
  }
  function segs() { return seg("data-cv", [["grid", "calGrid"], ["ring", "calRing"]], cvO) }
  function yearNav(label) {
    return '<div class="cnav"><button data-a="py" aria-label="-1">«</button><button class="cyl" data-a="ey" title="' + t("calYearEdit") + '">' + label +
      '</button><button data-a="ny" aria-label="+1">»</button></div>'
  }
  // kliknięcie w rok: pole do wpisania roku orbity (Enter albo wyjście z pola zatwierdza, Esc anuluje)
  function editYear(b) {
    var inp = document.createElement("input"), done = false;
    inp.type = "number"; inp.className = "cyin"; inp.value = oy; inp.min = 1000; inp.max = 3000; inp.setAttribute("aria-label", t("calYearEdit"));
    function fin(ok) {
      if (done) return; done = true;
      var y = Math.round(+inp.value);
      if (ok && y >= 1000 && y <= 3000) oy = y;
      render()
    }
    inp.onkeydown = function (e) { if (e.key === "Enter") fin(true); else if (e.key === "Escape") fin(false) };
    inp.onblur = function () { fin(true) };
    b.parentNode.replaceChild(inp, b); inp.focus(); inp.select()
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
        '<text class="ylb" x="' + c[0].toFixed(1) + '" y="' + (c[1] + 4).toFixed(1) + '" text-anchor="middle" font-size="10" font-weight="700" fill="' + (k === om ? "#fff" : "var(--fg)") + '">' + mShort(k) + '</text>'
    }
    for (q = 0; q < 4; q++) {
      var a = P(q * 90, 92), b = P(q * 90 + 45, 66);
      h += '<line x1="' + f(P(q * 90, 100)).replace(",", '" y1="') + '" x2="' + f(P(q * 90, 148)).replace(",", '" y2="') + '" stroke="var(--fg)" stroke-opacity=".5"/>' +
        '<text class="ylb" x="' + a[0].toFixed(1) + '" y="' + (a[1] + 3).toFixed(1) + '" text-anchor="middle">' + q * 90 + '°</text>' +
        '<text x="' + b[0].toFixed(1) + '" y="' + (b[1] + 4).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + qColor(q) + '">' + qName(q) + '</text>'
    }
    var tk = "";                                                        // granice dób (wschód Słońca w mieście); co 10 dni miesiąca dłuższa kreska
    for (k = 0; k < 12; k++) for (n = s[k]; n < s[k + 1]; n++) {
      var l = sunLonDeg(OrbitCal.dayStart(n)), d0 = n - s[k];
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
    var s = OrbitCal.starts(oy), o = OrbitCal.apsisDays(oy), k, i, h = segs() + yearNav(t("calOYear").replace("{y}", oy)) +
      '<div class="ysum">' + t("calOYearSum").replace("{d}", s[12] - s[0]).replace("{a}", short(OrbitCal.dateOf(s[0]))).replace("{b}", short(OrbitCal.dateOf(s[12] - 1))) +
      ' · ◆ ' + t("calAphS") + ' ' + short(OrbitCal.dateOf(o.aph)) + ' · ◆ ' + t("calPeriS") + ' ' + short(OrbitCal.dateOf(o.peri)) + '</div><div class="cyear oyear">';
    for (k = 0; k < 12; k++) {
      var len = s[k + 1] - s[k];
      h += '<div class="ym"><button class="ymh" data-om="' + k + '" style="border-bottom:3px solid ' + qColor(k / 3 | 0) + '">' + mName(k) + '</button>' +
        '<div class="ymsub">' + short(OrbitCal.dateOf(s[k])) + ' · ' + len + ' ' + t(dayKey(len)) + '</div><div class="ymg">';
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

  function render() {
    var box = $("calView"); if (!box) return;
    try {
      localStorage.setItem("calsel", JSON.stringify({ sy: sel.getFullYear(), sm: sel.getMonth(), d: sel.getDate(), oy: oy, om: om }));
      localStorage.setItem("cview", cvO)
    } catch (e) {}
    box.classList.toggle("yearMode", cvO === "grid");
    return cvO === "ring" ? renderRing(box) : renderGrid(box)
  }

  // wybór dnia: oglądany rok i miesiąc orbity idą za wybranym dniem
  function pick(d) {
    sel = d;
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
    var a = b.getAttribute("data-a"), v = b.getAttribute("data-cv"), n = b.getAttribute("data-n"), k = b.getAttribute("data-om");
    if (v) cvO = v;
    else if (n !== null) pick(OrbitCal.dateOf(+n));
    else if (k !== null) { om = +k; cvO = "ring" }                         // nazwa miesiąca -> koło z tym miesiącem
    else if (a === "t") pick(today);
    else if (a === "ey") return editYear(b);
    else if (a === "py") oy--; else if (a === "ny") oy++;
    else if (a === "pm") { om--; if (om < 0) { om = 11; oy-- } }
    else if (a === "nm") { om++; if (om > 11) { om = 0; oy++ } }
    render()
  };
  window.Cal = { render: render, selected: function () { return sel } };
})();
