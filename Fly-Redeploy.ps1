param(
  [string]$RepoRoot = "C:\Users\theos\OneDrive\My Documents\NASA\Projects\Oramax\oramax-landing",
  [string]$AppName  = "oramax-ui"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Die($m){ Write-Error $m; exit 1 }

if (-not (Test-Path -LiteralPath $RepoRoot)) { Die "Repo not found: $RepoRoot" }
Set-Location $RepoRoot

# --- helpers ---
function Write-NoBom($Path, $Content) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

# --- Dockerfile (0.0.0.0:8080) ---
$dockerfile = @'
# --- Build stage ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Run stage ---
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app ./
ENV PORT=8080
EXPOSE 8080
CMD ["npm","run","start","--","-p","8080","-H","0.0.0.0"]
'@
Write-NoBom (Join-Path $RepoRoot 'Dockerfile') $dockerfile

# --- fly.toml ---
$flyToml = @"
app = "$AppName"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]
"@
Write-NoBom (Join-Path $RepoRoot 'fly.toml') $flyToml

# --- Fly CLI ---
try { fly version | Out-Null } catch { Die "Fly CLI not found." }

# Αν δεν είσαι logged in, κάνε login
fly auth whoami | Out-Null
if ($LASTEXITCODE -ne 0) { fly auth login }

# Έλεγχος ύπαρξης app ΧΩΡΙΣ να διαβάζουμε το fly.toml
fly apps show $AppName | Out-Null
if ($LASTEXITCODE -ne 0) {
  fly apps create $AppName
}

# Deploy χρησιμοποιώντας ρητά το app name (ώστε να αγνοηθεί τυχόν προβληματικό toml)
fly deploy -a $AppName

Write-Host "✅ Fly redeploy OK"
