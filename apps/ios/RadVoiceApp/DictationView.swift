import Foundation
import SwiftUI

struct DictationView: View {
    @StateObject private var viewModel = DictationViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    connectionSection
                    sessionSection
                    speechSection
                    fragmentSection
                    transcriptSection
                    reportSection
                    flagsSection
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("RadVoice")
            .task {
                await viewModel.load()
            }
        }
    }

    private var connectionSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("API")
                .font(.headline)

            TextField("API URL", text: $viewModel.apiBaseURL)
                .textInputAutocapitalization(.never)
                .keyboardType(.URL)
                .autocorrectionDisabled()
                .textFieldStyle(.roundedBorder)

            Text(viewModel.statusMessage)
                .font(.footnote)
                .foregroundStyle(.secondary)

            Text(viewModel.connectionSummary)
                .font(.caption.bold())
                .foregroundStyle(viewModel.canRecordSpeech ? .green : .secondary)
        }
        .sectionStyle()
    }

    private var sessionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Session")
                .font(.headline)

            Picker("Template", selection: $viewModel.selectedTemplateId) {
                ForEach(viewModel.templates) { template in
                    Text(template.name).tag(template.id)
                }
            }
            .pickerStyle(.menu)

            HStack {
                Button("New Session") {
                    Task { await viewModel.createSession() }
                }
                .buttonStyle(.borderedProminent)

                Button(viewModel.isStreaming ? "Stop Mock" : "Mock iPhone") {
                    viewModel.toggleMockStream()
                }
                .buttonStyle(.bordered)
            }

            HStack {
                TextField("Pairing code", text: $viewModel.pairingCode)
                    .textInputAutocapitalization(.characters)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)

                Button("Join") {
                    Task { await viewModel.pairSession() }
                }
                .buttonStyle(.bordered)
            }

            if let session = viewModel.currentSession {
                Text("Code \(session.pairingCode)")
                    .font(.title3.monospaced().bold())
                    .foregroundStyle(.teal)

                Text(session.id)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .truncationMode(.middle)
            }
        }
        .sectionStyle()
    }

    private var fragmentSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Fragment")
                .font(.headline)

            TextEditor(text: $viewModel.pendingFragment)
                .frame(minHeight: 86)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(.separator), lineWidth: 1)
                )

            Button("Send Fragment") {
                Task { await viewModel.sendPendingFragment() }
            }
            .buttonStyle(.borderedProminent)
            .disabled(!viewModel.canSendFragment || viewModel.pendingFragment.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        .sectionStyle()
    }

    private var speechSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Speech")
                .font(.headline)

            HStack {
                Button(viewModel.isPaused ? "Resume" : "Record") {
                    Task { await viewModel.startRecording() }
                }
                .buttonStyle(.borderedProminent)
                .disabled(viewModel.isRecording || !viewModel.canRecordSpeech)

                Button("Pause") {
                    Task { await viewModel.pauseRecording() }
                }
                .buttonStyle(.bordered)
                .disabled(!viewModel.isRecording)

                Button("Stop") {
                    Task { await viewModel.stopRecording() }
                }
                .buttonStyle(.bordered)
                .disabled(!viewModel.isRecording && !viewModel.isPaused)
            }

            Text(viewModel.liveSpeechFragment.isEmpty ? "No live speech yet." : viewModel.liveSpeechFragment)
                .frame(maxWidth: .infinity, alignment: .leading)
                .font(.body)
                .foregroundStyle(viewModel.liveSpeechFragment.isEmpty ? .secondary : .primary)

            if !viewModel.canRecordSpeech {
                Text("Join a web session by pairing code before recording.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .sectionStyle()
    }

    private var transcriptSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Transcript")
                .font(.headline)

            Text(viewModel.transcriptText.isEmpty ? "No fragments yet." : viewModel.transcriptText)
                .frame(maxWidth: .infinity, alignment: .leading)
                .font(.body)
                .foregroundStyle(viewModel.transcriptText.isEmpty ? .secondary : .primary)
        }
        .sectionStyle()
    }

    private var reportSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Draft Report")
                .font(.headline)

            Text(viewModel.draftReport)
                .frame(maxWidth: .infinity, alignment: .leading)
                .font(.system(.body, design: .monospaced))
                .textSelection(.enabled)
        }
        .sectionStyle()
    }

    private var flagsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Flags")
                .font(.headline)

            if viewModel.flags.isEmpty {
                Text("No flags.")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(viewModel.flags) { flag in
                    Text("\(flag.category): \(flag.message)")
                        .font(.footnote)
                        .foregroundStyle(flag.severity == "critical" ? .red : .orange)
                }
            }
        }
        .sectionStyle()
    }
}

private extension View {
    func sectionStyle() -> some View {
        self
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

#Preview {
    DictationView()
}
