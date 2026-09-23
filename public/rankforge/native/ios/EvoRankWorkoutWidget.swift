import SwiftUI
import WidgetKit

struct EvoRankWorkoutEntry: TimelineEntry {
    let date: Date
    let snapshot: EvoRankWorkoutSnapshot
}

struct EvoRankWorkoutProvider: TimelineProvider {
    func placeholder(in context: Context) -> EvoRankWorkoutEntry {
        EvoRankWorkoutEntry(date: .now, snapshot: .empty)
    }

    func getSnapshot(in context: Context, completion: @escaping (EvoRankWorkoutEntry) -> Void) {
        completion(EvoRankWorkoutEntry(date: .now, snapshot: EvoRankSharedWorkoutStore.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<EvoRankWorkoutEntry>) -> Void) {
        let entry = EvoRankWorkoutEntry(date: .now, snapshot: EvoRankSharedWorkoutStore.load())
        completion(Timeline(entries: [entry], policy: .after(.now.addingTimeInterval(15 * 60))))
    }
}

struct EvoRankWorkoutWidgetView: View {
    let entry: EvoRankWorkoutEntry
    private let accent = Color(red: 1.0, green: 0.21, blue: 0.35)

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack {
                Image(systemName: "bolt.fill").foregroundStyle(accent)
                Text("EVORANK").font(.caption2.weight(.black)).tracking(1.4)
                Spacer()
                if entry.snapshot.isPaused != true, let end = entry.snapshot.timerEnd {
                    Text(timerInterval: Date()...max(Date(), end), countsDown: true)
                        .font(.caption.weight(.bold)).monospacedDigit()
                } else if entry.snapshot.remainingSeconds > 0 {
                    Text(duration(entry.snapshot.remainingSeconds))
                        .font(.caption.weight(.bold)).monospacedDigit()
                }
            }
            Text(entry.snapshot.title).font(.headline.weight(.bold)).lineLimit(1)
            Text(entry.snapshot.detail).font(.caption).foregroundStyle(.secondary).lineLimit(2)
            if entry.snapshot.totalSets > 0 {
                ProgressView(value: Double(entry.snapshot.currentSet), total: Double(entry.snapshot.totalSets))
                    .tint(accent)
                Text("Satz \(entry.snapshot.currentSet)/\(entry.snapshot.totalSets)")
                    .font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
            }
        }
        .containerBackground(Color(red: 0.035, green: 0.045, blue: 0.065), for: .widget)
        .widgetURL(URL(string: "evorank://workout/current"))
    }

    private func duration(_ seconds: Int) -> String {
        String(format: "%d:%02d", max(0, seconds) / 60, max(0, seconds) % 60)
    }
}

struct EvoRankWorkoutWidget: Widget {
    let kind = "EvoRankWorkoutWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: EvoRankWorkoutProvider()) { entry in
            EvoRankWorkoutWidgetView(entry: entry)
        }
        .configurationDisplayName("EVORANK Training")
        .description("Zeigt dein aktuelles Workout und den Satzfortschritt.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
