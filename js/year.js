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

  /* Rok jako zamknięta pętla (nie jest to klasyczna analemma, która pokazuje deklinację i równanie czasu):
     kąt na pętli = pozycja Słońca na ekliptyce (kąt roku, bez dat kalendarzowych), przesilenie letnie u góry;
     promień = stopnie światła tego dnia (24 h = 360°). Przerywany okrąg = dzień równy nocy (180°).
     Kolor odcinka = rzeczywisty kierunek zmiany: światła przybywa (złoty), ubywa (fioletowy), prawie stałe (szary). */
  function render() {
    var box = $("yearView"); if (!box) return;
    var now = new Date(), y = now.getFullYear(), a = series(y), n = a.length,
      lam = a.map(function (_, i) { return sunLonDeg(Date.UTC(y, 0, 1 + i, 12)) }),
      today = Math.round((Date.UTC(y, now.getMonth(), now.getDate()) - Date.UTC(y, 0, 1)) / 864e5),
      h0 = a[today], hn = today < n - 1 ? a[today + 1] : dayHours(y + 1, 0, 1),
      rate = (hn - h0) * 15,                                           // zmiana stopni światła: jutro minus dziś (°/dobę)
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
        : Math.abs(rate) < 0.05 ? (h0 >= (a[iMax] + a[iMin]) / 2 ? "yLong" : "yShort") : rate > 0 ? "yRise" : "yFall",
      col = st === "yRise" || st === "yLong" ? "#e8a000" : st === "yFall" || st === "yShort" ? "#6a66b0" : "var(--mut)";
    last = { year: y, today: today, iMax: iMax, iMin: iMin, dMax: dMax, dMin: dMin, rate: rate, state: st, flat: flat, hours: h0, lightDeg: h0 * 15, amp: a[iMax] - a[iMin], n: n };

    var top0 = lat >= 0 ? 90 : 270, o = "", i,
      rr = function (h) { return Math.max(20, Math.min(140, 80 + 60 * (h * 15 - 180) / 180)) },
      Pt = function (k, r2) { var th = (lam[((k % n) + n) % n] - top0) * R; return [180 + r2 * Math.sin(th), 160 - r2 * Math.cos(th)] },
      Pc = function (k) { return Pt(k, rr(a[((k % n) + n) % n])) },
      fmt = function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1) };
    o += '<circle cx="180" cy="160" r="80" fill="none" stroke="var(--mut)" stroke-opacity=".4" stroke-dasharray="3 4"/>';
    var runs = [], cur = null;
    for (i = 0; i < n; i++) {                                         // cała pętla, łącznie z domknięciem ostatniego dnia z pierwszym
      var dd = (a[(i + 1) % n] - a[i]) * 15, k = dd > 0.05 ? "r" : dd < -0.05 ? "f" : "z";
      if (!cur || cur.k !== k) { cur = { k: k, p: [Pc(i)] }; runs.push(cur) }
      cur.p.push(Pc(i + 1))
    }
    runs.forEach(function (r) {
      o += '<polyline fill="none" stroke="' + (r.k === "r" ? "#e8a000" : r.k === "f" ? "#6a66b0" : "var(--mut)") + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="' + r.p.map(fmt).join(" ") + '"/>'
    });
    if (!flat) [[iMax, "yLongS", "#e8a000", 14], [iMin, "yShortS", "#6a66b0", 16]].forEach(function (e) {
      if (a[e[0]] === 24 || a[e[0]] === 0) return;                    // plateau polarne nie ma jednego punktu
      var p = Pc(e[0]), q = Pt(e[0], rr(a[e[0]]) + e[3]);
      o += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" fill="var(--bg)" stroke="' + e[2] + '" stroke-width="2"/>' +
        '<text class="ylb" x="' + q[0].toFixed(1) + '" y="' + (q[1] + 3).toFixed(1) + '" text-anchor="middle">' + t(e[1]) + '</text>'
    });
    var pm = Pc(today);
    if (!flat) {                                                      // strzałka: kierunek ruchu po cyklu (styczna do pętli)
      var p0 = Pc(today - 2), p1 = Pc(today + 2), an = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), cs = Math.cos(an), sn = Math.sin(an),
        ax = pm[0] + 16 * cs, ay = pm[1] + 16 * sn;
      o += '<polygon fill="' + col + '" points="' + [[ax + 6 * cs, ay + 6 * sn], [ax - 3 * cs - 4 * sn, ay - 3 * sn + 4 * cs], [ax - 3 * cs + 4 * sn, ay - 3 * sn - 4 * cs]].map(fmt).join(" ") + '"/>'
    }
    o += '<circle cx="' + pm[0].toFixed(1) + '" cy="' + pm[1].toFixed(1) + '" r="6.5" fill="#f08a00" stroke="var(--bg)" stroke-width="2.5"/>';
    if (!polar && rr(a[iMin]) > 45) o += '<text x="180" y="166" text-anchor="middle" font-size="22" font-weight="700" fill="var(--fg)">' + Math.round(h0 * 15) + '°</text>';

    var rt = Math.abs(rate) < 0.05 ? "0" : (rate > 0 ? "+" : "−") + num(Math.abs(rate), 1),
      h = '<svg class="ysvg" viewBox="0 0 360 320" role="img" aria-label="' + t("yearBtn") + '">' + o + '</svg>' +
        '<div class="ystate"><span class="ydot" style="background:' + col + '"></span>' + t(st) + '</div>';
    if (!polar) h += '<div class="yrow">' + t("lightHead").replace("{a}", Math.round(h0 * 15)) + (flat ? "" : " · " + t("yRate").replace("{r}", rt)) + '</div>';
    if (!flat) h += '<div class="yrow">' + t("yToLong").replace("{n}", nd(dMax)) + '</div><div class="yrow">' + t("yToShort").replace("{n}", nd(dMin)) + '</div>' +
      '<div class="yrow yexp">' + t("yExp") + '</div>';
    box.innerHTML = h
  }
  window.YearClock = { render: render, last: function () { return last } };
})();
