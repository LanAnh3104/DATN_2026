# NexusAI - AI-Powered Web Test Automation Engine

NexusAI là một nền tảng Đồ Án Tốt Nghiệp tập trung vào việc tự động hóa quy trình kiểm thử phần mềm bằng Trí tuệ Nhân tạo (AI). Ứng dụng cung cấp giải pháp quét cấu trúc giao diện website, tự động sinh ra các kịch bản kiểm thử (Test Cases), và quản lý quá trình chạy test trực tiếp trên nền tảng Web.

## 🚀 Tính năng nổi bật
- **Phân tích Web bằng AI:** Quét cấu trúc DOM và sinh kịch bản test case tự động bằng Google Gemini / OpenAI.
- **Quản lý Test Suites:** Lưu trữ và quản lý tập hợp các kịch bản kiểm thử cho từng dự án.
- **Thống kê (Analytics):** Báo cáo trực quan về tỷ lệ thành công / thất bại của các lượt chạy test.
- **Xác thực an toàn:** Đăng nhập một chạm bằng tài khoản Google thông qua Firebase Auth.

## 🛠️ Công nghệ sử dụng
### Frontend
- **React.js (Vite)**: Xây dựng giao diện Single Page Application cực nhanh.
- **TailwindCSS**: CSS framework để thiết kế UI hiện đại, Dark Mode.
- **Framer Motion**: Tạo các hiệu ứng chuyển động vi mô (Micro-animations) mượt mà.
- **React Router DOM**: Quản lý điều hướng giữa các trang.
- **Firebase Authentication**: Hệ thống xác thực người dùng.

### Backend (Đang phát triển)
- **Node.js & Express**: Máy chủ API hiệu suất cao.
- **Playwright**: Engine tự động hóa trình duyệt để quét cấu trúc website (Web Scraping / Crawling).
- **Google Generative AI (Gemini)**: Bộ não phân tích cấu trúc DOM và đưa ra quyết định sinh kịch bản kiểm thử.

## 📦 Hướng dẫn cài đặt và chạy ứng dụng

### 1. Khởi chạy Frontend
\`\`\`bash
# Cài đặt các thư viện phụ thuộc
npm install

# Khởi chạy môi trường phát triển (Dev server)
npm run dev
\`\`\`
Mở trình duyệt tại địa chỉ: \`http://localhost:5173\`

### 2. Khởi chạy Backend
\`\`\`bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt thư viện
npm install

# Chạy server
node server.js
\`\`\`
Backend sẽ lắng nghe tại: \`http://localhost:5000\`

---

*Dự án Đồ Án Tốt Nghiệp năm 2026.*
