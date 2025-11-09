# 📦 Version Management Guide

This guide explains how to view and manage versions in OverLearn.

## 📍 Current Version

**v0.1.0**

The version is defined in three places:
- `package.json` (JavaScript/Next.js)
- `src-tauri/Cargo.toml` (Rust/Tauri)
- `src-tauri/tauri.conf.json` (App bundle metadata)

---

## 🔍 How to View the Version

### **1. In the Running Application**

The easiest way is to use the `<AppVersion />` component:

```tsx
import { AppVersion } from "@/components/ui/app-version";

export function MyComponent() {
  return (
    <footer>
      <AppVersion />
    </footer>
  );
}
```

This will display:
- **🦀 Native v0.1.0** - When running in Tauri
- **🌐 Web v0.1.0** - When running in browser

### **2. From Browser Console (Tauri)**

When running the Tauri app, open DevTools (F12):

```javascript
// Get version from Rust backend
const { invoke } = window.__TAURI__.core;
const version = await invoke('get_app_version');
console.log('Version:', version);
```

### **3. From Terminal**

```bash
# JavaScript version
node -p "require('./package.json').version"

# Rust version
grep '^version' src-tauri/Cargo.toml | head -1

# Tauri config version
grep '"version"' src-tauri/tauri.conf.json | head -1
```

### **4. After Building**

```bash
# For .deb package
dpkg -I src-tauri/target/release/bundle/deb/overlearn_*.deb | grep Version

# For installed app
overlearn --version  # (if supported)
```

---

## 🔄 How to Update the Version

### **Method 1: Automatic (Recommended)**

Use the provided bump-version script:

```bash
# Bump patch version (0.1.0 → 0.1.1)
./scripts/bump-version.sh patch

# Bump minor version (0.1.0 → 0.2.0)
./scripts/bump-version.sh minor

# Bump major version (0.1.0 → 1.0.0)
./scripts/bump-version.sh major

# Set specific version
./scripts/bump-version.sh 1.5.2
```

This automatically updates all three files.

### **Method 2: Manual**

1. **Update package.json**:
```bash
npm version 0.2.0 --no-git-tag-version
```

2. **Update src-tauri/Cargo.toml**:
```toml
[package]
version = "0.2.0"  # Change this line
```

3. **Update src-tauri/tauri.conf.json**:
```json
{
  "version": "0.2.0",  // Change this line
  ...
}
```

---

## 🏷️ Version Workflow

### Standard Release Process

```bash
# 1. Bump version
./scripts/bump-version.sh minor

# 2. Review changes
git diff

# 3. Commit version bump
git add .
git commit -m "chore: bump version to 0.2.0"

# 4. Create git tag
git tag v0.2.0

# 5. Build release
npm run tauri:build

# 6. Push to remote (including tags)
git push origin main --tags
```

---

## 📊 Version Scheme (Semantic Versioning)

OverLearn follows [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
  │      │     │
  │      │     └─── Bug fixes, minor changes (0.1.0 → 0.1.1)
  │      └─────────── New features, backwards compatible (0.1.0 → 0.2.0)
  └────────────────── Breaking changes (0.1.0 → 1.0.0)
```

### Examples

- **0.1.0 → 0.1.1**: Fixed notification bug
- **0.1.0 → 0.2.0**: Added dark mode feature
- **0.1.0 → 1.0.0**: Redesigned entire database schema (breaking)

---

## 🔧 Displaying Version in UI

### Example: Add to Profile Page

```tsx
// src/app/profile/page.tsx
import { AppVersion } from "@/components/ui/app-version";

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>

      {/* ... other content ... */}

      <div className="mt-8 border-t pt-4">
        <AppVersion />
      </div>
    </div>
  );
}
```

### Example: Add to Footer

```tsx
// src/components/layout/footer.tsx
import { AppVersion } from "@/components/ui/app-version";

export function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="container flex justify-between">
        <p>OverLearn © 2025</p>
        <AppVersion />
      </div>
    </footer>
  );
}
```

---

## 🐛 Troubleshooting

### Version Mismatch Between Files

If versions are out of sync:

```bash
# Check all versions
echo "package.json: $(node -p 'require(\"./package.json\").version')"
echo "Cargo.toml: $(grep '^version' src-tauri/Cargo.toml | cut -d'"' -f2)"
echo "tauri.conf.json: $(grep '\"version\"' src-tauri/tauri.conf.json | cut -d'"' -f4)"
```

Then use the bump script to sync them:

```bash
./scripts/bump-version.sh 0.1.0  # Set all to same version
```

### "Unknown" Version in UI

If the app shows "unknown", check:

1. **Environment variable loaded**:
```bash
echo $NEXT_PUBLIC_APP_VERSION
```

2. **Restart dev server** after changing next.config.ts

3. **Clear Next.js cache**:
```bash
rm -rf .next
npm run dev
```

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2025-11-03 | Initial release with Tauri support |

---

## 🔗 Related Files

- **Component**: `src/components/ui/app-version.tsx`
- **Config**: `next.config.ts` (exposes version as env var)
- **Script**: `scripts/bump-version.sh`
- **Tauri Command**: `src-tauri/src/commands.rs` (`get_app_version`)
- **TypeScript Bindings**: `src/lib/tauri.ts`

---

**💡 Tip**: Always keep versions in sync across all three files. Use the automated script to avoid mistakes!
