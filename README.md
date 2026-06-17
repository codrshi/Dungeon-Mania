# Dungeon Mania

Dungeon Mania is a dice-based card game in which the player navigates a knight across a 7×7 board, with movement determined by the dice roll. The knight interacts with the card they land on -- monsters, weapons, potions, bombs, artifacts -- and the game ends when the knight's health hits zero.

![game snapshot](./src/public/asset/image/game_snapshot.png)

## How to Play

Roll the dice, then move the knight by that many tiles in any of the four cardinal directions. Interact with whatever card you land on:

- **Monsters** damage you (or, if you're holding a weapon, get slain).
- **Health potions** restore HP.
- **Bombs** detonate the moment you step on them and damage adjacent tiles.
- **Artifacts** trigger special effects -- a mana stone clears a monster, a chaos orb reshuffles the grid, an enigma elixir grants temporary invincibility, and so on.

Pile up enough "aura" (passive XP from kills) to enter the **Mage Realm**, the boss arena with its own grid layout.

A full visual guide is available in-game under **Guide**.

---

## Play (recommended)

The fastest way to play -- no Node, no Docker, no terminal required.

1. Open the [Releases page](https://github.com/codrshi/Dungeon-Mania/releases) and download the zip for your OS:

   | OS | Asset |
   |---|---|
   | Windows | `DungeonMania-win-x64.zip` |
   | macOS | `DungeonMania-macos-x64.zip` (or `-arm64` on Apple Silicon) |
   | Linux | `DungeonMania-linux-x64.zip` |

2. Unzip anywhere.

3. Double-click `dungeon-mania` (or `dungeon-mania.exe` on Windows). Your default browser will open the game automatically.

> **First-run security warnings.** The binaries are not yet code-signed.
> - On Windows you'll see a SmartScreen prompt -- click *More info* → *Run anyway*.
> - On macOS you'll see a Gatekeeper warning -- right-click the binary, choose *Open*, and confirm once.
>
> Both prompts only appear on the first run.

### Where the save file lives

Lifetime stats and your randomly-assigned player name are persisted to a single `stats.json` file in your OS's user-data directory:

| OS | Path |
|---|---|
| Windows | `%LOCALAPPDATA%\Dungeon-Mania\Data\stats.json` |
| macOS | `~/Library/Application Support/Dungeon-Mania/stats.json` |
| Linux | `$XDG_DATA_HOME/Dungeon-Mania/stats.json` (defaults to `~/.local/share/Dungeon-Mania/stats.json`) |

**To reset your stats** (start over from a blank slate), just delete that file. The game will recreate it on next launch with a fresh name and zeroed counters.

### Choose a different port / disable the auto-opened browser

The binary accepts the same CLI flags as the Node entry point:

```
dungeon-mania --port=4000 --no-browser --log-level=DEBUG
```

`PORT=4000 dungeon-mania` also works.

---

## Run with Docker

Best for Linux servers, headless boxes, and quick containerized smoke tests.

```
docker pull codrshi/dungeon-mania:latest
docker run -p 3030:3030 codrshi/dungeon-mania:latest
```

The game is then reachable at <http://localhost:3030>.

The container always runs with `--no-browser` (there's no display inside Docker), so the auto-open behaviour is suppressed. Any extra flags after the image name are passed straight through to `node src/server.js`:

```
docker run -p 3030:3030 codrshi/dungeon-mania:latest --log-level=DEBUG
docker run -p 4000:4000 -e PORT=4000 codrshi/dungeon-mania:latest
```

> **Note**: stats persistence inside Docker writes to the container's filesystem, which is lost when the container is removed. Mount a volume at the user-data path above if you want stats to survive across container lifetimes.

---

## Develop locally

For hacking on the source.

Prerequisites: **Node.js 20+** and **npm**.

```
git clone https://github.com/codrshi/Dungeon-Mania.git
cd Dungeon-Mania
npm install
npm start                       # or `npm run dev` for nodemon hot-reload
```

Browser auto-opens at <http://localhost:3030>. Pass flags via npm's `--`:

```
npm start -- --log-level=DEBUG
npm start -- -l warn --no-browser --port=4000
```

### Build your own SEA binary

```
npm run build:sea
```

Produces `build/DungeonMania-<os>-<arch>.zip` for the host OS. The zip contains the executable plus a sibling `public/` and `template/` folder -- those are the runtime assets the binary loads from disk.

### Cutting a release

Push a `v*` tag and the [release workflow](.github/workflows/release.yml) builds all three OS zips in parallel and attaches them to a new GitHub Release:

```
git tag v1.0.0
git push origin v1.0.0
```

---

## Configuring the log level

The server emits four log levels -- `ERROR`, `WARN`, `INFO`, `DEBUG` -- and prints everything from the chosen level upwards in severity. The default is `INFO`, so `ERROR`, `WARN` and `INFO` are shown but `DEBUG` chatter is suppressed.

Supported flag forms (case-insensitive value):

| Flag form | Example |
|---|---|
| `--log-level=<LEVEL>` | `--log-level=DEBUG` |
| `--log-level <LEVEL>` | `--log-level WARN` |
| `-l <LEVEL>` | `-l error` |

Invalid values are ignored with a warning and the default is kept. The first `INFO` line on startup confirms the resolved level, e.g.:

```
[2026-06-17T...] [INFO] : game started on http://localhost:3030/ (log level = DEBUG)
```

---

## Tech stack

- **Backend**: Express.js (Node.js 20+)
- **Frontend**: jQuery
- **Templating**: EJS
- **Styling**: hand-rolled pixel-art CSS theme
- **Packaging**: Node Single Executable Application (SEA) via esbuild + postject

---

## Caveats (player-facing)

- **No code signing yet.** Windows SmartScreen and macOS Gatekeeper will warn on first launch -- see *Play* above for how to dismiss them.
- **No auto-update.** Grab newer releases from the [Releases page](https://github.com/codrshi/Dungeon-Mania/releases).
- **Antivirus false positives.** Some Defender configurations occasionally quarantine SEA binaries; allow-list the executable if that happens.
- **One game per browser tab.** The server holds a single in-memory game state, so opening multiple tabs against the same binary will let them interfere.
