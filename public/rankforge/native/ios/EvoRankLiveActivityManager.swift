import ActivityKit
import Combine
import Foundation

/// Main-app bridge for starting, updating and ending the workout Live Activity.
@MainActor
final class EvoRankLiveActivityManager: ObservableObject {
    static let shared = EvoRankLiveActivityManager()

    @Published private(set) var activity: Activity<EvoRankActivityAttributes>?

    private init() { activity = Activity<EvoRankActivityAttributes>.activities.first }

    func start(
        workoutID: String,
        workoutName: String,
        exerciseName: String,
        currentSet: Int,
        totalSets: Int,
        timerEnd: Date? = nil
    ) throws {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

        let attributes = EvoRankActivityAttributes(
            workoutID: workoutID,
            workoutName: workoutName
        )
        let state = EvoRankActivityAttributes.ContentState(
            exerciseName: exerciseName,
            currentSet: currentSet,
            totalSets: totalSets,
            timerEnd: timerEnd,
            isPaused: false,
            pausedSeconds: 0
        )
        let content = ActivityContent(
            state: state,
            staleDate: timerEnd?.addingTimeInterval(90)
        )

        activity = try Activity.request(
            attributes: attributes,
            content: content,
            pushType: nil
        )
    }

    func update(
        exerciseName: String,
        currentSet: Int,
        totalSets: Int,
        timerEnd: Date?,
        isPaused: Bool,
        pausedSeconds: Int = 0
    ) async {
        let state = EvoRankActivityAttributes.ContentState(
            exerciseName: exerciseName,
            currentSet: currentSet,
            totalSets: totalSets,
            timerEnd: timerEnd,
            isPaused: isPaused,
            pausedSeconds: pausedSeconds
        )
        await activity?.update(
            ActivityContent(
                state: state,
                staleDate: timerEnd?.addingTimeInterval(90)
            )
        )
    }

    func end() async {
        guard let activity else { return }
        await activity.end(nil, dismissalPolicy: .immediate)
        self.activity = nil
    }
}
