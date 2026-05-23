import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid API URL."
        case .invalidResponse:
            return "Invalid API response."
        case .server(let message):
            return message
        }
    }
}

final class APIClient {
    var baseURL = URL(string: "http://localhost:8787")!

    func fetchTemplates() async throws -> [ReportTemplate] {
        let requestURL = baseURL.appending(path: "templates")
        let (data, response) = try await URLSession.shared.data(from: requestURL)
        try validate(response)
        return try JSONDecoder().decode(TemplateResponse.self, from: data).templates
    }

    func createSession(templateId: String) async throws -> ReportSession {
        let payload = ["templateId": templateId]
        return try await post(path: "sessions", payload: payload)
    }

    func pairSession(code: String) async throws -> ReportSession {
        let normalizedCode = code
            .replacingOccurrences(of: "-", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .uppercased()
        let requestURL = baseURL.appending(path: "sessions/pair/\(normalizedCode)")
        let (data, response) = try await URLSession.shared.data(from: requestURL)
        try validate(response)
        return try JSONDecoder().decode(ReportSession.self, from: data)
    }

    func appendSegment(sessionId: String, text: String, source: String = "iphone") async throws -> ReportSession {
        let payload = [
            "source": source,
            "text": text,
        ]
        return try await post(path: "sessions/\(sessionId)/segments", payload: payload)
    }

    private func post<TPayload: Encodable, TResponse: Decodable>(
        path: String,
        payload: TPayload
    ) async throws -> TResponse {
        let requestURL = baseURL.appending(path: path)
        var request = URLRequest(url: requestURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        try validate(response)
        return try JSONDecoder().decode(TResponse.self, from: data)
    }

    private func validate(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            throw APIError.server("API returned \(httpResponse.statusCode).")
        }
    }
}
