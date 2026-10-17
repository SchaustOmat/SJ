# Sinan's Keller

PS1-Casino im Browser. **Spielen: https://schaustomat.github.io/SK/**

Nur Spielgeld.

## Aufbau

- `src/` – Quellcode, wird in Dateinamen-Reihenfolge zu einer Seite zusammengesetzt
  - `00_slotengine.js` Walzen, Gewinnlinien, Auswertung
  - `01_pokercore.js` Hand-Bewertung, Side Pots, Gewinnchance
  - `10_core.js` Chips, Sound, 3D-Grundlagen, Karten
  - `11_world.js` Räume, Möbel, Figuren
  - `20_slots.js` Spielautomaten mit Freispielen, Karten- und Leiter-Risiko
  - `21_poker_bots.js` Hold'em gegen Computer-Gegner (2. Stock)
  - `22_hilo.js` Höher/Tiefer
  - `30_multiplayer.js` Mitspieler, Chat, Räume per Code, Auto-Update
  - `31_ui_bars.js` Vollbild-Automat, Knopfleisten an Tischen
  - `32_player_table.js` Spielertisch: Hold'em gegen echte Mitspieler (EG)
  - `90_main.js` Aufzug, Welt, Steuerung, Kamera, Roulette, Start
  - `shell.html` Oberfläche und Styles
- `build.py` baut `index.html` und `version.txt`
- `tools/slot_sim.js` rechnet die Auszahlungsquote der Automaten nach
