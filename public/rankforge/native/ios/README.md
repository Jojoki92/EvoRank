# EVORANK X4.5 – iPhone, Alarm, Widget und Dynamic Island

Die Web-App bleibt vollständig nutzbar. Widget, Sperrbildschirm-Live-Activity
und Dynamic Island benötigen zusätzlich eine signierte native iOS-App mit
`WKWebView`, Widget Extension und ActivityKit.

## Xcode-Einrichtung

1. Auf einem Mac in Xcode ein Haupt-App-Target und eine **Widget Extension** mit
   **Include Live Activity** anlegen. Für diese Quellen beide Deployment Targets
   auf **iOS 17 oder neuer** setzen; das Widget verwendet `containerBackground`.
   Swift-Sprachmodus 5 verwenden. Ein fertiges Xcode-Projekt oder eine signierte
   IPA ist nicht Bestandteil dieser Lieferung.
2. Für beide Targets dieselbe App Group aktivieren. Den Wert
   `group.com.evorank.shared` in `EvoRankSharedWorkoutStore.swift` durch die
   echte App Group ersetzen.
3. `EvoRankActivityAttributes.swift` und `EvoRankSharedWorkoutStore.swift`
   beiden Targets zuordnen.
4. `EvoRankWorkoutWidget.swift`, `EvoRankLiveActivityWidget.swift` und
   `EvoRankWidgetBundle.swift` nur der Widget Extension zuordnen.
5. `EvoRankLiveActivityManager.swift`, `EvoRankWebBridge.swift` und
   `EvoRankAlarmManager.swift` nur dem Haupt-App-Target zuordnen. Die Datei
   `../../assets/evorank-alarm-x4.5.wav` zum Haupt-App-Bundle hinzufügen
   (Copy Bundle Resources). UNUserNotificationCenter-Delegate mit eventuell
   anderen nativen Mitteilungsfunktionen koordinieren.
6. Die Werte aus `Info.plist.snippet.xml` übernehmen und den URL-Scheme
   `evorank://` registrieren.
7. Vor Erzeugung der `WKWebView` den Bridge-Wert als Property des View
   Controllers behalten:

   ```swift
   let configuration = WKWebViewConfiguration()
   // appURL ist die bereits verwendete HTTPS-Adresse deiner EvoRank-Website.
   self.evoRankBridge = EvoRankWebBridge.install(in: configuration, appURL: appURL)
   self.webView = WKWebView(frame: .zero, configuration: configuration)
   self.webView.load(URLRequest(url: appURL))
   ```

8. Deep Links wie `evorank://workout/current` in der Haupt-App behandeln und
   das laufende Workout öffnen. Bei dauerhaftem Entfernen der WKWebView ihren
   Script-Message-Handler mit `removeScriptMessageHandler(forName:)` entfernen.
9. Die App darf nur Inhalte der eigenen EvoRank-Origin mit dieser Bridge nutzen.
   Der Handler prüft Hauptframe, Schema, Host und Port. Externe Links getrennt
   öffnen. OAuth (insbesondere Google-/Strava-Anmeldung) über einen System-
   Authentifizierungsdialog integrieren; die Web-OAuth-Strecke nicht blind als
   native WKWebView-Anmeldung übernehmen.
10. Team, Bundle IDs und App Group auf beiden Targets signieren, Widget Extension
    in die App einbetten und auf einem echten iPhone installieren.

## Verhalten

- JavaScript sendet Timerstatus, Beschriftung, Satzfortschritt und Audio-Einstellungen
  an den lokalen `WKWebView`-Handler `evorankLiveActivity`.
- Die Bridge aktualisiert den Home-Screen-Widget-Stand und die Live Activity.
- Configure-/Alarm-/Sync-Nachrichten erzeugen keine leeren Live Activities.
- Eine Pause plant bei erlaubten Mitteilungen vorab eine lokale iOS-Mitteilung.
  Pause, Änderung und Abbruch ersetzen bzw. entfernen nur den eigenen Alarm.
  Generationen verhindern, dass alte asynchrone Anfragen neue Alarme löschen.
- Bei aktiver App spielt ein kurzer AVAudioPlayer-Ton. Wahlweise unterbricht
  AVAudioSession andere Wiedergabe oder senkt sie ab; danach erfolgt
  `notifyOthersOnDeactivation`. Die andere App entscheidet über das Fortsetzen.
- Bei gesperrtem Handy spielt iOS den normalen Mitteilungston, auch wenn die
  WebView ruht. Hinweislautstärke, Fokus und Stummmodus bleiben maßgeblich.
  Kein Critical-Alert-Entitlement und keine dauerhafte stille Audio-Wiedergabe.
- Der App-Regler steuert Vordergrund-Audio; native Mitteilungen nutzen die
  iOS-Lautstärke. 0 % bzw. ausgeschalteter Ton unterdrückt den Alarmton.
- Der Widget-Countdown nutzt den Endzeitpunkt. Satzfortschritt ist der letzte
  übergebene Stand und wird nicht sekündlich aus dem Hintergrund neu geladen.
- Ohne native Bridge bleibt der Web-Timer aktiv; es wird nichts an einen
  fremden Server übertragen.

## Prüfung auf einem echten iPhone erforderlich

Diese Swift-Dateien wurden auf Windows bearbeitet, aber **nicht mit Xcode
kompiliert oder auf einem iPhone ausgeführt**. Prüfen: Ton im Vordergrund,
Spotify/Apple Music vorher/nachher, 0/35/100 %, Kopfhörer, Fokus/Stummmodus,
10-Sekunden-Pause bei Sperre und TikTok, Pause/Fortsetzen/Ändern/Abbrechen,
Rückkehr nach abgelaufenem Timer ohne doppelten Ton, Widget-Neuanlage,
Dynamic Island und App-Neustart. Native Mitteilungen zunächst beim aktiven
Workout über den „Mitteilung“-Schalter freigeben. Kein Hintergrundalarm wird
durch den JavaScript-Timer allein garantiert.

Referenzen: [lokale Mitteilungen](https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/SchedulingandHandlingLocalNotifications.html),
[Audio-Ducking](https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/duckothers),
[ActivityKit](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities).
