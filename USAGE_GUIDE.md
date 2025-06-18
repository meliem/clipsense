# 🚀 ClipSense - Guide d'Utilisation Complet

## 🏃‍♂️ Lancement de l'Application

### 1. Mode Développement
```bash
npm run dev
```
Lance l'application en mode développement avec rechargement automatique.

### 2. Application Compilée (Local)
```bash
# 1. Build l'application
npm run build

# 2. Lance l'application compilée
npm run start
# OU
npm run preview
# OU directement avec electron
npx electron .
```

### 3. Test Rapide de l'App
```bash
npm run app:dev
```
Build + lance l'application immédiatement.

## 📦 Création d'Exécutables (Releases)

### 🔧 Commandes Disponibles

#### Builds de Développement
```bash
# Crée un dossier exécutable (non-packagé)
npm run app:dir

# Build standard sans packaging
npm run app:dist
```

#### Releases par Plateforme
```bash
# 🍎 macOS (.dmg + .zip)
npm run release:mac

# 🪟 Windows (.exe + portable)
npm run release:win  

# 🐧 Linux (.AppImage + .deb + .rpm)
npm run release:linux

# 🌍 Toutes les plateformes
npm run release:all
```

### 📁 Fichiers Générés

Les exécutables seront créés dans le dossier `release/` :

```
release/
├── ClipSense-1.0.0-mac-universal.dmg     # Installateur macOS
├── ClipSense-1.0.0-mac-universal.zip     # Archive macOS  
├── ClipSense-1.0.0-win-x64.exe          # Installateur Windows
├── ClipSense-1.0.0-win-x64-portable.exe # Portable Windows
├── ClipSense-1.0.0-linux-x64.AppImage   # Portable Linux
├── ClipSense-1.0.0-linux-x64.deb        # Package Debian/Ubuntu
└── ClipSense-1.0.0-linux-x64.rpm        # Package RedHat/Fedora
```

## 🎯 Releases GitHub Automatiques

### Configuration GitHub Actions

Créez `.github/workflows/release.yml` :

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build and release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run build
          npm run app:dist
```

### 🏷️ Créer une Release

```bash
# 1. Tagger une version
git tag v1.0.0
git push origin v1.0.0

# 2. OU créer manuellement sur GitHub
# Aller sur GitHub > Releases > Create new release
# Tag: v1.0.0
# Titre: ClipSense v1.0.0
# Description: Première release stable
```

### 📤 Publication Manuelle

```bash
# Build toutes les plateformes
npm run release:all

# Upload manuellement sur GitHub Releases
# Ou utiliser gh CLI:
gh release create v1.0.0 release/* --title "ClipSense v1.0.0" --notes "Première release stable"
```

## 🛠️ Dépannage

### ❌ Problèmes Courants

**1. Erreur SQLite :**
```bash
npm rebuild better-sqlite3
```

**2. Permissions macOS :**
- Codesign requis pour distribution
- Ajoutez des certificats de développeur

**3. Icônes manquantes :**
- Créez les icônes dans `resources/`
- Format: `.icns` (mac), `.ico` (win), `.png` (linux)

**4. Antivirus Windows :**
- Les exécutables non-signés peuvent déclencher des alertes
- Utilisez un certificat de signature de code

### 🔍 Debug Build

```bash
# Mode verbose
DEBUG=electron-builder npm run release:mac

# Vérifier les fichiers inclus
npm run app:dir
# Regarder dans release/mac/ClipSense.app/Contents/Resources/app/
```

## 📋 Checklist Release

- [ ] Tests passent : `npm test`
- [ ] Build réussit : `npm run build` 
- [ ] App fonctionne : `npm run app:dev`
- [ ] Version mise à jour dans `package.json`
- [ ] CHANGELOG.md mis à jour
- [ ] Icônes présentes dans `resources/`
- [ ] Tag git créé
- [ ] Release GitHub publiée

## 🎨 Personnalisation

### Icônes d'Application

Placez vos icônes dans `resources/` :
- `icon.icns` - macOS (512x512)  
- `icon.ico` - Windows (256x256)
- `icon.png` - Linux (512x512)

### Configuration Build

Modifiez la section `"build"` dans `package.json` :
- `appId` - Identifiant unique de l'app
- `productName` - Nom affiché 
- `directories.output` - Dossier de sortie
- `publish` - Configuration auto-update

## 🚀 Distribution

### App Store / Microsoft Store
- Nécessite comptes développeur payants
- Processus de validation
- Signature de code obligatoire

### Distribution Web
```bash
# Créer un site de téléchargement
# Héberger les releases
# Mettre à jour les liens automatiquement
```

---

**🎉 Votre ClipSense est maintenant prêt pour la distribution !**