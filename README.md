# AG1

A side-scrolling pixel-art platformer that runs in a web browser with no internet connection.
Run right, collect weapons, gold and runes, fight your way through ten levels across time and
space, beat the boss guarding each treasure chest, and finally defeat The Master of Time.
Play with a keyboard or with touch buttons on an iPad.

## How to run

**Option 1: open the file.** Double-click `index.html` (or drag it into a browser window).

**Option 2: local server (use this if option 1 shows a blank screen or saving doesn't work).**
Some browsers restrict pages opened from `file://`. From this folder, run either:

```bash
node serve.js
```

```bash
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser. Stop the server with `Ctrl+C`.

Everything the game needs is in this folder. Phaser 3 is included as `lib/phaser.min.js`, and
all graphics and sounds are generated in code, so no network connection is ever needed.

## iPad or computer

The first screen asks what you're playing on. Click or tap to choose (you can switch later from
**CONTROLS** on the main menu).

- **iPad:** on-screen buttons. Left/right arrows (slide your finger between them), V to crouch,
  JUMP, HIT, DASH, WPN (next weapon), RIDE (pegasus, once you own it) and II (pause). Tap a
  weapon icon to switch to it and a rune icon to use its power; they sit under the hearts and
  the score. Every menu can be tapped.
- **Computer:** the keyboard controls below. Menus can also be clicked.

## Controls (keyboard)

| Key | Action |
| --- | --- |
| Left / Right arrows | Move |
| Up arrow | Jump. Press again in mid-air to double jump. Release early for a shorter jump. |
| Down arrow | Crouch. Flying shots pass over you; melee, falling rocks and shockwaves still hit. |
| Space (or J) | Attack with the equipped weapon (hold to keep attacking) |
| D | Dash. You can't be hurt while dashing. One dash per jump. |
| S / F / B / A / T / M | Sword / Fire Wand / Bow / Battle Axe / Throwing Axe / Bombs |
| R / I / N / U / L / O | Boom-arang / Ice / Earth / Air / Lightning / Void Wand |
| 1 - 9, 0 | The first ten weapons you own, in weapon-bar order |
| Tab | Next weapon |
| Q W E Z X C G H K | Rune powers: Earth, Crystal, Shadow, Water, Ice, Light, Undead, Time, Air |
| P | Ride the pegasus / hop off |
| V | Shaders on/off |
| Esc | Pause (in the pause menu, Q quits to the main menu) |

## Rules

- **Platforms are deadly from the side and from below.** Landing on top of ground or a platform is
  safe. Walking into a wall, bumping your head on a ceiling, or falling into a pit kills you.
  Clipping just the **corner** of a ledge or ceiling bounces you off instead.
- Dying sends you back to the start of the level with the stats you had when the level began.
  Once a boss fight has started, dying puts you back at the boss instead.
- After taking damage you are invincible for about one second.
- Each level ends in a boss arena. Beat the boss and the treasure chest drops from the sky.
- Touching the chest completes the level, saves your progress, and opens the shop.
- The first time you reach each level, a short cutscene plays. Press Enter/Space or tap for the
  next line, or skip it with Esc or the SKIP button.

## Levels and bosses

| Level | Mobs | Boss |
| --- | --- | --- |
| 1 Green Meadow | slimes, bats, golemites | Grassy Golem: ground slams, boulders, golemite helpers |
| 2 Crystal Cave | crystal gem crabs, skeletons | Crystal Crab: shard sprays, charges, gem crabs |
| 3 Shadow Castle | ninjas, skeletons | The Mysterious Stranger: teleports, shadow daggers, dash strikes |
| 4 Dragon's Peak | everything so far | The Dark Dragon: fire breath, meteor showers, low swoops |
| 5 The Dark Forest | ogres | The Haunted Tree: root spikes (watch for the red marks), acorns, bats and ogres |
| 6 Area 51.2 | governmental guards | Portal Gate Guard: laser bursts, shield charges, guards from the portal |
| 7 Alien Planet | aliens | The Giant Alien: jump slams, eye lasers along the red line, aliens |
| 8 Alien Castle | alien guards, aliens | The Alien King: plasma fans, lightning strikes, dives, alien guards |
| 9 Technology Dimension | robots, guards, glitch mobs | The Super Computer: low lasers (jump), high lasers (crouch), data bombs, robots |
| 10 The Time-Space Continuum | glitch mobs and mobs from every era | The Master of Time: clock-hand spirals, sand rain, teleports, glitch mobs |

Bosses get faster and add attacks once they're below half health.

New mobs: **Ogres** (big, slow, smash shockwaves when you're close), **Governmental Guards**
(patrol and fire lasers), **Aliens** (hop and fire plasma), **Alien Guards** (a shield blocks
half of every hit from the front; they charge with spears), **Robots** (charge up a fast laser
beam), **Glitch Mobs** (blink right next to you).

**Bonus level (Sky Vault):** a portal floats near the start of Crystal Cave. With the Earth Rune
you can jump into it for 45 seconds of coin and gem grabbing. It can be played once per run.

## Secrets and runes

- **Secret passages** are fake walls with faint cracks and the occasional sparkle. Walk straight
  into them: they're not solid, and they hide treasure.
- Every level except Dragon's Peak hides a **rune** in a secret passage. Each rune gives a power:

| Rune | Key | Superpower | Recharge |
| --- | --- | --- | --- |
| Earth (1) | Q | Stone Skin: 4 seconds where nothing hurts you and enemies you touch take damage | 20 s |
| Crystal (2) | W | Crystal Storm: a ring of shards that cut through enemies | 10 s |
| Shadow (3) | E | Void Blast: damages every enemy on screen and wipes out their shots | 25 s |
| Water (5) | Z | Tidal Wave: a wave rolls ahead, washing away mobs and their shots | 12 s |
| Ice (6) | X | Frost Nova: freezes every mob near you | 16 s |
| Air (7) | K | Sky Leap: launches you high and gives back all your jumps | 8 s |
| Undead (8) | G | Ghost Army: friendly ghosts hunt down mobs | 15 s |
| Light (9) | C | Healing Light: heals 5 hearts and refills armor | 30 s |
| Time (10) | H | Time Stop: every mob, boss and shot freezes for 5 seconds | 30 s |

- **Rune vaults** are glowing walls in the rune's colour. They bounce you back (harmlessly) until
  you own the rune they need; after that they open like a secret passage.

## Weapons

The first time you get a weapon (picked up or bought) you also get a permanent upgrade.
Shots from ranged weapons (and pets) **aim at the nearest mob**.

| Weapon | Key | What it does | Upgrade |
| --- | --- | --- | --- |
| Dagger | 1 | Fast melee | +Speed (you start with it) |
| Sword | S | Medium melee | +1 max HP |
| Hammer | 3 | Slow melee, big knockback, 30% chance to stun for 2 seconds | +1 power |
| Battle Axe | A | Wide heavy melee | +2 max HP |
| Bow | B | Arrows | +1 max HP |
| Fire Wand | F | Fireballs | +10% attack speed |
| Throwing Axe | T | Spinning arc, cuts through every enemy | +5% attack speed |
| Bombs | M | Bounce, then explode | +1 max HP |
| Boom-arang | R | Flies out and comes back, cuts through mobs and walls, grabs coins | +Speed |
| Ice Wand | I | Ice bolts freeze mobs for 3 seconds (frozen mobs are harmless) | +1 max HP |
| Earth Wand | N | Quake: every mob on the platform you stand on loses half its health | +1 power |
| Air Wand | U | A tornado sucks up mobs and shots, then throws the mobs far away | +Speed |
| Lightning Wand | L | A bolt bounces to every mob on screen, through walls, collecting money | +5% attack speed |
| Void Wand | O | While held, a void circle around you takes 3/4 of the health of mobs that touch it. Attack to make it pulse bigger. | +2 max HP |

Bosses shrug off the strongest effects: the earth, void and air wands only take a slice of a
boss's health, and freezes and stuns wear off faster.

## Items

Mobs sometimes drop magic items. They work as soon as you pick them up:

- **Shield Potion:** a bubble blocks all damage for 8 seconds.
- **Frenzy Potion:** attack twice as fast for 8 seconds.
- **Explode Potion:** a big blast that hits every mob near you.
- **Time Freeze Apple:** stops every mob and shot for 5 seconds.

Also: gold coin (+1 gold), gem (+5 gold), health potion (+3 HP), heart container (+5 max HP).

## Shop and shopkeeper

The shop opens between levels (the shopkeeper has opinions). Tabs:

- **Weapons** to buy or equip.
- **Forge:** upgrade weapons you own up to level 4. Each level adds 1 damage and 8% speed.
- **Armor:** blue shield hearts that take hits first and refill every level.
- **Upgrades:** +1 max HP, +1 power, Swift Boots, Quick Hands, Dash Recharge, Triple Jump.
- **Pets** and the **Pegasus**. These stay yours for every future run.

## Pets and the pegasus

One pet comes along at a time (choose in the shop). Pets can't be hurt.

- **Coco-nut:** a monkey that lobs coconuts at mobs.
- **Fire Phoenix:** flies above you and shoots little fireballs.
- **Rhi-no-no-no:** charges in and rams mobs.

The **Pegasus** is a mount (P, or RIDE on iPad). While riding you run faster, get two extra
mid-air jumps, and can still attack. Hits take the pegasus' 3 white hearts first; if they run
out it throws you off and rests for 20 seconds. When nobody rides it, it flies along beside you
and can't be hurt, and mobs never aim at it.

## Wardrobe

Skins are free: pick one in **WARDROBE** on the main menu, along with optional accessories:
a hat, a necklace, a face item and a belt. Your choice is used in every run.

## Daily tasks

**DAILY TASKS** on the main menu shows three fun tasks that change every day (defeat mobs,
collect coins, freeze mobs, catch your boom-arang...). Finishing one earns a star. They're just
for fun.

## Saving and leaderboard

Progress is saved to the browser's `localStorage` when you finish a level and when you buy
something: level, max HP, weapons and forge levels, gold, armor, upgrades, runes, score and your
run time. The main menu shows **Continue** when a save exists. The wardrobe, pets, pegasus, daily
tasks and settings are kept separately and survive new games.

A **timer** runs while you play a level (shown under the score). The **leaderboard** lists runs
by score, by level reached, or by time (furthest level first, then fastest); switch with the tabs
or Left/Right. You enter three letters (type them or tap the arrows) after beating the game, or
when you quit a run from the pause menu with a high enough score. Leave with BACK TO MENU,
Enter or Esc.

## Shaders

With WebGL (any modern browser), the game uses a CRT-style screen effect (scanlines, slight color
fringing, vignette) and glows on runes, items, portals and bosses. Toggle with V, from the pause
screen, or from the main menu. The game still runs without WebGL; the effects are just skipped.

## Project layout

```
index.html            loads Phaser and the game scripts
serve.js              tiny local web server (node serve.js)
lib/phaser.min.js     Phaser 3.80.1 (local copy)
src/main.js           Phaser config, scene registration
src/data/             weapons (+ forge), enemies (+ bosses), levels, gear (armor, skins,
                      accessories, upgrades, runes, items, pets, pegasus), story (cutscenes),
                      sprites and sprites2 (extra pixel art)
src/scenes/           Boot (generates textures), Device (iPad or computer), Menu, Wardrobe,
                      Daily, Cutscene, Game (+ GameMagic: wands, runes, items, pegasus),
                      UI (HUD), Touch (iPad buttons), Pause, Shop, Win, Leaderboard (+ name entry)
src/entities/         Player, Enemy and NewEnemies, Boss and NewBosses, Projectile (+ Bomb,
                      Boomerang, Tornado), Pickup, Companions (pets, pegasus)
src/systems/          SaveManager (state, save, profile, leaderboard), Controls (keyboard and
                      touch), Daily (daily tasks), Sound (Web Audio synth), Shaders
```

Levels are described in `src/data/levels.js` as ground segments, platforms, secrets, rune vaults
and entity positions, which are turned into a grid of characters (see the legend at the top of
that file).
