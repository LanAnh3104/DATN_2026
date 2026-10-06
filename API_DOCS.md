# 📚 Tài liệu Đặc tả Kỹ thuật (Frontend & Backend API)

Tài liệu này cung cấp đặc tả kỹ thuật chi tiết cho cả 2 phân hệ của hệ thống NexusAI Test Engine: **Frontend (Client-side)** và **Backend (RESTful API)**.

---

## Phần 1: Đặc tả Frontend (Client-side)

Phân hệ Frontend được xây dựng bằng React.js, đóng vai trò tương tác trực tiếp với người dùng và quản lý trạng thái (state management) toàn cục của ứng dụng.

### 1. Cấu trúc Component cốt lõi
- **`App` (Main Layout):** Quản lý trạng thái xác thực người dùng (Firebase Auth), điều phối các Route (`/`, `/suites`, `/analytics`, `/settings`), và chứa các background animation (Hexagons, CSS blobs).
- **`Header` & `Footer`:** Chứa thanh điều hướng (Navigation), hiển thị thông tin User Profile, Nút đăng nhập/đăng xuất bằng Google.
- **`Dashboard` (Page):** Màn hình chính nơi người dùng nhập URL. Bao gồm các thành phần con:
  - **`Hero`:** Cung cấp ô Input nhập URL và nút "Phân Tích Bằng AI". Xử lý logic gọi API (Fetch) xuống Backend, quản lý trạng thái Loading (`isAnalyzing`).
  - **`TestCaseCard`:** Component nhận dữ liệu (Props) từ Backend để hiển thị một kịch bản test (Tên, độ phức tạp, độ ưu tiên, steps). Hỗ trợ hover animation và đổ bóng (glow effects).
  - **`ExecutionWidget`:** Bảng điều khiển giả lập việc kích hoạt chạy tất cả các test cases (Run All Tests) và xem log thực thi (Recent Activity).

### 2. Giao tiếp Frontend - Backend
- **Phương thức:** Giao tiếp qua giao thức HTTP (Fetch API).
- **Quản lý lỗi:** Mọi luồng Fetch (`handleAnalyze`) đều được đặt trong khối `try-catch`. Nếu Backend sập hoặc trả về mảng dữ liệu lỗi, Frontend sẽ bắt và hiển thị popup (Alert) thân thiện cho người dùng.
- **Xử lý bất đồng bộ:** Áp dụng `async/await` để chờ AI phân tích xong mới cập nhật DOM, kết hợp hiệu ứng Loading spinner để báo hiệu cho người dùng.

---

## Phần 2: Đặc tả Backend API (RESTful Services)

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
