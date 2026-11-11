Add-Type -AssemblyName System.Drawing

function Create-GPayNuIcon {
    param([string]$path, [int]$size, [bool]$transparentBg, [bool]$showText)

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    if ($transparentBg) {
        $g.Clear([System.Drawing.Color]::Transparent)
    } else {
        $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#090D16"))
        $g.FillRectangle($bgBrush, 0, 0, $size, $size)
        $bgBrush.Dispose()
    }

    # Center shield/badge
    $badgeSize = [int]($size * 0.62)
    $badgeX = [int](($size - $badgeSize) / 2)
    $badgeY = if ($showText) { [int]($size * 0.16) } else { [int](($size - $badgeSize) / 2) }
    $radius = [int]($badgeSize * 0.28)

    # Outer cyan/indigo glow
    $glowPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#00D2FF"), [float]($size * 0.018))
    $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#151E32"))
    
    # Draw rounded rect for badge
    $rect = New-Object System.Drawing.Rectangle($badgeX, $badgeY, $badgeSize, $badgeSize)
    $pathGlow = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $pathGlow.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
    $pathGlow.AddArc($rect.X + $rect.Width - $d, $rect.Y, $d, $d, 270, 90)
    $pathGlow.AddArc($rect.X + $rect.Width - $d, $rect.Y + $rect.Height - $d, $d, $d, 0, 90)
    $pathGlow.AddArc($rect.X, $rect.Y + $rect.Height - $d, $d, $d, 90, 90)
    $pathGlow.CloseFigure()

    $g.FillPath($glowBrush, $pathGlow)
    $g.DrawPath($glowPen, $pathGlow)

    # Top accent cyan line
    $accentPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#10E7C3"), [float]($size * 0.015))
    $g.DrawLine($accentPen, ($badgeX + $radius), ($badgeY + 2), ($badgeX + $badgeSize - $radius), ($badgeY + 2))
    $accentPen.Dispose()

    # Draw G • ? monogram
    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $fontSize = [int]($badgeSize * 0.38)
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold)
    
    $textG = "G"
    $textDot = "•"
    $textNu = "?"

    $sizeG = $g.MeasureString($textG, $font)
    $sizeDot = $g.MeasureString($textDot, $font)
    $sizeNu = $g.MeasureString($textNu, $font)
    $totalW = $sizeG.Width + $sizeDot.Width + $sizeNu.Width - [int]($fontSize * 0.5)

    $startX = $badgeX + (($badgeSize - $totalW) / 2)
    $startY = $badgeY + (($badgeSize - $sizeG.Height) / 2) - [int]($badgeSize * 0.03)

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#F8FAFC"))
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#10E7C3"))
    $cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#00D2FF"))

    $g.DrawString($textG, $font, $whiteBrush, $startX, $startY)
    $dotX = $startX + $sizeG.Width - [int]($fontSize * 0.22)
    $g.DrawString($textDot, $font, $dotBrush, $dotX, $startY)
    $nuX = $dotX + $sizeDot.Width - [int]($fontSize * 0.22)
    $g.DrawString($textNu, $font, $cyanBrush, $nuX, $startY)

    if ($showText) {
        $titleFont = New-Object System.Drawing.Font($fontFamily, [int]($size * 0.075), [System.Drawing.FontStyle]::Bold)
        $subFont = New-Object System.Drawing.Font($fontFamily, [int]($size * 0.032), [System.Drawing.FontStyle]::Regular)

        $title = "G Pay.nu"
        $sub = "DEMO WALLET SIMULATOR"

        $titleSize = $g.MeasureString($title, $titleFont)
        $subSize = $g.MeasureString($sub, $subFont)

        $titleX = ($size - $titleSize.Width) / 2
        $titleY = $badgeY + $badgeSize + [int]($size * 0.04)
        $g.DrawString($title, $titleFont, $whiteBrush, $titleX, $titleY)

        $subX = ($size - $subSize.Width) / 2
        $subY = $titleY + $titleSize.Height + [int]($size * 0.01)
        $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#94A3B8"))
        $g.DrawString($sub, $subFont, $subBrush, $subX, $subY)

        $titleFont.Dispose()
        $subFont.Dispose()
        $subBrush.Dispose()
    }

    $glowPen.Dispose()
    $glowBrush.Dispose()
    $whiteBrush.Dispose()
    $dotBrush.Dispose()
    $cyanBrush.Dispose()
    $font.Dispose()
    $pathGlow.Dispose()
    $g.Dispose()

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Generated: $path"
}

# 1. Main app icon
Create-GPayNuIcon -path "assets/images/icon.png" -size 1024 -transparentBg $false -showText $true

# 2. Android adaptive foreground
Create-GPayNuIcon -path "assets/images/android-icon-foreground.png" -size 1024 -transparentBg $true -showText $false

# 3. Android adaptive background
$bgBmp = New-Object System.Drawing.Bitmap(1024, 1024)
$bgG = [System.Drawing.Graphics]::FromImage($bgBmp)
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#090D16"))
$bgG.FillRectangle($bgBrush, 0, 0, 1024, 1024)
$bgBrush.Dispose()
$bgG.Dispose()
$bgBmp.Save("assets/images/android-icon-background.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bgBmp.Dispose()
Write-Output "Generated: assets/images/android-icon-background.png"

# 4. Splash screen icon
Create-GPayNuIcon -path "assets/images/splash-icon.png" -size 512 -transparentBg $true -showText $true

