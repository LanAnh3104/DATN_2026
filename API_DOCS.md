# Tài liệu API (API Documentation) - NexusAI

Tài liệu này mô tả các điểm kết nối (Endpoints) của Backend NexusAI, phục vụ cho giao tiếp giữa Frontend và AI / Automation Engine.

---

## 1. Kiểm tra trạng thái máy chủ (Health Check)
Đảm bảo Backend đang hoạt động bình thường.

- **URL:** `/api/health`
- **Method:** `GET`
- **Headers:** None
- **Body:** None

**Response thành công (200 OK):**
\`\`\`json
{
  "status": "Backend is running!",
  "version": "1.0.0"
}
\`\`\`

---

## 2. Phân tích Website & Sinh Test Case bằng AI
Điểm kết nối cốt lõi để nhận một URL từ người dùng, dùng Playwright mở trang web quét cấu trúc DOM, sau đó đưa qua mô hình AI (Gemini) để sinh ra các kịch bản kiểm thử (Test Cases).

- **URL:** `/api/analyze`
- **Method:** `POST`
- **Headers:** 
  - `Content-Type: application/json`
- **Body:**
\`\`\`json
{
  "url": "https://example.com"
}
\`\`\`

**Response thành công (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Phân tích thành công",
  "urlAnalyzed": "https://example.com",
  "domContext": {
    "title": "Example Domain",
    "inputs": [],
    "buttons": ["More information..."],
    "links": [
      {
        "text": "More information...",
        "href": "https://www.iana.org/domains/example"
      }
    ]
  },
  "testCases": [
    {
      "id": 1696238123000,
      "title": "Kiểm tra hiển thị trang chủ: Example Domain",
      "priority": "Critical",
      "complex": "Low",
      "steps": "navigate(https://example.com) → assert(title === \"Example Domain\")"
    },
    {
      "id": 1696238123001,
      "title": "Phân tích tương tác các Buttons (1 tìm thấy)",
      "priority": "Standard",
      "complex": "Medium",
      "steps": "navigate(https://example.com) → click(button) → wait(networkidle)"
    }
  ]
}
\`\`\`

**Response lỗi (400 Bad Request) - Thiếu tham số:**
\`\`\`json
{
  "error": "Vui lòng cung cấp URL để phân tích."
}
\`\`\`

**Response lỗi (500 Internal Server Error) - Không cào được Web hoặc AI lỗi:**
\`\`\`json
{
  "error": "Đã xảy ra lỗi trong quá trình phân tích trang web.",
  "details": "Timeout 15000ms exceeded."
}
\`\`\`

---
*Tài liệu sẽ được cập nhật liên tục trong quá trình mở rộng hệ thống.*
