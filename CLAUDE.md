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
- Geld intern in Cent (fmt zeigt 20000 als 200,00 €). Start 200 €, Barkeeper gibt 200 € unter 20 € (nicht wenn mind. 20 € auf dem Konto).
- Geld darf nie verloren gehen/zurückgesetzt werden.
- Leiter: Werte wie echtes Merkur-Gerät (bei Level 40: 15,30,60,120,240,400,800,1200,1600,2000,3200,5400,14000), auf Einsatz umgerechnet, unterste Stufe = Einsatz; hoch eine Stufe / sonst zwei runter, fair (2 % Vorteil); ab 10× Einsatz AUSSPIELUNG mit didididi. Spammbar, nicht automatisch nach Gewinn öffnen.
- Automaten: beim Hinsetzen Portemonnaie/Karte stecken (ENTSPERRT), Karte hält den Automaten (Aufstehen in jedem Zustand).
- Gewinne nur glatte Beträge (Pharao = echter Merkur-Spielplan), Einsatzstufen wie Merkur-Level (10, 20, 40, 60, 80, 100, 200 …). Quoten ~96–98 % über die Walzenbelegung, nicht über krumme Gewinne, per Simulation prüfen (`node tools/sim_pharao.js '<strips-json>' <scale> 2000000`, andere Spiele mit tools/slot_sim.js).
- Text darf nie aus dem Bild laufen, Hoch- und Querformat müssen gehen.
- Keine Dateien/Grafiken/Sounds aus echten Merkur-Apps übernehmen (Urheberrecht, Seite ist öffentlich). Zahlen/Regeln aus Spielplänen sind ok, Optik selbst nachzeichnen.
