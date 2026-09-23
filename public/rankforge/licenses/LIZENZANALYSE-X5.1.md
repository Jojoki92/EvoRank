# EvoRank X5.1 – Lizenzen und mögliche Kosten

Stand: 14. September 2026. Geprüft wurden der aktuelle Projektstand, alle 743 Einträge der npm-Lockdatei, die verfügbaren Lizenzdateien installierter Pakete, externe Code-Verweise und die Herkunftsnachweise der App-Grafiken. Dies ist eine technische Bestandsaufnahme, keine bestätigte Freigabe zur Veröffentlichung.

## Ergebnis für dich

Die üblichen Entwicklungsbibliotheken benötigen keine kommerzielle Kauflizenz. Kostenlos nutzbar bedeutet trotzdem nicht frei von Bedingungen. Besonders zu prüfen sind **die Bildrechte, die übernommenen Rangtabellen sowie LGPL-/MPL-Komponenten, wenn deren Binärdateien ausgeliefert werden**. Eine kostenlose App mit späteren In-App-Käufen benötigt ebenfalls passende kommerzielle Nutzungsrechte.

## Bibliotheken

| Gruppe | Im Projekt gefunden | Bedeutung / nächste Maßnahme |
| --- | --- | --- |
| MIT, ISC, BSD, 0BSD, MIT-0 | Unter anderem React, Next, Vite und viele Hilfspakete | Kommerzielle Nutzung grundsätzlich erlaubt. Erforderliche Copyright- und Lizenztexte erhalten; keine automatische Pflicht, den eigenen App-Code zu veröffentlichen. |
| Apache 2.0 | Unter anderem TypeScript und sharp | Kommerziell nutzbar; Lizenz, einschlägige NOTICE-Hinweise und Änderungsvermerke beachten. Markenrechte werden nicht automatisch eingeräumt. |
| LGPL 3 oder später / gemischte Apache-LGPL-Angaben | sharp-Plattformpakete, z. B. `@img/sharp-win32-x64@0.34.5` | Kein automatischer Kaufzwang. Beim Verteilen der Bibliotheks-Binaries müssen jedoch u. a. Lizenz-/Quellcodepflichten und die Bedingungen für Austausch bzw. erneutes Linken geprüft werden. Nicht ungeprüft in einen nativen App-Store-Build übernehmen. |
| MPL 2.0 | lightningcss, @resvg/resvg-wasm, @vercel/og, satori, axe-core | Copyleft auf Dateiebene: Beim Verteilen betroffener ausführbarer Komponenten muss der zugehörige MPL-Quellcode zugänglich sein; Änderungen an MPL-Dateien bleiben MPL. Eigene unabhängige Dateien müssen dadurch nicht insgesamt offen werden. |
| CC BY 4.0 | caniuse-lite | Namensnennung, Lizenzverweis und Änderungskennzeichnung beachten, wenn diese Daten weiterverteilt werden. |
| Python 2.0, BlueOak 1.0.0, CC0 | Weitere transitive Hilfspakete | Kein Hinweis auf eine notwendige Kauflizenz; vorhandene Hinweise beibehalten. |

Die Lockdatei enthält 607 MIT-, 43 reine Apache-2.0-, 28 MPL-2.0- und 14 LGPL-bezogene Einträge einschließlich gemischter Angaben. Das sind Paket-/Plattformeinträge, nicht 743 verschiedene Komponenten in der sichtbaren App. Es wurden keine fehlenden Lizenzangaben in den Lock-Metadaten gefunden; Metadaten allein beweisen aber keine vollständige Rechtekette. 492 lokal verfügbare Lizenz-/NOTICE-Dateien sind in [DEPENDENCY-NOTICES.txt](./DEPENDENCY-NOTICES.txt) zusammengestellt. Optionale Plattformpakete, die hier nicht installiert sind, und eingebettete Unterkomponenten sind damit nicht vollständig einzeln auditiert.

Die X5.1-Windows- und Netlify-Pakete enthalten die statische PWA und vorhandene Serverfunktionen, **kein node_modules, keine sharp-Binärdateien und keinen mitgelieferten Node-Runtime**. Der Windows-Start nutzt PowerShell oder ein bereits installiertes Node. Dadurch werden reine Build-Abhängigkeiten nicht schon durch dieses Paket zu App-Laufzeitbibliotheken. Ein späterer Framework-/nativer Build muss anhand seiner tatsächlich ausgelieferten Dateien erneut geprüft werden.

