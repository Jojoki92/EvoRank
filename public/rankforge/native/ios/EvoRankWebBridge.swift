import Foundation
import WebKit

/// Retain for the WKWebView lifetime. Only the configured HTTPS origin can call it.
@MainActor
final class EvoRankWebBridge: NSObject, WKScriptMessageHandler {
    static let messageName = "evorankLiveActivity"
    private var allowedOrigin: URL!
    private var task: Task<Void, Never>?

    static func install(in configuration: WKWebViewConfiguration, appURL: URL) -> EvoRankWebBridge {
        precondition(appURL.scheme == "https", "Use the existing EvoRank HTTPS origin")
        let bridge = EvoRankWebBridge()
        bridge.allowedOrigin = appURL
        configuration.userContentController.add(bridge, name: messageName)
        let source = "window.EVORANK_NATIVE_CAPABILITIES = Object.freeze({alarm:true,liveActivity:true,widget:true});"
        configuration.userContentController.addUserScript(WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        _ = EvoRankAlarmManager.shared
        return bridge
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let origin = message.frameInfo.securityOrigin
        guard message.name == Self.messageName, message.frameInfo.isMainFrame,
              origin.protocol == allowedOrigin.scheme, origin.host == allowedOrigin.host,
              (origin.port == 0 ? 443 : origin.port) == (allowedOrigin.port ?? 443),
              let body = message.body as? [String: Any] else { return }
        let previous = task
        task = Task { await previous?.value; await apply(body) }
    }

    private func apply(_ body: [String: Any]) async {
        let action = string(body["action"], fallback: "update", maximum: 30)
        EvoRankAlarmManager.shared.receive(body)
        guard ["start", "resume", "update", "pause", "end", "complete"].contains(action) else { return }
        let label = string(body["label"], fallback: "Satzpause", maximum: 80)
        let remaining = integer(body["remainingSeconds"], maximum: 86_400)
        let currentSet = integer(body["currentSet"], maximum: 999)
        let totalSets = max(currentSet, integer(body["totalSets"], maximum: 999))
        let paused = (body["isPaused"] as? Bool) ?? false
        let end: Date? = {
            guard !paused, let milliseconds = (body["endTimestamp"] as? NSNumber)?.doubleValue,
                  milliseconds.isFinite, milliseconds > 0 else { return nil }
            return Date(timeIntervalSince1970: milliseconds / 1000)
        }()
        if action == "end" {
            EvoRankSharedWorkoutStore.save(.empty)
            await EvoRankLiveActivityManager.shared.end()
            return
        }
        let completed = action == "complete"
        EvoRankSharedWorkoutStore.save(EvoRankWorkoutSnapshot(
            title: "Aktives Workout", detail: completed ? "Bereit für den nächsten Satz" : label,
            currentSet: currentSet, totalSets: totalSets, remainingSeconds: completed ? 0 : remaining,
            updatedAt: .now, timerEnd: completed ? nil : end, isPaused: paused
        ))
        if completed { await EvoRankLiveActivityManager.shared.end(); return }
        if EvoRankLiveActivityManager.shared.activity == nil {
            try? EvoRankLiveActivityManager.shared.start(workoutID: "current", workoutName: "EVORANK",
                exerciseName: label, currentSet: currentSet, totalSets: max(totalSets, 1), timerEnd: end)
        }
        await EvoRankLiveActivityManager.shared.update(exerciseName: label, currentSet: currentSet,
            totalSets: max(totalSets, 1), timerEnd: end, isPaused: paused, pausedSeconds: paused ? remaining : 0)
    }

    private func string(_ value: Any?, fallback: String, maximum: Int) -> String {
        String(((value as? String) ?? fallback).prefix(maximum))
    }
    private func integer(_ value: Any?, maximum: Int) -> Int {
        min(maximum, max(0, (value as? NSNumber)?.intValue ?? 0))
    }
}
