# Ikony Zegara światła: tarcza z pierścieniem w kolorach nieba (te same progi co skyColor w js/main.js),
# Warszawa, deklinacja +8° (ok. 204° światła), Słońce rano na 70° od wschodu.
# Uwaga: PowerShell nie rozróżnia wielkości liter w nazwach zmiennych ($fg = $FG, $bg = $BG, $r = $R).
# Uruchomienie z katalogu repozytorium (PowerShell): .\scripts\icons.ps1
# Tworzy ikony strony (assets/) i, gdy jest folder android/, ikony i ekrany startowe aplikacji na Androida.
param([string]$Root = (Split-Path $PSScriptRoot -Parent))
# Ikona Zegara światła: tarcza z pierścieniem w kolorach nieba (te same progi co skyColor w js/main.js),
# Warszawa, deklinacja +8° (ok. 203° światła), Słońce rano na 70° od wschodu.
Add-Type -AssemblyName System.Drawing
$R = [Math]::PI / 180; $lat = 52.23; $dec = 8; $sunA = 70
$F = $lat * $R; $E = $dec * $R
$c0 = ([Math]::Sin(-0.833 * $R) - [Math]::Sin($F) * [Math]::Sin($E)) / ([Math]::Cos($F) * [Math]::Cos($E))
$H0 = [Math]::Acos($c0) / $R
function Alt($a) { [Math]::Asin([Math]::Sin($F) * [Math]::Sin($E) + [Math]::Cos($F) * [Math]::Cos($E) * [Math]::Cos(($a - $H0) * $R)) / $R }
$SKY = @(@(-18, @(47, 42, 90)), @(-12, @(62, 63, 126)), @(-6, @(90, 98, 168)), @(-3, @(154, 111, 166)), @(-0.833, @(224, 122, 95)),
  @(3, @(245, 154, 62)), @(8, @(255, 191, 79)), @(14, @(255, 211, 106)))
function Sky($h) {
  if ($h -le $SKY[0][0]) { return $SKY[0][1] }
  for ($i = 1; $i -lt $SKY.Count; $i++) { if ($h -lt $SKY[$i][0]) {
    $a = $SKY[$i - 1]; $b = $SKY[$i]; $x = ($h - $a[0]) / ($b[0] - $a[0])
    return @(0, 1, 2 | ForEach-Object { [int][Math]::Round($a[1][$_] + ($b[1][$_] - $a[1][$_]) * $x) }) } }
  return $SKY[-1][1]
}
function Hex($c) { "#{0:x2}{1:x2}{2:x2}" -f $c[0], $c[1], $c[2] }
# punkt tarczy: 0° po lewej, 90° u góry, zgodnie z ruchem wskazówek (jak pt() w js/main.js)
function P($a, $rad) { , @((256 - $rad * [Math]::Cos($a * $R)), (256 - $rad * [Math]::Sin($a * $R))) }   # uwaga: PowerShell nie rozróżnia $r i $R

# geometria w układzie 512×512; m < 1 = ikona maskowalna (wszystko w bezpiecznym kole 40% rozmiaru)
function Geo($m) {
  @{ R0 = 168 * $m; W = 52 * $m; sunR = 30 * $m; sunS = 7 * $m; tick = 6 * $m; hub = 15 * $m; hub2 = 6 * $m; hw = 8 * $m; tail = 26 * $m; tip = 150 * $m }
}
$BG = "#fff7ea"; $FG = "#2b2118"; $MUT = "#8a7863"; $SUN = "#f08a00"

function Png($size, $m, $path, $bgMode = "full") {   # $bgMode, nie $bg: PowerShell nie rozróżnia $bg i $BG
  $g0 = Geo $m; $k = $size / 512
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"; $g.PixelOffsetMode = "HighQuality"
  if ($bgMode -eq "full") { $g.Clear([System.Drawing.ColorTranslator]::FromHtml($BG)) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  $g.ScaleTransform($k, $k)
  if ($bgMode -eq "circle") { $cb = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($BG)); $g.FillEllipse($cb, 0, 0, 512, 512); $cb.Dispose() }
  $rr = $g0.R0; $rect = New-Object System.Drawing.RectangleF (256 - $rr), (256 - $rr), (2 * $rr), (2 * $rr)
  for ($a = 0; $a -lt 360; $a += 1.5) {
    $col = Sky (Alt ($a + 0.75)); $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($col[0], $col[1], $col[2])), $g0.W
    $g.DrawArc($pen, $rect, [single]($a + 180), [single]1.9); $pen.Dispose()
  }
  $tp = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($MUT)), $g0.tick
  $tp.StartCap = "Round"; $tp.EndCap = "Round"
  foreach ($a in 0, 90, 180, 270) { $p = P $a ($rr - $g0.W / 2 - 14 * $m); $q = P $a ($rr - $g0.W / 2 - 40 * $m); $g.DrawLine($tp, [single]$p[0], [single]$p[1], [single]$q[0], [single]$q[1]) }
  # wskazówka: wąski romb od ogona do czubka, w stronę Słońca
  $t = P $sunA $g0.tip; $b = P ($sunA + 180) $g0.tail; $nx = [Math]::Sin($sunA * $R) * $g0.hw; $ny = -[Math]::Cos($sunA * $R) * $g0.hw
  $pts = @((New-Object System.Drawing.PointF $t[0], $t[1]), (New-Object System.Drawing.PointF (256 + $nx), (256 + $ny)),
    (New-Object System.Drawing.PointF $b[0], $b[1]), (New-Object System.Drawing.PointF (256 - $nx), (256 - $ny)))
  $fb = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($FG)); $g.FillPolygon($fb, [System.Drawing.PointF[]]$pts)
  $g.FillEllipse($fb, [single](256 - $g0.hub), [single](256 - $g0.hub), [single](2 * $g0.hub), [single](2 * $g0.hub))
  $sb = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($SUN)); $bb = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($BG))
  $g.FillEllipse($sb, [single](256 - $g0.hub2), [single](256 - $g0.hub2), [single](2 * $g0.hub2), [single](2 * $g0.hub2))
  $s = P $sunA $rr; $o = $g0.sunR + $g0.sunS
  $g.FillEllipse($bb, [single]($s[0] - $o), [single]($s[1] - $o), [single](2 * $o), [single](2 * $o))
  $g.FillEllipse($sb, [single]($s[0] - $g0.sunR), [single]($s[1] - $g0.sunR), [single](2 * $g0.sunR), [single](2 * $g0.sunR))
  $g.Dispose(); $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}

