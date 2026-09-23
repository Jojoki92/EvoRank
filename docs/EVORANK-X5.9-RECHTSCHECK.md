# EvoRank X5.9 – rechtliche Prüfung und notwendige Betreiberangaben

Stand: 23.09.2026. Eine rechtliche Gesamtfreigabe ist **nicht** erreicht. Eine Garantie, dass keinerlei rechtliche Schwierigkeiten entstehen, ist nicht möglich.

## In X5.9 umgesetzt

- **Kontolöschung vollständig:** Die App versprach „Konto und alle Daten in der Cloud löschen“, der Server löschte aber nur die Trainingssicherung. Jetzt entfernt `rf_account_delete` Login, Cloud-Sicherung, Profil, Freundschaften, Bestenlisten-Einträge, Einwilligungen, Geburtstagsdaten und Sportverbindungen (am echten Supabase-Projekt eingespielt, lokal mit PostgreSQL getestet).
- **Sicherheit:** Hilfsfunktion `rls_auto_enable()` ist nicht mehr ohne Anmeldung aufrufbar. Neue Tabellen sind nur über geprüfte Serverfunktionen erreichbar (RLS an, kein direkter Browserzugriff).
- **Datenschutzerklärung:** tatsächliche Regionen (Supabase EU/Irland, Netlify-Funktionen USA), mögliche USA-Übermittlung, Löschumfang und 30-Tage-Löschung von Wartungskopien (per `pg_cron` am 23.10.2026 automatisch).
- **Nutzungsbedingungen:** Gesundheits- und Sicherheitshinweis (kein Ersatz für ärztliche Beratung), Mindestalter 14 Jahre, Haftungsregel (unbeschränkt bei Vorsatz, grober Fahrlässigkeit und Personenschäden).
- Veraltete Bezeichnung „Produktionscenter“ in Rechtstexten und Einwilligung ersetzt.

## Weiterhin offen (nur Johannes kann das liefern)

- **Anschrift im Impressum** (§ 5 ECG, § 25 MedienG): größtes Risiko. Ohne ladungsfähige Anschrift ist das Impressum unvollständig.
- **Unternehmensstatus** (privat/Gewerbe/Firma, ggf. UID/Firmenbuch).
- **Bildrechte** an Körpergrafiken, Rangbildern, Logos und Referenztabellen.
- **Mindestalter technisch prüfen:** derzeit nur in den Bedingungen geregelt, keine Altersabfrage bei der Registrierung.
- **Leaked-Password-Schutz** in Supabase (Dashboard → Authentication → Passwörter), abhängig vom Tarif.

## Frühere Prüfung (X5.7/X5.8)

Stand: 22.09.2026. Die technischen Korrekturen sind umgesetzt. Eine rechtliche Gesamtfreigabe ist damit **nicht** erreicht. Die folgenden Angaben und Nachweise fehlen tatsächlich; weder ein Hinweis im Impressum noch eine KI-Neugenerierung ersetzt sie. Eine Garantie, dass keinerlei rechtliche Schwierigkeiten entstehen, ist nicht möglich.

### In X5.7 umgesetzt

- Cloud-Sicherung verweigert die Freigabe, wenn das Modul für kontobezogene Einwilligung fehlt. Der alte geräteweite Wert „accepted“ und unzugeordnete Profildaten dürfen keine Übertragung auslösen. Die Oberfläche bestätigt eine Aktivierung erst nach Prüfung des gespeicherten Zustands.
- Die Konto-Anmeldung bleibt ohne Cloud-Einwilligung möglich. Die Registrierung verspricht eine Wiederherstellung auf anderen Geräten jetzt ausdrücklich nur bei optionaler Cloud-Sicherung.
- Das Impressum enthält den bestätigten Betreiber sowie inhaltliche Verantwortung und grundlegende Richtung. Die fehlende öffentliche Anschrift bleibt erkennbar. Datenschutzhinweise beschreiben Zeit/Distanz statt einer dauerhaft gespeicherten GPS-Route und erklären die ungeklärte Minderjährigen-Freigabe. Der veraltete Versionshinweis bei Käufen ist entfernt.
- Die bestehenden Funktionen für getrennte Freigaben, Widerruf, lokalen Export und Löschung bleiben erhalten. Einwilligungstrennung, fehlgeschlagene Anmeldung, begrenzte Feedbackdiagnosen sowie die PostgreSQL-Bestenlistenregeln werden lokal getestet. Dies ersetzt keinen Test des produktiven Supabase-Projekts.

### Was für einen öffentlichen Betrieb noch erforderlich ist

