# 🚀 Guide des Releases Automatiques GitHub

## 🎯 **3 Méthodes pour Créer des Releases**

### 1. **🤖 Releases Automatiques (Recommandé)**

#### Étape 1: Pousser le code sur GitHub
```bash
git push origin main
```

#### Étape 2: Créer un tag de version
```bash
# Version patch (1.0.0 → 1.0.1)
git tag v1.0.1
git push origin v1.0.1

# Version minor (1.0.1 → 1.1.0)  
git tag v1.1.0
git push origin v1.1.0

# Version major (1.1.0 → 2.0.0)
git tag v2.0.0  
git push origin v2.0.0
```

#### ✨ **Ce qui se passe automatiquement :**
- GitHub Actions détecte le tag `v*`
- Build sur 3 plateformes en parallèle (Windows, macOS, Linux)
- Création automatique de la release GitHub
- Upload des exécutables (.exe, .dmg, .AppImage, etc.)
- Utilisateurs peuvent télécharger immédiatement

---

### 2. **🔧 Releases Manuelles avec Upload Auto**

```bash
# Génère ET upload automatiquement
npm run release:all:publish

# Ou par plateforme
npm run release:win:publish    # Windows
npm run release:mac:publish    # macOS  
npm run release:linux:publish  # Linux
```

**Prérequis :** Token GitHub configuré
```bash
export GH_TOKEN=ghp_your_token_here
```

---

### 3. **📤 Releases Manuelles**

```bash
# 1. Générer les exécutables
npm run release:all

# 2. Créer manuellement la release sur GitHub
# Aller sur: https://github.com/meliem/clipsense/releases
# - Create new release
# - Tag: v1.0.1
# - Upload files from release/ folder
```

---

## 🏷️ **Workflow Complet (Méthode Automatique)**

### 1. **Développement**
```bash
# Développer et tester
npm run dev

# Commit des changements
git add .
git commit -m "Add new features"
git push origin main
```

### 2. **Release**
```bash
# Mettre à jour la version dans package.json
npm version patch  # ou minor, major

# Pousser le tag (déclenche l'automatisation)
git push origin main --tags
```

### 3. **✅ Résultat Automatique**
- Release créée sur GitHub
- Exécutables disponibles :
  - `ClipSense-1.0.1-mac-universal.dmg`
  - `ClipSense-1.0.1-win-x64.exe` 
  - `ClipSense-1.0.1-linux-x64.AppImage`
  - + formats additionnels (.zip, .deb, .rpm, etc.)

---

## 🔧 **Configuration Requise**

### GitHub Repository Settings
1. **Actions** activées (Settings > Actions > Allow all actions)
2. **Read and write permissions** pour GITHUB_TOKEN (Settings > Actions > Workflow permissions)

### Optionnel: Token Personnel
Pour plus de contrôle, créez un token GitHub :
1. GitHub > Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Scopes: `repo`, `write:packages`
4. Ajoutez dans Secrets : `Settings > Secrets > Actions > New secret`
   - Name: `GH_TOKEN`
   - Value: `ghp_...`

---

## 📋 **Exemple Workflow Complet**

```bash
# 1. Finaliser la version
git add .
git commit -m "Ready for v1.0.1 release"

# 2. Bump version (met à jour package.json + crée tag)
npm version patch

# 3. Push (déclenche GitHub Actions)
git push origin main --tags

# 4. ✅ Attendre 5-10 minutes
# Les releases apparaissent automatiquement sur :
# https://github.com/meliem/clipsense/releases
```

---

## 🎯 **Avantages des Releases Automatiques**

- ✅ **Zéro intervention manuelle**
- ✅ **Build sur les 3 plateformes** simultanément
- ✅ **Cohérence** des builds
- ✅ **Téléchargements immédiats** pour les utilisateurs
- ✅ **Historique automatique** des versions
- ✅ **Notifications** aux followers du repo

---

**🎉 Une fois configuré, vos releases se font en 30 secondes !**