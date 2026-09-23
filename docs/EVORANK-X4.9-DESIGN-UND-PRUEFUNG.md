# X4.9 · Apple-Leitfaden und Video umgesetzt

Die angehängte Datei `C:\Users\johan\Downloads\SKILL.md` wurde vollständig gelesen.
Die 32,4 Sekunden lange Aufnahme vom 11.09.2026 wurde lokal transkribiert und
anhand von Einzelbildern geprüft. Video und Ton wurden nicht zu einem Dienst hochgeladen.
Die Datei ist ein Leitfaden eines Dritten; ihre Aussagen sind nicht automatisch
offizielle Apple-Spezifikationen. Abgleich erfolgte mit
[Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)
und [Apples Material-Guidelines](https://developer.apple.com/design/human-interface-guidelines/materials).

## Was am Apple-Verhalten fehlte

| Vorher | X4.9 |
| --- | --- |
| Starre CSS-Einblendung, keine direkte Manipulation von Dialogen | Geeignete Informationsdialoge lassen sich am Griff ziehen. Die Oberfläche folgt der Bewegung, übernimmt deren Geschwindigkeit und federt zurück oder schließt. Die Bewegung kann erneut gegriffen werden. |
| Unterschiedliche Drück-Rückmeldungen | Unmittelbare Rückmeldung beim Drücken der gemeinsamen Buttons; Aktion weiterhin erst beim Loslassen. |
| Sehr kleine Beschriftungen und unterschiedliche Flächen | Systemschrift, optische Schriftgrößen, skalierbare Dialogtexte und dezente Materialflächen im bestehenden Theme. |
| Nicht überall sichtbarer Tastaturfokus | Sichtbare Fokusmarkierungen, benannte Dialoge, Fokusumlauf innerhalb des Dialogs und bedienbare Checkboxen. |
| Helle Akzentfarben können weiße Buttontexte schlecht lesbar machen | Primärbuttons wählen Schwarz oder Weiß nach berechnetem Kontrast; die Akzentfarbe bleibt gleich. |
| Wenig Reaktion auf Transparenz-/Kontrastpräferenzen | Feste Flächen bei reduzierter Transparenz, deutlichere Grenzen bei erhöhtem Kontrast. |

Die Darstellung ist unter **Design & Farben → Bedienung & Flächen** umschaltbar.
Apple-inspiriert ist der neue Standard; klassisch bleibt wählbar. Es gibt weiterhin
nur eine App und einen Trainingsspeicher. Formulare und Löschbestätigungen sind
von der Wischgeste ausgeschlossen. Vorhandene Schließen-Aktionen bleiben erhalten.
CSS-Glas ist eine Web-Annäherung und kein natives Liquid Glass. Systemschrift
verwendet die Schrift des jeweiligen Betriebssystems; Apple-Schriftdateien werden
nicht mitgeliefert. Native Widget-/Alarmdateien bleiben der bestehende Quellstand.

## Empfehlungen aus dem Video

| Empfehlung | Ergebnis |
| --- | --- |
| Datenschutz, Nutzungsbedingungen, Cookies | Vorhandene veraltete Texte aktualisiert, Speicherzwecke erklärt und Cookie-Seite ergänzt. |
| Cookie-Zustimmung prüfen | 77 geladene Skripte/Styles plus Einstieg untersucht: keine bekannten Tracking-SDKs und keine automatisch extern geladenen Script-/Iframe-/Bild-Tags gefunden. Kein unnötiges Tracking-Banner ergänzt. Das ist eine statische Prüfung, kein Mitschnitt der produktiven Website. |
| Rückerstattung | Seite für aktuell kostenlose Nutzung und später geplante Käufe ergänzt. Keine pauschale Erstattung versprochen und keine Käufe freigeschaltet. |
| Formulare, Zustimmung, nur notwendige Daten | Cloud-Zustimmung ist bei Anmeldung/Registrierung optional und kontogebunden. Fehlgeschlagene Anmeldung erteilt keine Freigabe. Feedback übernimmt weder Profilnamen noch Account-E-Mail automatisch; Antwortadresse und technische Zähler sind freiwillig. Alte Nachrichten in der Sendewarteschlange werden vor Übermittlung ebenfalls reduziert. |
| Tastatur, Alt-Texte, Kontrast | Benannte Dialoge, sichtbarer Fokus, Tastaturumlauf und fokussierbare Checkboxen. Die neuen Seiten haben sinnvolle Bildtexte und einen Sprunglink. Buttonkontrast wird numerisch geprüft. Keine pauschale WCAG-Konformität behauptet. |
| Verständliche Beschriftung | Bestehende Aktionen behalten konkrete Namen. Der unbelegte Prüfstatus „50 geprüfte Basisübungen“ wird als „50 Basisübungen“ angezeigt. |
| Falsche Bewertungen und unbelegte Aussagen | Keine eingebetteten Testimonials/Bewertungsstatistiken in den untersuchten HTML-Seiten gefunden. Pauschale Sicherheits-/Anonymitätsformulierungen in den betroffenen Hinweisen zurückgenommen. Rang- und native Integrationsgrenzen bleiben ausdrücklich erläutert. |
| Geschäftsdaten | Johannes Gumplmayr, Österreich und evorank.fitness@gmail.com bestätigt. Öffentliche Anschrift noch nicht angegeben. |
| Bildrechte | 134 Bilddateien inventarisiert und mit SHA-256 erfasst. Das beweist Dateibestand, keine Nutzungslizenz. |

## Was vor Veröffentlichung noch fehlt

- **Anschrift:** `packaging/legal-operator.json` vervollständigen und
  `npm.cmd run legal:generate` ausführen. Eine Anschrift wird öffentlich sichtbar.
- **Betrieb:** Tatsächliche Hosting-/Supabase-Regionen, Verträge, Aufbewahrung,
  mögliche Drittlandtransfers und funktionierende Lösch-/Widerrufswege am realen
  Dienst prüfen und ergänzen. Freigaben im Code sind kein Nachweis der Serverkonfiguration.
- **Bild-/Markenrechte:** Für bestehende Anatomiegrafiken und weitere übernommene
  Assets fehlen teilweise belastbare Herkunfts-/Lizenznachweise. X2-Markenentwürfe
  haben dokumentierte Bildgenerierungsnotizen, X3 Entwurfs-Prompts. Diese Unterlagen
  ersetzen keine Rechteklärung für alle späteren Bilder oder eine Markenprüfung.
  Keine fremde Apple-Schrift, Apple-Icons oder Apple-Logos wurden ergänzt.
- **App Store:** Developer-Konto, Xcode-App-Target, Signierung, Bundle-/App-Group-IDs,
  Datenschutzangaben, Altersfreigabe und reale Geräteprüfung fehlen weiterhin.
  Ein Webdesign allein ergibt noch keine veröffentlichte iPhone-App.
- **Spätere Käufe:** Konkrete Produkte, StoreKit-/Serverprüfung, Wiederherstellung,
  Preise, Bedingungen und Tests im Apple-Sandboxkonto sind nicht implementiert.
- **Barrierefreiheit:** VoiceOver, Tastaturablauf im echten Browser, 200-%-Textgröße,
  kleine Displays und sämtliche Farbkombinationen noch auf Geräten testen.

Rechtsquellen für die Einordnung:
[Österreichische Datenschutzbehörde – Cookies](https://dsb.gv.at/faqs/datenschutz-cookies),
[DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu),
[§ 5 ECG](https://www.ris.bka.gv.at/eli/bgbl/i/2001/152/P5/NOR40025801),
[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/),
[Apple – Rückerstattung](https://support.apple.com/de-at/118223).
Die Prüfung reduziert konkrete Fehler; sie ist keine rechtliche Freigabe für den
noch nicht konfigurierten öffentlichen Betrieb.

## Dateien aufgeräumt

Im Windows-Paket steht nur noch die aktuelle Anleitung. Historische Anleitungen,
Entwicklerübergaben und Prüfberichte bleiben im vollständigen Quellpaket.
Am 11.09. wurden 470.884.257 Byte identisch vorhandener Vorbereitungskopien und
doppelter Windows-Dokumente entfernt; Prüfreport in `delivery/CLEANUP-X4.9.json`.
`release:save` bereinigt künftig nach erfolgreicher Lieferung die hashgeprüfte
Vorbereitungskopie automatisch. Frühere Releases und Quellpakete bleiben erhalten.
