import AVFoundation
import Foundation
import Speech

@MainActor
final class DictationViewModel: ObservableObject {
    @Published var apiBaseURL = "http://localhost:8787"
    @Published var templates: [ReportTemplate] = []
    @Published var selectedTemplateId = "ct-abdomen-pelvis"
    @Published var currentSession: ReportSession?
    @Published var pairingCode = ""
    @Published var pendingFragment = ""
    @Published var isStreaming = false
    @Published var isRecording = false
    @Published var isPaused = false
    @Published var liveSpeechFragment = ""
    @Published var statusMessage = "Ready"

    private let apiClient = APIClient()
    private var streamTask: Task<Void, Never>?
    private var hasJoinedPairedSession = false
    private let audioEngine = AVAudioEngine()
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-AU"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?

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

    var canSendFragment: Bool {
        currentSession != nil
    }

    var canRecordSpeech: Bool {
        currentSession != nil && hasJoinedPairedSession
    }

    var connectionSummary: String {
        if hasJoinedPairedSession {
            return "Paired with web"
        }

        if currentSession != nil {
            return "Local session created"
        }

        return "Not paired"
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
            pairingCode = currentSession?.pairingCode ?? ""
            hasJoinedPairedSession = false
            statusMessage = "Session created"
        } catch {
            statusMessage = "Could not create session: \(error.localizedDescription)"
        }
    }

    func pairSession() async {
        let code = pairingCode.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !code.isEmpty else {
            statusMessage = "Enter a pairing code"
            return
        }

        configureAPI()

        do {
            currentSession = try await apiClient.pairSession(code: code)
            selectedTemplateId = currentSession?.templateId ?? selectedTemplateId
            pairingCode = currentSession?.pairingCode ?? code
            hasJoinedPairedSession = true
            statusMessage = "Paired with web session"
        } catch {
            statusMessage = "Pairing failed: \(error.localizedDescription)"
        }
    }

    func sendPendingFragment() async {
        let fragment = pendingFragment.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !fragment.isEmpty else { return }

        guard canSendFragment else {
            statusMessage = "Create or join a session before sending"
            return
        }

        if await send(fragment: fragment, source: "iphone") {
            pendingFragment = ""
        }
    }

    func startRecording() async {
        guard canRecordSpeech else {
            statusMessage = "Join a web session by pairing code before recording"
            return
        }

        do {
            try await requestSpeechPermissions()
            try startSpeechRecognition()
            isRecording = true
            isPaused = false
            statusMessage = "Recording"
        } catch {
            statusMessage = "Recording unavailable: \(error.localizedDescription)"
        }
    }

    func pauseRecording() async {
        guard isRecording else { return }

        stopSpeechRecognition()
        isRecording = false
        isPaused = true

        if await sendLiveSpeechFragment(source: "iphone-speech") {
            statusMessage = "Paused and sent fragment"
        } else if liveSpeechFragment.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            statusMessage = "Paused"
        }
    }

    func stopRecording() async {
        guard isRecording || isPaused else { return }

        stopSpeechRecognition()
        isRecording = false
        isPaused = false

        if await sendLiveSpeechFragment(source: "iphone-speech") {
            statusMessage = "Stopped and sent fragment"
        } else if liveSpeechFragment.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            statusMessage = "Stopped"
        }
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
                let sent = await self.send(fragment: fragment, source: "iphone-mock")
                if !sent { break }

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

    private func send(fragment: String, source: String) async -> Bool {
        configureAPI()

        do {
            guard let sessionId = currentSession?.id else {
                statusMessage = "Create or join a session before sending"
                return false
            }

            currentSession = try await apiClient.appendSegment(
                sessionId: sessionId,
                text: fragment,
                source: source
            )
            statusMessage = "Sent fragment"
            return true
        } catch {
            statusMessage = "Send failed: \(error.localizedDescription)"
            return false
        }
    }

    private func sendLiveSpeechFragment(source: String) async -> Bool {
        let fragment = liveSpeechFragment.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !fragment.isEmpty else { return false }

        if await send(fragment: fragment, source: source) {
            liveSpeechFragment = ""
            return true
        }

        return false
    }

    private func requestSpeechPermissions() async throws {
        let speechStatus = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }

        guard speechStatus == .authorized else {
            throw SpeechError.permissionDenied
        }

        let microphoneGranted = await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                continuation.resume(returning: granted)
            }
        }
        guard microphoneGranted else {
            throw SpeechError.permissionDenied
        }
    }

    private func startSpeechRecognition() throws {
        stopSpeechRecognition()

        guard let speechRecognizer, speechRecognizer.isAvailable else {
            throw SpeechError.recognizerUnavailable
        }

        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        recognitionRequest = request

        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak request] buffer, _ in
            request?.append(buffer)
        }

        audioEngine.prepare()
        try audioEngine.start()

        recognitionTask = speechRecognizer.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                if let result {
                    self?.liveSpeechFragment = result.bestTranscription.formattedString
                }

                if error != nil {
                    self?.stopSpeechRecognition()
                    self?.isRecording = false
                    self?.statusMessage = "Speech recognition stopped"
                }
            }
        }
    }

    private func stopSpeechRecognition() {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }

        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
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

enum SpeechError: LocalizedError {
    case permissionDenied
    case recognizerUnavailable

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Microphone and speech recognition permissions are required."
        case .recognizerUnavailable:
            return "Speech recognizer is unavailable."
        }
    }
}
