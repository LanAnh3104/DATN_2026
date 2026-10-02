# 📚 Tài liệu Đặc tả Giao diện Lập trình Ứng dụng (API Documentation)

Hệ thống NexusAI Test Engine giao tiếp thông qua kiến trúc **RESTful API**, chuẩn hóa định dạng dữ liệu trả về theo chuẩn JSON. Tài liệu này cung cấp đặc tả kỹ thuật chi tiết cho các lập trình viên tích hợp hệ thống.

---

## 📌 Bảng tóm tắt các Endpoints

| Endpoint | Method | Mô tả chức năng | Tình trạng |
|---|---|---|---|
| `/api/health` | `GET` | Kiểm tra trạng thái máy chủ (Healthcheck) | Đang phát triển |
| `/api/analyze` | `POST` | Phân tích URL, quét DOM và sinh Test Cases bằng AI | Đang phát triển |
| `/api/execute` | `POST` | (Dự kiến) Khởi chạy bộ kiểm thử trực tiếp trên server | Đang phát triển |
| `/api/reports` | `GET` | (Dự kiến) Lấy dữ liệu thống kê báo cáo kiểm thử | Đang phát triển |

---

## ⚙️ Đặc tả chi tiết từng Endpoint

### 1. Kiểm tra trạng thái (Health Check)
Sử dụng để Load Balancer hoặc K8s ping kiểm tra xem Node.js server có đang hoạt động hay không.

- **URL:** `/api/health`
- **Method:** `GET`
- **Authentication Required:** No

#### Response: `200 OK`
\`\`\`json
{
  "status": "Backend is running!",
  "version": "1.0.0",
  "uptime_seconds": 1205.4
}
\`\`\`

---

### 2. Trích xuất DOM & Sinh Test Case bằng AI (Core Engine)
Đây là API nặng nhất của hệ thống. Nó sẽ cấp phát một Headless Browser bằng thư viện Playwright, truy cập vào trang đích, vượt qua các rào cản cơ bản, trích xuất cây DOM (nhấn mạnh vào Inputs, Forms, Buttons, Links) và gửi cho LLM (Large Language Model) để nhận diện pattern nhằm sinh ra Test Suites.

- **URL:** `/api/analyze`
- **Method:** `POST`
- **Authentication Required:** Dự kiến sẽ thêm Bearer Token (JWT) trong tương lai.

#### Headers Yêu cầu:
- `Content-Type: application/json`

#### Body (Request Payload):
\`\`\`json
{
  "url": "https://example.com/login",
  "deepScan": false // (Tương lai: Cho phép quét đa tầng các sub-pages)
}
\`\`\`

#### Response: `200 OK` (Phân tích và Sinh thành công)
\`\`\`json
{
  "success": true,
  "message": "Phân tích thành công",
  "urlAnalyzed": "https://example.com/login",
  "domContext": {
    "title": "Login - Example Portal",
    "inputs": [
      { "type": "email", "name": "userEmail", "placeholder": "Enter your email" },
      { "type": "password", "name": "userPassword", "placeholder": "Enter password" }
    ],
    "buttons": ["Sign In", "Forgot Password?", "Create Account"],
    "links": [
      { "text": "Terms of Service", "href": "/terms" }
    ]
  },
  "testCases": [
    {
      "id": 1696238123000,
      "title": "Kiểm tra luồng đăng nhập đúng thông tin (Happy Path)",
      "priority": "Critical",
      "complex": "High",
      "steps": "navigate(/login) → fill(email, pass) → click(Sign In) → assert(url === /dashboard)"
    },
    {
      "id": 1696238123001,
      "title": "Kiểm tra hiển thị thông báo lỗi khi bỏ trống mật khẩu",
      "priority": "Standard",
      "complex": "Medium",
      "steps": "navigate(/login) → fill(email) → click(Sign In) → assert(Error Message)"
    },
    {
      "id": 1696238123002,
      "title": "Kiểm tra điều hướng Forgot Password",
      "priority": "Low",
      "complex": "Low",
      "steps": "navigate(/login) → click(Forgot Password) → assert(url === /forgot-password)"
    }
  ]
}
\`\`\`

#### Response: `400 Bad Request` (Dữ liệu đầu vào sai)
\`\`\`json
{
  "error": "Vui lòng cung cấp URL hợp lệ để phân tích."
}
\`\`\`

#### Response: `500 Internal Server Error` (Lỗi Server, Cào lỗi hoặc AI Limit)
Trường hợp trang web chặn bot (Captcha), hoặc hết token AI, hệ thống sẽ throw error.
\`\`\`json
{
  "error": "Đã xảy ra lỗi trong quá trình phân tích trang web.",
  "details": "net::ERR_NAME_NOT_RESOLVED at https://invalid-url.com"
}
\`\`\`

---

## 🔒 Hướng phát triển sắp tới
- **Chuẩn hóa REST API:** Áp dụng chuẩn JSON API (JSON:API specification).
- **Rate Limiting:** Tích hợp `express-rate-limit` để giới hạn số lượt quét (ví dụ: 10 requests / 1 phút / 1 IP) để tránh spam gây kiệt quệ tài nguyên máy chủ do Playwright ngốn khá nhiều RAM.
- **Microservices:** Có thể tách riêng service cào web bằng Playwright và service giao tiếp với LLM ra làm 2 container khác nhau để dễ scale-up.
