const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load biến môi trường từ file .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối thành công tới MongoDB!'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Khởi tạo Gemini AI (Sẽ cần API Key)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Khai báo các Models
const User = require('./models/User');
const Project = require('./models/Project');
const TestCase = require('./models/TestCase');

// API Đồng bộ User từ Frontend
app.post('/api/users/sync', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, email, displayName, photoURL, role: 'qa_engineer' });
      await user.save();
      console.log(`[DB] Đã tạo User mới: ${email}`);
    } else {
      user.lastLogin = Date.now();
      await user.save();
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- MODULE 2: PROJECT CRUD ---
app.get('/api/projects/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, targetUrl, owner, description } = req.body;
    const newProject = new Project({ name, targetUrl, owner, description });
    await newProject.save();
    res.json({ success: true, project: newProject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    await TestCase.deleteMany({ project: req.params.id }); 
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MODULE 3: TEST CASE CRUD ---
app.get('/api/testcases/:projectId', async (req, res) => {
  try {
    const testCases = await TestCase.find({ project: req.params.projectId }).sort({ createdAt: -1 });
    res.json({ success: true, testCases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/testcases', async (req, res) => {
  try {
    const { title, priority, complex, steps, project, author } = req.body;
    const newTestCase = new TestCase({ title, priority, complex, steps, project, author });
    await newTestCase.save();
    res.json({ success: true, testCase: newTestCase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/testcases/:id', async (req, res) => {
  try {
    const updatedTestCase = await TestCase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, testCase: updatedTestCase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/testcases/:id', async (req, res) => {
  try {
    await TestCase.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

    // 2. Gửi dữ liệu DOM cho AI để phân tích
    console.log(`[3] Đang gửi dữ liệu cho AI phân tích...`);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Chưa cấu hình GEMINI_API_KEY trong biến môi trường!");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
    const prompt = `Bạn là một kỹ sư Automation QA chuyên nghiệp.
Dưới đây là cấu trúc DOM tóm tắt cào được từ trang ${url}:
${JSON.stringify(domStructure, null, 2)}

Hãy suy luận chức năng của trang này và tự động tạo ra một danh sách các kịch bản kiểm thử (Test Cases) phù hợp (khoảng 3-6 kịch bản).
Yêu cầu bắt buộc: Trả về KẾT QUẢ DUY NHẤT LÀ JSON ARRAY CHUẨN. KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI JSON. KHÔNG DÙNG MARKDOWN BLOCK (\`\`\`json).
Mỗi test case là một JSON Object gồm các thuộc tính:
{
  "id": <chỉ để số tự nhiên ngẫu nhiên lớn như 1712000000>,
  "title": "<Tên kịch bản tiếng Việt ngắn gọn>",
  "priority": "<Chọn 1 trong: Critical, High, Standard, Low>",
  "complex": "<Chọn 1 trong: High, Medium, Low>",
  "steps": "<Dạng chuỗi: navigate(...) → click(...) → assert(...)>"
}`;

    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text();

    // Dọn dẹp chuỗi trả về để tránh lỗi JSON parse nếu AI vô tình xuất markdown
    aiResponse = aiResponse.replace(/^\`\`\`(json)?/gm, '').replace(/\`\`\`$/gm, '').trim();

    const generatedTestCases = JSON.parse(aiResponse);

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

// Endpoint: Thực thi một Test Case cụ thể
app.post('/api/execute', async (req, res) => {
  const { url, testCase } = req.body;

  if (!url || !testCase) {
    return res.status(400).json({ error: 'Thiếu tham số url hoặc testCase để chạy.' });
  }

  try {
    console.log(`[EXEC] Bắt đầu chạy test: ${testCase.title}`);

    // 1. Khởi tạo Playwright
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 2. Mở trang web cần test
    console.log(`[EXEC] Đang truy cập URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // TODO: (Các bước tiếp theo) Sẽ parse chuỗi testCase.steps (VD: click, fill) để giả lập hành động ở đây

    // 3. Chụp ảnh màn hình làm "bằng chứng" (Proof of test)
    const screenshotBuffer = await page.screenshot();
    const screenshotBase64 = screenshotBuffer.toString('base64');

    // 4. Dọn dẹp
    await browser.close();
    console.log(`[EXEC] Hoàn tất test case: ${testCase.title}`);

    res.json({
      success: true,
      message: 'Test case đã chạy thành công (Basic Run)',
      logs: [
        `Khởi tạo môi trường ảo thành công`,
        `Đã truy cập URL: ${url}`,
        `Đã chụp ảnh màn hình xác nhận.`
      ],
      screenshot: `data:image/png;base64,${screenshotBase64}` // Trả về ảnh base64 để render lên UI
    });

  } catch (error) {
    console.error('[EXEC] Lỗi khi chạy test:', error);
    res.status(500).json({ success: false, error: 'Chạy test thất bại', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend NexusAI đang chạy tại: http://localhost:${PORT}`);
});
