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
    zMenu: "Menu", zTitle: "Astrologia", zClose: "Zamknij", zSun: "Znak Słońca", zMoon: "Znak Księżyca", zSys: "System",
    zChanges: "Zmiany znaków", zChangesD: "Kiedy Słońce i Księżyc wejdą w następny znak (godzina w wybranym mieście).",
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
    zMenu: "Menu", zTitle: "Astrology", zClose: "Close", zSun: "Sun sign", zMoon: "Moon sign", zSys: "System",
    zChanges: "Sign changes", zChangesD: "When the Sun and Moon enter the next sign (time in the chosen city).",
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
    zMenu: "Menú", zTitle: "Astrología", zClose: "Cerrar", zSun: "Signo solar", zMoon: "Signo lunar", zSys: "Sistema",
    zChanges: "Cambios de signo", zChangesD: "Cuándo el Sol y la Luna entran en el siguiente signo (hora de la ciudad elegida).",
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
    zMenu: "Menü", zTitle: "Astrologie", zClose: "Schließen", zSun: "Sonnenzeichen", zMoon: "Mondzeichen", zSys: "System",
    zChanges: "Zeichenwechsel", zChangesD: "Wann Sonne und Mond ins nächste Zeichen wechseln (Uhrzeit der gewählten Stadt).",
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
    zMenu: "Menu", zTitle: "Astrologie", zClose: "Fermer", zSun: "Signe solaire", zMoon: "Signe lunaire", zSys: "Système",
    zChanges: "Changements de signe", zChangesD: "Quand le Soleil et la Lune entrent dans le signe suivant (heure de la ville choisie).",
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
    zMenu: "Menu", zTitle: "Astrologia", zClose: "Chiudi", zSun: "Segno solare", zMoon: "Segno lunare", zSys: "Sistema",
    zChanges: "Cambi di segno", zChangesD: "Quando il Sole e la Luna entrano nel segno successivo (ora della città scelta).",
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
    zMenu: "Menu", zTitle: "Astrologia", zClose: "Fechar", zSun: "Signo solar", zMoon: "Signo lunar", zSys: "Sistema",
    zChanges: "Mudanças de signo", zChangesD: "Quando o Sol e a Lua entram no signo seguinte (hora da cidade escolhida).",
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
    zMenu: "Меню", zTitle: "Астрологія", zClose: "Закрити", zSun: "Знак Сонця", zMoon: "Знак Місяця", zSys: "Система",
    zChanges: "Зміни знаків", zChangesD: "Коли Сонце й Місяць перейдуть у наступний знак (час у вибраному місті).",
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
    zMenu: "القائمة", zTitle: "التنجيم", zClose: "إغلاق", zSun: "برج الشمس", zMoon: "برج القمر", zSys: "النظام",
    zChanges: "تغيّر الأبراج", zChangesD: "متى تدخل الشمس والقمر البرج التالي (بتوقيت المدينة المختارة).",
    zMoonSky: "القمر بحسب السماء", zMoonSkyD: "يبتعد القمر عن دائرة البروج حتى 5°، فقد يظهر في السماء في كوكبة أخرى، وأحيانًا خارج البروج (مثل الجبّار). يُحسب كما يُرى من مكانك.",
    zs_trop: "الغربي", zd_trop: "12 برجًا متساويًا من اعتدال مارس، بحسب الفصول. وهو الأشهر بين الناس.",
    zs_sid: "الفيدي", zd_sid: "12 برجًا متساويًا تُقاس من النجوم (أيانامشا لاهيري). اليوم متأخر نحو 24° عن الغربي.",
    zs_ecl13: "الكوكبات (13)", zd_ecl13: "الكوكبات الحقيقية غير المتساوية على مسار الشمس، ومعها الحوّاء.",
    zAyanNote: "للنظام الفيدي عدة صيغ للإزاحة عن النجوم (أيانامشا). هنا صيغة لاهيري، المعتمدة في الهند. صيغ أخرى (رامان، كريشنامورتي، فاغان-برادلي) تُزيح حدود الأبراج من دقائق قوسية قليلة إلى نحو 1.5°، لذا قد يختلف البرج قرب الحد."
  });
  names("ar", ["الحمل", "الثور", "الجوزاء", "السرطان", "الأسد", "العذراء", "الميزان", "العقرب", "القوس", "الجدي", "الدلو", "الحوت", "الحوّاء", "الجبّار", "قيطس", "ممسك الأعنّة", "الغراب", "السدس"]);
})();