| Thema | Konkreter nächster Schritt |
| --- | --- |
| Betreiber und Unternehmensstatus | Johannes Gumplmayr, Österreich und evorank.fitness@gmail.com sind bestätigt. Bitte die tatsächliche veröffentlichbare Niederlassungsanschrift sowie den Gewerbe-/Unternehmensstatus angeben. Je nach Status sind weitere Register-, Kammer-, Aufsichts- oder UID-Angaben erforderlich. Kostenloser Start und geplante Käufe beantworten diese Einordnung nicht. Keine private Adresse wurde aus anderen Dateien übernommen. [§ 5 ECG](https://www.ris.bka.gv.at/eli/bgbl/i/2001/152/P5/NOR40025801), [USP zur Gewerbeanmeldung](https://www.usp.gv.at/services/suchen-und-finden/lexikon/gewerbeanmeldung.html). |
| Medienrecht | Wohnort/Sitz und gegebenenfalls Unternehmens-/Beteiligungsangaben vervollständigen. Welche Offenlegung erforderlich ist, hängt vom tatsächlichen Medieninhaber und Angebot ab. Die neue Beschreibung ist noch keine vollständige Offenlegung. [§ 25 MedienG](https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10000719&Paragraf=25&ShowPrintPreview=True). |
| Produktions-Datenschutz | Die tatsächlich genutzten Netlify-/Supabase-Projekte, Regionen, gültigen Verträge/AVV, Unterauftragsverarbeiter, mögliche Drittlandtransfers und Lösch-/Backupfristen bestätigen. Anschließend die Empfängerinformation ergänzen und Export, Kontolöschung, Freigabeentzug sowie Datenzugriff zwischen Testkonten am echten Backend prüfen. Ein öffentlich verfügbarer Anbieter-AVV beweist nicht die konkrete Kontokonfiguration. [DSGVO, insbesondere Art. 13, 28, 32 und 44 ff.](https://eur-lex.europa.eu/legal-content/DE-EN/ALL/?from=EN&uri=CELEX%3A32016R0679), [Supabase-AVV](https://supabase.com/legal/customer-resources/data-processing-addendum). |
| Minderjährige | Zielalter und Zielländer festlegen. Für Österreich gilt bei der von § 4 Abs. 4 DSG erfassten Online-Einwilligung die Grenze von 14 Jahren. EU-weit unterscheiden sich die Grenzen; Art. 8 DSGVO erlaubt nationale Absenkungen. Ein verifizierbarer Elternprozess ist noch nicht implementiert. Das Trainingsalter ist keine Einwilligungsprüfung. Ein solcher Prozess oder eine passende Altersbeschränkung muss vor dem entsprechenden öffentlichen Angebot umgesetzt und geprüft werden. [DSG](https://ris.bka.gv.at/geltendeFassung.wxe?Abfrage=bundesnormen&Gesetzesnummer=10001597), [Art. 8 DSGVO](https://eur-lex.europa.eu/legal-content/EN-DE/ALL/?uri=CELEX%3A32016R0679). |
| Bild-, Marken- und Datenrechte | Nachweise für Körpergrafiken, Logos, Rangvorlagen, Katalogtexte und die übernommenen Referenztabellen beschaffen. Die 36 neuen PNGs sind generierte Bearbeitungen der gelieferten Vorlagen. Sie schaffen keinen Nachweis für Rechte an diesen Vorlagen. Die Lizenzanalyse X5.1 nennt insbesondere kommerzielle Tabellen-/Datenbanknutzung und nachgeladenen OCR-Code als Prüfpunkte; diese sind nicht durch das neue UI erledigt. |
| Käufe und Barrierefreiheit | Aktuell gibt es keine Echtgeld-Käufe und kein Abo. Vor deren Einführung müssen die konkreten Kauf-/Verbraucherinformationen, Wiederherstellung, Kündigung/Rücktritt und der anwendbare Barrierefreiheitsumfang umgesetzt werden. Dafür fehlen noch das tatsächliche Produkt und Geschäftsmodell. Eine native App-Store- oder vollständige Barrierefreiheitsprüfung wurde nicht durchgeführt. |

### Angaben anschließend eintragen

Bestätigte öffentliche Betreiberinformationen gehören in `packaging/legal-operator.json`. Mit `npm.cmd run legal:generate` werden die acht Rechtstexte daraus aktualisiert. Hosting-/Fristeninformationen werden im Generator `scripts/build-legal-pages.mjs` anhand bestätigter Fakten ergänzt. Keine Platzhalteranschrift, behauptete Gewerbeanmeldung oder unbestätigten Verträge eintragen.

Die lokalen Pakete veröffentlichen nichts automatisch. Dieser Bericht und die enthaltenen Rechtstexte dürfen nicht als Freigabe für einen sofortigen öffentlichen Start oder den App Store verstanden werden. Für die endgültige Einordnung des konkreten österreichischen Betriebs ist eine qualifizierte Prüfung sinnvoll.