function Svg($m, $path) {
  $g0 = Geo $m; $rr = $g0.R0; $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="' + $BG + '"/><g fill="none" stroke-width="' + $g0.W + '">')
  for ($a = 0; $a -lt 360; $a += 3) {
    $p = P $a $rr; $q = P ([Math]::Min(360, $a + 3.4)) $rr; $col = Hex (Sky (Alt ($a + 1.5)))
    [void]$sb.Append(('<path d="M{0:0.#} {1:0.#}A{2:0.#} {2:0.#} 0 0 1 {3:0.#} {4:0.#}" stroke="{5}"/>' -f $p[0], $p[1], $rr, $q[0], $q[1], $col))
  }
  [void]$sb.Append('</g><g stroke="' + $MUT + '" stroke-width="' + $g0.tick + '" stroke-linecap="round">')
  foreach ($a in 0, 90, 180, 270) { $p = P $a ($rr - $g0.W / 2 - 14 * $m); $q = P $a ($rr - $g0.W / 2 - 40 * $m); [void]$sb.Append(('<line x1="{0:0.#}" y1="{1:0.#}" x2="{2:0.#}" y2="{3:0.#}"/>' -f $p[0], $p[1], $q[0], $q[1])) }
  $t = P $sunA $g0.tip; $b = P ($sunA + 180) $g0.tail; $nx = [Math]::Sin($sunA * $R) * $g0.hw; $ny = -[Math]::Cos($sunA * $R) * $g0.hw; $s = P $sunA $rr
  [void]$sb.Append(('</g><path d="M{0:0.#} {1:0.#}L{2:0.#} {3:0.#}L{4:0.#} {5:0.#}L{6:0.#} {7:0.#}Z" fill="{8}"/>' -f $t[0], $t[1], (256 + $nx), (256 + $ny), $b[0], $b[1], (256 - $nx), (256 - $ny), $FG))
  [void]$sb.Append(('<circle cx="256" cy="256" r="{0:0.#}" fill="{1}"/><circle cx="256" cy="256" r="{2:0.#}" fill="{3}"/>' -f $g0.hub, $FG, $g0.hub2, $SUN))
  [void]$sb.Append(('<circle cx="{0:0.#}" cy="{1:0.#}" r="{2:0.#}" fill="{3}" stroke="{4}" stroke-width="{5:0.#}"/></svg>' -f $s[0], $s[1], $g0.sunR, $SUN, $BG, (2 * $g0.sunS)))
  [IO.File]::WriteAllText($path, $sb.ToString(), (New-Object System.Text.UTF8Encoding $false))
}


[System.Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
$Out = Join-Path $Root "assets"
Png 512 1 "$Out\icon-512.png"; Png 192 1 "$Out\icon-192.png"; Png 180 1 "$Out\apple-touch-icon.png"; Png 32 1 "$Out\favicon-32.png"
Png 512 0.78 "$Out\icon-maskable-512.png"; Png 192 0.78 "$Out\icon-maskable-192.png"
Svg 1 "$Out\icon.svg"

# Android: ikony (48–192 px), warstwa ikony adaptacyjnej (108 dp, rysunek w bezpiecznym kole 66 dp) i ekrany startowe
$res = Join-Path $Root "android\app\src\main\res"
if (Test-Path $res) {
  $dens = @{ mdpi = 1; hdpi = 1.5; xhdpi = 2; xxhdpi = 3; xxxhdpi = 4 }
  foreach ($d in $dens.Keys) {
    $px = [int](48 * $dens[$d]); $fgPx = [int](108 * $dens[$d]); $dir = Join-Path $res "mipmap-$d"
    Png $px 0.88 "$dir\ic_launcher.png"; Png $px 0.88 "$dir\ic_launcher_round.png" "circle"; Png $fgPx 0.62 "$dir\ic_launcher_foreground.png" "none"
  }
  # ekran startowy: kremowe tło i ikona na środku (rozmiary jak w szablonie Capacitora)
  $tmp = [IO.Path]::GetTempFileName()
  Get-ChildItem $res -Recurse -Filter splash.png | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName); $w = $img.Width; $h = $img.Height; $img.Dispose()
    $s = [int]([Math]::Min($w, $h) * 0.42); Png $s 1 $tmp "none"
    $bmp = New-Object System.Drawing.Bitmap $w, $h; $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml($BG)); $ic = [System.Drawing.Image]::FromFile($tmp)
    $g.DrawImage($ic, [int](($w - $s) / 2), [int](($h - $s) / 2), $s, $s); $ic.Dispose(); $g.Dispose()
    $bmp.Save($_.FullName, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
  }
  Remove-Item $tmp
  "android: ikony i ekrany startowe gotowe"
}
"assets: gotowe (dzień $([Math]::Round(2 * $H0))°)"