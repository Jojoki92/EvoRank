# RANKFORGE – Marketing und Google Play

Stand: 24. August 2026

## Klare Positionierung

RANKFORGE ist kein weiterer Trainingsplaner. Die stärkste Botschaft ist:

> Dein Training wird zum Rank-System: Jeder Muskel steigt vom Wood-Rank bis zur Spitze auf.

Das sollte in kurzen Videos innerhalb der ersten zwei Sekunden sichtbar sein: Körpergraph, Rang-Aufstieg und ein konkreter Lift.

## Empfehlenswerte Kanäle

1. **TikTok, Instagram Reels und YouTube Shorts:** dasselbe vertikale Grundvideo, aber Text, Beschreibung und CTA pro Plattform anpassen.
2. **Gym-Micro-Creator:** Trainer und Athleten mit 5.000–50.000 Followern erhalten einen persönlichen Challenge-Code und zeigen ihren echten Bodygraph.
3. **Referral-Challenge:** „Bring einen Freund auf Bronze“ oder ein gemeinsamer 30-Tage-Rank-Aufstieg.
4. **Gym-Kooperationen:** QR-Code auf kleinen Karten am Empfang oder bei Personal Trainern; nicht wahllos plakatieren, sondern mit Einwilligung des Studios.
5. **Build in public:** echte Designverbesserungen, Nutzerfeedback und Vorher/Nachher-Ansichten posten.
6. **Communities:** gezielt in passenden Fitness-Discords, Subreddits oder lokalen Gruppen mit Mehrwert und transparenter Eigenwerbung teilnehmen.

## Drei sofort nutzbare TikTok-Skripte

### 1. „Warum dein Gym-Fortschritt unsichtbar ist“ – 15 Sekunden

- **0–2 s / Hook:** Bildschirmaufnahme des Bodygraphs. Text: „Du wirst stärker – aber wo genau?“
- **2–7 s:** Ein Satz Bankdrücken, danach Brust im Bodygraph antippen.
- **7–12 s:** Wood → Bronze/Platinum als kurze Rank-Animation.
- **12–15 s / CTA:** „Ich baue eine App, die jeden Muskel rankt. Welchen Muskel soll ich als Nächstes testen?“

### 2. „Der Gym-Rank-Test“ – 20 Sekunden

- **0–2 s / Hook:** „Welchen Rank hat deine Brust wirklich?“
- **2–8 s:** Gewicht, Wiederholungen und Körpergewicht eingeben.
- **8–14 s:** Ergebnis mit Rank-Icon und LP-Fortschritt zeigen.
- **14–20 s / CTA:** „Kommentiere Gewicht × Wiederholungen – ich sage dir deinen ungefähren Rank.“

### 3. „30 Tage von Wood zu Bronze“ – Serienformat

- **0–3 s / Hook:** „Tag 1: Alle Muskeln sind Wood.“
- **3–10 s:** heutiges Workout und zwei kurze Trainingsclips.
- **10–15 s:** aktualisierten Bodygraph zeigen.
- **15–18 s / CTA:** „Folge für Tag 2 – Ziel: erster Bronze-Muskel in 30 Tagen.“

## Wichtige Kennzahlen

- 3-Sekunden-Haltequote und durchschnittlich angesehener Videoanteil
- Profil-/Link-Klickrate
- Klick → Installation bzw. PWA-Start
- abgeschlossene Ersteinrichtung
- erstes gespeichertes Workout
- Tag-1- und Tag-7-Retention
- Einladungen pro aktivem Nutzer

Nicht nur Views optimieren. Die wichtigste frühe Kennzahl ist: **Wie viele neue Nutzer speichern innerhalb von 24 Stunden ihr erstes Workout?**

## Google Play: aktueller Weg für RANKFORGE

