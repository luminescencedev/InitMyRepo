# Script PowerShell pour créer une release GitHub avec l'installeur
param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [string]$ReleaseNotes = "Nouvelle version de InitMyRepo"
)

Write-Host "🚀 Création de la release v$Version..." -ForegroundColor Green

# 1. Vérifier que Git est propre
$status = git status --porcelain
if ($status) {
    Write-Host "❌ Vous avez des changements non committés. Veuillez les committer d'abord." -ForegroundColor Red
    exit 1
}

# 2. Mettre à jour la version dans package.json
Write-Host "📝 Mise à jour de la version dans package.json..." -ForegroundColor Yellow
npm version $Version --no-git-tag-version

# 3. Committer les changements de version
git add package.json
git commit -m "chore: bump version to $Version"

# 4. Créer le tag
git tag -a "v$Version" -m "Release v$Version"

# 5. Construire l'application
Write-Host "🔨 Construction de l'application..." -ForegroundColor Yellow
npm run dist:win

# 6. Push les changements et le tag
Write-Host "⬆️ Push vers GitHub..." -ForegroundColor Yellow
git push origin main
git push origin "v$Version"

Write-Host "✅ Release v$Version créée avec succès!" -ForegroundColor Green
Write-Host "📦 L'installeur est disponible dans: dist/InitMyRepo-$Version-win-x64.exe" -ForegroundColor Cyan
Write-Host "🌐 Allez sur GitHub pour finaliser la release et uploader l'installeur." -ForegroundColor Cyan
