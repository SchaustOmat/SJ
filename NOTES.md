# Übergabe für die nächste Sitzung (Stand 2026-11-11)

Erst `CLAUDE.md` lesen (alle Regeln, Bauen, Testen, Dateiliste). Hier steht nur der aktuelle Stand.

## Zuletzt erledigt
- **Portemonnaie mit Scheinen** (Commit 8a5df7d, live): neue Datei `src/43_wallet.js`, Beschreibung in CLAUDE.md (Eintrag 43_wallet.js).
  - G / Handy-Knopf GELD = Portemonnaie in der Hand, Schein antippen, dann V Werfen / B Ablegen / C Geben / G Zurück.
  - Liegende Scheine laufen über die Präsenz (dr/pk/dg/wk), nur einer bekommt sie, nicht vergebene kommen nach 10 Min / Raumwechsel / Neuladen zurück.
  - Automat: im Tor Portemonnaie antippen, Scheine rein (m.cashOn/m.cash), SCHEIN REIN legt nach, Aufstehen zahlt den Rest aus (slotCashOut, nk_slotpend).
  - Geldautomat zeigt die Scheine unter BARGELD.
  - Getestet headless: Handy hoch + PC, Mehrspieler nur nachgestellt.
- Davor: Zentaurus-Säulen aus Marmor (f389d47), Spielbank wieder online (db7343b).

## Offen / nächste Schritte
- Kleiner Fehler: im Bargeld-Modus steht auf dem Automaten noch „ENTSPERRT – DER AUTOMAT GEHÖRT DIR“ (Text gehört angepasst, z. B. „BARGELD – GUTHABEN …“; Stelle in 20_slots/31_ui_bars beim Entsperr-Bildschirm suchen).
- Justins Rückmeldung zum Portemonnaie abwarten (echter Test mit Kollegen: Werfen/Aufheben/Geben).
- Ideen aus CLAUDE.md: Inventar, realistisch weiches Umschauen, Freispiel-Intros/Gewinn-Animationen aufwerten, mehr Interaktion mit Gegenständen (Schachtel drehen/zu/einpacken), Spielnamen ggf. durch eigene ersetzen.

## Wichtig
- Bauen `py -3.14 build.py`, Syntax mit `node --check`, Tests stumm mit `tools/headless_shot.mjs`, nie im Claude-Browser.
- Nur eigene Dateien committen, vor dem Push `git pull --rebase`.
