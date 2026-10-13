/* ===== Zegar roku: długość dnia w ciągu roku dla wybranej lokalizacji =====
   Te same obliczenia co zegar dobowy (sol, gam, wschód/zachód przy 90,833°). Kierunek zmiany
   (przybywa / ubywa) wynika z faktycznej różnicy długości dnia, a nie z półkuli. */
(function () {
  var last = null;
  function $(i) { return document.getElementById(i) }

  // długość dnia w godzinach (0 = noc polarna, 24 = dzień polarny)
  function dayHours(y, m, d) {
    var S = sol(gam(new Date(Date.UTC(y, m, d, 12)))),
      c = Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(S.dc)) - Math.tan(lat * R) * Math.tan(S.dc);
    return c > 1 ? 0 : c < -1 ? 24 : 2 * Math.acos(c) / R / 15
  }
  function daysIn(y) { return (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 864e5 }
  function series(y) { var a = [], n = daysIn(y); for (var i = 0; i < n; i++) a.push(dayHours(y, 0, 1 + i)); return a }
  function arg(a, mx) {   // indeks największej (mx) lub najmniejszej wartości; przy remisie pierwszy
    var k = 0;
    for (var i = 1; i < a.length; i++) if (mx ? a[i] > a[k] + 1e-9 : a[i] < a[k] - 1e-9) k = i;
    return k
  }
  function num(x, d) { return x.toFixed(d).replace(".", lang === "en" ? "." : ",") }
  function nd(n) { return n === 0 ? t("todayLbl") : n + " " + t(n === 1 ? "dayOne" : "dayMany") }
  function dshort(y, i) { return new Date(Date.UTC(y, 0, 1 + i)).toLocaleDateString(lang, { day: "numeric", month: "short", timeZone: "UTC" }) }

  function render() {
    var box = $("yearView"); if (!box) return;
    var now = new Date(), y = now.getFullYear(), a = series(y), n = a.length,
      today = Math.round((Date.UTC(y, now.getMonth(), now.getDate()) - Date.UTC(y, 0, 1)) / 864e5),
      h0 = a[today], hp = today > 0 ? a[today - 1] : dayHours(y - 1, 11, 31), hn = today < n - 1 ? a[today + 1] : dayHours(y + 1, 0, 1),
      rate = (hn - hp) / 2 * 60,                                     // zmiana w minutach na dobę
      iMax = arg(a, 1), iMin = arg(a, 0), flat = a[iMax] - a[iMin] < 0.25, polar = h0 <= 0 || h0 >= 24;
    function until(i, mx) {                                           // dni do najbliższego (przyszłego) ekstremum
      if (a[i] === (mx ? 24 : 0)) {                                   // plateau polarne: pierwszy dzień plateau od dziś
        var ab = a.concat(series(y + 1));
        for (var j = today; j < ab.length; j++) if (ab[j] === a[i]) return j - today
      }
      if (Math.abs(h0 - a[i]) < 1e-6 || i >= today) return Math.max(0, i - today);
      return (n - today) + arg(series(y + 1), mx)
    }
    var dMax = until(iMax, 1), dMin = until(iMin, 0),
      st = h0 >= 24 ? "yPolarDay" : h0 <= 0 ? "yPolarNight" : flat ? "yFlat"
        : Math.abs(rate) < 0.2 ? (h0 >= (a[iMax] + a[iMin]) / 2 ? "yLong" : "yShort") : rate > 0 ? "yRise" : "yFall",
      col = st === "yRise" ? "#e8a000" : st === "yFall" || st === "yShort" ? "#6a66b0" : st === "yLong" ? "#e8a000" : "var(--mut)";
    last = { year: y, today: today, iMax: iMax, iMin: iMin, dMax: dMax, dMin: dMin, rate: rate, state: st, flat: flat, hours: h0, amp: a[iMax] - a[iMin] };

    var X0 = 30, X1 = 350, Y0 = 14, Y1 = 164, o = "",
      X = function (i) { return X0 + (X1 - X0) * i / (n - 1) }, Y = function (v) { return Y0 + (Y1 - Y0) * (1 - v / 24) };
    [6, 12, 18].forEach(function (g) {
      o += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + Y(g) + '" y2="' + Y(g) + '" stroke="var(--mut)" stroke-opacity=".3" stroke-dasharray="2 4"/>' +
        '<text class="ylb" x="' + (X0 - 4) + '" y="' + (Y(g) + 3) + '" text-anchor="end">' + g + ' h</text>'
    });
    for (var mo = 0; mo < 12; mo++) {
      var s0 = (Date.UTC(y, mo, 1) - Date.UTC(y, 0, 1)) / 864e5, s1 = (Date.UTC(y, mo + 1, 1) - Date.UTC(y, 0, 1)) / 864e5;
      o += '<line x1="' + X(s0) + '" x2="' + X(s0) + '" y1="' + Y1 + '" y2="' + (Y1 + 4) + '" stroke="var(--mut)" stroke-opacity=".5"/>' +
        '<text class="ylb" x="' + X((s0 + s1) / 2) + '" y="' + (Y1 + 16) + '" text-anchor="middle">' +
        new Date(Date.UTC(y, mo, 15)).toLocaleDateString(lang, { month: "short", timeZone: "UTC" }).replace(".", "") + '</text>'
    }
    // krzywa: odcinki kolorowane według rzeczywistego kierunku zmiany (przybywa / ubywa / stały)
    var runs = [], cur = null, i;
    for (i = 1; i < n; i++) {
      var dd = a[i] - a[i - 1], k = dd > 1e-4 ? "r" : dd < -1e-4 ? "f" : "z";
      if (!cur || cur.k !== k) { cur = { k: k, p: [[X(i - 1), Y(a[i - 1])]] }; runs.push(cur) }
      cur.p.push([X(i), Y(a[i])])
    }
    runs.forEach(function (r) {
      o += '<polyline fill="none" stroke="' + (r.k === "r" ? "#e8a000" : r.k === "f" ? "#6a66b0" : "var(--mut)") + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="' +
        r.p.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1) }).join(" ") + '"/>'
    });
    if (!flat) [[iMax, "yLongS", "#e8a000", -10], [iMin, "yShortS", "#6a66b0", 17]].forEach(function (e) {
      var x = X(e[0]), an = x < 90 ? "start" : x > 290 ? "end" : "middle";
      o += '<circle cx="' + x + '" cy="' + Y(a[e[0]]) + '" r="4" fill="var(--bg)" stroke="' + e[2] + '" stroke-width="2"/>' +
        '<text class="ylb" x="' + x + '" y="' + (Y(a[e[0]]) + e[3]) + '" text-anchor="' + an + '">' + t(e[1]) + ' · ' + dshort(y, e[0]) + '</text>'
    });
    var mx = X(today), my = Y(h0);
    o += '<line x1="' + mx + '" x2="' + mx + '" y1="' + my + '" y2="' + Y1 + '" stroke="var(--fg)" stroke-opacity=".35" stroke-dasharray="3 3"/>';
    if (!polar && !flat && Math.abs(rate) >= 0.2) {   // strzałka kierunku zmiany światła, styczna do krzywej
      var i0 = Math.max(0, today - 4), i1 = Math.min(n - 1, today + 4), an2 = Math.atan2(Y(a[i1]) - Y(a[i0]), X(i1) - X(i0)),
        cs = Math.cos(an2), sn = Math.sin(an2), ax = mx + 15 * cs, ay = my + 15 * sn;
      o += '<polygon fill="' + col + '" points="' + [[ax + 6 * cs, ay + 6 * sn], [ax - 3 * cs - 4 * sn, ay - 3 * sn + 4 * cs], [ax - 3 * cs + 4 * sn, ay - 3 * sn - 4 * cs]].map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1) }).join(" ") + '"/>'
    }
    o += '<circle cx="' + mx + '" cy="' + my + '" r="5.5" fill="#f08a00" stroke="var(--bg)" stroke-width="2"/>';

    var hh = Math.floor(h0), mm = Math.round((h0 - hh) * 60), h = '<svg class="ysvg" viewBox="0 0 360 190" role="img" aria-label="' + t("yearBtn") + '">' + o + '</svg>' +
      '<div class="ystate"><span class="ydot" style="background:' + col + '"></span>' + t(st) + '</div>';
    if (!polar) h += '<div class="yrow">' + t("yLen").replace("{h}", hh).replace("{m}", mm) +
      (flat ? "" : " · " + t("yRate").replace("{r}", (rate > 0 ? "+" : "−") + num(Math.abs(rate), 1))) + '</div>';
    if (!flat) h += '<div class="yrow">' + t("yToLong").replace("{n}", nd(dMax)) + '</div><div class="yrow">' + t("yToShort").replace("{n}", nd(dMin)) + '</div>';
    box.innerHTML = h
  }
  window.YearClock = { render: render, last: function () { return last } };
})();