RANKFORGE ist derzeit eine PWA/Web-App, noch keine direkt hochladbare Android-App. Google Play erwartet für neue Apps ein signiertes Android App Bundle (`.aab`). Google erklärt das Bundle als Veröffentlichungsformat, aus dem Play optimierte APKs für die jeweiligen Geräte erzeugt: https://developer.android.com/guide/app-bundle/

### Empfohlene technische Route

Für den schnellsten Store-Start kann die PWA als **Trusted Web Activity (TWA)** verpackt werden. Dabei öffnet Android die eigene, verifizierte Web-App im Vollbild; Website und App werden über Digital Asset Links verbunden: https://developer.chrome.com/docs/android/trusted-web-activity/

Für RANKFORGE ist mittelfristig **Capacitor** die bessere Route, wenn Push-Benachrichtigungen, Health-/Wearable-Integrationen, Hintergrundtimer oder weitere native Funktionen geplant sind. Capacitor erzeugt ein Android-Studio-Projekt und kann ein signiertes AAB bauen: https://capacitorjs.com/docs/cli/commands/build

### Konto und Voraussetzungen

1. Play-Console-Entwicklerkonto anlegen, Vereinbarung akzeptieren und die einmalige Registrierungsgebühr von **25 US-Dollar** bezahlen. Google verlangt Identitätsprüfung; bei neuen persönlichen Konten außerdem Geräteverifizierung: https://support.google.com/googleplay/android-developer/answer/6112435
2. Bei einem persönlichen Konto, das nach dem 13. November 2023 erstellt wurde, ist vor der Produktion ein geschlossener Test mit mindestens **12 Testern für 14 aufeinanderfolgende Tage** erforderlich: https://support.google.com/googleplay/android-developer/answer/14151465
3. Ziel-SDK beachten: Bis 30. August 2026 gilt für neue Mobile-Apps mindestens Android 15/API 35; ab **31. August 2026** müssen neue Apps und Updates Android 16/API 36 anvisieren. Für RANKFORGE daher direkt API 36 verwenden: https://support.google.com/googleplay/android-developer/answer/11926878

### Store-Eintrag und Prüfung

- App-Name, Kurzbeschreibung, vollständige Beschreibung
- App-Icon, Feature-Grafik und echte Smartphone-Screenshots
- Kategorie „Health & Fitness“, Länder/Regionen und Preis
- öffentlich erreichbare Datenschutzerklärung
- Data-Safety-Angaben passend zum tatsächlichen Datenfluss
- Erklärung zu Werbung, Zielgruppe, Inhaltsbewertung und App-Zugriff
- falls Login existiert: funktionierende Testzugangsdaten/Anleitung für das Review-Team

Google listet diese Review-Angaben offiziell unter „App content“ auf: https://support.google.com/googleplay/android-developer/answer/9859455

### Veröffentlichung

1. Signiertes `.aab` erzeugen und Play App Signing aktivieren.
2. Zuerst internen Test, danach erforderlichen geschlossenen Test starten.
3. Store-Listing und alle App-Content-Erklärungen abschließen.
4. Release Notes eintragen, Fehler/Warnungen beheben und den Release zur Prüfung senden.
5. Nach Freigabe Produktion zunächst kontrolliert veröffentlichen und Abstürze/ANRs beobachten.

Der offizielle Release-Ablauf mit Test-Tracks, App-Signing und Bundle-Upload steht hier: https://support.google.com/googleplay/android-developer/answer/9859348

## Ist Google Play einfacher als der Apple App Store?

Für den Einstieg meistens ja: einmalige 25-US-Dollar-Gebühr statt jährlicher Mitgliedschaft und ein unkomplizierterer Android-Build. Bei einem neuen persönlichen Konto verlängert der verpflichtende 12-Personen-/14-Tage-Test den Start jedoch. Für RANKFORGE ist ein realistischer Plan: zuerst Android-Testgruppe aufbauen, gleichzeitig Store-Material und Datenschutzerklärung fertigstellen, danach Produktion beantragen.

