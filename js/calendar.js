/* ===== Kalendarz: nawigacja po dniach + podwójne oznaczenie daty =====
   Datę w "naszym systemie" opisuje wymienny obiekt CalendarSystem. Na razie pokazuje roboczy kąt roku
   (długość ekliptyczna Słońca, 0° = równonoc wiosenna). Reguły kalendarza, nazwy okresów, miesiące
   księżycowe i początek roku można podmienić bez przepisywania widoku. */
(function () {
  function $(i) { return document.getElementById(i) }
  function dayStart() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()) }
  var today = dayStart();
  var sel = today, vy = today.getFullYear(), vm = today.getMonth();
  var cv = "month";   // widok kalendarza: "month" (jeden miesiąc) albo "year" (cały rok), zapamiętany w przeglądarce
  try { if (localStorage.getItem("cview") === "year") cv = "year" } catch (e) {}
  try {   // ostatnio oglądany miesiąc i wybrany dzień (po przeładowaniu strony widok zostaje)
    var cs = JSON.parse(localStorage.getItem("calsel") || "null");
    if (cs && isFinite(cs.y) && isFinite(cs.sy) && isFinite(cs.sm) && cs.m >= 0 && cs.m < 12 && isFinite(cs.d)) { vy = cs.y; vm = cs.m; sel = new Date(cs.sy, cs.sm, cs.d) }
  } catch (e) {}

  // Po północy "dziś" przesuwa się samo. Jeśli patrzyłeś na dzisiejszy dzień, zaznaczenie idzie razem z nim.
  setInterval(function () {
    var n = dayStart();
    if (same(n, today)) return;
    if (same(sel, today) && vy === today.getFullYear() && vm === today.getMonth()) { sel = n; vy = n.getFullYear(); vm = n.getMonth() }
    today = n;
    if ($("calView") && !$("calView").hidden) render()
  }, 30000);

  window.CalendarSystem = window.CalendarSystem || {
    label: function (d) { return Math.round(sunLonDeg(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime())) % 360 + "°" }
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
  function season(d) {
    var a = sunLonDeg(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()),
      b = sunLonDeg(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime());
    if (b < a) b += 360;
    return Math.floor(b / 90) > Math.floor(a / 90)
  }
  function same(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

  function detail(d) {   // dane astronomiczne wybranego dnia (wspólne funkcje z zegarem dobowym)
    var y = d.getFullYear(), m = d.getMonth(), dd = d.getDate(), T = times(new Date(y, m, dd)), T2 = times(new Date(y, m, dd + 1)),
      noon = new Date(y, m, dd, 12), ph = elong(noon.getTime()), il = Math.round((1 - Math.cos(ph * R)) / 2 * 100), lc = lunarCycle(noon),
      light = T && T2 ? Math.round(360 * (T.set - T.rise) / (T2.rise - T.rise)) : null;
    return '<div class="cdet"><div class="cg1">' + d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + '</div>' +
      '<div class="cp">' + t("calAngle").replace("{a}", CalendarSystem.label(d)) + '</div>' +
      '<div>' + t("calDoy").replace("{n}", doy(d)).replace("{d}", daysInYear(y)).replace("{w}", isoWeek(d)) + '</div>' +
      '<div>' + (light === null ? t("calPolar") : t("lightHead").replace("{a}", light)) + '</div>' +
      '<div>' + t("ph" + phaseIdx(ph)) + ' · ' + t("moonIll").replace("{i}", il) + '</div>' +
      '<div>' + t("moonDayLine").replace("{d}", lc.day).replace("{l}", lc.length.toFixed(1).replace(".", lang === "en" ? "." : ",")) + '</div>' +
      '<p class="cnote">' + t("moonNote") + '</p></div>'
  }

  function seg() {
    return '<div class="seg cseg" role="group">' +
      '<button data-cv="month" aria-pressed="' + (cv === "month") + '">' + t("calMonthV") + '</button>' +
      '<button data-cv="year" aria-pressed="' + (cv === "year") + '">' + t("calYearV") + '</button></div>'
  }

  /* Widok roku: 12 małych miesięcy obok siebie. W każdym: numer tygodnia (ISO), skróty nazw dni,
     numery dni miesiąca. Kropka = równonoc lub przesilenie. Po najechaniu: nazwa dnia, numer dnia w roku, kąt roku. */
  function renderYear(box) {
    var i, m, h = seg() + '<div class="cnav"><button data-a="py" aria-label="-1">«</button><b>' + vy +
      '</b><button data-a="ny" aria-label="+1">»</button></div>' +
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
    try { localStorage.setItem("calsel", JSON.stringify({ y: vy, m: vm, sy: sel.getFullYear(), sm: sel.getMonth(), d: sel.getDate() })) } catch (e) {}
    box.classList.toggle("yearMode", cv === "year");
    if (cv === "year") return renderYear(box);
    var first = new Date(vy, vm, 1), lead = (first.getDay() + 6) % 7, days = new Date(vy, vm + 1, 0).getDate(), i, h =
      '<div class="cnav"><button data-a="py" aria-label="-1">«</button><button data-a="pm" aria-label="-">‹</button><b>' +
      first.toLocaleDateString(loc(), { month: "long", year: "numeric" }) + '</b><button data-a="nm" aria-label="+">›</button><button data-a="ny" aria-label="+1">»</button></div><div class="cgrid">';
    h = seg() + h;
    for (i = 0; i < 7; i++) h += '<span class="wd">' + new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: "short" }) + '</span>';
    for (i = 0; i < lead; i++) h += '<span></span>';
    for (i = 1; i <= days; i++) {
      var dt = new Date(vy, vm, i);
      h += '<button class="cc' + (same(dt, today) ? " today" : "") + (same(dt, sel) ? " sel" : "") + '" data-d="' + i + '"><small>' + i + '</small><b>' + CalendarSystem.label(dt) + '</b></button>'
    }
    box.innerHTML = h + '</div><div class="ctoolbar"><button class="ctoday" data-a="t">' + t("calToday") + '</button></div>' + detail(sel) +
      '<p class="cnote">' + t("calNote") + '</p>'
  }

  if ($("calView")) $("calView").onclick = function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var a = b.getAttribute("data-a"), d = b.getAttribute("data-d"), m = b.getAttribute("data-m"), v = b.getAttribute("data-cv");
    if (v) { cv = v; try { localStorage.setItem("cview", v) } catch (e2) {} }
    else if (m !== null && !d) { vm = +m; cv = "month"; try { localStorage.setItem("cview", cv) } catch (e2) {} }   // nazwa miesiąca -> widok miesiąca
    else if (m !== null) { vm = +m; sel = new Date(vy, vm, +d) }
    else if (d) sel = new Date(vy, vm, +d);
    else if (a === "py") vy--; else if (a === "ny") vy++;
    else if (a === "pm") { vm--; if (vm < 0) { vm = 11; vy-- } }
    else if (a === "nm") { vm++; if (vm > 11) { vm = 0; vy++ } }
    else if (a === "t") { sel = today; vy = today.getFullYear(); vm = today.getMonth() }
    render()
  };
  window.Cal = { render: render, selected: function () { return sel } };
})();
