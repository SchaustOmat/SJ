# Übergabe für die nächste Sitzung (Stand 2026-11-11)

Erst `CLAUDE.md` lesen (alle Regeln, Bauen, Testen, Dateiliste). Hier steht nur der aktuelle Stand.

## Zuletzt erledigt
- **Große Durchsicht 2026-11-11** (Sicherungspunkt davor: Git-Tag `stand-2026-11-11`; zurück: `git revert` der Commits danach oder `git checkout stand-2026-11-11 -- src` + bauen + pushen).
  - Flüssiger: Zielsuche nur noch in Reichweite (rayHits in 90_main, 5 ms → 0,1 ms), automatische Auflösung (dynRes/DYN in 90_main, senkt bis 60 % bei < ~42 Bildern/s, im Test aus über NK_HS_LOCAL), Hallen-Figuren außerhalb des Bildes ruhen (chCull), Risiko/Menü-Bildschirm max. 30 Zeichnungen/s, Handy-Tastenleiste 10×/s, Präsenz-Vergleich nur alle 0,1 s, Kerzen ein Material, leere Hände-Szene wird nicht gezeichnet.
  - Mitspieler gleiten gleichmäßig (30_multiplayer, a.mv), Crash-Zähler bei Mitspielern ruckelt nicht mehr (Gastgeber-Uhr weitergedacht).
  - Geld/Fehler: Aufstehen während Pharao-Mystery gesperrt (Gewinn ging verloren), zweiter Tab wartet (nk_alive in 10_core, sonst doppeltes Geld), Crash im Hintergrund verpasst = echter Crash-Punkt, Crash hing nach Raumverlust, AUTO blieb nach Risiko-Automatik an der Leiterspitze stehen, Karten-Risiko-Tick doppelt, Figuren-Speicher wird freigegeben (chDispose).
  - Runde 2 (Sicherungspunkt davor: Tag `stand-2026-11-11b`): Spielertisch behält den Stapel nach Verbindungsabriss (ts.b wird nachgeführt), Bank ZURÜCKHOLEN nur wenn Empfänger nicht im Raum und 20 s alt, Power-Spin-Walzen landen weich, Karten-Risiko nimmt Druck während der Anzeige an, Bargeld-Modus zeigt „BARGELD – GUTHABEN“, Schilder mit Mipmaps. Nur headless auf Fehler geprüft, Tisch/Bank nicht mit echten Mitspielern.
  - Handy hoch (Tag davor `stand-2026-11-11c`): Kippen-/Geld-Knöpfe als schmale Spalte links statt Reihen oben (#itBar:not(.fc) in shell.html), Kippe im Mund tiefer/flacher (hdMouth), Hand mit Kippe schaut nur von unten ins Bild (chHandPose cig/cigAsh, far). Am Automaten und im Querformat unverändert, Glas-Hand und Schachtel nicht angefasst.
  - Weiter offen (Tisch/Bank/Power-Spin/Karten-Risiko/Schilder aus der Liste sind erledigt): Spielertisch setzt Stapel nach Verbindungsabriss auf den Einkauf zurück (32_player_table 170–174, ts.b zwischen den Händen nachführen); Bank „ZURÜCKHOLEN“ kann verdoppeln (36_bank 165); Cloud-Save der Artifact-Version (35_save: CR.pend/queued fehlt in totalWealth, Scheine doppelt gezählt); 11 Punktlichter je Etage (Akzentlichter durch Leuchten ersetzen, ändert die Optik); ein Skelett je Figur statt je Teilnetz (16_chars 167); Power-Spin-Walzen rasten hart ein (20_slots ~617); Karten-Risiko schluckt Tastendrücke in gambleNext; Allokationen in der Ich-Perspektive (16_chars/41_hands); Schilder ohne Mipmaps (canvasTex).
- **Portemonnaie mit Scheinen** (Commit 8a5df7d, live): neue Datei `src/43_wallet.js`, Beschreibung in CLAUDE.md (Eintrag 43_wallet.js).
  - G / Handy-Knopf GELD = Portemonnaie in der Hand, Schein antippen, dann V Werfen / B Ablegen / C Geben / G Zurück.
  - Liegende Scheine laufen über die Präsenz (dr/pk/dg/wk), nur einer bekommt sie, nicht vergebene kommen nach 10 Min / Raumwechsel / Neuladen zurück.
  - Automat: im Tor Portemonnaie antippen, Scheine rein (m.cashOn/m.cash), SCHEIN REIN legt nach, Aufstehen zahlt den Rest aus (slotCashOut, nk_slotpend).
  - Geldautomat zeigt die Scheine unter BARGELD.
  - Getestet headless: Handy hoch + PC, Mehrspieler nur nachgestellt.
- Davor: Zentaurus-Säulen aus Marmor (f389d47), Spielbank wieder online (db7343b).

## Offen / nächste Schritte
- Justins Rückmeldung zum Portemonnaie abwarten (echter Test mit Kollegen: Werfen/Aufheben/Geben).
- Ideen aus CLAUDE.md: Inventar, realistisch weiches Umschauen, Freispiel-Intros/Gewinn-Animationen aufwerten, mehr Interaktion mit Gegenständen (Schachtel drehen/zu/einpacken), Spielnamen ggf. durch eigene ersetzen.

## Wichtig
- Bauen `py -3.14 build.py`, Syntax mit `node --check`, Tests stumm mit `tools/headless_shot.mjs`, nie im Claude-Browser.
- Nur eigene Dateien committen, vor dem Push `git pull --rebase`.
