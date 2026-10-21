# SJ Spielbank (früher Sinan's Keller) – Projektinfos für Claude Code

3D-Casino-Spiel im PS1/PS2-Look fürs Handy (three.js r128 von cdnjs). Privat, für Justin und Kollegen.
Antworten an den Nutzer immer auf Deutsch, kurz und ohne Fachchinesisch.

## Live
- GitHub-Repo: https://github.com/SchaustOmat/SJ (Branch main, früher SK), GitHub Pages: https://schaustomat.github.io/SJ/
- Pages-Link lädt neue Versionen automatisch (pollt `version.txt`, Reload mit `?v=`).
- Es gibt zusätzlich eine Claude-Artifact-Version (Build mit `--artifact`), die nutzt window.claude (room/db/user) statt MQTT.

## Bauen
- `python build.py` → fügt `src/*.js` (sortiert) + `src/shell.html` zu `index.html` zusammen und schreibt `version.txt`.
- `python build.py --artifact PFAD` → Claude-Version.
- Nie `index.html` direkt bearbeiten, immer `src/`.
- Deploy: bauen, Syntax prüfen (`node --check` auf das Script aus index.html), committen, pushen. Pages baut automatisch.

## Dateien (src/)
- 00_slotengine.js: Walzen-Engine (Strips, Linien, Wild/Scatter, Freispiele, bothWays, wildStack, wildMult, walk, superspin). Im Menü nur echte Merkur-Spiele: pharao (Lucky Pharaoh Wild), spitze (Alles Spitze), zent (Zentaurus, 20 Linien, lineDiv 2 = 0,10 €), tizona, doppel (Doppel Buch). book/fruit/viking/mine/reef/temple sind alt und nicht mehr im Menü. Gewinnpläne = echte Merkur-Tabellen (Pharao bei 0,20 €, Tizona/Zentaurus/Doppel Buch bei 0,10 €).
- 28_spitze.js: Alles Spitze (eine Walze, 3 Leitern, Cashpot). 29_newgames.js: Symbole für Zentaurus/Tizona/Doppel Buch.
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
- Leiter wie Merkur Risiko+ (merkur.com): feste Euro-Stufen unabhängig vom Einsatz: 0,15 0,30 0,60 1,20 2,40 | AUSSPIELUNG | 4 8 12 20 32 52 84 140 €, ab 140 € RISIKO+ (linke Spalte 100 140 180 220 260 300 €). Über 2 € Einsatz wächst die ganze Leiter mit (× Einsatz/2 €, ganze Faktoren; z. B. 10 € Einsatz: 0,75 … 700 €, RISIKO+ 500–1.500 €). Bis einschließlich 4 € gilt hoch oder 0 (jeder Druck ~50 % hoch, Wunsch vom Nutzer 2026-10), ab 8 € hoch 1 / sonst 2 Stufen runter. In RISIKO+ bei Verlust Rückfall auf 100 € (von 100 € hoch auf 140 € / runter auf 52 €). Fair mit 2 % Vorteil. AUSSPIELUNG: nur beim Hochdrücken von 2,40 € (Lauflicht wie im Video, landet meist auf 4 €, selten höher bis 140 €). Spammbar, nicht automatisch nach Gewinn öffnen (außer Risiko-Automatik). Leiter genau wie in den Nutzer-Videos (2026-10-20, gemessen, selbst nachgebaut): Blinken alle 1/3 s (aktuelle Stufe fest, abwechselnd Stufe darüber/darunter), bei jedem 'darüber' ein weicher a-Moll-Akkord (SFX.ladChord); Drücken = Ergebnis sofort, Licht springt hart (keine Lichtfahrt/Glühen), hoch = Fanfare ~0,1 s danach (SFX.ladFan: A6, D-F-A-D, A6/H5); runter: bis 4 € auf 0, von 8 € auf 4 €, sonst 2 Stufen; Einstieg mit krummem Betrag: 1 s schnelles Flackern zwischen den Nachbarstufen, dann untere Stufe (Rest gutgeschrieben) + Fanfare; Ausspielung (nur beim Hochdrücken von 2,40 €): Feld leuchtet, Licht läuft 1/30 s pro Stufe von 4 € bis 140 € hoch, ~1,84 s, Akkordfolge (SFX.ausRun), dann Fanfare.
- Automaten: beim Hinsetzen Portemonnaie/Karte stecken (ENTSPERRT), Karte hält den Automaten (Aufstehen in jedem Zustand).
- Steuerung (2026-10-21): PC = freier Zeiger (AIM in 90_main.js: Totzone 0,07 rad, Kamera zieht weich nach), Tasten am Pult eigener Automaten im Stehen anklickbar (pressStanding, Reichweite 3,6 m; 7 Pult-Tasten inkl. LEITER). Handy = Tastenleiste #rmBar (39_remote.js) für eigene Automaten in Reichweite + „dicker Finger“ beim Tippen auf Pult-Tasten. Zukunft (Wunsch): Inventar, Portemonnaie zum Geld-Rausnehmen/Werfen, realistisches Umschauen.
- Gewinne nur glatte Beträge (Pharao = echter Merkur-Spielplan), Einsatzstufen wie Merkur-Level (10, 20, 40, 60, 80, 100, 200 …). Quoten ~96–98 % über die Walzenbelegung, nicht über krumme Gewinne, per Simulation prüfen (`node tools/sim_pharao.js '<strips-json>' <scale> 2000000`, andere Spiele mit tools/slot_sim.js).
- Text darf nie aus dem Bild laufen, Hoch- und Querformat müssen gehen.
- Keine Dateien/Grafiken/Sounds aus echten Merkur-Apps übernehmen (Urheberrecht, Seite ist öffentlich). Zahlen/Regeln aus Spielplänen sind ok, Optik selbst nachzeichnen.
- Knopfleiste wie Merkur-App: runde Knöpfe Starten (=AUTO), ERFOLG, LEVEL, Risiko 1:1 Leiter (ohne Gewinn: Einsatz +1 Stufe), Risiko 1:1 Karte (ohne Gewinn: max. Einsatz), Start. Freispiele startet der Spieler selbst (außer AUTO).
- Tizona: Freispiele kaufen = 100× Einsatz, 10 Freispiele auf eigenen Kauf-Walzen (mehr Schwerter, kein Startschwert), Quote ~98 %.
- Walzen gestapelt (stack:3) für dicke Gewinne bei gleicher Quote; bei Zentaurus/Doppel Buch Freispiele ungestapelt.
