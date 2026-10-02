# 🤖 NexusAI Test Engine - Nền tảng Kiểm thử Web tự động bằng AI

<div align="center">
  <img src="./public/favicon.svg" alt="NexusAI Logo" width="120" />
  <p><strong>Đồ án tốt nghiệp 2026 - Giải pháp Tự động hóa Kịch bản Kiểm thử bằng Trí tuệ Nhân tạo</strong></p>
</div>

---

## 📑 Mục lục
1. [Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Luồng hoạt động (Workflow)](#3-luồng-hoạt-động-workflow)
4. [Các tính năng cốt lõi](#4-các-tính-năng-cốt-lõi)
5. [Cấu trúc thư mục](#5-cấu-trúc-thư-mục)
6. [Hướng dẫn triển khai & Cài đặt](#6-hướng-dẫn-triển-khai--cài-đặt)

---

## 1. Giới thiệu tổng quan
**NexusAI** ra đời nhằm giải quyết bài toán tốn kém thời gian trong quy trình kiểm thử phần mềm thủ công. Bằng cách kết hợp **Large Language Models (LLMs)** và **Web Automation (Playwright)**, hệ thống có khả năng tự động đọc hiểu giao diện (DOM) của một website bất kỳ và sinh ra các kịch bản kiểm thử (Test Suites) đạt chuẩn kỹ thuật phần mềm.

---

## 2. Kiến trúc hệ thống
Hệ thống được chia làm 3 phân hệ chính:
- **Client (Frontend):** Ứng dụng Single Page Application (SPA) xây dựng bằng **React (Vite)**, cung cấp giao diện Dashboard tương tác thời gian thực, hiển thị trực quan các kịch bản test bằng **TailwindCSS** và **Framer Motion**.
- **API Gateway & Core Logic (Backend):** Máy chủ **Node.js (Express)** đóng vai trò xử lý nghiệp vụ, điều phối quá trình cào dữ liệu DOM bằng **Playwright** trong môi trường Headless.
- **AI Engine (Third-party):** Tích hợp **Google Gemini API / OpenAI API** để phân tích ngữ nghĩa của các node HTML (Inputs, Buttons, Links) và đưa ra phán đoán để viết Test Case.

---

## 3. Luồng hoạt động (Workflow)
1. Người dùng nhập URL môi trường cần test trên giao diện.
2. Frontend gọi API `/api/analyze` truyền URL tới Backend.
3. Backend khởi chạy Playwright, điều khiển trình duyệt ẩn truy cập vào URL.
4. Crawler trích xuất các thành phần tương tác chính (DOM Tree: form, button, input).
5. Dữ liệu DOM được chuẩn hóa và đóng gói vào Prompt gửi cho AI Model.
6. AI phân tích và trả về cấu trúc JSON chứa các Test Case theo mức độ quan trọng (Critical, High, Medium).
7. Backend gửi kết quả lại Frontend để render ra màn hình Dashboard.

---

## 4. Các tính năng cốt lõi
- [x] **SSO Authentication:** Đăng nhập an toàn qua hệ thống nhận diện tài khoản Google (Firebase Auth).
- [x] **AI DOM Analysis:** Tự động bắt và phân tích giao diện UI của ứng dụng mục tiêu.
- [x] **Dynamic Test Suite Generation:** Khởi tạo kịch bản kiểm thử (End-to-end) tự động.
- [ ] **Test Execution Engine:** (Đang phát triển) Tự động chạy ngầm kịch bản test đã sinh ra và bắt lỗi (Pass/Fail).
- [ ] **Real-time Log Streaming:** (Đang phát triển) Truyền dữ liệu log chạy test trực tiếp về Frontend qua WebSockets.
- [ ] **Test Report Analytics:** Báo cáo tổng quan, biểu đồ trực quan hóa dữ liệu tỷ lệ pass/fail.

---

## 5. Cấu trúc thư mục
\`\`\`text
NexusAI/
├── backend/                   # Phân hệ Server Node.js
│   ├── server.js              # Entry point của API Server
│   └── package.json           # Quản lý thư viện backend
├── src/                       # Phân hệ Frontend React
│   ├── assets/                # Hình ảnh, SVG, Icons
│   ├── App.jsx                # Layout chính & Routing
│   ├── firebase.js            # Cấu hình Firebase Authentication
│   ├── index.css              # Reset CSS & Tailwind base
│   └── main.jsx               # Entry point Frontend
├── public/                    # Tài nguyên tĩnh public
├── API_DOCS.md                # Tài liệu chi tiết mô tả API (Tham khảo file này)
└── README.md                  # Giới thiệu dự án (File hiện tại)
\`\`\`

---

## 6. Hướng dẫn triển khai & Cài đặt

### Yêu cầu môi trường
- **Node.js** >= v18.x
- **NPM** >= v9.x
- Tài khoản Firebase (lấy Config Key)
- Tài khoản Google AI Studio (lấy Gemini API Key)

### Chạy hệ thống trên môi trường Local (Dev)

**Bước 1: Khởi động giao diện người dùng (Frontend)**
\`\`\`bash
# Từ thư mục gốc dự án
npm install
npm run dev
\`\`\`
Trình duyệt sẽ khởi chạy tại: `http://localhost:5173`

**Bước 2: Khởi động máy chủ phân tích (Backend)**
\`\`\`bash
# Mở một terminal mới
cd backend
npm install
node server.js
\`\`\`
API Server sẽ lắng nghe tại: `http://localhost:5000`

---
*Bản quyền thuộc về đồ án tốt nghiệp năm 2026. Nghiêm cấm sao chép phục vụ mục đích thương mại.*
