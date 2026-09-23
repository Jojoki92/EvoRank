# Recht, Lizenzen und fehlende Angaben

Diese Übergabe dokumentiert den Rechtscheck vom 22.09.2026; sie ist keine neue juristische Prüfung und keine Zusage, dass keinerlei rechtliche Schwierigkeiten entstehen. Maßgebliche ausführliche Bestandsaufnahme: `projekt/docs/EVORANK-X5.7-RECHTSCHECK.md`. Vor Veröffentlichung Rechtslage/Anbieterbedingungen neu prüfen und den konkreten Betrieb qualifiziert beurteilen lassen.

## Bestätigte Angaben

- Betreiber: **Johannes Gumplmayr**, **Österreich**.
- Öffentliche Kontaktadresse: **evorank.fitness@gmail.com**.
- App soll kostenlos erhältlich sein; kostenpflichtige Inhalte sind später gewünscht, aktuell nicht implementiert.
- **Keine bestätigte öffentliche Niederlassungsanschrift**, kein bestätigter Gewerbe-/Unternehmensstatus, keine vollständige Bild-/Datenrechtekette.

Keine Adresse aus anderen Dateien/Accounts ableiten oder eine Privatadresse ohne Freigabe veröffentlichen. Auch eine KI-Neugenerierung eines vorhandenen Motivs belegt nicht automatisch Rechte an der Vorlage.

## Bereits technisch erledigt

- Kontobezogene, optionale Cloud-Einwilligung; fehlendes Modul gewährt in X5.7 keine Freigabe aus altem globalen Wert.
- Registrierung/Cloudhinweise präzisiert, Freigaben/Export/Löschung als vorhandene App-Funktionen erhalten.
- Rechtstexte mit bestätigtem Namen/Kontakt und Hinweisen zu fehlenden Tatsachen, GPS-Speicherung, Minderjährigen und nicht vorhandenen Käufen.
- Reproduzierbares Lizenzinventar, vorhandene Copyright-/NOTICE-Texte, dokumentierte Prüfbereiche.

Das beweist weder produktiv wirksame Backend-Löschung noch einen abgeschlossenen AVV oder rechtsgültige Elternfreigabe.

## Fehlende Tatsachen und Folgeschritte

| Thema | Benötigte Information / Arbeit |
| --- | --- |
| Impressum/Offenlegung | Tatsächliche veröffentlichbare Anschrift, Unternehmens-/Gewerbestatus, gegebenenfalls Register/Kammer/Aufsicht/UID; § 5 ECG und § 25 MedienG konkret prüfen |
| Produktions-Datenschutz | Reale Anbieter/Projekte/Regionen, Verträge/AVV, Subprozessoren, Transfers, Retention/Backups; Empfängerinfos ergänzen und realen Export/Löschung/Widerruf prüfen |
| Minderjährige | Zielalter/Zielländer und geeigneter Freigabe- oder Beschränkungsprozess; eingegebenes Trainingsalter ist keine verifizierte Zustimmung |
| Bilder/Marken | Körpergrafiken, Logos, Badgevorlagen, Illustrationen/Inline-Icons: Herkunft und kommerzielle Rechte belegbar erfassen |
| Referenzdaten/Katalog | Kommerzielle Nutzung von Beschreibungen und Strength-/Running-/Swimming-/Cycling-Level-Tabellen klären oder durch freigegebene/eigene Daten ersetzen |
| OCR | Bei Bedarf extern geladene Tesseract-Komponenten/Sprachdaten separat nach tatsächlicher Version und Lizenz erfassen |
| Native/Store | Tatsächlich eingebundene Komponenten und Datenschutzmanifest, Labels, Einwilligungen, Store-Regeln prüfen; keine Freigabe aus CSS-Appleoptik ableiten |
| Künftige Käufe | Konkretes Produkt/Preise/Entitlements, Verbraucherinformation, Wiederherstellung, Rücktritt/Kündigung und anwendbare Barrierefreiheit vor Einführung |

In der bestehenden Unterhaltung wurden Betreiberanschrift, Gewerbestatus und kommerzielle Bildrechte bereits erfragt, aber nicht beantwortet. Nicht erneut behaupten, sie lägen vor. Die nächste KI kann diese fehlenden Angaben gebündelt erfragen und währenddessen unabhängige technische Aufgaben bearbeiten.

## Lizenzinventar richtig lesen

`public/rankforge/licenses/LIZENZANALYSE-X5.1.md` ist historisch. Es enthält Bedingungen/Risiken zu MIT/Apache/MPL/LGPL, nachgeladenem OCR, Grafiken, Tabellen und Anbieter-/Storekosten. Eine ältere Preisangabe ist keine aktuelle Kostenbestätigung.

X5.7 ändert die Rangbildtechnik: jetzt 36 einzelne generierte transparente PNGs statt Laufzeit-Ausschnitten mit Hintergrundmasken. Die ursprünglichen vier Tafeln sind weiterhin im Quellprojekt. Die neue Darstellung beseitigt keine offene Vorlagenlizenz. `docs/EVORANK-X5.7-ICON-EXPORT.json` dokumentiert Exporte, keinen Nutzungsrechtsvertrag.

Keine pauschale Open-Source-Lizenz wurde über die gesamte EvoRank-App gelegt. Git und Weitergabe an eine KI machen den Code nicht automatisch öffentlich. `node_modules` und native Build-Binaries werden in dieser Übergabe nicht mitgeliefert; die historische RTK-Setup-ZIP bleibt als ursprüngliches versioniertes Werkzeug vorhanden, nicht als neue App-Laufzeitabhängigkeit.

## Änderungspunkte nach bestätigten Angaben

- `packaging/legal-operator.json` – tatsächliche Betreiberangaben.
- `scripts/build-legal-pages.mjs` – bestätigte Produktions-/Datenverarbeitungsinformationen.
- `npm.cmd run legal:generate` – daraus acht Rechtsseiten erzeugen und anschließend prüfen.
- Rechteübersicht und finale ausgelieferte Komponenten dokumentieren, Hinweise nicht entfernen.

Primärquellen und Quellenlinks sind im ausführlichen X5.7-Rechtscheck enthalten. Keine automatische Veröffentlichung durch diese Übergabe.
