import Foundation
import WidgetKit

struct EvoRankWorkoutSnapshot: Codable, Hashable {
    var title: String
    var detail: String
    var currentSet: Int
    var totalSets: Int
    var remainingSeconds: Int
    var updatedAt: Date
    var timerEnd: Date? = nil
    var isPaused: Bool? = nil

    static let empty = EvoRankWorkoutSnapshot(
        title: "EVORANK",
        detail: "Bereit für dein Training",
        currentSet: 0,
        totalSets: 0,
        remainingSeconds: 0,
        updatedAt: .now
    )
}

enum EvoRankSharedWorkoutStore {
    /// In Xcode an die tatsächlich eingerichtete App Group anpassen.
    static let appGroup = "group.com.evorank.shared"
    private static let key = "evorank.widget.workout.v1"

    private static var defaults: UserDefaults {
        UserDefaults(suiteName: appGroup) ?? .standard
    }

    static func load() -> EvoRankWorkoutSnapshot {
        guard let data = defaults.data(forKey: key),
              let value = try? JSONDecoder().decode(EvoRankWorkoutSnapshot.self, from: data)
        else { return .empty }
        return value
    }

    static func save(_ value: EvoRankWorkoutSnapshot) {
        guard let data = try? JSONEncoder().encode(value) else { return }
        defaults.set(data, forKey: key)
        WidgetCenter.shared.reloadTimelines(ofKind: "EvoRankWorkoutWidget")
    }
}
