import SwiftUI
import WidgetKit

@main
struct EvoRankWidgetBundle: WidgetBundle {
    var body: some Widget {
        EvoRankWorkoutWidget()
        EvoRankLiveActivityWidget()
    }
}
