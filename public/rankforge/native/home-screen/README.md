# EVORANK – Home-Bildschirm

Die Web-App ist bereits als installierbare PWA vorbereitet:

- `manifest.webmanifest` enthält Name, Start-URL, Standalone-Modus, Portrait-Ausrichtung und Shortcuts.
- `icons/evorank-icon-v10.7-180.png` ist das Apple-Touch-Icon mit dem rot-weißen Blitz.
- `icons/evorank-icon-v10.7-192.png` und `icons/evorank-icon-v10.7-512.png` sind die normalen und maskierbaren PWA-Icons.
- die Dateien unter `splash/` decken die vorhandenen iPhone-Startbildschirmgrößen ab.
- `#quick-workout` und `#bodygraph` öffnen die passenden App-Bereiche über Home-Screen-Shortcuts.
- helle und dunkle Favicons passen den Browser-Tab an das Systemdesign an.

## Installation

- iPhone/iPad: In Safari **Teilen → Zum Home-Bildschirm**.
- Android/Chrome: Im Browsermenü **App installieren**.
- Desktop-Chrome/Edge: Installationssymbol in der Adressleiste verwenden.

Für ein späteres natives iOS-Target können dieselben PNG-Quellen in einen Xcode
`AppIcon.appiconset` übernommen werden. Dynamic Island benötigt das separate
ActivityKit-Starterpaket im Ordner `native/ios`.
