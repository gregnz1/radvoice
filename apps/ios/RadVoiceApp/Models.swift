import Foundation

struct ReportTemplate: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let title: String
    let sections: [String]
    let normalImpression: String
}

struct TemplateResponse: Codable {
    let templates: [ReportTemplate]
}

struct QualityFlag: Codable, Identifiable, Hashable {
    var id: String { "\(severity)-\(category)-\(message)" }

    let severity: String
    let category: String
    let message: String
}

struct ReportDraft: Codable {
    let templateId: String
    let findings: [String: [String]]
    let impression: String
    let flags: [QualityFlag]
    let report: String
}

struct TranscriptSegment: Codable, Identifiable, Hashable {
    let id: String
    let text: String
    let source: String
    let sequence: Int
    let createdAt: String
}

struct ReportSession: Codable, Identifiable {
    let id: String
    let status: String
    let templateId: String
    let segments: [TranscriptSegment]
    let draft: ReportDraft
    let createdAt: String
    let updatedAt: String
}

