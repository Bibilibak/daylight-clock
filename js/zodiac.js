/* ===== Zodiak: dokładny Księżyc, znaki Słońca i Księżyca w czterech systemach =====
   Plik jest samodzielny (nie czyta zmiennych z js/main.js) i ładuje się przed nim: main.js bierze stąd położenie Księżyca.

   Systemy (ZD.SYS):
   - "trop"  zachodni (tropikalny): 12 równych znaków po 30°, liczonych od równonocy marcowej (pory roku, nie gwiazdy),
   - "sid"   wedyjski (syderyczny): 12 równych znaków liczonych od gwiazd, czyli długość tropikalna minus ajanamsa.
             UWAGA: ajanamsa (przesunięcie między zodiakiem tropikalnym a gwiazdowym) ma kilka wariantów.
             Tu jest Lahiri (Chitrapaksha), urzędowy standard indyjski: 23°15'00,658" 21.03.1956 + precesja.
             Inne warianty dają inne granice znaków: Raman ok. 1,4° mniej, Krishnamurti (KP) ok. 6' mniej,
             Fagan-Bradley (zachodnia astrologia syderyczna) ok. 0,9° więcej. Ten sam Księżyc może więc być
             w innym znaku zależnie od wariantu; do ewentualnego przełącznika w przyszłości (ZD.AYAN).
   - "ecl13" gwiazdozbiory po ekliptyce: 13 nierównych odcinków (z Wężownikiem), w których ekliptyka przecina
             granice gwiazdozbiorów IAU. Punkt liczony na ekliptyce, bez szerokości Księżyca (tak liczą astrolodzy „13 znaków”).
   - "sky"   gwiazdozbiory naprawdę na niebie: gwiazdozbiór IAU, w którym widać ciało z wybranego miejsca
             (Księżyc z paralaksą, bo z powierzchni Ziemi przesuwa się na tle gwiazd nawet o 1°). Księżyc bywa wtedy
             poza zodiakiem, np. w Orionie, Wielorybie albo Sekstansie.

   Źródła:
   - Księżyc: J. Meeus, „Astronomical Algorithms”, rozdz. 47 (ELP-2000/82 w skrócie, ok. 10" w długości, 4" w szerokości),
     nutacja z rozdz. 22, precesja z rozdz. 21,
   - granice gwiazdozbiorów: N. G. Roman (1987), PASP 99, 695 (granice IAU z 1930 r. w układzie B1875), w zapisie
     z biblioteki astronomy-engine (Don Cross, licencja MIT; tą biblioteką sprawdzają obliczenia testy w test/).
   Czas: wzory chcą czasu ziemskiego TT, a zegar daje UTC; różnicę ΔT (ok. 69 s) bierzemy z tabeli.
   Dokładność (Księżyc ok. 20", Słońce ok. 1") dotyczy lat 1900-2100. Dalej ΔT, czyli spowolnienie obrotu Ziemi, znamy
   tylko w przybliżeniu, a wzory Meeusa tracą dokładność: w latach 1000 i 3000 Księżyc może być 2-4' obok
   (zmiana jego znaku nawet kilka minut wcześniej lub później). */
