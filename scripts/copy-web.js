/* Kopiuje pliki strony do www/, z którego Capacitor buduje aplikację (capacitor.config.json: webDir).
   Strona dalej działa z katalogu głównego repozytorium (GitHub Pages); www/ jest tylko kopią i nie trafia do gita.
   Prezentacje, dokumenty i pliki projektu Android zostają poza aplikacją. */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), out = path.join(root, "www");
const files = ["index.html", "privacy.html", "css", "js", "assets", "manifests"];

fs.rmSync(out, { recursive: true, force: true });
for (const f of files) fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });
console.log("www/: " + files.join(", "));
