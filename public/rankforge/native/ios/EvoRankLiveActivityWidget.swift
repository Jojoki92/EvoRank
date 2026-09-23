import ActivityKit
import Foundation
import SwiftUI
import WidgetKit

struct EvoRankLiveActivityWidget: Widget {
    private let forgeRed = Color(red: 1.0, green: 0.21, blue: 0.35)

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: EvoRankActivityAttributes.self) { context in
            lockScreenView(context)
                .activityBackgroundTint(Color(red: 0.035, green: 0.045, blue: 0.065))
                .activitySystemActionForegroundColor(.white)
                .widgetURL(deepLink(context))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    brandMark
                }
                DynamicIslandExpandedRegion(.trailing) {
                    timer(context.state)
                        .font(.system(.headline, design: .rounded, weight: .bold))
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 2) {
                        Text(context.attributes.workoutName)
                            .font(.caption.weight(.semibold))
                            .lineLimit(1)
                        Text(context.state.exerciseName)
                            .font(.headline.weight(.bold))
                            .lineLimit(1)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 10) {
                        ProgressView(value: context.state.progress)
                            .tint(forgeRed)
                        Text("Satz \(context.state.currentSet)/\(context.state.totalSets)")
                            .font(.caption.weight(.bold))
                            .monospacedDigit()
                    }
                }
            } compactLeading: {
                Image(systemName: "bolt.fill")
                    .foregroundStyle(forgeRed)
            } compactTrailing: {
                timer(context.state)
                    .font(.caption2.weight(.bold))
                    .monospacedDigit()
            } minimal: {
                Image(systemName: "bolt.fill")
                    .foregroundStyle(forgeRed)
            }
            .keylineTint(forgeRed)
            .widgetURL(deepLink(context))
        }
    }

    private var brandMark: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 9)
                .fill(Color.black)
                .frame(width: 34, height: 34)
            Image(systemName: "bolt.fill")
                .foregroundStyle(forgeRed)
        }
        .accessibilityLabel("EVORANK")
    }

    @ViewBuilder
    private func timer(_ state: EvoRankActivityAttributes.ContentState) -> some View {
        if state.isPaused {
            Text(duration(state.pausedSeconds))
        } else if let end = state.timerEnd {
            Text(timerInterval: Date()...max(end, Date()), countsDown: true)
                .monospacedDigit()
        } else {
            Text("Bereit")
        }
    }

    private func duration(_ seconds: Int) -> String {
        String(format: "%d:%02d", max(0, seconds) / 60, max(0, seconds) % 60)
    }

    private func deepLink(_ context: ActivityViewContext<EvoRankActivityAttributes>) -> URL? {
        URL(string: "evorank://workout/\(context.attributes.workoutID)")
    }

    @ViewBuilder
    private func lockScreenView(
        _ context: ActivityViewContext<EvoRankActivityAttributes>
    ) -> some View {
        HStack(spacing: 13) {
            brandMark
            VStack(alignment: .leading, spacing: 3) {
                Text(context.attributes.workoutName.uppercased())
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                Text(context.state.exerciseName)
                    .font(.headline.weight(.bold))
                    .lineLimit(1)
                ProgressView(value: context.state.progress)
                    .tint(forgeRed)
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 3) {
                timer(context.state)
                    .font(.title3.weight(.bold))
                    .monospacedDigit()
                Text("Satz \(context.state.currentSet)/\(context.state.totalSets)")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(15)
    }
}
