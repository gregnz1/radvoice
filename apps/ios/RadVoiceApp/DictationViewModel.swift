import Foundation

@MainActor
final class DictationViewModel: ObservableObject {
    @Published var apiBaseURL = "http://localhost:8787"
    @Published var templates: [ReportTemplate] = []
    @Published var selectedTemplateId = "ct-abdomen-pelvis"
    @Published var currentSession: ReportSession?
    @Published var pendingFragment = ""
    @Published var isStreaming = false
    @Published var statusMessage = "Ready"

    private let apiClient = APIClient()
    private var streamTask: Task<Void, Never>?

    var selectedTemplateName: String {
        templates.first(where: { $0.id == selectedTemplateId })?.name ?? "Template"
    }

    var transcriptText: String {
        currentSession?.segments.map(\.text).joined(separator: " ") ?? ""
    }

    var draftReport: String {
        currentSession?.draft.report ?? "Create a session to begin."
    }

    var flags: [QualityFlag] {
        currentSession?.draft.flags ?? []
    }

    func load() async {
        configureAPI()

        do {
            templates = try await apiClient.fetchTemplates()
            selectedTemplateId = templates.first?.id ?? selectedTemplateId
            statusMessage = "Connected"
        } catch {
            statusMessage = "API unavailable: \(error.localizedDescription)"
        }
    }

    func createSession() async {
        configureAPI()

        do {
            currentSession = try await apiClient.createSession(templateId: selectedTemplateId)
            statusMessage = "Session created"
        } catch {
            statusMessage = "Could not create session: \(error.localizedDescription)"
        }
    }

    func sendPendingFragment() async {
        let fragment = pendingFragment.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !fragment.isEmpty else { return }

        await send(fragment: fragment, source: "iphone")
        pendingFragment = ""
    }

    func toggleMockStream() {
        if isStreaming {
            stopMockStream()
        } else {
            startMockStream()
        }
    }

    func stopMockStream() {
        streamTask?.cancel()
        streamTask = nil
        isStreaming = false
        statusMessage = "Mock stream stopped"
    }

    private func startMockStream() {
        isStreaming = true
        statusMessage = "Mock stream running"

        streamTask = Task { [weak self] in
            guard let self else { return }
            await self.createSession()

            for fragment in self.mockFragments() {
                if Task.isCancelled { break }
                await self.send(fragment: fragment, source: "iphone-mock")

                do {
                    try await Task.sleep(for: .milliseconds(850))
                } catch {
                    break
                }
            }

            await MainActor.run {
                self.isStreaming = false
                self.streamTask = nil
                self.statusMessage = "Mock stream complete"
            }
        }
    }

    private func send(fragment: String, source: String) async {
        configureAPI()

        do {
            if currentSession == nil {
                currentSession = try await apiClient.createSession(templateId: selectedTemplateId)
            }

            guard let sessionId = currentSession?.id else { return }
            currentSession = try await apiClient.appendSegment(
                sessionId: sessionId,
                text: fragment,
                source: source
            )
            statusMessage = "Sent fragment"
        } catch {
            statusMessage = "Send failed: \(error.localizedDescription)"
        }
    }

    private func configureAPI() {
        if let url = URL(string: apiBaseURL) {
            apiClient.baseURL = url
        }
    }

    private func mockFragments() -> [String] {
        switch selectedTemplateId {
        case "ct-head":
            return [
                "ct head",
                "no bleed no mass effect",
                "ventricles normal",
                "chronic small vessel change",
                "impression no acute",
            ]
        case "chest-xray":
            return [
                "chest xray",
                "heart size normal",
                "lungs clear",
                "no pleural effusion no pneumothorax",
                "impression no acute cardiopulmonary disease",
            ]
        default:
            return [
                "ct abdomen pelvis with contrast",
                "liver fine gallbladder removed",
                "pancreas normal spleen okay",
                "kidneys no hydronephrosis",
                "mild diverticular disease no obstruction",
                "no free air no free fluid",
                "impression nothing acute",
            ]
        }
    }
}

