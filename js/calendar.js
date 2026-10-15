/* ===== Kalendarz: nawigacja po dniach + podwójne oznaczenie daty =====
   Datę w "naszym systemie" opisuje wymienny obiekt CalendarSystem. Na razie pokazuje roboczy kąt roku
   (długość ekliptyczna Słońca, 0° = równonoc wiosenna). Reguły kalendarza, nazwy okresów, miesiące
   księżycowe i początek roku można podmienić bez przepisywania widoku. */
(function () {
  function $(i) { return document.getElementById(i) }
  function dayStart() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()) }
  var today = dayStart();
  var sel = today, vy = today.getFullYear(), vm = today.getMonth();

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
  function same(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

  function detail(d) {   // dane astronomiczne wybranego dnia (wspólne funkcje z zegarem dobowym)
    var y = d.getFullYear(), m = d.getMonth(), dd = d.getDate(), T = times(new Date(y, m, dd)), T2 = times(new Date(y, m, dd + 1)),
      noon = new Date(y, m, dd, 12), ph = elong(noon.getTime()), il = Math.round((1 - Math.cos(ph * R)) / 2 * 100), lc = lunarCycle(noon),
      light = T && T2 ? Math.round(360 * (T.set - T.rise) / (T2.rise - T.rise)) : null;
    return '<div class="cdet"><div class="cg1">' + d.toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + '</div>' +
      '<div class="cp">' + t("calAngle").replace("{a}", CalendarSystem.label(d)) + '</div>' +
      '<div>' + (light === null ? t("calPolar") : t("lightHead").replace("{a}", light)) + '</div>' +
      '<div>' + t("ph" + phaseIdx(ph)) + ' · ' + t("moonIll").replace("{i}", il) + '</div>' +
      '<div>' + t("moonDayLine").replace("{d}", lc.day).replace("{l}", lc.length.toFixed(1).replace(".", lang === "en" ? "." : ",")) + '</div>' +
      '<p class="cnote">' + t("moonNote") + '</p></div>'
  }

  function render() {
    var box = $("calView"); if (!box) return;
    var first = new Date(vy, vm, 1), lead = (first.getDay() + 6) % 7, days = new Date(vy, vm + 1, 0).getDate(), i, h =
      '<div class="cnav"><button data-a="py" aria-label="-1">«</button><button data-a="pm" aria-label="-">‹</button><b>' +
      first.toLocaleDateString(lang, { month: "long", year: "numeric" }) + '</b><button data-a="nm" aria-label="+">›</button><button data-a="ny" aria-label="+1">»</button></div><div class="cgrid">';
    for (i = 0; i < 7; i++) h += '<span class="wd">' + new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: "short" }) + '</span>';
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
    var a = b.getAttribute("data-a"), d = b.getAttribute("data-d");
    if (d) sel = new Date(vy, vm, +d);
    else if (a === "py") vy--; else if (a === "ny") vy++;
    else if (a === "pm") { vm--; if (vm < 0) { vm = 11; vy-- } }
    else if (a === "nm") { vm++; if (vm > 11) { vm = 0; vy++ } }
    else if (a === "t") { sel = today; vy = today.getFullYear(); vm = today.getMonth() }
    render()
  };
  window.Cal = { render: render, selected: function () { return sel } };
})();
