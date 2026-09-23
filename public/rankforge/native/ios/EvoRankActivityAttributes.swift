import ActivityKit
import Foundation

/// Add this file to both the main app target and the Widget Extension target.
struct EvoRankActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var exerciseName: String
        var currentSet: Int
        var totalSets: Int
        var timerEnd: Date?
        var isPaused: Bool
        var pausedSeconds: Int

        var progress: Double {
            guard totalSets > 0 else { return 0 }
            return min(1, max(0, Double(currentSet) / Double(totalSets)))
        }
    }

    let workoutID: String
    let workoutName: String
}
