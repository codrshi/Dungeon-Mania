# Dungeon Mania

Dungeon Mania is a dice-based card game in which the player navigates a knight across a 7×7 board, with movement determined by the dice roll. The knight interacts with the card they land on -- monsters, weapons, potions, bombs, artifacts -- and the game ends when the knight escapes the Mage Realm or its health drains to zero.

![game snapshot](./src/public/asset/image/game_snapshot.png)

## How to Play

Roll the dice, then move the knight by that many tiles in any of the four cardinal directions. Interact with whatever card you land on:

- **Monsters** damage you (or, if you're holding a weapon, get slain).
- **Health potions** restore HP.
- **Bombs** detonate the moment you step on them and damage adjacent tiles.
- **Artifacts** trigger special effects

Pile up enough "aura" (passive XP from kills) to enter the **Mage Realm**, the boss arena with its own grid layout.

A full visual guide is available in-game under **Guide**.

---

## Play (recommended)

1. Download the zip from [Releases page](https://github.com/codrshi/Dungeon-Mania/releases):

   | OS | Asset |
   |---|---|
   | Windows | `DungeonMania-win-x64.zip` |
   | macOS | `DungeonMania-macos-x64.zip` (or `-arm64` on Apple Silicon) |
   | Linux | `DungeonMania-linux-x64.zip` |

2. Unzip and double-click on `dungeon-mania` (or `dungeon-mania.exe` on Windows). Your default browser will open the game automatically.

> **First-run security warnings.** The binaries are not yet code-signed.

### Where the save file lives

| OS | Path |
|---|---|
| Windows | `%LOCALAPPDATA%\Dungeon-Mania\Data\stats.json` |
| macOS | `~/Library/Application Support/Dungeon-Mania/stats.json` |
| Linux | `$XDG_DATA_HOME/Dungeon-Mania/stats.json` (defaults to `~/.local/share/Dungeon-Mania/stats.json`) |

Delete the file to reset your stats. The game will recreate it on next launch.

### Choose a different port / disable the auto-opened browser

The binary accepts the same CLI flags as the Node entry point:

```
dungeon-mania --port=4000 --no-browser --log-level=DEBUG
```

`PORT=4000 dungeon-mania` also works.

---

## Run with Docker

```
docker pull codrshi/dungeon-mania:latest
docker run -p 3030:3030 codrshi/dungeon-mania:latest
```

The game is then reachable at <http://localhost:3030>.

```
docker run -p 3030:3030 codrshi/dungeon-mania:latest --log-level=DEBUG
docker run -p 4000:4000 -e PORT=4000 codrshi/dungeon-mania:latest
```

> **Note**: stats persistence inside Docker writes to the container's filesystem, which is lost when the container is removed. Mount a volume at the user-data path above if you want stats to survive across container lifetimes.

---

## Configuring the log level

Supported flag forms (case-insensitive):

| Flag form | Example |
|---|---|
| `--log-level=<LEVEL>` | `--log-level=DEBUG` |
| `--log-level <LEVEL>` | `--log-level WARN` |
| `-l <LEVEL>` | `-l error` |

---

## Tech stack

- **Backend**: Express.js (Node.js 20+)
- **Frontend**: jQuery
- **Templating**: EJS
- **Styling**: hand-rolled pixel-art CSS theme
- **Packaging**: Node Single Executable Application (SEA) via esbuild + postject

---
