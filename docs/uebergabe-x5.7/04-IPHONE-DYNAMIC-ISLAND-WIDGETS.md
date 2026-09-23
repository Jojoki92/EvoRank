# iPhone, Dynamic Island, Widgets und Audio

## Drei unterschiedliche Dinge

1. **Heute nutzbare Web-App/PWA:** Safari oder „Zum Home-Bildschirm“. Vorhandene Aufnahme, Workout und Webtimer. Zuverlässige dauerhafte Ausführung bei gesperrtem iPhone ist nicht nachgewiesen.
2. **Vorhandene native Quellbausteine:** Swift-Dateien für WKWebView-Bridge, ActivityKit, WidgetKit und lokale Alarme. Diese sind im Paket, aber nicht mit Xcode kompiliert oder auf einem Gerät ausgeführt.
3. **Noch herzustellende native App:** Xcode-Projekt, Targets, Host-App, Signierung, tatsächliche Berechtigungen, System-OAuth, Geräteprüfungen, TestFlight und später App Store. Keine IPA und kein fertig integrierter HealthKit-/Hintergrund-GPS-Dienst liegen vor.

Historische App-Store-Notizen nennen umfangreiche Vorbereitungen. Nicht daraus schließen, dass ein vollständiges signiertes Projekt, ein vollständiges Privacy Manifest oder ein Gerätetest existiert. Der tatsächlich enthaltene Swift-/Plist-Bestand ist maßgeblich.

## Vorhandene Dateien unter `projekt/public/rankforge/native/ios/`

| Datei | Zweck |
| --- | --- |
| `README.md` | Integration, Target-Zuordnung und Geräteprüfungen |
| `EvoRankWebBridge.swift` | Nachrichten der eigenen WKWebView-Origin; Alarm-, Widget- und Live-Activity-Anbindung |
| `EvoRankActivityAttributes.swift` | Gemeinsames ActivityKit-Modell |
| `EvoRankLiveActivityManager.swift` | Start/Aktualisierung/Ende der Live Activity |
| `EvoRankLiveActivityWidget.swift` | Sperrbildschirm- und Dynamic-Island-Darstellung |
| `EvoRankSharedWorkoutStore.swift` | Datenübergabe an die Widget Extension per App Group |
| `EvoRankWorkoutWidget.swift` | Home-Screen-Widget mit zuletzt übergebenem Trainingsstand |
| `EvoRankWidgetBundle.swift` | Widget-Bundle-Einstieg |
| `EvoRankAlarmManager.swift` | Audio im Vordergrund und lokale Benachrichtigungsplanung |
| `Info.plist.snippet.xml` | Ausschnitt für Live-Activities/URL-Scheme, keine vollständige App-Konfiguration |

Die Tondatei liegt unter `projekt/public/rankforge/assets/evorank-alarm-x4.5.wav`; Webanbindung/Audioeinstellungen im bestehenden X4.5-Modul. Dateiname X4.5 bedeutet nicht, dass diese Bausteine in X5.7 entfernt sind.

## Integration auf Mac/Xcode

Die mitgelieferte iOS-README setzt iOS 17+ für diese Quellen und Swift-Sprachmodus 5 voraus. Das ist die bisherige Projektvorgabe; aktuelle SDK-/Store-Anforderungen vor Beginn offiziell prüfen.

1. Haupt-App-Target mit WKWebView sowie Widget Extension mit Live Activity erstellen.
2. Eigene Bundle IDs/Apple-Team und echte App Group festlegen. Beispiel `group.com.evorank.shared` in `EvoRankSharedWorkoutStore.swift` ersetzen, in beiden Targets gleich konfigurieren.
3. ActivityAttributes und SharedWorkoutStore beiden Targets zuordnen; Widget-Dateien nur Extension; Manager, Bridge, Alarm nur Haupt-App.
4. Alarm-WAV als Bundle-Ressource hinzufügen. Plist-Ausschnitt sinnvoll integrieren, URL-Scheme `evorank://` registrieren und `evorank://workout/current` in der Host-App behandeln.
5. Bridge vor Erstellung der WKWebView installieren, als Property behalten. Nur die vorhandene eigene HTTPS-Origin autorisieren; Schema, Host, Port und Hauptframe prüfen. Externe Seiten ohne privilegierte Bridge öffnen.
6. OAuth über passenden System-Authentifizierungsdialog integrieren. Web-OAuth nicht ungeprüft in der WKWebView betreiben.
7. Haupt-App und eingebettete Extension signieren. Tatsächlich benötigte Berechtigungen/Datenschutzangaben/Entitlements überprüfen, kein pauschales Hintergrundrecht behaupten.
8. Buildfehler beheben und Tests auf mindestens einem geeigneten realen iPhone durchführen; Unterschiede ohne Dynamic Island berücksichtigen.