Quellen: [MIT](https://opensource.org/license/mit), [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0), [MPL-FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/), [LGPL 3](https://opensource.org/license/lgpl-3-0), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Die [sharp-Projektseite](https://sharp.pixelplumbing.com/) nennt Apache 2.0 für sharp; die Lizenzangaben der mitgelieferten nativen Pakete müssen zusätzlich berücksichtigt werden.

## Außerhalb der npm-Lockdatei

- **Texterkennung:** Der bestehende Code lädt bei Bedarf Tesseract.js 5.1.1 von jsDelivr. Das [Originalprojekt](https://github.com/naptha/tesseract.js/) steht unter Apache 2.0. Nachgeladener Worker, OCR-Kern und Sprachdaten sind nicht vollständig durch die lokale npm-Liste erfasst. Deren konkrete ausgelieferte Versionen und Hinweise müssen vor Veröffentlichung dokumentiert werden; die Funktion wurde hier nicht live aufgerufen. Kein Code- oder Sprachpaket wurde vorsorglich heruntergeladen.
- **Neue 36 Rangabzeichen:** Die vier Originalbilder stammen aus deinem `EvoRank-Codex-Gesamtpaket.zip`. Die Übergabe bezeichnet die Bilder als freigegeben, enthält aber keinen prüfbaren Urheber-/Lizenzvertrag. Die unveränderten Bildtafeln werden durch SVG-Ausschnitte dargestellt. Bitte den Herkunftsnachweis mit Erlaubnis für App Store, Werbung, kommerzielle Nutzung und Bearbeitung aufbewahren. Bei KI-Erstellung gehören auch Anbieterbedingungen und Erstellungsnachweis dazu; fremde Marken dürfen dadurch nicht automatisch verwendet werden.
- **Körpergrafiken, ältere Logos und Übungsillustrationen:** Vorhandene Dateien bleiben unverändert. Für den gesamten Bestand liegt keine vollständige, dateigenaue Rechtekette vor. Generierungsnotizen einzelner Brand-Dateien sind keine umfassende Lizenz für alle App-Bilder. Dies bleibt ein konkreter Veröffentlichungspunkt.
- **Übungskatalog und Rangdaten:** Übungsnamen sind von Textbeschreibungen, Bildern und Datenbankrechten zu unterscheiden. `strength-standards-x4.2.js`, `age-ranking-x4.7.js` und `endurance-ranking-x4.8.js` verwenden dokumentierte Referenzen von Strength Level, Running Level, Swimming Level und Cycling Level. Eine kommerzielle Weiterverwendung dieser Tabellen ist im Projekt nicht nachgewiesen. Die [Strength-Level-Bedingungen](https://strengthlevel.com/terms-and-conditions) beschränken automatisierten Zugriff. Ein Quellenlink ersetzt keine Lizenz. Vor Veröffentlichung Erlaubnis bzw. zulässige Nutzung klären oder die Referenzen durch nachweislich freigegebene/eigene Daten ersetzen. X5.1 verändert diese Rangbasis nicht eigenmächtig.
- **Schriften und Apple-Optik:** Keine eigenen `.ttf`, `.otf` oder `.woff`-Dateien im öffentlichen App-Ordner gefunden. Die neue Oberfläche nutzt Systemschriften und CSS-Materialien. Es wurden keine Apple-Schriftdateien oder SF-Symbol-Grafikpakete kopiert. Apple-ähnliches CSS ist keine native Liquid-Glass-Implementierung und keine App-Store-Zulassung. Bestehende Inline-SVG-Icons sind nicht für jedes Motiv einzeln mit einem Herkunftsnachweis versehen.
- **Eigener Quellcode:** Im Projektstamm wurde keine allgemeine Open-Source-Lizenz für EvoRank gefunden. Git macht den Code weder öffentlich noch automatisch zu Open Source. Es wurde keine pauschale MIT-Lizenz über deine App und fremde Bilder gelegt.
- **Ältere IP-Prüfliste:** `docs/legal/LIFTOFF-RISIKO-UND-IP-CHECKLISTE.md` im App-Bestand nennt bereits mögliche Nähe zu fremden Logos, Texten, Bildern und Gestaltung. Diese Notiz ist weder ein Nachweis einer Verletzung noch eine Freigabe. Ein vollständiger Herkunfts- und Markenvergleich war mit dem gelieferten Material nicht möglich.

## Kosten getrennt von Softwarelizenzen

| Bereich | Einschätzung |
| --- | --- |
| Lokal programmieren und Windows-PWA nutzen | Kein zusätzliches Bibliotheksabo durch diese Änderung erforderlich. |
| Apple App Store | Das [Apple Developer Program](https://developer.apple.com/programs/enroll/) nennt 99 USD pro Mitgliedschaftsjahr, regional in Landeswährung; eine kostenlose App macht die Mitgliedschaft nicht automatisch kostenlos. |
| Hosting / Datenbank | [Netlify](https://www.netlify.com/pricing/) und [Supabase](https://supabase.com/pricing) bieten begrenzte kostenlose Tarife. Mehr Nutzung oder andere Tarife können kosten. Dein tatsächlicher Vertrag und Verbrauch wurden nicht aus einem Konto gelesen. |
| Strava / Garmin | Separate Anbieterbedingungen, Berechtigungen und gegebenenfalls Partnerfreigaben; keine pauschale Kostenfreiheit oder Produktionsfreigabe aus dem vorliegenden Code ableitbar. |
| Spätere In-App-Käufe | Noch nicht implementiert. Dann gelten die gewählten Apple-Verträge und anwendbaren Gebühren; hier wurde kein Zahlungsdienst gebucht oder aktiviert. |

## Bereits erledigt / noch offen

Erledigt: reproduzierbare Paketliste, Sammlung der verfügbaren Originalhinweise, Kennzeichnung der konkreten Prüffälle, keine zusätzliche kostenpflichtige Bibliothek, keine Übertragung des Codes an einen neuen Dienst.

Offen vor Veröffentlichung: kommerzielle Bildrechte und Tabellenrechte belegen; externen OCR-Bestand vollständig erfassen; finale native/serverseitige Binärdateien einschließlich Quellcodeangeboten prüfen. Auch die öffentliche Betreiberanschrift und echte iPhone-/App-Store-Prüfung bleiben separat offen. Nicht als Beleg verwenden, dass „alles kostenlos und rechtlich fertig“ sei.
