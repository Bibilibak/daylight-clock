/* ===== Działanie bez internetu (service worker) =====
   Przy instalacji pobiera index.html i zapisuje go razem z każdym plikiem, który wskazuje (css, js, ikony, manifesty),
   więc listy plików nie trzeba tu utrzymywać. Pliki z ?v= w adresie są niezmienne: idą z pamięci podręcznej.
   Pozostałe pliki (ikony, manifesty, polityka prywatności) idą z pamięci, a w tle się odświeżają.
   Strona zegara idzie najpierw z sieci (żeby poprawki docierały od razu), a bez sieci albo po 4 s z pamięci;
   odpowiedź z sieci i tak trafia potem do pamięci. Inne domeny (wyszukiwarka miast Open-Meteo) idą zawsze przez sieć.
   Pamięć podręczna jest wspólna dla całej domeny bibilibak.github.io, więc ten plik rusza tylko swoje wpisy („zegar-…”).
   Po zmianie tego pliku podnieś CACHE, żeby stare pliki zostały usunięte. */
var PREFIX = "zegar-", CACHE = PREFIX + "2";

function cache() { return caches.open(CACHE) }
// zawsze świeża odpowiedź z serwera (z pominięciem pamięci HTTP przeglądarki, GitHub Pages trzyma ją 10 min)
function fresh(u) { return fetch(u, { cache: "no-cache", credentials: "same-origin" }) }

self.addEventListener("install", function (e) {
  e.waitUntil(cache().then(function (c) {
    return fresh("./").then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.clone().text().then(function (html) {
        var urls = [], m, re = /(?:href|src)="([^"#:]+)"/g;   // tylko adresy względne (bez https:, mailto: i kotwic)
        while ((m = re.exec(html))) if (urls.indexOf(m[1]) < 0) urls.push(m[1].replace(/&amp;/g, "&"));
        // manifesty pozostałych języków i ikony (strona podmienia manifest po zmianie języka)
        var extra = ["pl", "en", "es", "de", "fr", "it", "pt", "uk", "ar"].map(function (l) { return "manifests/" + l + ".webmanifest" })
          .concat(["icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png"].map(function (f) { return "assets/" + f }));
        function put(u) { return fresh(u).then(function (x) { if (!x.ok) throw new Error(u + " " + x.status); return c.put(u, x) }) }
        // css i js (z ?v=) są niezbędne: bez nich instalacja się nie udaje i spróbuje znowu przy następnej wizycie;
        // reszta (ikony, manifesty, polityka) jest opcjonalna
        return Promise.all([c.put("./", r)].concat(urls.map(function (u) {
          return /\?v=/.test(u) ? put(u) : put(u).catch(function () {})
        }), extra.map(function (u) { return put(u).catch(function () {}) })))
      })
    })
  }).then(function () { return self.skipWaiting() }))
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== CACHE }).map(function (k) { return caches["delete"](k) }))
  }).then(function () { return self.clients.claim() }))
});

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;   // inne domeny: zwykle przez sieć
  var page = url.origin + url.pathname, root = self.registration.scope;
  if (req.mode === "navigate" && (page === root || page === root + "index.html")) {
    // strona zegara: najpierw sieć, bez sieci albo po 4 s z pamięci; odpowiedź z sieci zawsze trafia do pamięci
    var net = fresh(req.url);
    e.waitUntil(net.then(function (r) {
      if (!r.ok || r.redirected) return;
      var copy = r.clone();   // kopia od razu, zanim strona zacznie czytać odpowiedź
      return cache().then(function (c) { return c.put("./", copy) })
    }).catch(function () {}));
    e.respondWith(race(net, 4000).catch(function () {
      return cache().then(function (c) { return c.match("./") }).then(function (hit) { return hit || net })   // pamięć pusta: czekamy na sieć
    }));
    return
  }
  if (req.mode === "navigate") {   // inne strony (np. privacy.html, Prezentacje/): z sieci, bez sieci z pamięci, jeśli tam są
    e.respondWith(fetch(req).catch(function (err) {
      return cache().then(function (c) { return c.match(req) }).then(function (hit) { if (hit) return hit; throw err })
    }));
    return
  }
  var fixed = /[?&]v=/.test(url.search);   // plik z ?v= nigdy się nie zmienia
  var work = cache().then(function (c) {
    return c.match(req).then(function (hit) {
      if (hit && fixed) return { res: hit };
      var upd = fetch(req).then(function (r) { return r.ok ? c.put(req, r.clone()).then(function () { return r }) : r });
      return hit ? { res: hit, bg: upd.catch(function () {}) }   // z pamięci, a w tle świeża wersja na następny raz
        : { res: upd }
    })
  });
  e.respondWith(work.then(function (w) { return w.res }));
  e.waitUntil(work.then(function (w) { return w.bg }, function () {}))
});

// odpowiedź z sieci albo błąd po ms milisekundach (słaby zasięg: lepiej szybko pokazać zapisaną stronę)
function race(net, ms) {
  return new Promise(function (ok, fail) {
    var t = setTimeout(function () { fail(new Error("timeout")) }, ms);
    net.then(function (r) { clearTimeout(t); r.ok ? ok(r) : fail(new Error(r.status)) }, function (err) { clearTimeout(t); fail(err) })
  })
}
