/* ===== Kalendarz orbity: widok Kalendarz (siatka roku, domyślny) i Koło =====
   Daty kalendarza orbity liczy js/orbit.js. */
(function () {
  function $(i) { return document.getElementById(i) }
  function dayStart() { return OrbitCal.dateOf(sunDay(Date.now())) }   // dzisiejsza doba (od słonecznej północy w wybranym miejscu)
  var today = dayStart();
  var sel = today;
  var cvO = "grid";   // widok: "grid" (Kalendarz) albo "ring" (Koło), zapamiętany w przeglądarce
  try { if (localStorage.getItem("cview") === "ring") cvO = "ring"; localStorage.removeItem("cviews") } catch (e) {}   // cviews: zapis starszej wersji (z kalendarzem gregoriańskim)
  try {   // ostatnio oglądany miesiąc i wybrany dzień (po przeładowaniu strony widok zostaje)
    var cs = JSON.parse(localStorage.getItem("calsel") || "null");
    // tylko sensowne wartości (zapis mógł zostać uszkodzony albo zmieniony ręcznie)
    if (cs && inYears(cs.sy) && cs.sm >= 0 && cs.sm < 12 && cs.d >= 1 && cs.d <= 31 && cs.sm % 1 === 0 && cs.d % 1 === 0) sel = new Date(cs.sy, cs.sm, cs.d)
  } catch (e) {}
  function inYears(y) { return typeof y === "number" && y % 1 === 0 && y >= 1000 && y <= 3000 }   // lata 1000–3000, jak pole roku
  var od = OrbitCal.date(sel), oy = od.year, om = od.month;   // oglądany rok orbity i miesiąc (0–11)
  if (cs && inYears(cs.oy) && cs.om >= 0 && cs.om < 12 && cs.om % 1 === 0) { oy = cs.oy; om = cs.om }

  // O słonecznej północy (albo po zmianie miejsca) "dziś" przesuwa się samo. Jeśli patrzyłeś na dzisiejszy dzień,
  // zaznaczenie idzie razem z nim. Zwraca true, gdy "dziś" się zmieniło.
  function syncToday() {
    var n = dayStart();
    if (same(n, today)) return false;
    if (same(sel, today)) { sel = n; var o = OrbitCal.date(n); oy = o.year; om = o.month }
    today = n;
    return true
  }
  setInterval(function () { if (syncToday() && $("calView") && !$("calView").hidden) render() }, 30000);

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
  /* Kalendarz klimatyczny: wiosna, lato, jesień, zima, każda podzielona na 3 miesiące po 30° (wczesna / pełna / późna
     pora roku), na wzór 12 miesięcy gregoriańskich. Miesiące mają 29–32 dni. Kalendarz i Koło to dwa sposoby jego pokazania.
     Dokładne miejsce Ziemi na orbicie (kalendarz orbitalny, w stopniach) jest w zakładce Rok (js/orbitwheel.js). */
  function part(key, i) { return t(key).split("|")[i] }
  function qName(q) { return t("os" + sIdx(q)) }
  /* Nazwa miesiąca kalendarza klimatycznego: wczesna / pełna / późna pora roku (calMonN: 12 nazw rozdzielonych "|",
     od wczesnej wiosny do późnej zimy). Gdy brakuje nazwy w tłumaczeniu: zakres kąta orbity, np. "Miesiąc 0–30°". */
  function mName(k) {
    return t("calMonN").split("|")[sIdx(k / 3 | 0) * 3 + k % 3] || t("calMon").replace("{a}", k * 30 + "–" + (k + 1) * 30 + "°")
  }
  /* Skrót na kole: wczesna / pełna / późna (calMonS: 3 skróty albo 12, gdy forma zależy od pory roku).
     Gdy brakuje skrótu: numer miesiąca w ćwiartce, 1–3. */
  function mShort(k) {
    var s = t("calMonS").split("|");
    return (s.length === 12 ? s[sIdx(k / 3 | 0) * 3 + k % 3] : s[k % 3]) || k % 3 + 1
  }
  function mColor(k) { return qColor(k / 3 | 0) }
  // urodziny: kąt w porze roku kalendarza orbitalnego, z 2 miejscami po przecinku, ucięty (nie zaokrąglony):
  // 33,996° to jeszcze 33,99°, bo Ziemia nie doszła do 34°
  function degTr(x) { return num(Math.floor(x * 100 + 1e-9) / 100, 2) + "°" }
  // data w kalendarzu, np. "Pełna jesień · dzień 3"
  function dName(o) { return mName(o.month) + ' · ' + t("calDay").replace("{d}", o.day) }

  function detail(d) {   // dane wybranego dnia, tylko to, co potrzebne: data, granice miesięcy i apsydy, światło, Księżyc
    // Wszystko z doby n w wybranym miejscu (od słonecznej północy), nie z zegara urządzenia: Księżyc w chwili górowania Słońca,
    // światło = łuk od wschodu do zachodu tego dnia (w dzień / noc polarną: komunikat calPolar).
    var n = OrbitCal.dayN(d), noon = sunNoon(n), c = dayCycle(new Date(noon)),
      ph = elong(noon), il = Math.round((1 - Math.cos(ph * R)) / 2 * 100), lc = lunarCycle(new Date(noon)),
      light = c && !c.polar && !c.noDay ? Math.round(360 * (c.set - c.a) / (c.b - c.a)) : null,
      o = OrbitCal.date(d), ap = OrbitCal.apsisOn(n),
      ev = moonPhasesIn(OrbitCal.dayStart(n), OrbitCal.dayStart(n + 1)), k = o.month,
      // doba przejścia przez granicę 30°·k: równonoc 0° / 180°, przesilenie 90° / 270°, inaczej granica miesiąca
      cross = o.day === 1 ? (k % 3 ? t("calMonStart").replace("{l}", k * 30) : t(k % 6 ? "calSolstice" : "calEquinox")) + ': ' + whenTxt(OrbitCal.year(o.year).b[k]) : "";
    return '<div class="cdet"><div class="cg1">' + d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + '</div>' +
      '<div class="cp">' + dName(o) + '</div>' +
      (cross ? '<div class="cap">' + cross + '</div>' : '') +
      (ap ? '<div class="cap">' + t(ap.far ? "calAph" : "calPeri").replace("{k}", num(ap.km / 1e6, 1)) + ': ' + whenTxt(ap.ms) + '</div>' : '') +
      '<div>' + (light === null ? t("calPolar") : t("lightHead").replace("{a}", light)) + '</div>' +
      '<div>' + t("ph" + phaseIdx(ph)) + ' · ' + t("moonIll").replace("{i}", il) + '</div>' +
      '<div>' + t("moonDayLine").replace("{d}", lc.day).replace("{l}", lc.length.toFixed(1).replace(".", lang === "en" ? "." : ",")) + '</div>' +
      ev.map(function (e) { return '<div><b>' + t("ph" + e.k * 2) + '</b>: ' + whenTxt(e.ms) + '</div>' }).join("") + '</div>'
  }

  function seg(attr, list, cur) {
    return '<div class="seg cseg" role="group">' + list.map(function (v) {
      return '<button ' + attr + '="' + v[0] + '" aria-pressed="' + (cur === v[0]) + '">' + t(v[1]) + '</button>'
    }).join("") + '</div>'
  }
  function segs() {
    return '<div class="csegs">' + seg("data-cv", [["grid", "calGrid"], ["ring", "calRing"]], cvO) + '</div>'
  }
  function yearNav(label) {
    return '<div class="cnav"><button data-a="py" aria-label="-1">«</button><button class="cyl" data-a="ey" title="' + t("calYearEdit") + '">' + label +
      '</button><button data-a="ny" aria-label="+1">»</button></div>'
  }
  /* Kliknięcie w rok: pole do wpisania roku orbity. Enter albo wyjście z pola zatwierdza, Esc anuluje.
     Kliknięcie innego przycisku kalendarza przy otwartym polu najpierw przyjmuje rok, potem działa normalnie
     (mousedown nie zabiera fokusu z pola, więc przycisk nie znika przed kliknięciem). */
  var Y0 = 1000, Y1 = 3000, yearInp = null;
  function editYear(b) {
    var inp = yearInp = document.createElement("input");
    inp.type = "number"; inp.className = "cyin"; inp.value = oy; inp.min = Y0; inp.max = Y1; inp.setAttribute("aria-label", t("calYearEdit"));
    inp.onkeydown = function (e) {
      if (e.key !== "Enter" && e.key !== "Escape") return;
      e.preventDefault();   // inaczej ten sam Enter "naciska" napis roku, na który zaraz wraca fokus, i pole otwiera się znowu
      closeYear(e.key === "Enter"); render();
      var c = $("calView").querySelector(".cyl"); if (c) c.focus()   // fokus wraca na napis roku
    };
    inp.onblur = function (e) {   // wyjście z pola (np. Tab): przyjmij rok; fokus na ten sam przycisk po przerysowaniu
      var to = e.relatedTarget, key = null;
      if (to && $("calView").contains(to))
        ["data-a", "data-cv", "data-n", "data-om"].some(function (at) { var v = to.getAttribute(at); if (v !== null) key = '[' + at + '="' + v + '"]'; return key });
      if (!closeYear(true)) return;
      render();
      var f = key && $("calView").querySelector(key); if (f) f.focus()
    };
    b.parentNode.replaceChild(inp, b); inp.focus(); inp.select()
  }
  function closeYear(ok) {   // zamyka pole roku (bez rysowania); ok: przyjmij wpisany rok. Zwraca false, gdy pole było już zamknięte.
    var inp = yearInp; if (!inp) return false;
    yearInp = null;
    var y = Math.round(+inp.value);
    if (ok && y >= Y0 && y <= Y1) oy = y;
    return true
  }
  function oNote() {
    return '<p class="cnote">' + t("calONote") + " " + t("calMonWhy") + (OrbitCal.zone() === "T" ? " " + t("calTrop") : "") + '</p>'
  }

  /* Koło roku orbity: kąt na kole = kąt roku, zgodnie z ruchem wskazówek. Koło się obraca: wybrany dzień jest zawsze
     u góry, pod strzałką ▼. Pierścień = 12 miesięcy po 30°; kreski = granice dób; ◆ = aphelium i peryhelium.
     Koło obraca się palcem albo myszą (dzień pod strzałką zmienia się na bieżąco, puszczone w ruchu kręci się jeszcze chwilę),
     strzałkami klawiatury o dobę; kliknięcie w pierścień obraca koło do tego dnia. W środku kąt roku pod strzałką. */
  var rTop = null;   // kąt roku pod strzałką na narysowanym kole (null: koło nienarysowane)
  function inOy(d) { var s = OrbitCal.starts(oy), n = OrbitCal.dayN(d); return n >= s[0] && n < s[12] }
  function ringInner(top) {
    var o = OrbitCal.year(oy), s = OrbitCal.starts(oy), C = 180, h = "", k, n;
    var P = function (l, r) { var th = (l - top) * R; return [C + r * Math.sin(th), C - r * Math.cos(th)] },
      f = function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1) },
      arc = function (l0, l1, r) { return "M" + f(P(l0, r)) + " A" + r + " " + r + " 0 0 1 " + f(P(l1, r)) };
    var q, u;
    for (u = 0; u < 12; u++) {
      var c = P(u * 30 + 15, 118);
      h += '<path d="' + arc(u * 30 + 0.7, u * 30 + 29.3, 118) + '" fill="none" stroke="' + mColor(u) + '" stroke-width="24" stroke-opacity="' + (u === om ? 1 : 0.35) + '"/>' +
        '<text class="ylb" x="' + c[0].toFixed(1) + '" y="' + (c[1] + 4).toFixed(1) + '" text-anchor="middle" font-size="10" font-weight="700" fill="' +
          (u === om ? "#fff" : "var(--fg)") + '">' + mShort(u) + '</text>'
    }
    for (q = 0; q < 4; q++) {
      var a = P(q * 90, 92), b = P(q * 90 + 45, 66), x = a[0].toFixed(1);
      h += '<line x1="' + f(P(q * 90, 100)).replace(",", '" y1="') + '" x2="' + f(P(q * 90, 148)).replace(",", '" y2="') + '" stroke="var(--fg)" stroke-opacity=".5"/>' +
        '<text class="ylb" x="' + x + '" y="' + (a[1] + 3).toFixed(1) + '" text-anchor="middle">' + q * 90 + '°</text>' +
        '<text x="' + b[0].toFixed(1) + '" y="' + (b[1] + 4).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + qColor(q) + '">' +
        qName(q) + '</text>'
    }
    var tk = "";                                                        // granice dób (słoneczna północ w mieście); co 10 dni miesiąca dłuższa kreska
    for (u = 0; u < 12; u++) for (n = s[u]; n < s[u + 1]; n++) {
      var l = sunLonDeg(OrbitCal.dayStart(n)), d0 = n - s[u];
      tk += "M" + f(P(l, 132)) + "L" + f(P(l, d0 % 10 ? 135 : 139))
    }
    h += '<path d="' + tk + '" stroke="var(--mut)" stroke-width=".8" fill="none"/>';
    [[o.aph, "calAphS"], [o.peri, "calPeriS"]].forEach(function (e) {
      // obrócone koło: z boku napis w dwóch wierszach nad / pod ◆ (na zewnątrz) i przesunięty do środka, żeby nie wychodził poza rysunek
      var l = sunLonDeg(e[0].ms), p = P(l, 146), q2 = P(l, 160), side = Math.abs(q2[0] - C) > 100,
        ln = side ? t(e[1]).replace(" ", "\n").split("\n") : [t(e[1])],
        hw = Math.max.apply(0, ln.map(function (x) { return x.length })) * 2.7,
        x = Math.min(358 - hw, Math.max(2 + hw, q2[0])).toFixed(1), y = side ? (p[1] < C ? p[1] - 19 : p[1] + 16) : q2[1] + 4;
      h += '<path d="M' + p[0].toFixed(1) + ',' + (p[1] - 5).toFixed(1) + 'l4,5l-4,5l-4,-5z" fill="var(--fg)"/>' +
        '<text class="ylb" y="' + y.toFixed(1) + '" text-anchor="middle">' +
        ln.map(function (s, i) { return '<tspan x="' + x + '" dy="' + (i ? 11 : 0) + '">' + s + '</tspan>' }).join("") + '</text>'
    });
    if (inOy(today)) { var pt0 = P(sunLonDeg(Date.now()), 118); h += '<circle cx="' + pt0[0].toFixed(1) + '" cy="' + pt0[1].toFixed(1) + '" r="6.5" fill="#f08a00" stroke="var(--bg)" stroke-width="2.5"/>' }
    return h + '<path d="M180,37l-7,-12h14z" fill="var(--fg)"/>' +   // strzałka ▼ i kółko wybranego dnia: zawsze u góry
      '<circle cx="180" cy="62" r="10" fill="none" stroke="var(--fg)" stroke-width="2.5"/>' +
      '<text x="180" y="186" text-anchor="middle" font-size="28" font-weight="700" fill="var(--fg)">' + deg(top) + '</text>' +
      '<text class="ylb" x="180" y="202" text-anchor="middle">' + t("yAxX") + '</text>'
  }
  function drawRing(top) { top = (top % 360 + 360) % 360; var g = $("calView").querySelector(".oring"); if (g) g.innerHTML = ringInner(top); rTop = top }

  var anim = 0;   // trwający obrót (animacja albo rozpęd po puszczeniu)
  function still() { try { return matchMedia("(prefers-reduced-motion: reduce)").matches } catch (e) { return false } }
  function spinTo(a, b) {   // obrót koła od kąta a do b najkrótszą drogą
    cancelAnimationFrame(anim);
    var d = ((b - a) % 360 + 540) % 360 - 180, t0 = performance.now();
    if (Math.abs(d) < 0.5 || still()) return drawRing(b);
    (function step(now) {
      var x = Math.min(1, (now - t0) / 400);
      drawRing(a + d * (1 - Math.pow(1 - x, 3)));
      anim = x < 1 ? requestAnimationFrame(step) : 0
    })(t0)
  }
  // koło obrócone ręcznie: dzień pod strzałką staje się wybranym; dolna część (miesiąc, dane dnia) najwyżej raz na klatkę
  var restDue = false;
  function turn(top) {
    top = (top % 360 + 360) % 360;
    drawRing(top);
    var d = OrbitCal.dayAt(oy, top);
    if (same(d, sel)) return;
    var y = oy; pick(d); oy = y;
    if (!restDue) { restDue = true; requestAnimationFrame(function () { restDue = false; var r = $("calView").querySelector(".orest"); if (r) r.innerHTML = ringRest() }) }
  }

  function dayCls(dt, n) {
    var ap = OrbitCal.apsisOn(n);
    return (same(dt, today) ? " today" : "") + (same(dt, sel) ? " sel" : "") + (ap ? " ap" : "")
  }
  function renderRing(box, spin) {
    var top = OrbitCal.lonAt(OrbitCal.dayN(sel)), from = rTop;
    box.innerHTML = segs() + yearNav(t("calOYear").replace("{y}", oy)) +
      '<svg class="oring" viewBox="0 0 360 360" tabindex="0" role="img" aria-label="' + t("calRing") + '"></svg><div class="orest">' + ringRest() + '</div>';
    if (spin && from !== null) spinTo(from, top); else { cancelAnimationFrame(anim); drawRing(top) }
  }
  function ringRest() {   // pod kołem: miesiąc albo pora roku wybranego dnia, jej dni i dane dnia
    var s = OrbitCal.starts(oy), u = om, b0 = s[u], b1 = s[u + 1], i, h =
      '<div class="cnav onav"><button data-a="pm" aria-label="-">‹</button><b style="color:' + mColor(u) + '">' + mName(u) +
      '<small>' + short(OrbitCal.dateOf(b0)) + ' – ' + short(OrbitCal.dateOf(b1 - 1)) + '</small></b><button data-a="nm" aria-label="+">›</button></div><div class="cgrid ogrid">';
    for (i = 0; i < b1 - b0; i++) {
      var n = b0 + i, dt = OrbitCal.dateOf(n);
      h += '<button class="cc' + dayCls(dt, n) + '" data-n="' + n + '"><small>' + (i === 0 || dt.getDate() === 1 ? short(dt) : dt.getDate()) + '</small><b>' + (i + 1) + '</b></button>'
    }
    return h + '</div><div class="ctoolbar"><button class="ctoday" data-a="t">' + t("calToday") + '</button></div>' + detail(sel) + birthBox() + whyBox() + oNote()
  }

  /* Urodziny na orbicie: chwila urodzenia (data i godzina według zegara w miejscu urodzenia) -> data w kalendarzu orbity.
     Miejsce urodzenia jest osobne od miasta wybranego na dole strony, bo od niego zależą strefa czasowa (która chwila
     to była), słoneczna północ (od której liczy się doba) i półkula (ten sam kąt to jesień na północy, a wiosna na południu).
     Ziemia wraca na kąt urodzin co rok orbity, ale rok ma ok. 365,2422 doby, więc powrót wypada co rok ok. 5 h 49 min
     później (o ok. 87° dalej na tarczy), a po roku przestępnym się cofa. Czasem przechodzi przez słoneczną północ
     i wtedy urodziny wypadają w kalendarzu orbity o dzień dalej (albo bliżej). Powroty liczą się tam, gdzie jesteś. */
  var bday = null, bdOpen = false, bplace = null, bpList = [], bpTimer = null, bpId = 0;   // bday: { d: "2000-10-24", t: "12:00" }
  try {
    var bs = JSON.parse(localStorage.getItem("bday") || "null");
    if (bs && /^\d{4}-\d\d-\d\d$/.test(bs.d) && /^\d\d:\d\d$/.test(bs.t)) bday = bs;
    var bp = JSON.parse(localStorage.getItem("bplace") || "null");   // { lat, lon, name, tz }
    if (bp && validCoords(bp.lat, bp.lon)) bplace = { lat: bp.lat, lon: bp.lon, name: String(bp.name || ""), tz: String(bp.tz || "") };
    bdOpen = localStorage.getItem("bdOpen") === "1"
  } catch (e) {}
  // fn liczone w miejscu p: obliczenia czytają miejsce z lat / lon / tz (js/main.js), więc podmieniamy je na chwilę
  function atPlace(p, fn) {
    var s = [lat, lon, tz]; lat = p.lat; lon = p.lon; tz = p.tz;
    try { return fn() } finally { lat = s[0]; lon = s[1]; tz = s[2] }
  }
  function bpLabel() { return bplace ? "📍 " + (bplace.name || bplace.lat + "°, " + bplace.lon + "°") : "" }
  function setBplace(p) {
    bplace = p; bpList = [];
    try { localStorage.setItem("bplace", JSON.stringify(p)) } catch (e) {}
    var v = $("calView"), i = v.querySelector("[data-bp]");
    if (i) i.value = "";
    v.querySelector(".bdpr").innerHTML = "";
    v.querySelector(".bdplv").textContent = bpLabel();
    v.querySelector(".bdout").innerHTML = birthOut()
  }
  function bpSearch(q) {
    var id = ++bpId, box = $("calView").querySelector(".bdpr");
    geoSearch(q).then(function (list) {
      if (id !== bpId || !box.isConnected) return;
      bpList = list;
      box.innerHTML = list.length ? list.map(function (c, i) { return '<button data-bpi="' + i + '">' + esc(cityLabel(c)) + '</button>' }).join("")
        : '<div class="hint">' + t("noResults") + '</div>'
    }).catch(function (err) {
      if (id === bpId && box.isConnected) box.innerHTML = '<div class="hint">' + t("searchErr") + '</div>'
    })
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  // dzień powrotu w kalendarzu klimatycznym (w orbitalnym kąt jest co roku ten sam, więc tabela pokazuje dni)
  function bdOName(n) {
    var o = OrbitCal.date(OrbitCal.dateOf(n));
    return { k: o.month, d: o.day, txt: mName(o.month) + ' · ' + t("calDay").replace("{d}", o.day) }
  }
  /* Pola daty i godziny: zwykłe pola tekstowe na cyfry (natywne pole daty w części przeglądarek samo przeskakuje
     do następnej części po pierwszej cyfrze). Nic nie przeskakuje samo; wynik liczy się, gdy wszystkie pola są poprawne. */
  function bdField(k, lbl, len, v) {
    return '<label class="bdf"><span>' + lbl + '</span><input data-bd="' + k + '" inputmode="numeric" autocomplete="off" maxlength="' + len + '" size="' + len +
      '" placeholder="' + (k === "hh" ? "12" : "0000".slice(0, len)) + '" value="' + (v || "") + '"></label>'
  }
  function bdRead() {   // pola -> { d: "RRRR-MM-DD", t: "GG:MM" } albo null, gdy data niepełna lub niemożliwa (np. 31.02)
    var v = {};
    [].forEach.call($("calView").querySelectorAll("[data-bd]"), function (e) { v[e.getAttribute("data-bd")] = e.value.trim() });
    var y = +v.yy, m = +v.mm, d = +v.dd, h = v.hh === "" ? 12 : +v.hh, mi = v.mi === "" ? 0 : +v.mi;
    if (!/^\d{4}$/.test(v.yy) || !/^\d{1,2}$/.test(v.mm) || !/^\d{1,2}$/.test(v.dd) || !(h >= 0 && h < 24 && h % 1 === 0) || !(mi >= 0 && mi < 60 && mi % 1 === 0)) return null;
    var dt = new Date(Date.UTC(y, m - 1, d));
    if (y < Y0 || y > Y1 || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
    function p2(x) { return (x < 10 ? "0" : "") + x }
    return { d: y + "-" + p2(m) + "-" + p2(d), t: p2(h) + ":" + p2(mi) }
  }
  function birthBox() {
    var bd = bday ? bday.d.split("-") : [], tm = bday ? bday.t.split(":") : [];
    var h = '<details class="bday"' + (bdOpen ? " open" : "") + '><summary>' + t("bdTitle") + '</summary>' +
      '<div class="bdin">' + bdField("dd", t("bdD"), 2, bd[2]) + bdField("mm", t("bdM"), 2, bd[1]) + bdField("yy", t("bdYr"), 4, bd[0]) +
      bdField("hh", t("bdH"), 2, tm[0]) + bdField("mi", t("bdMi"), 2, tm[1]) + '</div>' +
      '<div class="bdpl"><span class="bdf">' + t("bdPlace") + '</span><div class="bdplv">' + esc(bpLabel()) + '</div>' +
      '<div class="bdpls"><input data-bp autocomplete="off" placeholder="' + t("cityPh") + '"><button data-a="bphere">' + t("bdHere") + '</button></div>' +
      '<div class="results bdpr"></div></div>';
    return h + '<div class="bdout">' + birthOut() + '</div></details>'
  }
  // wynik pod polami (przeliczany osobno: pola daty nie są przerysowywane w trakcie wpisywania)
  function birthOut() {
    if (!bday) return '<p class="cnote">' + t("bdHint") + '</p>';
    if (!bplace) return '<p class="cnote">' + t("bdPlNone") + '</p>';
    var p = bday.d.split("-").map(Number), q = bday.t.split(":").map(Number);
    if (!(p[0] >= Y0 && p[0] <= Y1)) return '<p class="cnote">' + t("bdHint") + '</p>';
    // chwila i doba urodzenia w miejscu urodzenia (strefa, słoneczna północ, półkula)
    var B = atPlace(bplace, function () {
      var ms = zoned(p[0], p[1] - 1, p[2], q[0], q[1]); if (isNaN(ms)) return null;
      var o = OrbitCal.date(OrbitCal.dateOf(sunDay(ms))), a = sunLonDeg(ms), qa = Math.floor(a / 90), r = riseRel(ms);   // orbitalny: pora roku według kąta w tej chwili
      return { ms: ms, a: a, o: o, tod: r ? degTxt(r.deg) : "", todK: r && r.key === "degToRise" ? "bdTodB" : r && r.key === "degRise" ? "bdTodR" : "bdTodP",
        color: qColor(o.season), clim: mName(o.month), orb: part("lsG", sIdx(qa)), oa: a - qa * 90 }
    });
    if (!B) return '<p class="cnote">' + t("bdHint") + '</p>';
    var a = B.a, ob = B.o, bk = ob.month, bd = ob.day,
      Yb = ob.year, Yn = Math.min(Y1, OrbitCal.date(today).year + 1), rows = "", shift = 0;
    // powroty na kąt urodzin: tam, gdzie jesteś (miasto wybrane na dole strony)
    for (var Y = Yb + 1; Y <= Yn; Y++) {
      var m = OrbitCal.momentAt(Y, a), n = sunDay(m), o = bdOName(n), same0 = o.k === bk && o.d === bd;
      if (!same0) shift++;
      rows += '<tr' + (same0 ? '' : ' class="off"') + ' data-bn="' + n + '"><td>' + Y + '</td><td>' + (Y - Yb) + '</td><td>' + o.txt + '</td><td>' +
        short(OrbitCal.dateOf(n)) + '</td><td>' + whenTxt(m) + '</td></tr>'
    }
    // data urodzenia: dzień w kalendarzu klimatycznym, kąt w porze roku (orbitalny) i pora doby (kąt Słońca od wschodu, jak na tarczy)
    function bdCal(nm, big, sub, col) {
      return '<div class="bdc" style="border-color:' + col + '"><small>' + t(nm) + '</small><b>' + big + '</b><span>' + sub + '</span></div>'
    }
    // dwie części, każda ze swoim miejscem: urodzenie (w miejscu urodzenia) i powroty (tam, gdzie jesteś: miasto u góry strony)
    function pin(p) { return '<span class="bdpin">📍 ' + esc(p.name || p.lat + "°, " + p.lon + "°") + '</span>' }
    return '<div class="bdres"><div class="bdsec"><small>' + t("bdBorn") + '</small><div class="bdwhen">' + t("calOYear").replace("{y}", Yb) + ' ' + pin(bplace) + '</div>' +
      '<div class="bdcals">' + bdCal("calNmS", B.clim, t("calDay").replace("{d}", ob.day), B.color) +
      bdCal("calNmL", degTr(B.oa), B.orb, B.color) + bdCal("bdTod", B.tod, t(B.todK), "var(--sun)") + '</div>' +
      '<div class="bdorb">' + t("bdOrb").replace("{a}", num(a, 2) + "°") + '</div></div>' +
      (rows ? '<div class="bdsec bdsec2"><small>' + t("bdRet") + '</small><div class="bdwhen">' + pin({ lat: lat, lon: lon, name: place }) + '</div>' +
        bdLadder(a, Yb, Yn, bk, bd) + '<p class="cnote">' + t("bdLad").replace("{s}", shift).replace("{n}", Yn - Yb) + '</p>' +
        '<div class="bdscr"><table class="ttab btab"><thead><tr><td>' + t("bdY") + '</td><td>' + t("bdAge") + '</td><td>' + t("bdODay") + '</td><td></td><td>' + t("bdTod") +
        '</td></tr></thead><tbody>' + rows + '</tbody></table></div></div>' : '') +
      '</div><p class="cnote">' + t("bdNote") + '</p>'
  }

  /* Drabina lat: każdy wiersz to jeden rok, wycinek orbity ±1,2° wokół kąta urodzin (pionowa linia, co roku ta sama).
     Po prawej data doby z kątem urodzin (ta sama co w tabeli), bo z samych pasów nie widać, czy to np. 23, czy 24 maja.
     Pasy to doby tam, gdzie jesteś: jasna część dzień, ciemna noc, czarna kreska = słoneczna północ (początek doby).
     Doba, w którą wpada kąt urodzin, ma obwódkę: pomarańczową, gdy to ten sam dzień kalendarza co urodzenie, szarą, gdy inny.
     Widać, jak granice dób co rok przesuwają się względem kąta (ok. 0,24° orbity), a po roku z 366 dniami wracają. */
  function bdLadder(a, Yb, Yn, bk, bd) {
    var W = 2.4, X0 = 40, X1 = 318, px = (X1 - X0) / W, xc = (X0 + X1) / 2, rh = 9, gap = 3, y0 = 4, h = "", Y;
    function X(l) { return xc + normDeg(l - a) * px }
    for (Y = Yb + 1; Y <= Yn; Y++) {
      var i = Y - Yb - 1, y = y0 + i * (rh + gap), m = OrbitCal.momentAt(Y, a), n = sunDay(m), o = bdOName(n), ok = o.k === bk && o.d === bd;
      h += '<text class="ylb" x="' + (X0 - 4) + '" y="' + (y + rh - 1) + '" text-anchor="end" font-size="8.5"' + (ok ? '' : ' opacity=".6"') + '>' + Y + '</text>' +
        '<text class="ylb" x="' + (X1 + 4) + '" y="' + (y + rh - 1) + '" font-size="8.5"' + (ok ? '' : ' opacity=".6"') + '>' + short(OrbitCal.dateOf(n)) + '</text>';
      for (var k = n - 2; k <= n + 2; k++) {
        var p = sunDayParts(k), cur = k === n, op = cur ? 1 : .45;
        if (X(sunLonDeg(p.b)) <= X0 || X(sunLonDeg(p.a)) >= X1) continue;
        // noc do wschodu, dzień, noc od zachodu; kreska na początku doby, obwódka wokół doby z kątem urodzin
        [[p.a, p.rise, "var(--night)"], [p.rise, p.set, "var(--day)"], [p.set, p.b, "var(--night)"]].forEach(function (g) {
          var u0 = Math.max(X0, X(sunLonDeg(g[0]))), u1 = Math.min(X1, X(sunLonDeg(g[1])));
          if (u1 > u0) h += '<rect x="' + u0.toFixed(1) + '" y="' + y + '" width="' + (u1 - u0).toFixed(1) + '" height="' + rh + '" fill="' + g[2] + '" opacity="' + op + '"/>'
        });
        var x0 = Math.max(X0, X(sunLonDeg(p.a))), x1 = Math.min(X1, X(sunLonDeg(p.b)));
        h += (X(sunLonDeg(p.a)) > X0 ? '<line x1="' + x0.toFixed(1) + '" y1="' + (y - 1) + '" x2="' + x0.toFixed(1) + '" y2="' + (y + rh + 1) + '" stroke="var(--fg)" stroke-width="1.2"/>' : '') +
          (cur ? '<rect x="' + x0.toFixed(1) + '" y="' + (y - .5) + '" width="' + (x1 - x0).toFixed(1) + '" height="' + (rh + 1) + '" fill="none" stroke="' + (ok ? "var(--sun)" : "var(--mut)") + '" stroke-width="1.5"/>' : '')
      }
    }
    var H = y0 + (Yn - Yb) * (rh + gap);
    return '<svg class="bdlad" viewBox="0 0 360 ' + (H + 2) + '" role="img" aria-label="' + t("bdTitle") + '">' + h +
      '<line x1="' + xc + '" y1="0" x2="' + xc + '" y2="' + (H + 2) + '" stroke="' + BDC + '" stroke-width="2"/></svg>'
  }
  var BDC = "#d6457a";   // kolor kąta urodzin (też na kole orbity w zakładce Rok)

  /* Dlaczego żaden kalendarz nie jest idealny: rok, miesiąc i doba to trzy niezależne ruchy.
     Tabela kompromisów (calWhyRows: wiersze rozdzielone "|", komórki ";"), ostatni wiersz = ten kalendarz. */
  var whyOpen = false;
  try { whyOpen = localStorage.getItem("whyOpen") === "1" } catch (e) {}
  function whyBox() {
    var rows = t("calWhyRows").split("|").map(function (r, i, a) {
      return '<tr' + (i === a.length - 1 ? ' class="on"' : '') + '>' + r.split(";").map(function (c) { return '<td>' + c + '</td>' }).join("") + '</tr>'
    }).join("");
    return '<details class="bday why"' + (whyOpen ? " open" : "") + '><summary>' + t("calWhyT") + '</summary><p>' + t("calWhyP") + '</p>' +
      '<table class="ttab wtab"><thead><tr>' + t("calWhyH").split(";").map(function (c) { return '<td>' + c + '</td>' }).join("") + '</tr></thead><tbody>' + rows +
      '</tbody></table></details>'
  }

  /* Siatka roku orbity: 12 miesięcy (klimatyczny) albo 4 pory roku po 89–94 dni (orbitalny), rzędami po 10 dni.
     Na szerokim ekranie 3 miesiące w rzędzie (rząd = pora roku), pory roku po 2. Kropka = równonoc / przesilenie,
     ◆ = aphelium / peryhelium. */
  function renderGrid(box) {
    var s = OrbitCal.starts(oy), o = OrbitCal.apsisDays(oy), u, i, h = segs() + yearNav(t("calOYear").replace("{y}", oy)) +
      '<div class="ysum">' + t("calOYearSum").replace("{d}", s[12] - s[0]).replace("{a}", short(OrbitCal.dateOf(s[0]))).replace("{b}", short(OrbitCal.dateOf(s[12] - 1))) +
      ' · ◆ ' + t("calAphS") + ' ' + short(OrbitCal.dateOf(o.aph)) + ' · ◆ ' + t("calPeriS") + ' ' + short(OrbitCal.dateOf(o.peri)) + '</div><div class="cyear oyear">';
    for (u = 0; u < 12; u++) {
      var b0 = s[u], len = s[u + 1] - b0;
      h += '<div class="ym"><button class="ymh" data-om="' + u + '" style="border-bottom:3px solid ' + mColor(u) + '">' + mName(u) + '</button>' +
        '<div class="ymsub">' + short(OrbitCal.dateOf(b0)) + ' – ' + short(OrbitCal.dateOf(b0 + len - 1)) + '</div><div class="ymg">';
      for (i = 0; i < len; i++) {
        var n = b0 + i, dt = OrbitCal.dateOf(n);
        h += '<button class="yd' + dayCls(dt, n) + (i === 0 && u % 3 === 0 ? " sn" : "") + '" data-n="' + n + '" title="' +
          dt.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + ' · ' + CalendarSystem.label(dt) + '">' + (i + 1) + '</button>'
      }
      h += '</div></div>'
    }
    box.innerHTML = h + '</div><p class="cnote">' + t("calOMarks") + '</p><div class="ctoolbar"><button class="ctoday" data-a="t">' + t("calToday") + '</button></div>' +
      detail(sel) + birthBox() + whyBox() + oNote()
  }

  var lastView = null;
  function render() {
    var box = $("calView"); if (!box) return;
    closeYear(false);   // np. odświeżenie o wschodzie przy otwartym polu roku: pole znika, więc zamykamy je bez zapisu
    syncToday();
    // na kole wybrany dzień jest zawsze w oglądanym roku: po zmianie roku ten sam kąt roku (oglądana część roku zostaje)
    if (cvO === "ring" && !inOy(sel)) { var m = om; pick(OrbitCal.dayAt(oy, OrbitCal.lonAt(OrbitCal.dayN(sel)))); om = m }
    var spin = cvO === "ring" && lastView === "ring" && !drag; lastView = cvO;
    try {
      localStorage.setItem("calsel", JSON.stringify({ sy: sel.getFullYear(), sm: sel.getMonth(), d: sel.getDate(), oy: oy, om: om }));
      localStorage.setItem("cview", cvO)
    } catch (e) {}
    box.classList.toggle("yearMode", cvO === "grid");
    return cvO === "ring" ? renderRing(box, spin) : renderGrid(box)
  }

  // wybór dnia: oglądany rok i miesiąc orbity idą za wybranym dniem
  function pick(d) {
    sel = d;
    var o = OrbitCal.date(d); oy = o.year; om = o.month
  }

  // urodziny: po każdej wpisanej cyfrze, gdy data jest pełna i poprawna, zapis i przeliczenie tabeli (same pola zostają nietknięte)
  if ($("calView")) $("calView").addEventListener("input", function (e) {
    if (e.target.hasAttribute("data-bp")) {   // miejsce urodzenia: szukaj, gdy skończysz pisać
      clearTimeout(bpTimer);
      var q = e.target.value.trim();
      if (q.length < 2) { bpId++; $("calView").querySelector(".bdpr").innerHTML = ""; return }
      bpTimer = setTimeout(function () { bpSearch(q) }, 350);
      return
    }
    if (!e.target.getAttribute("data-bd")) return;
    e.target.value = e.target.value.replace(/\D/g, "");
    var b = bdRead(); if (!b || (bday && b.d === bday.d && b.t === bday.t)) return;
    bday = b;
    try { localStorage.setItem("bday", JSON.stringify(bday)) } catch (e2) {}
    var out = $("calView").querySelector(".bdout"); if (out) out.innerHTML = birthOut()
  });
  if ($("calView")) $("calView").addEventListener("toggle", function (e) {
    if (!e.target.classList.contains("bday")) return;
    var why = e.target.classList.contains("why");
    if (why) whyOpen = e.target.open; else bdOpen = e.target.open;
    try { localStorage.setItem(why ? "whyOpen" : "bdOpen", e.target.open ? "1" : "0") } catch (e2) {}
  }, true);
  if ($("calView")) $("calView").onmousedown = function (e) { if (yearInp && e.target !== yearInp) e.preventDefault() };
  // miejsce wskaźnika na kole: kąt od góry zgodnie z ruchem wskazówek (°) i odległość od środka (w jednostkach rysunku 360×360)
  function ptr(g, e) {
    var rc = g.getBoundingClientRect(), dx = (e.clientX - rc.left) / rc.width * 360 - 180, dy = (e.clientY - rc.top) / rc.height * 360 - 180;
    return { a: Math.atan2(dx, -dy) / R, r: Math.sqrt(dx * dx + dy * dy) }
  }
  /* Obracanie koła: koło idzie za palcem / myszą. Puszczone w ruchu kręci się jeszcze chwilę i zwalnia,
     potem zatrzymuje się na dniu pod strzałką. Po przeciągnięciu kliknięcie, które przeglądarka wysyła na końcu, jest pomijane. */
  var drag = null, noClick = false;
  if ($("calView")) $("calView").onpointerdown = function (e) {
    var g = e.target.closest(".oring"); if (!g || e.button > 0 || rTop === null) return;
    var spinning = anim !== 0; cancelAnimationFrame(anim); anim = 0;
    var p = ptr(g, e);
    drag = { last: p.a, sum: 0, v: 0, ms: e.timeStamp, cut: spinning };
    noClick = false;
    g.setPointerCapture(e.pointerId); g.classList.add("drag")
  };
  if ($("calView")) $("calView").onpointermove = function (e) {
    if (!drag) return;
    var g = e.target.closest(".oring") || $("calView").querySelector(".oring"), p = ptr(g, e);
    if (p.r < 20) return;   // przy samym środku kąt skacze
    var da = ((p.a - drag.last) % 360 + 540) % 360 - 180, dt = Math.max(1, e.timeStamp - drag.ms);
    drag.last = p.a; drag.ms = e.timeStamp; drag.sum += Math.abs(da);
    drag.v = drag.v * 0.5 - da / dt * 0.5;   // prędkość obrotu (° kąta roku na ms), wygładzona
    if (drag.sum > 3) { noClick = true; turn(rTop - da) }
  };
  function letGo(e) {
    if (!drag) return;
    var d = drag; drag = null;
    var g = $("calView").querySelector(".oring"); if (g) g.classList.remove("drag");
    if (!noClick) { if (d.cut) render(); return }                                // bez przeciągania: kliknięcie obsłuży onclick
    var v = e.timeStamp - d.ms > 80 || still() ? 0 : d.v, t0 = performance.now();   // dłuższa pauza przed puszczeniem: bez rozpędu
    if (Math.abs(v) < 0.02) return render();
    (function step(now) {
      var dt = now - t0; t0 = now;
      turn(rTop + v * dt); v *= Math.pow(0.995, dt);
      if (Math.abs(v) > 0.005) anim = requestAnimationFrame(step); else { anim = 0; render() }
    })(t0)
  }
  if ($("calView")) { $("calView").onpointerup = letGo; $("calView").onpointercancel = letGo }
  if ($("calView")) $("calView").onkeydown = function (e) {   // strzałki na kole: doba wstecz / naprzód
    if (e.key === "Enter" && e.target.hasAttribute("data-bp")) { var f = $("calView").querySelector("[data-bpi]"); if (f) f.click(); return }   // Enter: pierwsze miasto
    var g = e.target.closest(".oring"), k = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!g || !k) return;
    e.preventDefault();
    var d = OrbitCal.dateOf(OrbitCal.dayN(sel) + k), y = OrbitCal.date(d).year;
    if (y < Y0 || y > Y1) return;
    pick(d); render();
    $("calView").querySelector(".oring").focus()
  };

  if ($("calView")) $("calView").onclick = function (e) {
    if (e.target === yearInp) return;
    var closed = closeYear(true);   // otwarte pole roku: przyjmij rok, potem obsłuż kliknięcie
    var ring = e.target.closest(".oring");
    if (ring) {   // kliknięcie w pierścień: koło obraca się do dnia o tym kącie roku
      if (noClick) { noClick = false; return }
      var p = ptr(ring, e), rr = p.r;
      if (rr >= 100 && rr <= 150) pick(OrbitCal.dayAt(oy, p.a + rTop));
      else if (!closed) return;
      return render()
    }
    var br = e.target.closest("tr[data-bn]");
    if (br) { pick(OrbitCal.dateOf(+br.getAttribute("data-bn"))); return render() }
    var b = e.target.closest("button"); if (!b) { if (closed) render(); return }
    var bi = b.getAttribute("data-bpi");   // miejsce urodzenia: wynik wyszukiwania albo miasto wybrane na dole strony
    if (bi !== null && bpList[+bi]) {
      var c = bpList[+bi];
      return setBplace({ lat: +(+c.latitude).toFixed(3), lon: +(+c.longitude).toFixed(3), name: [c.name, c.country || ""].filter(Boolean).join(", "), tz: c.timezone || "" })
    }
    if (b.getAttribute("data-a") === "bphere") return setBplace({ lat: lat, lon: lon, name: place, tz: tz });
    var a = b.getAttribute("data-a"), v = b.getAttribute("data-cv"), n = b.getAttribute("data-n"), k = b.getAttribute("data-om");
    if (v) cvO = v;
    else if (n !== null) pick(OrbitCal.dateOf(+n));
    else if (k !== null) { om = +k; cvO = "ring" }                         // nazwa miesiąca -> koło z nim
    else if (a === "t") pick(today);
    else if (a === "ey") return editYear(b);
    else if (a === "py") oy--; else if (a === "ny") oy++;
    else if (a === "pm") { om--; if (om < 0) { if (oy > Y0) { om += 12; oy-- } else om = 0 } }   // o miesiąc; na granicy lat 1000–3000 stoi
    else if (a === "nm") { om++; if (om > 11) { if (oy < Y1) { om -= 12; oy++ } else om = 11 } }
    oy = Math.max(Y0, Math.min(Y1, oy));   // strzałki roku też nie wychodzą poza lata 1000–3000
    render()
  };
  window.Cal = { render: render, selected: function () { return sel },
    // data doby n w kalendarzu orbity, np. "Pełna jesień · dzień 3" albo "Wieczór roku · dzień 33 z 90" (kafelek miesiąca księżycowego)
    // kąt urodzin (kąt roku w chwili urodzenia, w miejscu urodzenia) albo null, gdy urodziny nie są wpisane
    birthAngle: function () {
      if (!bday || !bplace) return null;
      var p = bday.d.split("-").map(Number), q = bday.t.split(":").map(Number), ms = atPlace(bplace, function () { return zoned(p[0], p[1] - 1, p[2], q[0], q[1]) });
      return isNaN(ms) ? null : sunLonDeg(ms)
    },
    orbitName: function (n) { return dName(OrbitCal.date(OrbitCal.dateOf(n))) },
    // nagłówek zakładki: dzisiejsza data w kalendarzu klimatycznym
    head: function () { syncToday(); return dName(OrbitCal.date(today)) } };
})();
