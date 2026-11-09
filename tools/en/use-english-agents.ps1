# Installs the English AGENTS.override.md files for readers of the English
# edition of "Developing with Codex" (see README.en.md). Windows PowerShell 5.1
# and PowerShell 7. Same behavior as tools/en/use-english-agents.sh.
#
#   powershell -ExecutionPolicy Bypass -File tools\en\use-english-agents.ps1
#   powershell -ExecutionPolicy Bypass -File tools\en\use-english-agents.ps1 -Remove
#
# On a chapter branch made from an older tag (where tools\en\ does not exist):
#   git show main:tools/en/use-english-agents.ps1 > $env:TEMP\use-english-agents.ps1
#   powershell -ExecutionPolicy Bypass -File $env:TEMP\use-english-agents.ps1
#
# An override is installed only next to an existing AGENTS.md, and its text
# matches the version of that AGENTS.md at the checked-out tag. Run the script
# again after switching to another tag. Files that do not carry the marker of
# this script (your own overrides) are never touched.
param(
  [switch]$Remove,
  [string]$Ref = $(if ($env:ROOMBOOK_EN_REF) { $env:ROOMBOOK_EN_REF } else { 'main' })
)
# native git calls report through $LASTEXITCODE; .NET errors still terminate
$ErrorActionPreference = 'Continue'
$marker = 'tools/en/use-english-agents.sh'

# --show-cdup is ASCII ("../.." or empty), so non-ASCII paths survive PS 5.1
$cdup = (& git rev-parse --show-cdup)
if ($LASTEXITCODE -ne 0) { throw 'not inside a git repository' }
if ($cdup) { Set-Location -LiteralPath $cdup }
$root = (Get-Location).ProviderPath

$pairs = @(
  @{ Name = 'root';       Dir = '.' },
  @{ Name = 'apps-api';   Dir = 'apps/api' },
  @{ Name = 'apps-web';   Dir = 'apps/web' },
  @{ Name = 'legacy-php'; Dir = 'legacy-php' }
)
# English file for a given Ukrainian AGENTS.md (blob hash, first 7 characters)
$variants = @{
  'root:fcf330d'       = 'by-tag/root.ch05-end'        # ch05-end..ch09-end
  'root:183a7c0'       = 'by-tag/root.ch10-end'        # ch10-end
  'apps-api:bead703'   = 'by-tag/apps-api.ch05-end'    # ch05-end..ch11-end
  'apps-api:e08bb74'   = 'by-tag/apps-api.ch12-end'    # ch12-end
  'apps-api:c284b38'   = 'by-tag/apps-api.ch13-end'    # ch13-end..ch14-end
  'legacy-php:e968bc5' = 'by-tag/legacy-php.ch05-end'  # ch05-end..ch06-end
  'legacy-php:8b4ab36' = 'by-tag/legacy-php.ch07-end'  # ch07-end..ch10-end
  'root:0fe1c6d'       = 'root'
  'apps-api:6f180a3'   = 'apps-api'
  'apps-web:e0f3d74'   = 'apps-web'
  'legacy-php:038051c' = 'legacy-php'
}
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Get-EnglishOverride([string]$name) {
  $rel = "tools/en/agents/$name.AGENTS.override.md"
  if (Test-Path -LiteralPath $rel) {
    return [System.IO.File]::ReadAllText((Join-Path $root $rel), $utf8)
  }
  foreach ($r in @($Ref, "origin/$Ref")) {
    & git cat-file -e "${r}:$rel" 2>$null
    if ($LASTEXITCODE -eq 0) {
      $lines = & git show "${r}:$rel"
      return (($lines -join "`n") + "`n")
    }
  }
  throw "cannot find $rel in the working tree, $Ref or origin/$Ref"
}

function Test-Ours([string]$path) {
  (Test-Path -LiteralPath $path) -and
    ([System.IO.File]::ReadAllText((Join-Path $root $path), $utf8).Contains($marker))
}

foreach ($p in $pairs) {
  $dir = $p.Dir
  $target = if ($dir -eq '.') { 'AGENTS.override.md' } else { "$dir/AGENTS.override.md" }
  $agents = if ($dir -eq '.') { 'AGENTS.md' } else { "$dir/AGENTS.md" }

  if ($Remove -or -not (Test-Path -LiteralPath $agents)) {
    if (Test-Ours $target) {
      Remove-Item -LiteralPath $target -Force
      Write-Output "removed   $target"
    } elseif (Test-Path -LiteralPath $target) {
      Write-Output "kept      $target (not created by this script)"
    } elseif (-not $Remove) {
      Write-Output "skipped   $target (no $agents at this commit)"
    }
    continue
  }

  if ((Test-Path -LiteralPath $target) -and -not (Test-Ours $target)) {
    Write-Output "kept      $target (your own override; delete it to use the English one)"
    continue
  }
  $hash = (& git hash-object -- $agents)
  $key = "$($p.Name):$($hash.Substring(0, 7))"
  $src = $variants[$key]
  if (-not $src) {
    $src = $p.Name
    Write-Output "note: $agents differs from every tagged version; using the main translation"
  }
  $text = Get-EnglishOverride $src
  [System.IO.File]::WriteAllText((Join-Path $root $target), $text, $utf8)
  Write-Output "installed $target  <- tools/en/agents/$src.AGENTS.override.md"
}

if (-not $Remove -and (Test-Path -LiteralPath 'AGENTS.override.md')) {
  & git check-ignore -q AGENTS.override.md
  if ($LASTEXITCODE -ne 0) {
    Write-Warning 'AGENTS.override.md is not in .gitignore at this commit; do not commit it'
  }
}
Write-Output 'Check: codex --ask-for-approval never "Summarize the current instructions."'
