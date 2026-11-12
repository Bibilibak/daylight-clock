/* ===== Astrologia: panel ☰ z filtrami, znaki Słońca i Księżyca na tarczy, w nagłówkach i przy urodzinach =====
   Obliczenia są w js/zodiac.js (ZD). Ustawienia w localStorage "astro":
   { sun, moon: pokazywać znak, sys: "trop" | "sid" | "ecl13", moonSky: Księżyc w gwiazdozbiorach według jego
   prawdziwego położenia na niebie (tylko przy "ecl13"), changes: pokazywać najbliższą zmianę znaku }.
   Domyślnie wszystko wyłączone, więc kto nie włączy astrologii, widzi zegar bez zmian.
   Później to będą funkcje płatne: wszystko, co tu się włącza, przechodzi przez Astro.allowed() (na razie zawsze true). */
var Astro = (function () {
  if (!$("menu") || !$("menuBtn")) return { tick: function () {}, birthLine: function () { return "" }, allowed: function () { return true },
    state: function () { return {} }, refreshLang: function () {}, ring: function () { return null }, legend: function () { return "" },
    span: function () { return null }, tile: function () { return "" }, dots: function () { return "" }, dotsTitle: function () { return "" } };   // strona bez panelu ☰
  var SYS = ["trop", "sid", "ecl13"],
    st = { sun: false, moon: false, sys: "trop", moonSky: false, changes: false };
  try {
    var s = JSON.parse(localStorage.getItem("astro") || "null");
    if (s && typeof s === "object") {
      ["sun", "moon", "moonSky", "changes"].forEach(function (k) { st[k] = s[k] === true });
      if (s.sys === "sky") { st.sys = "ecl13"; st.moonSky = true }   // zapis pierwszej wersji (osobny system „na niebie”)
      else if (SYS.indexOf(s.sys) >= 0) st.sys = s.sys
    }
  } catch (e) {}
  function save() { try { localStorage.setItem("astro", JSON.stringify(st)) } catch (e) {} }
  function allowed() { return true }   // miejsce na sprawdzenie wersji płatnej
  function on(k) { return allowed() && st[k] }
  // system dla Słońca i dla Księżyca: Słońce leży na ekliptyce, więc „na niebie” dotyczy tylko Księżyca
  function moonSys() { return st.sys === "ecl13" && st.moonSky ? "sky" : st.sys }

  // symbol w wersji tekstowej (U+FE0E), żeby system nie podmieniał go na kolorowe emoji; bez symbolu krótka nazwa (zab…, np. „Sek”)
  function glyph(z) { if (z.glyph) return z.glyph + "︎"; var k = "zab" + z.id, v = t(k); return v === k ? z.id : v }   // gwiazdozbiór spoza zodiaku: krótka nazwa w języku strony
  function arr() { return lang === "ar" ? "←" : "→" }   // kierunek „przechodzi w”: po arabsku od prawej do lewej
  function name(z) { var k = "zn" + z.id, v = t(k); return v === k ? z.id : v }
  // „♌ Lew 14°” (w gwiazdozbiorach na niebie bez stopni, bo granice nie leżą na jednej linii)
  function label(z) { return (z.glyph ? glyph(z) + " " : "") + name(z) + (z.deg === null ? "" : " " + Math.floor(z.deg) + "°") }
  // „→ ♐ Strzelec: Pełna jesień · dzień 10, 124° od wschodu”: dzień kalendarza klimatycznego i kąt Słońca na tarczy,
  // tak jak aplikacja mierzy czas (bez Kalendarza: data i godzina w wybranym mieście)
  function changeTxt(c, cur) {
    if (!c || c.to.id === cur.id) return "";   // na granicy (ułamek sekundy) nie pokazujemy „♍ → ♍”
    if (c.txt && c.lang === lang) return c.txt;   // tekst liczony raz (kalendarz i kąt Słońca nie zmieniają się co sekundę)
    var when;
    if (window.Cal && Cal.orbitName) when = Cal.orbitName(sunDay(c.ms)) + ", " + whenTxt(c.ms);
    else {
      var o = tzParts(c.ms);
      when = new Date(Date.UTC(o.year, o.month - 1, o.day)).toLocaleDateString(loc(), { day: "numeric", month: "short", timeZone: "UTC" }) + " " + clockTxt(c.ms)
    }
    c.lang = lang;
    return (c.txt = arr() + " " + glyph(c.to) + " " + name(c.to) + ": " + when)
  }

  // znaki w chwili ms w miejscu (la, lo); osobna pamięć dla tarczy i dla urodzin, odświeżana co 15 s
  var memo = {};
  function signs(slot, ms, la, lo) {
    var key = (slot === "birth" ? ms : Math.floor(ms / 15e3)) + "|" + la + "|" + lo + "|" + st.sys + "|" + st.moonSky, m = memo[slot];
    if (m && slot === "dial" && ["sun", "moon"].some(function (k) { return chg[k] && chg[k].v && ms >= chg[k].ms && m.at < chg[k].ms })) m = null;   // właśnie minęła zmiana znaku
    if (!m || m.k !== key) memo[slot] = m = { k: key, at: ms, sun: ZD.sunSign(ms, st.sys), moon: ZD.moonSign(ms, moonSys(), la, lo) };
    return m
  }
  // najbliższa zmiana: liczona raz i trzymana, dopóki nie minie albo nie zmieni się system / miejsce
  var chg = {};
  function change(kind, ms) {
    var key = lat + "|" + lon + "|" + st.sys + "|" + st.moonSky, c = chg[kind];
    if (!c || c.k !== key || !(ms < c.ms) || ms < c.from) {   // ms < c.from: zegar urządzenia cofnięty
      var n = ZD.nextChange(kind, ms, kind === "sun" ? st.sys : moonSys(), lat, lon);
      chg[kind] = c = { k: key, from: ms, ms: n ? n.ms : ms + 6e4, v: n }   // brak wyniku: spróbuj znowu za minutę
    }
    return c.v
  }

  /* Co sekundę z tick() w js/main.js: sDeg = kąt Słońca na tarczy, mDeg = kąt Księżyca, mr = promień znacznika Księżyca
     (null = brak Słońca / Księżyca na tarczy). Znak Słońca zastępuje liczbę stopni w kółku Słońca (stopień jest dalej
     w kafelku „Kąt Słońca” i w środku tarczy), znak Księżyca leży na jego ikonie. */
  /* Zmiany znaku Księżyca w dobie cyc (od cyc.a do cyc.b): lista { ms, to }, liczona raz na dobę i system.
     W gwiazdozbiorach (Skorpion ok. 7°) mogą być dwie w jednej dobie. */
  var dayChg = {}, lastChgH = null;
  function moonChanges(cyc) {
    var key = cyc.a + "|" + lat + "|" + lon + "|" + st.sys + "|" + st.moonSky;
    if (dayChg.k !== key) {
      var list = [], tt = cyc.a, c;
      for (var i = 0; i < 4 && (c = ZD.nextChange("moon", tt, moonSys(), lat, lon)) && c.ms < cyc.b; i++) { list.push(c); tt = c.ms + 1000 }
      dayChg = { k: key, v: list }
    }
    return dayChg.v
  }
  /* Kreska na pierścieniu tam, gdzie będzie ikona Księżyca w chwili zmiany (Księżyc „dotyka” kreski dokładnie wtedy,
     gdy zmienia znak), i symbol nowego znaku za pierścieniem. Kąt Księżyca na tarczy w chwili T: znacznik górowania
     Słońca + kąt godzinny Księżyca w T (jak dialAng w tick() w main.js). Zmiana, która już minęła, jest przygaszona.
     Czas zmiany jako kąt Słońca (np. „219°”) jest w Kalendarzu i w linijce pod nagłówkiem „Księżyc”. */
  function drawChanges(now, cyc, k) {
    var g = $("zChg"); if (!g) return;
    var h = "";
    if (on("changes") && on("moon") && cyc && k) moonChanges(cyc).forEach(function (c) {
      var a = k * (cyc.noon - cyc.a) + moonPos(new Date(c.ms)).H, p0 = pt(a, r - 8), p1 = pt(a, r + 8), q = pt(a, r + 21), op = c.ms < now.getTime() ? .4 : 1;
      h += '<g opacity="' + op + '"><line x1="' + p0[0].toFixed(1) + '" y1="' + p0[1].toFixed(1) + '" x2="' + p1[0].toFixed(1) + '" y2="' + p1[1].toFixed(1) +
        '" stroke="#8ea3c2" stroke-width="2.2" stroke-linecap="round"/><text class="zc" x="' + q[0].toFixed(1) + '" y="' + q[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="central" font-size="' + (c.to.glyph ? 12 : 8) + '">' + esc(glyph(c.to)) + '</text></g>'
    });
    if (h !== lastChgH) { g.innerHTML = h; lastChgH = h }   // porównanie z poprzednim tekstem (przeglądarka zapisuje SVG inaczej)
  }

  function tick(now, sDeg, mDeg, mr, cyc, k) {
    drawChanges(now, cyc, k);
    var ms = now.getTime(), z = (on("sun") || on("moon")) ? signs("dial", ms, lat, lon) : null,
      zs = on("sun") && z && z.sun, zm = on("moon") && z && z.moon;
    var sn = $("sunnum");
    if (sn) {
      if (zs && sDeg != null) {
        var g = glyph(zs);
        sn.setAttribute("font-size", zs.glyph ? 13 : 8);   // skrót gwiazdozbioru (np. „Ori”) mniejszy niż symbol
        sn.setAttribute("y", (+sn.getAttribute("y") - 3.5).toFixed(1));   // środek kółka: tick() w main.js ustawia y = środek + 3,5 od nowa co sekundę
        sn.setAttribute("dominant-baseline", "central");
        sn.textContent = g
      } else { sn.setAttribute("font-size", 10); sn.removeAttribute("dominant-baseline") }   // liczbę i jej położenie ustawia tick() w main.js
    }
    var e = $("zMoonG");
    if (e) {
      if (zm && mDeg != null) {
        var p = pt(mDeg, mr || r), gm = glyph(zm);
        e.style.display = ""; e.setAttribute("x", p[0].toFixed(1)); e.setAttribute("y", p[1].toFixed(1));   // środek ikony (dominant-baseline: central)
        e.setAttribute("font-size", zm.glyph ? 11 : 7);
        if (e.textContent !== gm) e.textContent = gm
      } else e.style.display = "none"
    }
    txt("zSunT", zs ? label(zs) : "");
    txt("zMoonT", zm ? label(zm) : "");
    txt("zSunC", zs && on("changes") ? changeTxt(change("sun", ms), zs) : "");   // najbliższa zmiana: linijka pod nagłówkiem
    txt("zMoonC", zm && on("changes") ? changeTxt(change("moon", ms), zm) : "")
  }
  function txt(id, v) { var e = $(id); if (e && e.textContent !== v) { e.textContent = v; e.hidden = !v } }

  // linijka przy urodzinach: znaki w chwili urodzenia (w miejscu urodzenia), tylko gdy coś jest włączone
  function birthLine(ms, p) {
    if (!on("sun") && !on("moon")) return "";
    var z = signs("birth", ms, p.lat, p.lon), h = [];
    if (on("sun") && z.sun) h.push('<span>' + t("sunH") + ' <b>' + esc(label(z.sun)) + '</b></span>');
    if (on("moon") && z.moon) h.push('<span>' + t("moonH") + ' <b>' + esc(label(z.moon)) + '</b></span>');
    if (!h.length) return "";
    return '<div class="zbirth">' + h.join("") + '<small>' + t("zs_" + st.sys) + (moonSys() === "sky" && on("moon") && z.moon ? " · " + t("zMoonSky") : "") + '</small></div>'
  }

  /* Panel ☰ (wysuwany z boku). Drugi przycisk ☰ (#menuFab) pojawia się w rogu ekranu, gdy pierwszy zniknie
     przy przewijaniu, żeby filtry były pod ręką na każdej wysokości strony. */
  function chk(k, lbl, sub, dis) {
    return '<label class="mchk' + (sub ? " msub" : "") + (dis ? " mdis" : "") + '"><input type="checkbox" data-z="' + k + '"' + (st[k] ? " checked" : "") + (dis ? " disabled" : "") + '>' +
      '<span>' + lbl + (sub ? '<small>' + sub + '</small>' : '') + '</span></label>'
  }
  function menuHtml() {
    var h = '<div class="mhead"><b id="menuT">' + t("zTitle") + '</b><button class="mclose" data-z="close" aria-label="' + t("zClose") + '">×</button></div>' +
      chk("sun", t("zSun")) + chk("moon", t("zMoon")) + chk("changes", t("zChanges"), t("zChangesD")) +
      '<fieldset class="msys"><legend>' + t("zSys") + '</legend>';
    SYS.forEach(function (k) {
      h += '<label class="mrad"><input type="radio" name="zsys" data-z="sys" value="' + k + '"' + (st.sys === k ? " checked" : "") + '>' +
        '<span><b>' + t("zs_" + k) + '</b><small>' + t("zd_" + k) + '</small></span></label>';
      if (k === "ecl13") h += chk("moonSky", t("zMoonSky"), t("zMoonSkyD"), st.sys !== "ecl13")   // podfiltr gwiazdozbiorów: zawsze widoczny, działa tylko przy nich
    });
    return h + '</fieldset><p class="mnote">' + t("zAyanNote") + '</p>'
  }
  function render() {   // przerysowanie panelu z zachowaniem fokusu (zmiana języka albo systemu)
    var m = $("menu"), f = document.activeElement, k = f && m.contains(f) ? f.getAttribute("data-z") + "|" + (f.value || "") : null;
    m.innerHTML = menuHtml();
    if (k) [].forEach.call(m.querySelectorAll("[data-z]"), function (el) { if (el.getAttribute("data-z") + "|" + (el.value || "") === k) el.focus() })
  }
  var opener = null;
  function open(v, from) {
    var m = $("menu");
    if (v) { opener = from || $("menuBtn"); render() }
    m.hidden = !v; $("menuBack").hidden = !v;
    document.documentElement.classList.toggle("menuopen", v);   // bez przewijania strony pod panelem
    [].forEach.call(document.body.children, function (el) {   // reszta strony nieaktywna dla czytników ekranu i dotyku
      if (el !== m && el.id !== "menuBack" && el.tagName !== "SCRIPT") { if (v) el.setAttribute("inert", ""); else el.removeAttribute("inert") }
    });
    ["menuBtn", "menuFab"].forEach(function (id) { if ($(id)) $(id).setAttribute("aria-expanded", v ? "true" : "false") });
    if (v) { var f = m.querySelector("input"); (f || m).focus() }
    else {   // fokus wraca do przycisku, który otworzył panel, albo do tego ☰, który jest teraz widoczny
      if (!opener || opener.hidden) opener = $("menuFab") && !$("menuFab").hidden ? $("menuFab") : $("menuBtn");
      opener.focus()
    }
  }
  function changed() {
    save(); memo = {}; chg = {};
    if (window.tick) window.tick();   // od razu odśwież tarczę (tick z js/main.js), zamiast czekać sekundę
    if (window.refreshViews) refreshViews()   // Kalendarz (linijka przy urodzinach) i Rok (pierścień znaków na orbicie)
  }
  $("menuBtn").onclick = function () { open($("menu").hidden, this) };
  if ($("menuFab")) $("menuFab").onclick = function () { open($("menu").hidden, this) };
  $("menuBack").onclick = function () { open(false) };
  $("menu").addEventListener("click", function (e) { if (e.target.getAttribute("data-z") === "close") open(false) });
  $("menu").addEventListener("change", function (e) {
    var k = e.target.getAttribute("data-z");
    if (k === "sun" || k === "moon" || k === "changes" || k === "moonSky") st[k] = e.target.checked;
    else if (k === "sys") { st.sys = e.target.value; render() }   // podfiltr Księżyca włącza się / wyszarza
    else return;
    changed()
  });
  document.addEventListener("keydown", function (e) {
    if ($("menu").hidden) return;
    if (e.key === "Escape") open(false);
    else if (e.key === "Tab") {   // fokus zostaje w panelu
      var f = [].filter.call($("menu").querySelectorAll("button, input"), function (x) { return !x.disabled && x.offsetParent !== null });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus() }
      else if (!e.shiftKey && (i < 0 || i === f.length - 1)) { e.preventDefault(); f[0].focus() }
    }
  });
  // pływający ☰: widoczny, gdy przycisk w pasku u góry jest poza ekranem
  if ($("menuFab") && "IntersectionObserver" in window)
    new IntersectionObserver(function (en) { $("menuFab").hidden = en[0].isIntersecting }).observe($("menuBtn"));

  /* Pierścień znaków na kole orbity (zakładka Rok): granice w wybranym systemie i znak Słońca w chwili ms.
     null, gdy filtr wyłączony. */
  function ring(ms) {
    if (!on("changes") || !on("sun")) return null;
    var z = ZD.sunSign(ms, st.sys, true);
    var dl = ((sunLonDeg(ms) - ZD.sunLon(ms)) % 360 + 540) % 360 - 180;   // różnica modeli Słońca (koło rysuje sunLonDeg)
    return { b: ZD.bounds(st.sys, ms).map(function (s) { return { a: ((s.a + dl) % 360 + 360) % 360, id: s.id } }), cur: z && z.id, color: color, tcol: tcol, glyph: function (id) { return glyph({ id: id, glyph: ZD.GLYPH[id] || "" }) } }
  }
  /* Kolor znaku. Zachodni i wedyjski: żywioły (ogień, ziemia, powietrze, woda), jak w astrologii.
     Gwiazdozbiory: tęcza dookoła 13 gwiazdozbiorów ekliptyki, od Barana (czerwony) do Ryb; inne gwiazdozbiory szare. */
  var ELEM = { Ari: 0, Leo: 0, Sgr: 0, Tau: 1, Vir: 1, Cap: 1, Gem: 2, Lib: 2, Aqr: 2, Cnc: 3, Sco: 3, Psc: 3 },
    ECOL = ["#d4553f", "#5c9a3c", "#d9a400", "#3f7fc4"];   // ogień, ziemia, powietrze, woda
  function tcol(id) { return "color-mix(in srgb, " + color(id) + " 60%, var(--fg))" }   // do tekstu: kontrast z tłem w obu motywach
  function color(id) {
    if (st.sys !== "ecl13") return ELEM[id] != null ? ECOL[ELEM[id]] : "#8a8f99";
    var i = ["Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Oph", "Sgr", "Cap", "Aqr", "Psc"].indexOf(id);
    return i < 0 ? "#8a8f99" : "hsl(" + Math.round(i * 360 / 13) + " 62% 50%)"
  }

  /* Podpis pod kołem orbity: bieżący znak z nazwą, początkiem (stopień orbity) i liczbą stopni do następnego.
     "" gdy filtr wyłączony. */
  function legend(ms) {
    var g = ring(ms); if (!g) return "";
    var L = sunLonDeg(ms), h = "";   // granice z ring() są w układzie sunLonDeg
    g.b.forEach(function (s, i) {
      if (s.id !== g.cur) return;   // tylko bieżący znak (pozostałe po przesunięciu orbity)
      var nx = g.b[(i + 1) % g.b.length].a, z = { id: s.id, glyph: ZD.GLYPH[s.id] || "", deg: null },
        left = Math.max(0, ((nx - L) % 360 + 540) % 360 - 180);   // ±180 i nie mniej niż 0 (tuż przed zmianą nie „360°”)
      h += '<span class="zl zlcur" style="border-inline-start-color:' + color(s.id) + '"><b style="color:' + tcol(s.id) + '">' + esc(glyph(z)) + '</b> ' + esc(name(z)) + ' <small>' + num(s.a, 1) + '°</small>' +
        ' <small>· ' + t("zLeft").replace("{a}", num(left, 1) + "°") + '</small></span>'
    });
    return '<div class="zlh">' + t("zs_" + st.sys) + (st.sys !== "ecl13" ? ' <small>' + t("zElem") + '</small>' : '') + '</div><div class="zlg">' + h + '</div>' +
      (st.sys !== "ecl13" ? '<div class="zle">' + t("zElems").split("|").map(function (n, i) { return '<span><i style="background:' + ECOL[i] + '"></i>' + n + '</span>' }).join("") + '</div>' : '')
  }

  /* Znaki i przeskoki dla dób n0 … n1-1 kalendarza (doba od słonecznej północy, OrbitCal.dayStart), w wybranym miejscu.
     Zwraca null, gdy znak Słońca i Księżyca są wyłączone, albo { sun, moon: co pokazywać, d: [na każdą dobę
     { m0: znak Księżyca na początku doby, mc: zmiany Księżyca w tej dobie, sc: zmiany Słońca }] }. Liczone raz dla zakresu. */
  var spanMemo = {};
  function span(n0, n1) {
    if (!on("sun") && !on("moon")) return null;
    var base = lat + "|" + lon + "|" + st.sys + "|" + st.moonSky + "|" + st.sun + "|" + st.moon, key = n0 + "|" + n1 + "|" + base;
    if (spanMemo[key]) return spanMemo[key].v;
    for (var mk in spanMemo) {   // miesiąc z już policzonego roku: bez liczenia od nowa
      var m = spanMemo[mk];
      if (m.base === base && m.n0 <= n0 && m.n1 >= n1) return { sun: m.v.sun, moon: m.v.moon, d: m.v.d.slice(n0 - m.n0, n1 - m.n0) }
    }
    var starts = [], i, d = [];
    for (i = n0; i <= n1; i++) starts.push(OrbitCal.dayStart(i));
    function all(kind, sys) {   // wszystkie zmiany od początku pierwszej doby do końca ostatniej
      var out = [], tt = starts[0], c;
      // krok 30 min także dla Księżyca na niebie (kalendarz na cały rok; tarcza doby szuka dokładniej, co 10 min)
      while ((c = ZD.nextChange(kind, tt, sys, lat, lon, 18e5)) && c.ms < starts[starts.length - 1] && out.length < 400) { out.push(c); tt = c.ms + 1000 }
      return out
    }
    var mc = on("moon") ? all("moon", moonSys()) : [], sc = on("sun") ? all("sun", st.sys) : [],
      m0 = on("moon") ? ZD.moonSign(starts[0], moonSys(), lat, lon, true) : null,
      s0 = on("sun") ? ZD.sunSign(starts[0], st.sys, true) : null, j = 0, k = 0;
    for (i = 0; i < starts.length - 1; i++) {
      var e = { m0: m0, s0: s0, mc: [], sc: [] };
      while (j < mc.length && mc[j].ms < starts[i + 1]) { e.mc.push(mc[j]); m0 = mc[j].to; j++ }
      while (k < sc.length && sc[k].ms < starts[i + 1]) { e.sc.push(sc[k]); s0 = sc[k].to; k++ }
      d.push(e)
    }
    if (Object.keys(spanMemo).length > 20) spanMemo = {};   // pamięć: kilka ostatnich zakresów
    var v = { sun: on("sun"), moon: on("moon"), d: d };
    spanMemo[key] = { base: base, n0: n0, n1: n1, v: v };
    return v
  }
  // kąt Słońca na tarczy w chwili ms (jak na tarczy doby), np. „212°”
  // (przed wschodem kąt liczy się od słonecznej północy: wtedy dopisek zMidS, pełny opis w podpowiedzi kafelka)
  function degAt(ms) { var q = riseRel(ms); return q ? degTxt(q.deg) + (q.key === "degRise" ? "" : " " + t("zMidS")) : "" }
  // zawartość dużego kafelka (widok miesiąca): tylko przeskoki, np. „☽ ♑→♒ 212°” i „☉ →♐ 45°” (kąt Słońca w chwili zmiany)
  // np. [♏]→♐ z kątem Słońca w chwili zmiany pod spodem: w kółku znak, w którym ciało było na początku doby
  // (srebrne kółko = Księżyc, pomarańczowe = Słońce), za strzałką nowy znak (przy dwóch zmianach w dobie oba)
  function tile(e) {
    if (!e) return "";
    function line(cls, z0, list) {
      return '<span class="zt1 ' + cls + '"><span class="zdisc' + (z0 && !z0.glyph ? " zdab" : "") + '">' + (z0 ? esc(glyph(z0)) : "") + '</span>' +
        list.map(function (c) { return arr() + '<span style="color:' + tcol(c.to.id) + '">' + esc(glyph(c.to)) + '</span>' }).join("") +
        '<small>' + list.map(function (c) { return degAt(c.ms) }).join(", ") + '</small></span>'
    }
    return (st.moon && e.mc.length ? line("ztm", e.m0, e.mc) : "") + (st.sun && e.sc.length ? line("zts", e.s0, e.sc) : "")
  }
  // drobne znaczniki do małych kafelków (rok, koło): kolorowa kropka = zmiana Słońca, srebrna = zmiana Księżyca
  function dots(e) {
    if (!e) return "";
    return (st.sun && e.sc.length ? '<i class="zds" style="background:' + color(e.sc[0].to.id) + '"></i>' : '') + (st.moon && e.mc.length ? '<i class="zdm"></i>' : '')
  }
  function dotsTitle(e) {
    if (!e) return "";
    var s = [];
    if (st.sun) e.sc.forEach(function (c) { s.push("☉ " + arr() + " " + glyph(c.to) + " " + name(c.to) + ", " + whenTxt(c.ms)) });
    if (st.moon) e.mc.forEach(function (c) { s.push("☽ " + arr() + " " + glyph(c.to) + " " + name(c.to) + ", " + whenTxt(c.ms)) });
    return s.length ? " · " + s.join(" · ") : ""
  }

  return { tick: tick, birthLine: birthLine, ring: ring, legend: legend, span: span, tile: tile, dots: dots, dotsTitle: dotsTitle, allowed: allowed, state: function () { return st },
    refreshLang: function () { chg = {}; if (!$("menu").hidden) render() } }
})();