Keine Apple-Mitgliedschaft, Team-ID, reale Bundle-ID oder Produktions-Origin für ein neues Projekt erfinden. Die bestehende Domain muss erhalten bleiben.

## Gewünschtes Verhalten und Grenzen

- Timerstatus, Trainingstitel, Satzfortschritt und Audio-Einstellungen gehen lokal an den WKWebView-Handler `evorankLiveActivity`.
- Konfigurations-/Synchronisationsnachrichten sollen keine leeren Activities starten. Ende/Abbruch muss die eigene Activity korrekt beenden.
- Widget und Live Activity nutzen einen Endzeitpunkt; der Widget-Satzstand ist der zuletzt übergebene Stand, kein sekündlicher Hintergrundabruf aus JavaScript.
- Die native Alarmplanung soll den Pausenalarm im Voraus terminieren. Pause, neue Dauer, Fortsetzen und Abbruch ersetzen/entfernen den eigenen Alarm, ohne fremde Benachrichtigungen zu löschen.
- App-Lautstärkeregler gilt für Vordergrund-Audio. Native Mitteilungen richten sich nach iOS-Lautstärke, Fokus/Stummmodus und erteilten Berechtigungen. Kein Critical-Alert-Entitlement ist vorhanden.
- Audio-Session kann andere Wiedergabe absenken oder unterbrechen und danach mit `notifyOthersOnDeactivation` freigeben. Ob eine fremde Musik-App wieder startet, entscheidet deren Verhalten; nicht garantieren.
- PWA allein, dauerhaftes stilles Audio oder bloße JavaScript-Timer ersetzen keinen nativen Hintergrundalarm. TikTok im Vordergrund ist ein expliziter Gerätetestfall.
- Das installierte Home-Screen-Icon ist das freigegebene metallische D+H-Logo. In-App-Akzentfarbe färbt dieses Bitmap nicht automatisch um.

## Verpflichtende Geräte-Prüfmatrix

| Bereich | Testfälle |
| --- | --- |
| Formular/Navigation | Safari und PWA, Statusleiste, Tastatur offen, Querformat, Scrolling, Plus erreichbar |
| Muskel-Auswahl | Core/Unterarme links/rechts, beide Geschlechter, vorne/hinten, hell/dunkel, Abwahl |
| Audio | 0/35/100 %, stumm, Kopfhörer, Musik vorher/nachher, Fokus, Ablehnung der Mitteilungen |
| Pause | 10-Sekunden-Test, ändern/pausieren/fortsetzen/abbrechen, Rennen alter asynchroner Requests |
| Hintergrund | Sperre, Wechsel zu TikTok, Rückkehr nach Ablauf; keine doppelten Töne |
| Live Activity | Start/Update/Ende, kompakt/minimal/erweitert, lange Titel, keine Phantom-Activity |
| Widget | hinzufügen, App Group, Countdown, stale Daten, Deep Link, Neuinstallation |
| Auth | Login/Logout, System-OAuth-Rückkehr, falsche Origin darf Bridge nicht nutzen |

Screenshots und Resultate mit Gerät/iOS/Build notieren. Erst danach Aussagen wie „funktioniert auf iPhone“ treffen.

## Weitere Wünsche getrennt behandeln

- **Hintergrund-GPS:** aktuell kein fertig integrierter nativer Dienst. Lebenszyklus, Pause, Speicherformat, Berechtigungen, Energieverbrauch und Datenschutz erst entwerfen, implementieren und draußen testen.
- **Apple Health:** Wunsch/Erweiterungsmöglichkeit, kein bestätigter fertiger HealthKit-Import. Reale Datentypen und Einwilligungen zuvor festlegen.
- **In-App-Käufe:** geplant, nicht gebaut. StoreKit und Wiederherstellung sind eigenes Folgeprojekt.
- **App Store:** Projekt-/Deviceprüfung, Rechte, Betreiberangaben, Datenschutzerklärung, Privacy Labels, Screenshots, TestFlight und Review bleiben offene Arbeit. Keine Garantie auf Zulassung.
