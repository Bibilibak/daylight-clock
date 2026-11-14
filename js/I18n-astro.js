/* ===== Tłumaczenia: astrologia (panel ☰, js/astro-ui.js) =====
   zn<skrót IAU> = nazwy znaków i gwiazdozbiorów. Poza 13 gwiazdozbiorami ekliptyki Księżyc bywa tylko w pięciu
   (Aur, Cet, Crv, Ori, Sex; sprawdza to test/zodiac.test.js dla lat 1900-2100). Brakująca nazwa -> skrót IAU. */
(function () {
  function add(l, o) { for (var k in o) I18N[l][k] = o[k] }
  function names(l, a) {   // kolejność: 12 znaków od Barana, potem Wężownik i gwiazdozbiory spoza zodiaku
    var ids = ["Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Sgr", "Cap", "Aqr", "Psc", "Oph", "Ori", "Cet", "Aur", "Crv", "Sex"], o = {};
    ids.forEach(function (id, i) { o["zn" + id] = a[i] });
    add(l, o)
  }

  add("pl", {
    zMidS: "pn.", zMidN: "Kąt przy przeskoku to kąt Słońca na tarczy w chwili zmiany; „pn.” = liczony od słonecznej północy (zmiana przed wschodem).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "Ori", zabCet: "Wiel", zabAur: "Woź", zabCrv: "Kruk", zabSex: "Sek",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ Cały rok",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "granica znaku",
    zElem: "kolory: żywioły", zElems: "Ogień|Ziemia|Powietrze|Woda",
    zLeft: "jeszcze {a}",
    zMenu: "Menu", zTitle: "Astrologia", zClose: "Zamknij", zSys: "System",
    zSigns: "Znaki zodiaku", zSignsD: "Znaki Słońca i Księżyca oraz chwile, w których przechodzą do następnego znaku (godzina w wybranym mieście).",
    zVenus: "Wenus", zVenusD: "Cykl Wenus (ok. 584 dni): gwiazda poranna i wieczorna oraz koniunkcje ze Słońcem.",
    venK0: "Koniunkcja dolna", venD0: "Wenus między Ziemią a Słońcem, ginie w jego blasku", venK1: "Lucyfer", venD1: "gwiazda poranna, wschodzi przed Słońcem", venK2: "Koniunkcja górna", venD2: "Wenus za Słońcem, niewidoczna", venK3: "Hesperus", venD3: "gwiazda wieczorna, świeci po zachodzie Słońca",
    venDay: "dzień {d} z {n}", venFrom: "{a}° od Słońca", venUp: "jaśnieje", venDn: "przygasa", venNext: "Dalej: {p}, {w}",
    vrAria: "Róża Wenus", vrNow: "Teraz: cykl {i} z 5", vrConj: "koniunkcja", vrEarth: "Ziemia", vrNote: "Droga Wenus widziana z Ziemi (w środku) przez 8 lat. W tym czasie Wenus 5 razy przechodzi między Ziemią a Słońcem (koniunkcja dolna, małe pętle). Kierunki tych pięciu spotkań układają się w pięciokąt, a po 8 latach wszystko powtarza się prawie w tych samych datach. Przerywany okrąg to droga Słońca, jaśniejsza część drogi Wenus jest jeszcze przed nami.",
    zMoonSky: "Księżyc według nieba", zMoonSkyD: "Księżyc odchodzi od ekliptyki nawet o 5°, więc na niebie bywa w innym gwiazdozbiorze, czasem spoza zodiaku (np. w Orionie). Liczony tak, jak go widać z Twojego miejsca.",
    zs_trop: "Zachodni", zd_trop: "12 równych znaków od równonocy marcowej, czyli według pór roku. Ten, który zna większość ludzi.",
    zs_sid: "Wedyjski", zd_sid: "12 równych znaków liczonych od gwiazd (ajanamsa Lahiri). Dziś ok. 24° za zachodnim.",
    zs_ecl13: "Gwiazdozbiory (13)", zd_ecl13: "Prawdziwe, nierównej długości gwiazdozbiory na drodze Słońca, razem z Wężownikiem.",
    zAyanNote: "System wedyjski ma kilka wariantów przesunięcia względem gwiazd (ajanamsa). Tu jest Lahiri, standard w Indiach. Inne (Raman, Krishnamurti, Fagan-Bradley) przesuwają granice znaków od kilku minut kątowych do ok. 1,5°, więc przy granicy znak może wyjść inny."
  });
  names("pl", ["Baran", "Byk", "Bliźnięta", "Rak", "Lew", "Panna", "Waga", "Skorpion", "Strzelec", "Koziorożec", "Wodnik", "Ryby", "Wężownik", "Orion", "Wieloryb", "Woźnica", "Kruk", "Sekstant"]);

  add("en", {
    zMidS: "mn.", zMidN: "The angle at a change is the Sun's angle on the dial at that moment; “mn.” = counted from solar midnight (change before sunrise).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "Ori", zabCet: "Cet", zabAur: "Aur", zabCrv: "Crv", zabSex: "Sxt",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ Whole year",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "sign boundary",
    zElem: "colours: elements", zElems: "Fire|Earth|Air|Water",
    zLeft: "{a} to go",
    zMenu: "Menu", zTitle: "Astrology", zClose: "Close", zSys: "System",
    zSigns: "Zodiac signs", zSignsD: "Sun and Moon signs and the moments they move into the next sign (time in the chosen city).",
    zVenus: "Venus", zVenusD: "Venus cycle (about 584 days): morning and evening star and conjunctions with the Sun.",
    venK0: "Inferior conjunction", venD0: "Venus between Earth and the Sun, lost in its glare", venK1: "Lucifer", venD1: "morning star, rises before the Sun", venK2: "Superior conjunction", venD2: "Venus behind the Sun, not visible", venK3: "Hesperus", venD3: "evening star, shines after sunset",
    venDay: "day {d} of {n}", venFrom: "{a}° from the Sun", venUp: "brightening", venDn: "fading", venNext: "Next: {p}, {w}",
    vrAria: "Venus rose", vrNow: "Now: cycle {i} of 5", vrConj: "conjunction", vrEarth: "Earth", vrNote: "The path of Venus seen from Earth (in the centre) over 8 years. In that time Venus passes between Earth and the Sun 5 times (inferior conjunction, the small loops). The directions of these five meetings form a pentagram, and after 8 years everything repeats on almost the same dates. The dashed circle is the Sun's path; the lighter part of Venus's path is still ahead.",
    zMoonSky: "Moon by the sky", zMoonSkyD: "The Moon strays up to 5° from the ecliptic, so in the sky it can be in another constellation, sometimes outside the zodiac (e.g. Orion). Computed as seen from your place.",
    zs_trop: "Western", zd_trop: "12 equal signs from the March equinox, following the seasons. The one most people know.",
    zs_sid: "Vedic", zd_sid: "12 equal signs measured from the stars (Lahiri ayanamsa). Today about 24° behind the Western one.",
    zs_ecl13: "Constellations (13)", zd_ecl13: "The real constellations of unequal length along the Sun's path, including Ophiuchus.",
    zAyanNote: "The Vedic system has several variants of the offset from the stars (ayanamsa). This is Lahiri, the standard in India. Others (Raman, Krishnamurti, Fagan-Bradley) move the sign boundaries by a few arcminutes up to about 1.5°, so near a boundary the sign may differ."
  });
  names("en", ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces", "Ophiuchus", "Orion", "Cetus", "Auriga", "Corvus", "Sextans"]);

  add("es", {
    zMidS: "mn.", zMidN: "El ángulo de un cambio es el del Sol en la esfera en ese momento; «mn.» = contado desde la medianoche solar (cambio antes del amanecer).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "Ori", zabCet: "Ball", zabAur: "Aur", zabCrv: "Cuer", zabSex: "Sext",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ Todo el año",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "límite de signo",
    zElem: "colores: elementos", zElems: "Fuego|Tierra|Aire|Agua",
    zLeft: "faltan {a}",
    zMenu: "Menú", zTitle: "Astrología", zClose: "Cerrar", zSys: "Sistema",
    zSigns: "Signos del zodiaco", zSignsD: "Signos del Sol y de la Luna y los momentos en que pasan al siguiente signo (hora de la ciudad elegida).",
    zVenus: "Venus", zVenusD: "Ciclo de Venus (unos 584 días): lucero del alba y de la tarde y conjunciones con el Sol.",
    venK0: "Conjunción inferior", venD0: "Venus entre la Tierra y el Sol, perdida en su resplandor", venK1: "Lucifer", venD1: "lucero del alba, sale antes que el Sol", venK2: "Conjunción superior", venD2: "Venus detrás del Sol, no visible", venK3: "Héspero", venD3: "lucero de la tarde, brilla tras la puesta del Sol",
    venDay: "día {d} de {n}", venFrom: "{a}° del Sol", venUp: "aumenta su brillo", venDn: "pierde brillo", venNext: "Después: {p}, {w}",
    vrAria: "Rosa de Venus", vrNow: "Ahora: ciclo {i} de 5", vrConj: "conjunción", vrEarth: "Tierra", vrNote: "El camino de Venus visto desde la Tierra (en el centro) durante 8 años. En ese tiempo Venus pasa 5 veces entre la Tierra y el Sol (conjunción inferior, los pequeños bucles). Las direcciones de estos cinco encuentros forman un pentagrama y, tras 8 años, todo se repite casi en las mismas fechas. El círculo discontinuo es el camino del Sol; la parte más clara del camino de Venus aún está por llegar.",
    zMoonSky: "Luna según el cielo", zMoonSkyD: "La Luna se aparta hasta 5° de la eclíptica, así que en el cielo puede estar en otra constelación, a veces fuera del zodiaco (p. ej. Orión). Calculada tal como se ve desde tu lugar.",
    zs_trop: "Occidental", zd_trop: "12 signos iguales desde el equinoccio de marzo, según las estaciones. El que conoce la mayoría.",
    zs_sid: "Védico", zd_sid: "12 signos iguales medidos desde las estrellas (ayanamsa Lahiri). Hoy unos 24° por detrás del occidental.",
    zs_ecl13: "Constelaciones (13)", zd_ecl13: "Las constelaciones reales, de distinta longitud, en el camino del Sol, con Ofiuco.",
    zAyanNote: "El sistema védico tiene varias variantes del desfase respecto a las estrellas (ayanamsa). Aquí se usa Lahiri, el estándar en la India. Otras (Raman, Krishnamurti, Fagan-Bradley) mueven los límites de los signos desde unos minutos de arco hasta unos 1,5°, así que cerca de un límite el signo puede ser otro."
  });
  names("es", ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis", "Ofiuco", "Orión", "Ballena", "Auriga", "Cuervo", "Sextante"]);

  add("de", {
    zMidS: "Mn.", zMidN: "Der Winkel bei einem Wechsel ist der Sonnenwinkel auf dem Zifferblatt in diesem Moment; „Mn.“ = ab Sonnenmitternacht gezählt (Wechsel vor Sonnenaufgang).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "Ori", zabCet: "Walf", zabAur: "Fuhr", zabCrv: "Rabe", zabSex: "Sext",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ Ganzes Jahr",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "Zeichengrenze",
    zElem: "Farben: Elemente", zElems: "Feuer|Erde|Luft|Wasser",
    zLeft: "noch {a}",
    zMenu: "Menü", zTitle: "Astrologie", zClose: "Schließen", zSys: "System",
    zSigns: "Tierkreiszeichen", zSignsD: "Sonnen- und Mondzeichen und die Momente, in denen sie ins nächste Zeichen wechseln (Uhrzeit der gewählten Stadt).",
    zVenus: "Venus", zVenusD: "Venuszyklus (etwa 584 Tage): Morgen- und Abendstern und Konjunktionen mit der Sonne.",
    venK0: "Untere Konjunktion", venD0: "Venus zwischen Erde und Sonne, im Sonnenglanz verborgen", venK1: "Luzifer", venD1: "Morgenstern, geht vor der Sonne auf", venK2: "Obere Konjunktion", venD2: "Venus hinter der Sonne, nicht sichtbar", venK3: "Hesperus", venD3: "Abendstern, leuchtet nach Sonnenuntergang",
    venDay: "Tag {d} von {n}", venFrom: "{a}° von der Sonne", venUp: "wird heller", venDn: "wird schwächer", venNext: "Danach: {p}, {w}",
    vrAria: "Venusrose", vrNow: "Jetzt: Zyklus {i} von 5", vrConj: "Konjunktion", vrEarth: "Erde", vrNote: "Der Weg der Venus, von der Erde (in der Mitte) aus gesehen, über 8 Jahre. In dieser Zeit zieht Venus 5-mal zwischen Erde und Sonne hindurch (untere Konjunktion, die kleinen Schleifen). Die Richtungen dieser fünf Begegnungen bilden ein Pentagramm, und nach 8 Jahren wiederholt sich alles fast an denselben Tagen. Der gestrichelte Kreis ist der Weg der Sonne; der hellere Teil des Venuswegs liegt noch vor uns.",
    zMoonSky: "Mond nach dem Himmel", zMoonSkyD: "Der Mond weicht bis zu 5° von der Ekliptik ab und steht am Himmel daher manchmal in einem anderen Sternbild, auch außerhalb des Tierkreises (z. B. Orion). Berechnet, wie er von deinem Ort aus erscheint.",
    zs_trop: "Westlich", zd_trop: "12 gleiche Zeichen ab der Märztagundnachtgleiche, nach den Jahreszeiten. Das bekannteste.",
    zs_sid: "Vedisch", zd_sid: "12 gleiche Zeichen, von den Sternen aus gemessen (Ayanamsa Lahiri). Heute etwa 24° hinter dem westlichen.",
    zs_ecl13: "Sternbilder (13)", zd_ecl13: "Die echten, unterschiedlich langen Sternbilder auf der Sonnenbahn, mit dem Schlangenträger.",
    zAyanNote: "Das vedische System hat mehrere Varianten des Abstands zu den Sternen (Ayanamsa). Hier: Lahiri, der Standard in Indien. Andere (Raman, Krishnamurti, Fagan-Bradley) verschieben die Zeichengrenzen um einige Bogenminuten bis etwa 1,5°, nahe einer Grenze kann das Zeichen also ein anderes sein."
  });
  names("de", ["Widder", "Stier", "Zwillinge", "Krebs", "Löwe", "Jungfrau", "Waage", "Skorpion", "Schütze", "Steinbock", "Wassermann", "Fische", "Schlangenträger", "Orion", "Walfisch", "Fuhrmann", "Rabe", "Sextant"]);

  add("fr", {
    zMidS: "mn.", zMidN: "L'angle d'un changement est celui du Soleil sur le cadran à cet instant ; « mn. » = compté depuis le minuit solaire (changement avant le lever).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "Ori", zabCet: "Bal", zabAur: "Coch", zabCrv: "Corb", zabSex: "Sext",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ Toute l'année",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "limite de signe",
    zElem: "couleurs : éléments", zElems: "Feu|Terre|Air|Eau",
    zLeft: "encore {a}",
    zMenu: "Menu", zTitle: "Astrologie", zClose: "Fermer", zSys: "Système",
    zSigns: "Signes du zodiaque", zSignsD: "Signes du Soleil et de la Lune et les moments où ils passent au signe suivant (heure de la ville choisie).",
    zVenus: "Vénus", zVenusD: "Cycle de Vénus (environ 584 jours) : étoile du matin et du soir et conjonctions avec le Soleil.",
    venK0: "Conjonction inférieure", venD0: "Vénus entre la Terre et le Soleil, noyée dans son éclat", venK1: "Lucifer", venD1: "étoile du matin, se lève avant le Soleil", venK2: "Conjonction supérieure", venD2: "Vénus derrière le Soleil, invisible", venK3: "Hespérus", venD3: "étoile du soir, brille après le coucher du Soleil",
    venDay: "jour {d} sur {n}", venFrom: "{a}° du Soleil", venUp: "devient plus brillante", venDn: "pâlit", venNext: "Ensuite : {p}, {w}",
    vrAria: "Rose de Vénus", vrNow: "Maintenant : cycle {i} sur 5", vrConj: "conjonction", vrEarth: "Terre", vrNote: "Le chemin de Vénus vu depuis la Terre (au centre) pendant 8 ans. Pendant ce temps, Vénus passe 5 fois entre la Terre et le Soleil (conjonction inférieure, les petites boucles). Les directions de ces cinq rencontres forment un pentagramme et, après 8 ans, tout se répète presque aux mêmes dates. Le cercle en pointillés est le chemin du Soleil ; la partie plus claire du chemin de Vénus est encore à venir.",
    zMoonSky: "Lune selon le ciel", zMoonSkyD: "La Lune s'écarte jusqu'à 5° de l'écliptique : dans le ciel, elle peut se trouver dans une autre constellation, parfois hors du zodiaque (p. ex. Orion). Calculée telle qu'on la voit depuis ton lieu.",
    zs_trop: "Occidental", zd_trop: "12 signes égaux depuis l'équinoxe de mars, selon les saisons. Celui que la plupart connaissent.",
    zs_sid: "Védique", zd_sid: "12 signes égaux mesurés depuis les étoiles (ayanamsa Lahiri). Aujourd'hui environ 24° derrière l'occidental.",
    zs_ecl13: "Constellations (13)", zd_ecl13: "Les vraies constellations, de longueurs inégales, sur le chemin du Soleil, avec Ophiuchus.",
    zAyanNote: "Le système védique a plusieurs variantes du décalage par rapport aux étoiles (ayanamsa). Ici : Lahiri, la norme en Inde. D'autres (Raman, Krishnamurti, Fagan-Bradley) déplacent les limites des signes de quelques minutes d'arc jusqu'à environ 1,5°, donc près d'une limite le signe peut changer."
  });
  names("fr", ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons", "Ophiuchus", "Orion", "Baleine", "Cocher", "Corbeau", "Sextant"]);

  add("it", {
    zMidS: "mn.", zMidN: "L'angolo di un cambio è quello del Sole sul quadrante in quel momento; «mn.» = contato dalla mezzanotte solare (cambio prima dell'alba).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "Ori", zabCet: "Bal", zabAur: "Aur", zabCrv: "Corv", zabSex: "Sest",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ Tutto l'anno",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "confine del segno",
    zElem: "colori: elementi", zElems: "Fuoco|Terra|Aria|Acqua",
    zLeft: "ancora {a}",
    zMenu: "Menu", zTitle: "Astrologia", zClose: "Chiudi", zSys: "Sistema",
    zSigns: "Segni zodiacali", zSignsD: "Segni del Sole e della Luna e i momenti in cui passano al segno successivo (ora della città scelta).",
    zVenus: "Venere", zVenusD: "Ciclo di Venere (circa 584 giorni): stella del mattino e della sera e congiunzioni con il Sole.",
    venK0: "Congiunzione inferiore", venD0: "Venere tra la Terra e il Sole, persa nel suo bagliore", venK1: "Lucifero", venD1: "stella del mattino, sorge prima del Sole", venK2: "Congiunzione superiore", venD2: "Venere dietro il Sole, non visibile", venK3: "Espero", venD3: "stella della sera, brilla dopo il tramonto",
    venDay: "giorno {d} di {n}", venFrom: "{a}° dal Sole", venUp: "si fa più luminosa", venDn: "si affievolisce", venNext: "Poi: {p}, {w}",
    vrAria: "Rosa di Venere", vrNow: "Ora: ciclo {i} di 5", vrConj: "congiunzione", vrEarth: "Terra", vrNote: "Il percorso di Venere visto dalla Terra (al centro) in 8 anni. In questo tempo Venere passa 5 volte tra la Terra e il Sole (congiunzione inferiore, i piccoli anelli). Le direzioni di questi cinque incontri formano un pentagramma e, dopo 8 anni, tutto si ripete quasi nelle stesse date. Il cerchio tratteggiato è il percorso del Sole; la parte più chiara del percorso di Venere deve ancora venire.",
    zMoonSky: "Luna secondo il cielo", zMoonSkyD: "La Luna si allontana fino a 5° dall'eclittica, quindi in cielo può trovarsi in un'altra costellazione, a volte fuori dallo zodiaco (ad es. Orione). Calcolata come si vede dal tuo luogo.",
    zs_trop: "Occidentale", zd_trop: "12 segni uguali dall'equinozio di marzo, secondo le stagioni. Quello che conosce la maggior parte delle persone.",
    zs_sid: "Vedico", zd_sid: "12 segni uguali misurati dalle stelle (ayanamsa Lahiri). Oggi circa 24° indietro rispetto all'occidentale.",
    zs_ecl13: "Costellazioni (13)", zd_ecl13: "Le vere costellazioni, di lunghezza diversa, sul percorso del Sole, con l'Ofiuco.",
    zAyanNote: "Il sistema vedico ha diverse varianti dello scarto rispetto alle stelle (ayanamsa). Qui si usa Lahiri, lo standard in India. Altre (Raman, Krishnamurti, Fagan-Bradley) spostano i confini dei segni da pochi primi d'arco fino a circa 1,5°, quindi vicino a un confine il segno può essere diverso."
  });
  names("it", ["Ariete", "Toro", "Gemelli", "Cancro", "Leone", "Vergine", "Bilancia", "Scorpione", "Sagittario", "Capricorno", "Acquario", "Pesci", "Ofiuco", "Orione", "Balena", "Auriga", "Corvo", "Sestante"]);

  add("pt", {
    zMidS: "mn.", zMidN: "O ângulo de uma mudança é o do Sol no mostrador nesse momento; «mn.» = contado desde a meia-noite solar (mudança antes do nascer).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "Ori", zabCet: "Bal", zabAur: "Coch", zabCrv: "Corv", zabSex: "Sext",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ Ano inteiro",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "limite do signo",
    zElem: "cores: elementos", zElems: "Fogo|Terra|Ar|Água",
    zLeft: "faltam {a}",
    zMenu: "Menu", zTitle: "Astrologia", zClose: "Fechar", zSys: "Sistema",
    zSigns: "Signos do zodíaco", zSignsD: "Signos do Sol e da Lua e os momentos em que passam ao signo seguinte (hora da cidade escolhida).",
    zVenus: "Vênus", zVenusD: "Ciclo de Vênus (cerca de 584 dias): estrela da manhã e da tarde e conjunções com o Sol.",
    venK0: "Conjunção inferior", venD0: "Vênus entre a Terra e o Sol, perdida no seu brilho", venK1: "Lúcifer", venD1: "estrela da manhã, nasce antes do Sol", venK2: "Conjunção superior", venD2: "Vênus atrás do Sol, invisível", venK3: "Héspero", venD3: "estrela da tarde, brilha depois do pôr do sol",
    venDay: "dia {d} de {n}", venFrom: "{a}° do Sol", venUp: "fica mais brilhante", venDn: "perde brilho", venNext: "Depois: {p}, {w}",
    vrAria: "Rosa de Vênus", vrNow: "Agora: ciclo {i} de 5", vrConj: "conjunção", vrEarth: "Terra", vrNote: "O caminho de Vênus visto da Terra (no centro) ao longo de 8 anos. Nesse tempo Vênus passa 5 vezes entre a Terra e o Sol (conjunção inferior, os pequenos laços). As direções desses cinco encontros formam um pentagrama e, após 8 anos, tudo se repete quase nas mesmas datas. O círculo tracejado é o caminho do Sol; a parte mais clara do caminho de Vênus ainda está por vir.",
    zMoonSky: "Lua segundo o céu", zMoonSkyD: "A Lua afasta-se até 5° da eclíptica, por isso no céu pode estar noutra constelação, às vezes fora do zodíaco (p. ex. Órion). Calculada como se vê a partir do teu lugar.",
    zs_trop: "Ocidental", zd_trop: "12 signos iguais a partir do equinócio de março, segundo as estações. O que a maioria conhece.",
    zs_sid: "Védico", zd_sid: "12 signos iguais medidos a partir das estrelas (ayanamsa Lahiri). Hoje cerca de 24° atrás do ocidental.",
    zs_ecl13: "Constelações (13)", zd_ecl13: "As constelações reais, de tamanhos diferentes, no caminho do Sol, incluindo Ofiúco.",
    zAyanNote: "O sistema védico tem várias variantes do desvio em relação às estrelas (ayanamsa). Aqui usa-se Lahiri, o padrão na Índia. Outras (Raman, Krishnamurti, Fagan-Bradley) deslocam os limites dos signos de alguns minutos de arco até cerca de 1,5°, por isso perto de um limite o signo pode ser outro."
  });
  names("pt", ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes", "Ofiúco", "Órion", "Baleia", "Cocheiro", "Corvo", "Sextante"]);

  add("uk", {
    zMidS: "пн.", zMidN: "Кут при зміні — це кут Сонця на циферблаті в цю мить; «пн.» = від сонячної півночі (зміна до сходу).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "Орі", zabCet: "Кит", zabAur: "Візн", zabCrv: "Вор", zabSex: "Скст",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ Увесь рік",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "межа знака",
    zElem: "кольори: стихії", zElems: "Вогонь|Земля|Повітря|Вода",
    zLeft: "ще {a}",
    zMenu: "Меню", zTitle: "Астрологія", zClose: "Закрити", zSys: "Система",
    zSigns: "Знаки зодіаку", zSignsD: "Знаки Сонця й Місяця та моменти, коли вони переходять у наступний знак (час у вибраному місті).",
    zVenus: "Венера", zVenusD: "Цикл Венери (близько 584 днів): ранкова й вечірня зоря та з’єднання із Сонцем.",
    venK0: "Нижнє з’єднання", venD0: "Венера між Землею і Сонцем, губиться в його сяйві", venK1: "Люцифер", venD1: "ранкова зоря, сходить перед Сонцем", venK2: "Верхнє з’єднання", venD2: "Венера за Сонцем, невидима", venK3: "Геспер", venD3: "вечірня зоря, сяє після заходу Сонця",
    venDay: "день {d} з {n}", venFrom: "{a}° від Сонця", venUp: "яскравішає", venDn: "тьмяніє", venNext: "Далі: {p}, {w}",
    vrAria: "Троянда Венери", vrNow: "Зараз: цикл {i} з 5", vrConj: "з’єднання", vrEarth: "Земля", vrNote: "Шлях Венери, видимий із Землі (у центрі), за 8 років. За цей час Венера 5 разів проходить між Землею і Сонцем (нижнє з’єднання, малі петлі). Напрямки цих п’яти зустрічей утворюють пентаграму, а через 8 років усе повторюється майже в ті самі дати. Пунктирне коло — шлях Сонця; світліша частина шляху Венери ще попереду.",
    zMoonSky: "Місяць за небом", zMoonSkyD: "Місяць відхиляється від екліптики до 5°, тож на небі буває в іншому сузір'ї, іноді поза зодіаком (напр. в Оріоні). Обчислено так, як його видно з твого місця.",
    zs_trop: "Західна", zd_trop: "12 рівних знаків від березневого рівнодення, за порами року. Та, яку знає більшість людей.",
    zs_sid: "Ведична", zd_sid: "12 рівних знаків, відрахованих від зір (аянамша Лахірі). Нині приблизно на 24° позаду західної.",
    zs_ecl13: "Сузір'я (13)", zd_ecl13: "Справжні сузір'я різної довжини на шляху Сонця, разом зі Змієносцем.",
    zAyanNote: "Ведична система має кілька варіантів зсуву відносно зір (аянамша). Тут — Лахірі, стандарт в Індії. Інші (Раман, Крішнамурті, Феґан-Бредлі) зсувають межі знаків від кількох кутових хвилин до приблизно 1,5°, тож біля межі знак може бути іншим."
  });
  names("uk", ["Овен", "Телець", "Близнюки", "Рак", "Лев", "Діва", "Терези", "Скорпіон", "Стрілець", "Козеріг", "Водолій", "Риби", "Змієносець", "Оріон", "Кит", "Візничий", "Ворон", "Секстант"]);

  add("ar", {
    zMidS: "م.", zMidN: "زاوية التغيّر هي زاوية الشمس على المينا في تلك اللحظة؛ «م.» = محسوبة من منتصف الليل الشمسي (تغيّر قبل الشروق).",   // kąt od słonecznej północy (zmiana przed wschodem): skrót w kafelku i objaśnienie pod miesiącem
    zabOri: "الجبّار", zabCet: "قيطس", zabAur: "الممسك", zabCrv: "الغراب", zabSex: "السدس",   // krótkie nazwy gwiazdozbiorów bez symbolu (tarcza, kafelki)
    calAllYear: "‹ السنة كاملة",   // widok miesiąca w Kalendarzu: powrót do całego roku
    zLgB: "حدّ البرج",
    zElem: "الألوان: العناصر", zElems: "نار|تراب|هواء|ماء",
    zLeft: "متبقٍّ {a}",
    zMenu: "القائمة", zTitle: "التنجيم", zClose: "إغلاق", zSys: "النظام",
    zSigns: "الأبراج", zSignsD: "برجا الشمس والقمر ولحظات انتقالهما إلى البرج التالي (بتوقيت المدينة المختارة).",
    zVenus: "الزهرة", zVenusD: "دورة الزهرة (نحو 584 يومًا): نجمة الصباح ونجمة المساء والاقترانات مع الشمس.",
    venK0: "الاقتران السفلي", venD0: "الزهرة بين الأرض والشمس، تختفي في وهجها", venK1: "لوسيفر", venD1: "نجمة الصباح، تشرق قبل الشمس", venK2: "الاقتران العلوي", venD2: "الزهرة خلف الشمس، غير مرئية", venK3: "هيسبيروس", venD3: "نجمة المساء، تلمع بعد غروب الشمس",
    venDay: "اليوم {d} من {n}", venFrom: "{a}° من الشمس", venUp: "يزداد لمعانها", venDn: "يخفت لمعانها", venNext: "التالي: {p}، {w}",
    vrAria: "وردة الزهرة", vrNow: "الآن: الدورة {i} من 5", vrConj: "اقتران", vrEarth: "الأرض", vrNote: "مسار الزهرة كما يُرى من الأرض (في المركز) خلال 8 سنوات. في هذه المدة تمر الزهرة 5 مرات بين الأرض والشمس (الاقتران السفلي، الحلقات الصغيرة). اتجاهات هذه اللقاءات الخمسة تشكّل نجمة خماسية، وبعد 8 سنوات يتكرر كل شيء في التواريخ نفسها تقريبًا. الدائرة المتقطعة هي مسار الشمس، والجزء الأفتح من مسار الزهرة لا يزال أمامنا.",
    zMoonSky: "القمر بحسب السماء", zMoonSkyD: "يبتعد القمر عن دائرة البروج حتى 5°، فقد يظهر في السماء في كوكبة أخرى، وأحيانًا خارج البروج (مثل الجبّار). يُحسب كما يُرى من مكانك.",
    zs_trop: "الغربي", zd_trop: "12 برجًا متساويًا من اعتدال مارس، بحسب الفصول. وهو الأشهر بين الناس.",
    zs_sid: "الفيدي", zd_sid: "12 برجًا متساويًا تُقاس من النجوم (أيانامشا لاهيري). اليوم متأخر نحو 24° عن الغربي.",
    zs_ecl13: "الكوكبات (13)", zd_ecl13: "الكوكبات الحقيقية غير المتساوية على مسار الشمس، ومعها الحوّاء.",
    zAyanNote: "للنظام الفيدي عدة صيغ للإزاحة عن النجوم (أيانامشا). هنا صيغة لاهيري، المعتمدة في الهند. صيغ أخرى (رامان، كريشنامورتي، فاغان-برادلي) تُزيح حدود الأبراج من دقائق قوسية قليلة إلى نحو 1.5°، لذا قد يختلف البرج قرب الحد."
  });
  names("ar", ["الحمل", "الثور", "الجوزاء", "السرطان", "الأسد", "العذراء", "الميزان", "العقرب", "القوس", "الجدي", "الدلو", "الحوت", "الحوّاء", "الجبّار", "قيطس", "ممسك الأعنّة", "الغراب", "السدس"]);
})();
