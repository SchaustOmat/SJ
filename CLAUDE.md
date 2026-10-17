# Sinan's Keller – Projektinfos für Claude Code

3D-Casino-Spiel im PS1/PS2-Look fürs Handy (three.js r128 von cdnjs). Privat, für Justin und Kollegen.
Antworten an den Nutzer immer auf Deutsch, kurz und ohne Fachchinesisch.

## Live
- GitHub-Repo: https://github.com/SchaustOmat/SK (Branch main), GitHub Pages: https://schaustomat.github.io/SK/
- Pages-Link lädt neue Versionen automatisch (pollt `version.txt`, Reload mit `?v=`).
- Es gibt zusätzlich eine Claude-Artifact-Version (Build mit `--artifact`), die nutzt window.claude (room/db/user) statt MQTT.

## Bauen
- `python build.py` → fügt `src/*.js` (sortiert) + `src/shell.html` zu `index.html` zusammen und schreibt `version.txt`.
- `python build.py --artifact PFAD` → Claude-Version.
- Nie `index.html` direkt bearbeiten, immer `src/`.
- Deploy: bauen, Syntax prüfen (`node --check` auf das Script aus index.html), committen, pushen. Pages baut automatisch.

## Dateien (src/)
- 00_slotengine.js: Walzen-Engine (Strips, Linien, Wild/Scatter, Freispiele, bothWays, wildStack). Spiele: book, fruit, viking, mine, reef, temple, pharao.
- 20_slots.js: Automaten (3D-Gehäuse, Knöpfe, Ablauf, Risiko Karte/Leiter mit TEILEN, Pharao Power-Spin-Angebot + Power Spins, Bildschirm-Zeichnung).
- 23_slot_symbols.js: gezeichnete Symbole. 24_spielomat.js: Automaten-OS „Spielomat V0.1“ (Menü, alle Spiele an jedem Automaten).
- 25_wheel.js: Roulette-Rad (groß, Zahlen, Kugel), auch fürs Zuschauen.
- 21_poker_bots.js: Texas Hold'em gegen Bots (50/100, Bots 20k). 22_hilo.js: Höher/Tiefer (Jokers-Wild-Regeln).
- 30_multiplayer.js: Presence-Multiplayer über MQTT (öffentliche Broker), Raumcode, Raumliste (retained `sinanskeller/lobby/<code>`), Auto-Update.
- 32_player_table.js: Hold'em-Tische nur mit echten Spielern. 33_spectate.js: Zuschauen. 34_voice.js: Voice-Chat (WebRTC).
- 35_save.js: Spielstand (localStorage nk_*, Cloud-Save in Artifact-Version). 36_bank.js: Geldautomaten/Konto/Überweisungen.
- 90_main.js: Welt, Kamera, Steuerung, Panels, Roulette-Tisch.

## Regeln vom Nutzer
- Startchips 20.000, Barkeeper gibt 20.000 wenn pleite (nicht wenn Geld auf dem Konto).
- Geld darf nie verloren gehen/zurückgesetzt werden.
- Leiter: unterste Stufe = Einsatz, Stufen Vielfache vom Einsatz, hoch eine Stufe / sonst zwei runter, Chance ~50–74 % (fair, 2 % Vorteil), spammbar, ruhig blinkend. Nicht automatisch nach Gewinn öffnen, nur per Knopf.
- Quoten aller Automaten 97 %, per Simulation prüfen (`node tools/sim_pharao.js '<strips-json>' <scale> 2000000`, andere Spiele mit tools/slot_sim.js).
- Text darf nie aus dem Bild laufen, Hoch- und Querformat müssen gehen.