var ZD = (function () {
  var R = Math.PI / 180;
  function nd(x) { return (x % 360 + 360) % 360 }

  // ΔT = TT - UT w sekundach: wartości zmierzone (co 10 lat) i przewidywane, liniowo pomiędzy; poza zakresem parabola Morrisona-Stephensona
  var DTY = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2050],
    DTV = [-2.7, 10.4, 21.2, 24.0, 24.3, 29.1, 33.2, 40.2, 50.5, 56.9, 63.8, 66.1, 69.4, 70.5, 75];
  function dT(ms) {
    var y = 1970 + ms / 315576e5;
    function ms2(y) { var u = (y - 1820) / 100; return -20 + 32 * u * u }   // parabola przesunięta tak, żeby łączyła się z tabelą bez skoku
    if (y < DTY[0]) return ms2(y) - ms2(DTY[0]) + DTV[0];
    if (y > DTY[DTY.length - 1]) return ms2(y) - ms2(DTY[DTY.length - 1]) + DTV[DTV.length - 1];
    for (var i = 1; DTY[i] < y; i++);
    return DTV[i - 1] + (DTV[i] - DTV[i - 1]) * (y - DTY[i - 1]) / (DTY[i] - DTY[i - 1])
  }
  // stulecia juliańskie od J2000 w czasie TT
  function TT(ms) { return ((ms + dT(ms) * 1000) / 864e5 - 10957.5) / 36525 }

  // nutacja w długości i nachylenie ekliptyki (prawdziwe), w stopniach (Meeus 22, wersja skrócona, ok. 0,5")
  function nut(T) {
    var O = R * (125.04452 - 1934.136261 * T), L = R * (280.4665 + 36000.7698 * T), Lm = R * (218.3165 + 481267.8813 * T);
    var dpsi = (-17.20 * Math.sin(O) - 1.32 * Math.sin(2 * L) - 0.23 * Math.sin(2 * Lm) + 0.21 * Math.sin(2 * O)) / 3600,
      deps = (9.20 * Math.cos(O) + 0.57 * Math.cos(2 * L) + 0.10 * Math.cos(2 * Lm) - 0.09 * Math.cos(2 * O)) / 3600,
      eps0 = 23.4392911 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
    return { dpsi: dpsi, eps0: eps0, eps: eps0 + deps }
  }

  /* Księżyc (Meeus 47). Wiersz: D, M, M', F, Σl [1e-6 °], Σr [1e-3 km]. */
  var LR = [
    0,0,1,0,6288774,-20905355, 2,0,-1,0,1274027,-3699111, 2,0,0,0,658314,-2955968, 0,0,2,0,213618,-569925,
    0,1,0,0,-185116,48888, 0,0,0,2,-114332,-3149, 2,0,-2,0,58793,246158, 2,-1,-1,0,57066,-152138,
    2,0,1,0,53322,-170733, 2,-1,0,0,45758,-204586, 0,1,-1,0,-40923,-129620, 1,0,0,0,-34720,108743,
    0,1,1,0,-30383,104755, 2,0,0,-2,15327,10321, 0,0,1,2,-12528,0, 0,0,1,-2,10980,79661,
    4,0,-1,0,10675,-34782, 0,0,3,0,10034,-23210, 4,0,-2,0,8548,-21636, 2,1,-1,0,-7888,24208,
    2,1,0,0,-6766,30824, 1,0,-1,0,-5163,-8379, 1,1,0,0,4987,-16675, 2,-1,1,0,4036,-12831,
    2,0,2,0,3994,-10445, 4,0,0,0,3861,-11650, 2,0,-3,0,3665,14403, 0,1,-2,0,-2689,-7003,
    2,0,-1,2,-2602,0, 2,-1,-2,0,2390,10056, 1,0,1,0,-2348,6322, 2,-2,0,0,2236,-9884,
    0,1,2,0,-2120,5751, 0,2,0,0,-2069,0, 2,-2,-1,0,2048,-4950, 2,0,1,-2,-1773,4130,
    2,0,0,2,-1595,0, 4,-1,-1,0,1215,-3958, 0,0,2,2,-1110,0, 3,0,-1,0,-892,3258,
    2,1,1,0,-810,2616, 4,-1,-2,0,759,-1897, 0,2,-1,0,-713,-2117, 2,2,-1,0,-700,2354,
    2,1,-2,0,691,0, 2,-1,0,-2,596,0, 4,0,1,0,549,-1423, 0,0,4,0,537,-1117,
    4,-1,0,0,520,-1571, 1,0,-2,0,-487,-1739, 2,1,0,-2,-399,0, 0,0,2,-2,-381,-4421,
    1,1,1,0,351,0, 3,0,-2,0,-340,0, 4,0,-3,0,330,0, 2,-1,2,0,327,0,
    0,2,1,0,-323,1165, 1,1,-1,0,299,0, 2,0,3,0,294,0, 2,0,-1,-2,0,8752];
  /* Wiersz: D, M, M', F, Σb [1e-6 °]. */
  var LB = [
    0,0,0,1,5128122, 0,0,1,1,280602, 0,0,1,-1,277693, 2,0,0,-1,173237, 2,0,-1,1,55413, 2,0,-1,-1,46271,
    2,0,0,1,32573, 0,0,2,1,17198, 2,0,1,-1,9266, 0,0,2,-1,8822, 2,-1,0,-1,8216, 2,0,-2,-1,4324,
    2,0,1,1,4200, 2,1,0,-1,-3359, 2,-1,-1,1,2463, 2,-1,0,1,2211, 2,-1,-1,-1,2065, 0,1,-1,-1,-1870,
    4,0,-1,-1,1828, 0,1,0,1,-1794, 0,0,0,3,-1749, 0,1,-1,1,-1565, 1,0,0,1,-1491, 0,1,1,1,-1475,
    0,1,1,-1,-1410, 0,1,0,-1,-1344, 1,0,0,-1,-1335, 0,0,3,1,1107, 4,0,0,-1,1021, 4,0,-1,1,833,
    0,0,1,-3,777, 4,0,-2,1,671, 2,0,0,-3,607, 2,0,2,-1,596, 2,-1,1,-1,491, 2,0,-2,1,-451,
    0,0,3,-1,439, 2,0,2,1,422, 2,0,-3,-1,421, 2,1,-1,1,-366, 2,1,0,1,-351, 4,0,0,1,331,
    2,-1,1,1,315, 2,-2,0,-1,302, 0,0,1,3,-283, 2,1,1,-1,-229, 1,1,0,-1,223, 1,1,0,1,223,
    0,1,-2,-1,-220, 2,1,-1,-1,-220, 1,0,1,1,-185, 2,-1,-2,-1,181, 0,1,2,1,-177, 4,0,-2,-1,176,
    4,-1,-1,-1,166, 1,0,1,-1,-164, 4,0,1,-1,132, 1,0,-1,-1,-119, 4,-1,0,-1,115, 2,-2,0,1,107];

  // geocentryczne położenie Księżyca: lonM = długość względem średniej równonocy daty (bez nutacji),
  // lon = pozorna (z nutacją), lat = szerokość ekliptyczna, dist = odległość [km]; wszystko w stopniach
  function moon(ms) {
    var T = TT(ms), T2 = T * T, T3 = T2 * T, T4 = T3 * T,
      Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000,
      D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000,
      M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000,
      Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000,
      F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000,
      A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T, A3 = 313.45 + 481266.484 * T,
      E = 1 - 0.002516 * T - 0.0000074 * T2, sl = 0, sr = 0, sb = 0, i, a, e;
    for (i = 0; i < LR.length; i += 6) {
      a = R * (LR[i] * D + LR[i + 1] * M + LR[i + 2] * Mp + LR[i + 3] * F);
      e = LR[i + 1] ? (LR[i + 1] * LR[i + 1] === 4 ? E * E : E) : 1;
      sl += LR[i + 4] * e * Math.sin(a); sr += LR[i + 5] * e * Math.cos(a)
    }
    for (i = 0; i < LB.length; i += 5) {
      a = R * (LB[i] * D + LB[i + 1] * M + LB[i + 2] * Mp + LB[i + 3] * F);
      e = LB[i + 1] ? (LB[i + 1] * LB[i + 1] === 4 ? E * E : E) : 1;
      sb += LB[i + 4] * e * Math.sin(a)
    }
    sl += 3958 * Math.sin(R * A1) + 1962 * Math.sin(R * (Lp - F)) + 318 * Math.sin(R * A2);
    sb += -2235 * Math.sin(R * Lp) + 382 * Math.sin(R * A3) + 175 * Math.sin(R * (A1 - F)) + 175 * Math.sin(R * (A1 + F))
      + 127 * Math.sin(R * (Lp - Mp)) - 115 * Math.sin(R * (Lp + Mp));
    var n = nut(T), lonM = nd(Lp + sl / 1e6);
    return { lonM: lonM, lon: nd(lonM + n.dpsi), lat: sb / 1e6, dist: 385000.56 + sr / 1000, T: T, nut: n }
  }

  // ekliptyka -> równik (stopnie), dla podanego nachylenia
  function toEq(l, b, eps) {
    l *= R; b *= R; eps *= R;
    var ra = Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l)),
      dc = Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l));
    return { ra: nd(ra / R), dec: dc / R }
  }

  // Księżyc w układzie równikowym (średni równik i równonoc daty), opcjonalnie z miejsca obserwatora (paralaksa, Meeus 40)
  function moonEq(ms, lat, lon) {
    var m = moon(ms), q = toEq(m.lonM, m.lat, m.nut.eps0);
    if (arguments.length < 3) return q;   // bez miejsca: geocentrycznie
    if (!isFinite(lat) || !isFinite(lon)) return null;   // zepsute współrzędne: brak wyniku zamiast zmyślonego
    var jd = ms / 864e5 + 2440587.5, d = jd - 2451545, Tu = d / 36525,
      gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * Tu * Tu,
      H = R * (gmst + lon - q.ra), dc = q.dec * R, sp = 6378.14 / m.dist,
      u = Math.atan(0.99664719 * Math.tan(lat * R)), rs = 0.99664719 * Math.sin(u), rc = Math.cos(u),
      den = Math.cos(dc) - rc * sp * Math.cos(H),
      dra = Math.atan2(-rc * sp * Math.sin(H), den),
      dct = Math.atan2((Math.sin(dc) - rs * sp) * Math.cos(dra), den);
    return { ra: nd(q.ra + dra / R), dec: dct / R }
  }

  // precesja (ra, dec) ze średniego równika daty ms na B1875 (Meeus 21.2), w tym układzie są granice gwiazdozbiorów
  function toB1875(ra, dec, ms) {
    var JD0 = ms / 864e5 + 2440587.5, T = (JD0 - 2451545) / 36525, t = (2405889.258550475 - JD0) / 36525,
      k = 2306.2181 + 1.39656 * T - 0.000139 * T * T,
      z1 = (k * t + (0.30188 - 0.000344 * T) * t * t + 0.017998 * t * t * t) / 3600 * R,
      z = (k * t + (1.09468 + 0.000066 * T) * t * t + 0.018203 * t * t * t) / 3600 * R,
      th = ((2004.3109 - 0.85330 * T - 0.000217 * T * T) * t - (0.42665 + 0.000217 * T) * t * t - 0.041833 * t * t * t) / 3600 * R,
      a = ra * R + z1, d = dec * R,
      A = Math.cos(d) * Math.sin(a), B = Math.cos(th) * Math.cos(d) * Math.cos(a) - Math.sin(th) * Math.sin(d),
      C = Math.sin(th) * Math.cos(d) * Math.cos(a) + Math.cos(th) * Math.sin(d);
    return { ra: nd((Math.atan2(A, B) + z) / R), dec: Math.asin(C) / R }
  }

  // Granice gwiazdozbiorów IAU (B1875): czwórki [nr gwiazdozbioru, RA od, RA do, Dec dolna] w jednostkach 1/360 h RA i 1/24 ° Dec.
  // Pierwszy pasujący wiersz (Dec ≥ dolnej granicy, RA w przedziale) wyznacza gwiazdozbiór.
  var CN = ['And','Ant','Aps','Aql','Aqr','Ara','Ari','Aur','Boo','Cae','Cam','Cap','Car','Cas','Cen','Cep','Cet','Cha','Cir','CMa','CMi','Cnc','Col','Com','CrA','CrB','Crt','Cru','Crv','CVn','Cyg','Del','Dor','Dra','Equ','Eri','For','Gem','Gru','Her','Hor','Hya','Hyi','Ind','Lac','Leo','Lep','Lib','LMi','Lup','Lyn','Lyr','Men','Mic','Mon','Mus','Nor','Oct','Oph','Ori','Pav','Peg','Per','Phe','Pic','PsA','Psc','Pup','Pyx','Ret','Scl','Sco','Sct','Ser','Sex','Sge','Sgr','Tau','Tel','TrA','Tri','Tuc','UMa','UMi','Vel','Vir','Vol','Vul'], CB = [
    83,0,8640,2112,83,2880,5220,2076,83,7560,8280,2068,83,6480,7560,2064,15,0,2880,2040,10,3300,3840,1968,15,0,1800,1920,10,3840,5220,1920,83,6300,6480,1920,33,7260,7560,1920,
    15,0,1263,1848,10,4140,4890,1848,83,5952,6300,1800,15,7260,7440,1800,10,2868,3300,1764,33,3300,4080,1764,83,4680,5952,1680,13,1116,1230,1632,33,7350,7440,1608,33,4080,4320,1596,
    15,0,120,1584,83,5040,5640,1584,15,8490,8640,1584,33,4320,4860,1536,33,4860,5190,1512,15,8340,8490,1512,10,2196,2520,1488,33,7200,7350,1476,15,7393.2,7416,1462,10,2520,2868,1440,
    82,2868,3030,1440,33,7116,7200,1428,15,7200,7393.2,1428,15,8232,8340,1418,13,0,876,1404,33,6990,7116,1392,13,612,687,1380,13,876,1116,1368,10,1116,1140,1368,15,8034,8232,1350,
    10,1800,2196,1344,82,5052,5190,1332,33,5190,6990,1332,10,1140,1200,1320,15,7968,8034,1320,15,7416,7908,1316,13,0,612,1296,50,2196,2340,1296,82,4350,4860,1272,33,5490,5670,1272,
    15,7908,7968,1266,10,1200,1800,1260,13,8232,8400,1260,33,5670,6120,1236,62,735,906,1212,33,6120,6564,1212,13,0,492,1200,62,492,600,1200,50,2340,2448,1200,13,8400,8640,1200,
    82,4860,5052,1164,13,0,402,1152,13,8490,8640,1152,39,6543,6564,1140,33,6564,6870,1140,30,6870,6900,1140,62,600,735,1128,82,3030,3300,1128,13,60,312,1104,82,4320,4350,1080,
    50,2448,2652,1068,30,7887,7908,1056,30,7875,7887,1050,30,6900,6984,1044,82,3300,3660,1008,82,3660,3882,960,8,5556,5670,960,39,5670,5880,960,50,3330,3450,954,0,0,906,882,
    62,906,924,882,51,6969,6984,876,62,1620,1689,864,30,7824,7875,864,44,7875,7920,864,7,2352,2652,852,50,2652,2790,852,0,0,720,840,44,7920,8214,840,44,8214,8232,828,
    0,8232,8460,828,62,924,978,816,82,3882,3960,816,29,4320,4440,816,50,2790,3330,804,48,3330,3558,804,0,258,507,792,8,5466,5556,792,0,8460,8550,770,29,4440,4770,768,
    0,8550,8640,752,29,5025,5052,738,80,870,978,736,62,978,1620,736,7,1620,1710,720,51,6543,6969,720,82,3960,4320,696,30,7080,7530,696,7,1710,2118,684,48,3558,3780,684,
    29,4770,5025,684,0,0,24,672,80,507,600,672,7,2118,2352,672,37,2838,2880,672,30,7530,7824,672,30,6933,7080,660,80,690,870,654,25,5820,5880,648,8,5430,5466,624,
    25,5466,5820,624,51,6612,6792,624,48,3870,3960,612,51,6792,6933,612,80,600,690,600,66,258,306,570,48,3780,3870,564,87,7650,7710,564,77,2052,2118,548,0,24,51,528,
    73,5730,5772,528,37,2118,2238,516,87,7140,7290,510,87,6792,6930,506,0,51,306,504,87,7290,7404,492,37,2811,2838,480,87,7404,7650,468,87,6930,7140,460,6,1182,1212,456,
    75,6792,6840,444,59,2052,2076,432,37,2238,2271,420,75,6840,7140,388,77,1788,1920,384,39,5730,5790,384,75,7140,7290,378,77,1662,1788,372,77,1920,2016,372,23,4620,4860,360,
    39,6210,6570,344,23,4272,4620,336,37,2700,2811,324,39,6030,6210,308,61,0,51,300,77,2016,2076,300,37,2520,2700,300,61,7602,7680,300,37,2271,2496,288,39,6570,6792,288,
    31,7515,7578,284,61,7578,7602,284,45,4146,4272,264,59,2247,2271,240,37,2496,2520,240,21,2811,2853,240,61,8580,8640,240,6,600,1182,238,31,7251,7308,204,8,4860,5430,192,
    61,8190,8580,180,21,2853,3330,168,45,3330,3870,168,58,6570,6718.4,150,3,6718.4,6792,150,31,7500,7515,144,20,2520,2526,132,73,6570,6633,108,39,5790,6030,96,58,6570,6633,72,
    61,7728,7800,66,66,0,720,48,73,6690,6792,48,31,7308,7500,48,34,7500,7680,48,61,7680,7728,48,61,7920,8190,48,61,7800,7920,42,20,2526,2592,36,77,1290,1662,0,
    59,1662,1680,0,20,2592,2910,0,85,5280,5430,0,58,6420,6570,0,16,954,1182,-42,77,1182,1290,-42,73,5430,5856,-78,59,1680,1830,-96,59,2100,2247,-96,73,6420,6468,-96,
    73,6570,6690,-96,3,6690,6792,-96,66,8190,8580,-96,45,3870,4146,-144,85,4146,4260,-144,66,0,120,-168,66,8580,8640,-168,85,5130,5280,-192,58,5730,5856,-192,3,7200,7392,-216,
    4,7680,7872,-216,58,6180,6468,-240,54,2100,2910,-264,35,1770,1830,-264,59,1830,2100,-264,41,2910,3012,-264,74,3450,3870,-264,85,4260,4620,-264,58,6330,6360,-280,3,6792,7200,-288.8,
    35,1740,1770,-348,4,7392,7680,-360,73,6180,6570,-384,72,6570,6792,-384,41,3012,3090,-408,58,5856,5895,-438,41,3090,3270,-456,26,3870,3900,-456,71,5856,5895,-462,47,5640,5730,-480,
    28,4530,4620,-528,85,4620,5130,-528,41,3270,3510,-576,16,600,954,-585.2,35,954,1350,-585.2,26,3900,4260,-588,28,4260,4530,-588,47,5130,5370,-588,58,5856,6030,-590,16,0,600,-612,
    11,7680,7872,-612,4,7872,8580,-612,16,8580,8640,-612,41,3510,3690,-636,35,1692,1740,-654,46,1740,2202,-654,11,7200,7680,-672,41,3690,3810,-700,41,4530,5370,-708,47,5370,5640,-708,
    71,5640,5760,-708,35,1650,1692,-720,58,6030,6336,-720,76,6336,6420,-720,41,3810,3900,-748,19,2202,2652,-792,41,4410,4530,-792,41,3900,4410,-840,36,1260,1350,-864,68,3012,3372,-882,
    35,1536,1650,-888,76,6420,6900,-888,65,7680,8280,-888,70,8280,8400,-888,36,1080,1260,-950,1,3372,3960,-954,70,0,600,-960,36,600,1080,-960,35,1392,1536,-960,70,8400,8640,-960,
    14,5100,5370,-1008,49,5640,5760,-1008,71,5760,5911.5,-1008,9,1740,1800,-1032,22,1800,2370,-1032,67,2880,3012,-1032,35,1230,1392,-1056,71,5911.5,6420,-1092,24,6420,6900,-1092,76,6900,7320,-1092,
    53,7320,7680,-1092,35,1080,1230,-1104,9,1620,1740,-1116,49,5520,5640,-1152,63,0,840,-1156,35,960,1080,-1176,40,1470,1536,-1176,9,1536,1620,-1176,38,7680,7920,-1200,67,2160,2880,-1218,
    84,2880,2940,-1218,35,870,960,-1224,40,1380,1470,-1224,63,0,660,-1236,12,2160,2220,-1260,84,2940,3042,-1272,40,1260,1380,-1276,32,1380,1440,-1276,63,0,570,-1284,35,780,870,-1296,
    64,1620,1800,-1296,49,5418,5520,-1296,84,3042,3180,-1308,12,2220,2340,-1320,14,4260,4620,-1320,49,5100,5418,-1320,56,5418,5520,-1320,32,1440,1560,-1356,84,3180,3960,-1356,14,3960,4050,-1356,
    5,6300,6480,-1368,78,6480,7320,-1368,38,7920,8400,-1368,40,1152,1260,-1380,64,1800,1980,-1380,12,2340,2460,-1392,63,0,480,-1404,35,480,780,-1404,63,8400,8640,-1404,32,1560,1650,-1416,
    56,5520,5911.5,-1440,43,7320,7680,-1440,64,1980,2160,-1464,18,5460,5520,-1464,5,5911.5,5970,-1464,18,5370,5460,-1526,5,5970,6030,-1526,64,2160,2460,-1536,12,2460,3252,-1536,14,4050,4260,-1536,
    27,4260,4620,-1536,14,4620,5232,-1536,18,4860,4920,-1560,5,6030,6060,-1560,40,780,1152,-1620,69,1152,1650,-1620,18,5310,5370,-1620,5,6060,6300,-1620,60,6300,6480,-1620,81,7920,8400,-1620,
    32,1650,2370,-1680,18,4920,5310,-1680,79,5310,6120,-1680,81,0,480,-1800,42,1260,1650,-1800,86,2370,3252,-1800,12,3252,4050,-1800,55,4050,4920,-1800,60,6480,7680,-1800,43,7680,8400,-1800,
    81,8400,8640,-1800,81,270,480,-1824,42,0,1260,-1980,17,2760,4920,-1980,2,4920,6480,-1980,52,1260,2760,-2040,57,0,8640,-2160];
  function constel(ra, dec, ms) {   // ra, dec: średni równik daty ms -> skrót IAU („Ori”)
    if (!isFinite(ra) || !isFinite(dec)) return null;
    var p = toB1875(ra, dec, ms), r = p.ra * 24, dd = p.dec * 24;   // r: RA w 1/360 h (= stopnie·24), dd: Dec w 1/24 °
    for (var i = 0; i < CB.length; i += 4)
      if (CB[i + 3] <= dd && CB[i + 1] <= r && r < CB[i + 2]) return CN[CB[i]];
    return null   // tylko dla NaN (tablica pokrywa całe niebo): lepiej nic nie pokazać niż zmyślony gwiazdozbiór
  }

  // ajanamsa Lahiri (średnia, względem średniej równonocy daty): 23°15'00,658" 21.03.1956 + precesja ogólna w długości (IAU 2006)
  function ayan(T) {
    var T0 = (2435553.5 - 2451545) / 36525;
    function p(t) { return 5028.796195 * t + 1.1054348 * t * t }
    return 23.2501828 + (p(T) - p(T0)) / 3600
  }

  // 12 znaków (kolejność od Barana), 13 gwiazdozbiorów ekliptyki (z Wężownikiem) w kolejności wzdłuż ekliptyki
  var SIGNS = ["Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Sgr", "Cap", "Aqr", "Psc"],
    ECL13 = ["Psc", "Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Oph", "Sgr", "Cap", "Aqr"];
  // symbole: znaki zodiaku, a gwiazdozbiory poza zodiakiem bez symbolu (pokazujemy wtedy skrót)
  var GLYPH = { Ari: "♈", Tau: "♉", Gem: "♊", Cnc: "♋", Leo: "♌", Vir: "♍", Lib: "♎", Sco: "♏", Sgr: "♐", Cap: "♑", Aqr: "♒", Psc: "♓", Oph: "⛎" };

  // gwiazdozbiór punktu ekliptyki o długości lM (średnia równonoc daty)
  function eclConst(lM, ms) {
    var e = nut(TT(ms)).eps0, q = toEq(lM, 0, e);
    return constel(q.ra, q.dec, ms)
  }
  // gdzie zaczyna się odcinek ekliptyki z gwiazdozbiorem c (cofamy się po 0,5° i dzielimy przedział na pół)
  function eclStart(lM, c, ms) {
    var a = lM, i;
    for (i = 0; i < 100 && eclConst(nd(a - 0.5), ms) === c; i++) a -= 0.5;
    var lo = a - 0.5, hi = a;   // na lo już inny gwiazdozbiór, na hi jeszcze c
    for (i = 0; i < 20; i++) { var mid = (lo + hi) / 2; if (eclConst(nd(mid), ms) === c) hi = mid; else lo = mid }
    return nd(hi)
  }

  /* Znak ciała w systemie sys. body: { lonM (średnia równonoc daty), lon (pozorna), lat, ra, dec (do "sky") }.
     Zwraca { id: skrót IAU (np. "Leo"), glyph: symbol albo "", deg: stopnie od początku znaku (null w "sky") }. */
  function signOf(body, sys, ms, idOnly) {
    var id, deg = null;
    if (sys === "trop" || sys === "sid") {
      var l = sys === "trop" ? body.lon : nd(body.lonM - ayan(TT(ms)));
      id = SIGNS[Math.floor(l / 30) % 12]; deg = l % 30
    } else if (sys === "ecl13") {
      id = eclConst(body.lonM, ms); if (!idOnly && id) deg = nd(body.lonM - eclStart(body.lonM, id, ms))
    } else {
      id = constel(body.ra, body.dec, ms)
    }
    return id ? { id: id, glyph: GLYPH[id] || "", deg: deg } : null
  }

  /* Słońce: VSOP87 (szereg długości Ziemi, 32 wyrazy z biblioteki astronomy-engine, ok. 1" w latach 1000-3000).
     Długość heliocentryczna Ziemi w układzie J2000 + 180°, w chwili wysłania światła (8,3 min wcześniej = aberracja),
     potem precesja do równonocy daty (dla punktu na ekliptyce wystarczy dodać precesję w długości).
     Zwraca długość pozorną względem średniej równonocy daty (bez nutacji), jak lonM Księżyca. */
  var EL = [[[1.75347045673,0,0],[0.03341656453,4.66925680415,6283.07584999],[0.00034894275,4.62610242189,12566.1517],[0.00003417572,2.82886579754,3.523118349],[0.00003497056,2.74411783405,5753.3848849],[0.00003135899,3.62767041756,77713.7714681],[0.00002676218,4.41808345438,7860.41939244],[0.00002342691,6.13516214446,3930.20969622],[0.00001273165,2.03709657878,529.690965095],[0.00001324294,0.74246341673,11506.7697698],[0.00000901854,2.04505446477,26.2983197998],[0.00001199167,1.10962946234,1577.34354245],[0.00000857223,3.50849152283,398.149003408],[0.00000779786,1.17882681962,5223.6939198],[0.0000099025,5.23268072088,5884.92684658],[0.00000753141,2.53339052847,5507.55323867],[0.00000505267,4.58292599973,18849.22755],[0.00000492392,4.20505711826,775.522611324],[0.00000356672,2.91954114478,0.0673103028],[0.00000284125,1.89869240932,796.298006816],[0.00000242879,0.34481445893,5486.77784318],[0.00000317087,5.84901948512,11790.6290887],[0.00000271112,0.31486255375,10977.0788047],[0.00000206217,4.80646631478,2544.31441988],[0.00000205478,1.86953770281,5573.14280143],[0.00000202318,2.45767790232,6069.77675455],[0.00000126225,1.08295459501,20.7753954924],[0.00000155516,0.83306084617,213.299095438]],[[6283.07584999,0,0],[0.00206058863,2.67823455808,6283.07584999],[0.00004303419,2.63512233481,12566.1517]],[[0.00008721859,1.07253635559,6283.07584999]]];
  function sunLon(ms) {
    var tt = (ms + dT(ms) * 1000) / 864e5 - 10957.5, t = (tt - 0.0057755183) / 365250, T = tt / 36525, tp = 1, L = 0;
    for (var s = 0; s < EL.length; s++) {
      var sum = 0;
      for (var k = 0; k < EL[s].length; k++) sum += EL[s][k][0] * Math.cos(EL[s][k][1] + t * EL[s][k][2]);
      L += tp * sum; tp *= t
    }
    return nd(L / R + 180 + (5028.796195 * T + 1.1054348 * T * T) / 3600)
  }
  // znak Słońca (szerokość ≈ 0, więc „na niebie” to to samo co po ekliptyce)
  function sunSign(ms, sys, idOnly) {
    var l = sunLon(ms), n = nut(TT(ms)), q = toEq(l, 0, n.eps0);
    return signOf({ lonM: l, lon: nd(l + n.dpsi), ra: q.ra, dec: q.dec }, sys, ms, idOnly)
  }
  // Księżyc: lat / lon miejsca potrzebne tylko w systemie "sky" (paralaksa)
  function moonSign(ms, sys, lat, lon, idOnly) {
    var m = moon(ms), body = { lonM: m.lonM, lon: m.lon };
    if (sys === "sky") { var q = moonEq(ms, lat, lon); if (!q) return null; body.ra = q.ra; body.dec = q.dec }
    return signOf(body, sys, ms, idOnly)
  }

  /* Najbliższa zmiana znaku po chwili ms: idziemy krokami (Słońce co dobę, Księżyc co 30 min; najkrótszy odcinek,
     Skorpion, to ok. 7°) i dzielimy ostatni krok na pół do 1 s.
     Zwraca { ms: chwila zmiany, to: nowy znak } albo null. W "sky" Księżyc przez paralaksę może czasem wejść
     do sąsiedniego gwiazdozbioru i za kilka godzin wrócić; to też jest zmiana. */
  function nextChange(kind, ms, sys, lat, lon, stepMs) {   // stepMs: inny krok Księżyca (np. 30 min na niebie w kalendarzu)
    function f(t) { var z = kind === "sun" ? sunSign(t, sys, true) : moonSign(t, sys, lat, lon, true); return z && z.id }
    // krok: Słońce co dobę, Księżyc co 30 min, a na niebie co 10 min (krótkie zahaczenie o róg gwiazdozbioru albo
    // wahnięcie przez paralaksę); szukamy najwyżej 60 dni dla Słońca i 5 dni dla Księżyca
    var c = f(ms), step = stepMs && kind !== "sun" ? stepMs : kind === "sun" ? 864e5 : sys === "sky" ? 6e5 : 18e5, max = Math.round((kind === "sun" ? 60 : 5) * 864e5 / step), a = ms, b, i;
    if (!c) return null;
    for (i = 0; i < max; i++) { b = a + step; if (f(b) !== c) break; a = b }
    if (i === max) return null;
    while (b - a > 1e3) { var m = (a + b) / 2; if (f(m) === c) a = m; else b = m }
    var z = kind === "sun" ? sunSign(b + 1, sys) : moonSign(b + 1, sys, lat, lon);
    return z ? { ms: b, to: z } : null
  }

  /* Granice znaków na ekliptyce (długość Słońca względem średniej równonocy daty) w systemie sys, dla chwili ms:
     lista { a: początek w stopniach, id } od 0°. W "trop" co 30° od 0°, w "sid" co 30° od ajanamsy, w "ecl13" (i "sky",
     bo Słońce leży na ekliptyce) granice gwiazdozbiorów IAU na ekliptyce. Wynik pamiętany dla systemu i roku. */
  var bmemo = {};
  function bounds(sys, ms) {
    if (sys === "sky") sys = "ecl13";
    var y = Math.floor(1970 + ms / 315576e5), key = sys + y;
    if (bmemo[key]) return bmemo[key];
    var out = [], i, t0 = Date.UTC(y, 6, 1);   // granice liczone na połowę roku (precesja: ok. 0,014° na rok)
    if (sys === "ecl13") {
      var prev = eclConst(359.75, t0);
      for (var l = 0; l < 360; l += 0.25) {
        var c = eclConst(l, t0);
        if (c !== prev) out.push({ a: eclStart(l, c, t0), id: c });
        prev = c
      }
    } else {
      var a0 = sys === "sid" ? ayan(TT(t0)) : 0;
      for (i = 0; i < 12; i++) out.push({ a: nd(a0 + 30 * i), id: SIGNS[i] })
    }
    out.sort(function (p, q) { return p.a - q.a });
    return (bmemo[key] = out)
  }

  return { SYS: ["trop", "sid", "ecl13", "sky"], AYAN: "lahiri", GLYPH: GLYPH, SIGNS: SIGNS, ECL13: ECL13,
    dT: dT, TT: TT, nut: nut, moon: moon, moonEq: moonEq, toEq: toEq, toB1875: toB1875, constel: constel, ayan: ayan,
    eclConst: eclConst, eclStart: eclStart, signOf: signOf, sunLon: sunLon, sunSign: sunSign, moonSign: moonSign, nextChange: nextChange, bounds: bounds }
})();
if (typeof module !== "undefined") module.exports = ZD;   // testy w Node
