/* ===== Wizualizacja zegara w 3D =====
   Dwa kąty w jednym rysunku:
   - obrót Ziemi (pomarańczowy): mierzony wokół osi Ziemi, w płaszczyźnie drogi Słońca,
     od wschodu - to jest kąt z tarczy zegara,
   - wysokość Słońca (niebieski): mierzona u obserwatora, od horyzontu w górę.
   Układ współrzędnych: x = wschód, y = północ, z = zenit (obserwator w środku). */
(function () {
  var D = Math.PI / 180, CX = 190, CY = 172, RR = 138;
  var az = Math.PI, el = 0.45;   // widok: obrót i wysokość kamery
  var follow = true;       // true = rysunek podąża za prawdziwym Słońcem w Twoim miejscu

  function $(i) { return document.getElementById(i) }

  // kierunek na Słońce (jednostkowy) dla kąta godzinnego H, deklinacji dec i szerokości lat
  function sv(H, dec, lat) {
    return [
      -Math.cos(dec) * Math.sin(H),
      Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(H),
      Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H)
    ]
  }

  // rzut ortograficzny punktu 3D na ekran (z obrotem widoku)
  function P(v) {
    var ca = Math.cos(az), sa = Math.sin(az),
      x = v[0] * ca - v[1] * sa, y = v[0] * sa + v[1] * ca,
      cb = Math.cos(el), sb = Math.sin(el);
    return [CX + RR * x, CY - RR * (v[2] * cb + y * sb)]
  }

  function pa(pts, cl) {
    return "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1) }).join("L") + (cl ? "Z" : "")
  }
  function ln(a, b, st) {
    return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" ' + st + '/>'
  }
  // podpis obok punktu: w prawo, jeśli punkt jest po prawej stronie środka, inaczej w lewo
  function lab(p, txt, cls, dx) {
    var r = p[0] > CX;
    return '<text class="' + cls + '" x="' + (p[0] + (r ? dx : -dx)).toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" text-anchor="' + (r ? "start" : "end") + '">' + txt + '</text>'
  }
  function mid(txt, cls, p, dy) {
    return '<text class="' + cls + '" x="' + p[0].toFixed(1) + '" y="' + (p[1] + dy).toFixed(1) + '" text-anchor="middle">' + txt + '</text>'
  }
  function fmt(n) { return n.toLocaleString(loc(), { maximumFractionDigits: 1 }) }

  // współrzędne ekliptyczne (długość l, szerokość b) -> rektascensja i deklinacja
  var EPS = 23.4397 * D, INC = 5.145 * D;   // nachylenie osi Ziemi i orbity Księżyca do ekliptyki
  function eq(l, b) {
    return {
      ra: Math.atan2(Math.sin(l) * Math.cos(EPS) - Math.tan(b) * Math.sin(EPS), Math.cos(l)),
      dec: Math.asin(Math.sin(b) * Math.cos(EPS) + Math.cos(b) * Math.sin(EPS) * Math.sin(l))
    }
  }
  // linia przez punkty 3D: część pod horyzontem bledsza
  function curve(pts, st) {
    var o = "", run = [pts[0]], up = pts[0][2] >= 0;
    function flush() { if (run.length > 1) o += '<path d="' + pa(run.map(P), 0) + '" fill="none" ' + st + ' stroke-opacity="' + (up ? 0.9 : 0.3) + '"/>' }
    for (var i = 1; i < pts.length; i++) {
      run.push(pts[i]);
      if ((pts[i][2] >= 0) !== up) { flush(); run = [pts[i]]; up = !up }
    }
    flush();
    return o
  }

  /* Wybrany przycisk na pomarańczowo: "Teraz", gdy rysunek podąża za Słońcem, albo przycisk deklinacji
     (21 cze / równonoc / 21 gru), którego wartość jest ustawiona na suwaku. Stan widoku zostaje w przeglądarce. */
  function mark() {
    var dec = +$("v3dec").value;
    $("v3now").classList.toggle("main", follow);
    document.querySelectorAll("[data-v3d]").forEach(function (b) {
      b.classList.toggle("main", !follow && Math.abs(dec - +b.getAttribute("data-v3d")) < 0.05)
    });
    try { localStorage.setItem("v3", JSON.stringify({ follow: follow, g: +$("v3g").value, lat: +$("v3lat").value, dec: dec, az: az, el: el })) } catch (e) {}
  }

  function draw() {
    mark();
    var lat = +$("v3lat").value * D, dec = +$("v3dec").value * D, g = +$("v3g").value;
    var H0 = Math.acos(Math.max(-1, Math.min(1, -Math.tan(lat) * Math.tan(dec)))),   // połowa łuku dnia
      arc = 2 * H0 / D, H = -H0 + g * D, S = sv(H, dec, lat),
      pv = [0, Math.cos(lat), Math.sin(lat)],   // oś Ziemi
      sd = Math.sin(dec), C = [pv[0] * sd, pv[1] * sd, pv[2] * sd];   // środek okręgu drogi Słońca
    var O = P([0, 0, 0]), Ps = P(S), Pc = P(C), Pr = P(sv(-H0, dec, lat)), Pt = P(sv(H0, dec, lat));
    var o = "", a = [], i;

    // horyzont (tarcza w płaszczyźnie z = 0)
    for (i = 0; i <= 90; i++) a.push(P([Math.cos(i * 4 * D), Math.sin(i * 4 * D), 0]));
    o += '<path d="' + pa(a, 1) + '" style="fill:var(--card);stroke:var(--mut);stroke-opacity:.6;stroke-width:1"/>';
    [[0, 1.14, t("v3N")], [0, -1.14, t("v3S")], [1.14, 0, t("v3E")], [-1.14, 0, t("v3W")]].forEach(function (c) {
      o += mid(c[2], "v3lb", P([c[0], c[1], 0]), 4)
    });
    o += lab(P([0.71, 0.71, 0]), t("v3Hor"), "v3lb", 10);

    // droga Słońca: noc (ciemny) i dzień (jasny) - te same kolory co na tarczy
    a = []; for (i = 0; i <= 60; i++) a.push(P(sv(H0 + (2 * Math.PI - 2 * H0) * i / 60, dec, lat)));
    o += '<path d="' + pa(a, 0) + '" fill="none" stroke="var(--night)" stroke-width="4" stroke-linecap="round"/>';
    a = []; for (i = 0; i <= 60; i++) a.push(P(sv(-H0 + 2 * H0 * i / 60, dec, lat)));
    o += '<path d="' + pa(a, 0) + '" fill="none" stroke="var(--day)" stroke-width="4" stroke-linecap="round"/>';

    // oś Ziemi
    var A1 = P([-pv[0] * 1.25, -pv[1] * 1.25, -pv[2] * 1.25]), A2 = P([pv[0] * 1.25, pv[1] * 1.25, pv[2] * 1.25]);
    o += ln(A1, A2, 'stroke="#7F77DD" stroke-width="1.2" stroke-dasharray="6 4"');
    var At = A1[1] < A2[1] ? A1 : A2;
    o += mid(t("v3Axis"), "v3lb", [At[0], At[1] - 12], 4);

    // obrót Ziemi: wycinek od wschodu do bieżącego położenia Słońca, wokół środka okręgu drogi
    var n = Math.max(2, Math.ceil(g / 3));
    a = [Pc]; for (i = 0; i <= n; i++) a.push(P(sv(-H0 + g * D * i / n, dec, lat)));
    o += '<path d="' + pa(a, 1) + '" fill="#EF9F27" fill-opacity="0.28" stroke="#EF9F27" stroke-width="0.8"/>';
    o += ln(Pc, Pr, 'stroke="#BA7517" stroke-width="1" stroke-dasharray="3 3"');
    o += ln(Pc, Ps, 'stroke="#BA7517" stroke-width="1" stroke-dasharray="3 3"');
    o += '<circle cx="' + Pc[0].toFixed(1) + '" cy="' + Pc[1].toFixed(1) + '" r="3" fill="#BA7517"/>';

    // wysokość Słońca: kąt między kierunkiem do punktu na horyzoncie pod Słońcem a kierunkiem na Słońce
    var nf = Math.hypot(S[0], S[1]), f = nf > 1e-6 ? [S[0] / nf, S[1] / nf] : [1, 0],
      alt = Math.asin(Math.max(-1, Math.min(1, S[2]))), Pf = P([S[0], S[1], 0]);
    a = [O]; for (i = 0; i <= 12; i++) {
      var tt = alt * i / 12;
      a.push(P([0.4 * Math.cos(tt) * f[0], 0.4 * Math.cos(tt) * f[1], 0.4 * Math.sin(tt)]))
    }
    o += '<path d="' + pa(a, 1) + '" fill="#378ADD" fill-opacity="0.25" stroke="#378ADD" stroke-width="1"/>';
    o += ln(O, Pf, 'stroke="#378ADD" stroke-width="1.5"');
    o += ln(Pf, Ps, 'stroke="#378ADD" stroke-width="1" stroke-dasharray="3 3"');
    o += ln(O, Ps, 'stroke="#185FA5" stroke-width="1.5"');

    // obserwator, wschód i zachód
    o += '<circle cx="' + O[0].toFixed(1) + '" cy="' + O[1].toFixed(1) + '" r="3.5" fill="var(--fg)"/>';
    o += mid(t("v3Obs"), "v3lb", [O[0], O[1] + 12], 4);
    [[Pr, t("v3Rise")], [Pt, t("v3Sunset")]].forEach(function (q) {
      o += '<circle cx="' + q[0][0].toFixed(1) + '" cy="' + q[0][1].toFixed(1) + '" r="3.5" fill="var(--fg)"/>' + lab([q[0][0], q[0][1] + 13], q[1], "v3lb", -6)
    });

    // ekliptyka i orbita Księżyca: wielkie okręgi na niebie, przecinają się w dwóch węzłach.
    // Słońce stoi na ekliptyce w długości odpowiadającej deklinacji z suwaka (pora roku z prawdziwej daty).
    var LV = window.live;
    if (LV && LV.node !== null && LV.node !== undefined) {
      var lS = Math.asin(Math.max(-1, Math.min(1, Math.sin(dec) / Math.sin(EPS))));
      if (Math.cos(LV.sLon * D) < 0) lS = Math.PI - lS;
      var raS = eq(lS, 0).ra, Om = LV.node * D;
      var sky = function (l, b) { var e = eq(l, b); return sv(H - (e.ra - raS), e.dec, lat) };
      var onOrbit = function (u) { return sky(Om + Math.atan2(Math.sin(u) * Math.cos(INC), Math.cos(u)), Math.asin(Math.sin(u) * Math.sin(INC))) };
      var ec = [], mo = [];
      for (i = 0; i <= 120; i++) { ec.push(sky(i * 3 * D, 0)); mo.push(onOrbit(i * 3 * D)) }
      o += curve(ec, 'stroke="#d4b20b" stroke-width="1.3"');
      o += curve(mo, 'stroke="#8ea3c2" stroke-width="1.3" stroke-dasharray="4 3"');
      [0, Math.PI].forEach(function (u) {   // węzły: tu orbita Księżyca przecina ekliptykę
        var q = P(onOrbit(u));
        o += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="3" fill="var(--card)" stroke="#8ea3c2" stroke-width="1.5"/>'
      });
      o += lab(P(sky(lS + 50 * D, 0)), t("v3Ecl"), "v3lb", 6);
      // Księżyc: ta sama odległość od Słońca co w rzeczywistości, położony na swojej orbicie
      var lM = lS + (LV.mLon - LV.sLon) * D, dM = lM - Om,
        Pm = P(onOrbit(Math.atan2(Math.sin(dM), Math.cos(dM) * Math.cos(INC))));
      o += '<circle cx="' + Pm[0].toFixed(1) + '" cy="' + Pm[1].toFixed(1) + '" r="4.5" fill="#e6ebf5" stroke="#8ea3c2" stroke-width="1.5"/>' + lab([Pm[0], Pm[1] - 10], t("moonH"), "v3lb", 6)
    }

    // Słońce
    o += '<circle cx="' + Ps[0].toFixed(1) + '" cy="' + Ps[1].toFixed(1) + '" r="7" fill="var(--sun)" stroke="var(--bg)" stroke-width="2"/>';

    // opisy kątów
    if (g > 8) {
      var m = sv(-H0 + g * D / 2, dec, lat);
      o += mid(Math.round(g) + "°", "v3A", P([(C[0] + m[0]) / 2, (C[1] + m[1]) / 2, (C[2] + m[2]) / 2]), 4)
    }
    if (Math.abs(alt) > 6 * D) {
      var b = alt / 2;
      o += mid(Math.round(alt / D) + "°", "v3B", P([0.62 * Math.cos(b) * f[0], 0.62 * Math.cos(b) * f[1], 0.62 * Math.sin(b)]), 4)
    }
    $("v3sc").innerHTML = o;

    $("v3A").textContent = Math.round(g) + "°";
    $("v3B").textContent = Math.round(alt / D) + "°";
    $("v3C").textContent = Math.round(arc) + "°";
    $("v3gv").textContent = Math.round(g) + "°";
    var lv = +$("v3lat").value;
    $("v3latv").textContent = Math.abs(lv) + "° " + (lv < 0 ? "S" : "N");
    $("v3decv").textContent = fmt(+$("v3dec").value) + "°";
  }

  // ustawia suwaki według prawdziwego Słońca w wybranym miejscu (dane z main.js)
  function sync() {
    var L = window.live;
    if (!L) return;
    $("v3lat").value = Math.max(-66, Math.min(66, Math.round(L.lat)));
    $("v3dec").value = Math.round(Math.max(-23.4, Math.min(23.4, L.dec)) * 10) / 10;
    // Obrót "od wschodu" z prawdziwego kąta godzinnego Słońca (sH: 0 = górowanie), przeliczony na model 3D
    // (szerokość i deklinacja z suwaków, przycięte do ±66° / ±23,4°). Działa też w dzień/noc polarną
    // i za kołem podbiegunowym, gdzie kąt z tarczy (od wschodu lub od północy) nie pasuje do modelu.
    var la3 = +$("v3lat").value * D, de3 = +$("v3dec").value * D,
      H0m = Math.acos(Math.max(-1, Math.min(1, -Math.tan(la3) * Math.tan(de3)))) / D;
    $("v3g").value = (((L.sH + H0m) % 360 + 360) % 360).toFixed(1);
  }

  // domyślny widok: patrzymy tak jak obserwator na Słońce - na półkuli północnej na południe,
  // na południowej na północ (wtedy droga Słońca nie jest widziana "od krawędzi")
  function resetView() {
    az = +$("v3lat").value >= 0 ? Math.PI : 0;
    el = 0.45;
  }

  function setBtn() {
    var b = $("viewBtn");
    b.textContent = t("to3d");
    b.setAttribute("aria-pressed", $("v3").hidden ? "false" : "true");
  }

  /* ----- przycisk w lewym górnym rogu: tarcza <-> wizualizacja 3D ----- */
  $("viewBtn").onclick = function () {
    var open = $("v3").hidden;   // za chwilę pokażemy 3D
    if (open) { follow = true; sync(); resetView(); draw() }
    if (window.showView) showView(open ? "3d" : "dial");   // przełączanie widoków jest w main.js
    setBtn();
  };

  /* ----- sterowanie ----- */
  ["v3g", "v3lat", "v3dec"].forEach(function (id) {
    $(id).oninput = function () { follow = false; draw() }
  });
  document.querySelectorAll("[data-v3d]").forEach(function (b) {
    b.onclick = function () { follow = false; $("v3dec").value = b.getAttribute("data-v3d"); draw() }
  });
  $("v3now").onclick = function () { follow = true; sync(); draw() };
  $("v3rs").onclick = function () { resetView(); draw() };

  /* ----- obracanie widoku przeciąganiem ----- */
  var dr = null, svg = $("v3svg");
  svg.onpointerdown = function (e) { dr = [e.clientX, e.clientY]; svg.setPointerCapture(e.pointerId); svg.style.cursor = "grabbing" };
  svg.onpointermove = function (e) {
    if (!dr) return;
    az += (e.clientX - dr[0]) * 0.008;
    el = Math.max(0.1, Math.min(1.35, el + (e.clientY - dr[1]) * 0.008));
    dr = [e.clientX, e.clientY];
    draw()
  };
  svg.onpointerup = svg.onpointercancel = function () { dr = null; svg.style.cursor = "grab" };

  // Słońce w rysunku porusza się razem z prawdziwym (tylko gdy widok 3D jest otwarty)
  setInterval(function () { if (!$("v3").hidden && follow) { sync(); draw() } }, 1000);

  // wywoływane z main.js po zmianie języka
  // restore(): po przeładowaniu strony otwiera 3D z zapamiętanymi suwakami i obrotem (zamiast "Teraz" od nowa)
  window.Sun3D = {
    refresh: function () { setBtn(); if (!$("v3").hidden) draw() },
    restore: function () {
      var st = null;
      try { st = JSON.parse(localStorage.getItem("v3") || "null") } catch (e) {}
      if (st && isFinite(st.g) && isFinite(st.lat) && isFinite(st.dec) && isFinite(st.az) && isFinite(st.el)) {
        follow = !!st.follow; $("v3lat").value = st.lat; $("v3dec").value = st.dec; $("v3g").value = st.g; az = st.az; el = st.el;
        if (follow) sync()
      } else { follow = true; sync(); resetView() }
      if (window.showView) showView("3d");
      draw(); setBtn()
    }
  };

  setBtn();
})();
