# NoPazazKit

NoPazazKit is a desktop client built with Electron and JavaScript for **NoPazazScape**, a private server built on the [LostCityLabs / Lost Citizens](https://www.lostcitylabs.com) codebase. It wraps the game in a native desktop app and adds a set of quality-of-life tools around it: world switching, an AFK/countdown stopwatch, screenshot capture, notes, content-creator notifications, quick-login accounts, and shortcuts to highscores, guides, and other reference tools.

Originally based on 05x Client by Akg, modified by Blackberry to point at NoPazazScape / Lost Citizens.

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
- Windows or Linux to produce a native installer (see [Building installers](#building-installers)). macOS can run the app from source but there's no packaged build for it.

## Getting the source

```
git clone https://github.com/baddatamusic/NoPazazKit.git
cd NoPazazKit
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
Produces `dist/NoPazazKit by Blackberry-Setup-<version>.exe` (NSIS installer, both x86 and x64).

**Linux** (run on Linux):
```
npm run build:linux
```
Produces `dist/NoPazazKit by Blackberry-<version>.AppImage`.

Both scripts wrap `electron-builder`; see `package.json`'s `build` block for the full configuration (icons, appId, NSIS options, etc.).

## Installing a built release

### Windows
Run the `.exe` installer, pick an install folder, and launch NoPazazKit from the Start Menu shortcut it creates.

### Linux
Download the `.AppImage`, mark it executable (`chmod +x`), and run it directly — no install step needed.

### macOS
No prebuilt installer is provided. Clone the repo and run it from source (see [Running in development](#running-in-development)) — it works, but you'll need to `git pull` and restart manually to pick up changes, since there's no auto-updater.

## Local data

NoPazazKit stores its settings and per-feature data in your OS user-data directory (e.g. `%APPDATA%` on Windows), independent of the install location:

| File / folder | Purpose |
|---|---|
| `.nopazaz-kit-settings.json` | Window state, last world, zoom, accounts, nav visibility, etc. |
| `.nopazaz-kit-stopwatch-config.json` | Stopwatch/AFK timer configuration |
| `.nopazaz-kit-notes.json` | Notes window contents |
| `nopazaz-kit/sounds/` | Custom alert/screenshot sound files |

Deleting these resets the app to defaults; nothing under the install directory itself needs to be touched.

## Contributing

Issues and pull requests are welcome. Please avoid committing anything under `node_modules/`, `out/`, or `dist/` — these are already covered by `.gitignore`.

## License

This project is licensed under the GNU General Public License v3.0 — see [LICENSE](LICENSE).
