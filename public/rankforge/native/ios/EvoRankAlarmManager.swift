import AVFAudio
import UIKit
import UserNotifications

/// Local notifications survive web-view suspension. Focus and system volume still apply.
@MainActor
final class EvoRankAlarmManager: NSObject, UNUserNotificationCenterDelegate, AVAudioPlayerDelegate {
    static let shared = EvoRankAlarmManager()
    private let center = UNUserNotificationCenter.current()
    private var player: AVAudioPlayer?
    private var generation = 0
    private var handled = Set<String>()
    private var pendingID: String?

    private override init() { super.init(); center.delegate = self }

    func receive(_ body: [String: Any]) {
        let action = body["action"] as? String ?? ""
        if action == "alarm" { Task { await play(body) }; return }
        guard ["start", "resume", "update", "pause", "end", "complete"].contains(action) else { return }
        generation += 1
        let currentGeneration = generation
        if let pendingID, action != "complete" || UIApplication.shared.applicationState == .active {
            center.removePendingNotificationRequests(withIdentifiers: [pendingID])
        }
        guard !["pause", "end", "complete"].contains(action),
              (body["isPaused"] as? Bool) != true,
              (body["notifications"] as? Bool) == true,
              let end = (body["endTimestamp"] as? NSNumber)?.doubleValue,
              end.isFinite, end / 1000 > Date().timeIntervalSince1970,
              let timerID = body["timerId"] as? String, !timerID.isEmpty else { return }
        let identifier = "evorank.rest.\(timerID).\(currentGeneration)"
        pendingID = identifier
        Task {
            let allowed = (try? await center.requestAuthorization(options: [.alert, .sound])) ?? false
            guard allowed, generation == currentGeneration else { return }
            let seconds = end / 1000 - Date().timeIntervalSince1970
            guard seconds > 0 else { return }
            let content = UNMutableNotificationContent()
            content.title = "EvoRank · Pause beendet"
            content.body = "Bereit für den nächsten Satz."
            let level = max(0, min(1, (body["alarmVolume"] as? NSNumber)?.doubleValue ?? 0.8))
            if (body["sound"] as? Bool) == true && level > 0 {
                content.sound = Bundle.main.url(forResource: "evorank-alarm-x4.5", withExtension: "wav") != nil
                    ? UNNotificationSound(named: UNNotificationSoundName("evorank-alarm-x4.5.wav")) : .default
            }
            content.userInfo = ["timerId": timerID, "alarmVolume": level,
                                "interruptOtherAudio": (body["interruptOtherAudio"] as? Bool) ?? true,
                                "sound": (body["sound"] as? Bool) ?? true]
            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: max(1, seconds), repeats: false)
            try? await center.add(UNNotificationRequest(identifier: identifier, content: content, trigger: trigger))
            if generation != currentGeneration { center.removePendingNotificationRequests(withIdentifiers: [identifier]) }
        }
    }

    private func play(_ body: [String: Any], fromNotification: Bool = false) async {
        guard UIApplication.shared.applicationState == .active else { return }
        let id = body["timerId"] as? String ?? ""
        if !id.isEmpty {
            if handled.contains(id) { return }
            if !fromNotification {
                let delivered = await center.deliveredNotifications()
                if delivered.contains(where: { $0.request.identifier.hasPrefix("evorank.rest.\(id).") }) { return }
            }
            guard !handled.contains(id) else { return }
            handled.insert(id)
            if handled.count > 200 { handled = [id] }
        }
        let level = max(0, min(1, (body["alarmVolume"] as? NSNumber)?.doubleValue ?? 0.8))
        guard (body["sound"] as? Bool) != false, level > 0,
              let file = Bundle.main.url(forResource: "evorank-alarm-x4.5", withExtension: "wav") else { return }
        do {
            player?.stop()
            let session = AVAudioSession.sharedInstance()
            let interrupt = (body["interruptOtherAudio"] as? Bool) ?? true
            try session.setCategory(.playback, mode: .default, options: interrupt ? [] : [.duckOthers])
            try session.setActive(true)
            let audio = try AVAudioPlayer(contentsOf: file)
            audio.volume = Float(level); audio.delegate = self; player = audio
            if !audio.play() { finishAudio() }
        } catch { finishAudio() }
    }

    private func finishAudio() {
        player?.stop(); player = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in self.finishAudio() }
    }
    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        guard notification.request.identifier.hasPrefix("evorank.rest.") else { completionHandler([.banner, .sound]); return }
        let body = notification.request.content.userInfo.reduce(into: [String: Any]()) { result, entry in
            if let key = entry.key as? String { result[key] = entry.value }
        }
        Task { @MainActor in await self.play(body, fromNotification: true); completionHandler([.banner]) }
    }
}
