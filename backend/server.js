const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load biến môi trường từ file .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo Gemini AI (Sẽ cần API Key)
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!', version: '1.0.0' });
});

// Endpoint: Phân tích URL và tạo Test Case bằng AI
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Vui lòng cung cấp URL để phân tích.' });
  }

  try {
    console.log(`[1] Đang khởi động trình duyệt để cào trang: ${url}...`);
    // 1. Mở Playwright để cào DOM cơ bản
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set timeout 15s để tránh treo server
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Cào các element quan trọng: forms, inputs, buttons, links
    const domStructure = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(el => ({ type: el.type, name: el.name, placeholder: el.placeholder }));
      const buttons = Array.from(document.querySelectorAll('button')).map(el => el.innerText.trim() || 'Unlabeled Button');
      const links = Array.from(document.querySelectorAll('a')).map(el => ({ text: el.innerText.trim(), href: el.getAttribute('href') })).filter(l => l.text);
      return {
        title: document.title,
        inputs: inputs.slice(0, 10), // Giới hạn số lượng để tránh token quá dài
        buttons: buttons.slice(0, 10),
        links: links.slice(0, 10)
      };
    });

    await browser.close();
    console.log(`[2] Cào DOM thành công. Dữ liệu:`, domStructure);

    // 2. Gửi dữ liệu DOM cho AI để phân tích (Hiện tại đang Hardcode, sẽ gắn Gemini vào sau)
    console.log(`[3] Đang gửi dữ liệu cho AI phân tích...`);
    
    /* 
      // TODO: Tích hợp Prompt thật với Gemini AI ở đây
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Bạn là một kỹ sư QA. Hãy phân tích cấu trúc DOM sau và sinh ra 3 kịch bản test case (Test Suites)...`;
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text(); 
    */

    // Dữ liệu giả lập (Mock) trả về cho đến khi có API Key
    const generatedTestCases = [
      { 
        id: Date.now(), 
        title: `Kiểm tra hiển thị trang chủ: ${domStructure.title}`, 
        priority: 'Critical', 
        complex: 'Low', 
        steps: `navigate(${url}) → assert(title === "${domStructure.title}")` 
      },
      { 
        id: Date.now() + 1, 
        title: `Phân tích tương tác các Buttons (${domStructure.buttons.length} tìm thấy)`, 
        priority: 'Standard', 
        complex: 'Medium', 
        steps: `navigate(${url}) → click(button) → wait(networkidle)` 
      },
      { 
        id: Date.now() + 2, 
        title: `Kiểm tra form Inputs (${domStructure.inputs.length} fields)`, 
        priority: 'Critical', 
        complex: 'High', 
        steps: `navigate(${url}) → fill(inputs) → submit() → assert(success)` 
      }
    ];

    console.log(`[4] Hoàn tất. Trả kết quả về Frontend.`);
    res.json({
      success: true,
      message: 'Phân tích thành công',
      urlAnalyzed: url,
      domContext: domStructure,
      testCases: generatedTestCases
    });

  } catch (error) {
    console.error('Lỗi khi phân tích:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình phân tích trang web.', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend NexusAI đang chạy tại: http://localhost:${PORT}`);
});
