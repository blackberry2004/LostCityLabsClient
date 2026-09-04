# LostCitizensKit

LostCitizensKit is a desktop client built with Electron and JavaScript for **LostCitizensScape**, a private server built on the [LostCityLabs / Lost Citizens](https://www.lostcitylabs.com) codebase. It wraps the game in a native desktop app and adds a set of quality-of-life tools around it: world switching, an AFK/countdown stopwatch, screenshot capture, notes, content-creator notifications, quick-login accounts, and shortcuts to highscores, guides, and other reference tools.

Originally based on 05x Client by Akg, modified by Blackberry to point at LostCitizensScape / Lost Citizens.

## Features

- **World switcher** — jump between World 1–4 without leaving the app.
- **Highscores, Clue Help, World Map, Quest Guides, Skill Guides, Skills Calculator, Bestiary, Item Database** — reference tools open in their own tabs alongside the game.
- **Stopwatch / AFK timer** — countdown, stopwatch, and AFK-detection modes, with an optional alert sound and a live timer shown right in the window title.
- **Screenshot capture** — one-key screenshots, auto-sorted into a folder per world, with an optional capture sound.
- **Notes** — a small persistent scratchpad window.
- **Creator notifications** — desktop notifications when tracked YouTube creators go live or post a new video.
- **Quick-login accounts** — store multiple accounts and hop between them with hotkeys.
- **Collapsible / strip-mode nav panel**, per-tab zoom, and a few other window-management niceties.

## Requirements

- [Node.js](https://nodejs.org) 18 or newer (CI builds on Node 22)
- [Git](https://git-scm.com)
- Windows, Linux, or macOS to produce a native installer for that platform (see [Installers](#installers-electron-builder)) — electron-builder can't cross-compile a Linux or macOS build from Windows, or vice versa.

## Getting the source

```
git clone https://github.com/baddatamusic/LostCitizensKit.git
cd LostCitizensKit
npm install
```

## Running in development

```
npm start
```

This launches the app via Electron Forge with live settings/logging, without producing an installer.

## Compiling / building

There are two separate build paths in this repo — pick whichever fits what you need.

### Quick package (Electron Forge)

```
npm run package
```

Produces an unpacked, runnable build of the app for your current OS/arch under `out/`.

To also produce distributable artifacts (a zip, on the current platform) via Forge's makers:

```
npm run make
```

Output lands in `out/make/`.

### Installers (electron-builder)

These produce a proper installer and must be run on the target OS (electron-builder doesn't cross-compile a Windows installer from Linux or vice versa).

**Windows** (run on Windows):
```
npm run build:win
```
Produces `dist/LostCitizensKit by Blackberry-Setup-<version>.exe` (NSIS installer, both x86 and x64).

**Linux** (run on Linux):
```
npm run build:linux
```
Produces `dist/LostCitizensKit by Blackberry-<version>.AppImage`.

**macOS** (run on macOS):
```
npm run build:mac
```
Produces a `.dmg` and `.zip` for both Intel and Apple Silicon under `dist/`. The build is unsigned (no Apple Developer ID certificate configured) — see the [macOS install note](#macos) below.

All three scripts wrap `electron-builder`; see `package.json`'s `build` block for the full configuration (icons, appId, NSIS options, etc.). CI (`.github/workflows/release.yml`) builds all three automatically on their respective OS runners whenever a `v*` tag is pushed, and attaches the artifacts to a GitHub Release.

## Installing a built release

### Windows
Run the `.exe` installer, pick an install folder, and launch LostCitizensKit from the Start Menu shortcut it creates.

### Linux
Download the `.AppImage`, mark it executable (`chmod +x`), and run it directly — no install step needed.

### macOS
Open the `.dmg` and drag LostCitizensKit into Applications (or unzip the `.zip` build). The app is **unsigned** (no Apple Developer ID certificate), so Gatekeeper will refuse to open it with a normal double-click the first time. Instead, right-click the app → **Open** → confirm in the dialog that appears, which only needs to be done once. If macOS still reports it as damaged, clear the quarantine flag from Terminal: `xattr -cr /Applications/LostCitizensKit\ by\ Blackberry.app`.

## Local data

LostCitizensKit stores its settings and per-feature data in your OS user-data directory (e.g. `%APPDATA%` on Windows), independent of the install location:

| File / folder | Purpose |
|---|---|
| `.lostcitizens-kit-settings.json` | Window state, last world, zoom, accounts, nav visibility, etc. |
| `.lostcitizens-kit-stopwatch-config.json` | Stopwatch/AFK timer configuration |
| `.lostcitizens-kit-notes.json` | Notes window contents |
| `lostcitizens-kit/sounds/` | Custom alert/screenshot sound files |

Deleting these resets the app to defaults; nothing under the install directory itself needs to be touched.

## Contributing

Issues and pull requests are welcome. Please avoid committing anything under `node_modules/`, `out/`, or `dist/` — these are already covered by `.gitignore`.

## License

This project is licensed under the GNU General Public License v3.0 — see [LICENSE](LICENSE).
