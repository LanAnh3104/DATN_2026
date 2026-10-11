import os
import json
import re
import time
from playwright.sync_api import sync_playwright
import google.generativeai as genai
from django.conf import settings

def scrape_and_analyze(url):
    """
    1. Dùng Playwright mở URL và cào các phần tử tương tác (button, input, a, form...)
    2. Gửi DOM tóm tắt sang Google Gemini AI để tự động sinh kịch bản Test Cases
    """
    extracted_elements = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        try:
            page.goto(url, timeout=30000, wait_until='domcontentloaded')
            page.wait_for_timeout(2000)
            
            # Trích xuất các element
            elements = page.query_selector_all('button, input, a, select, textarea')
            for el in elements[:25]: # Giới hạn 25 elements tiêu biểu
                try:
                    tag_name = el.evaluate('el => el.tagName.toLowerCase()')
                    text = el.inner_text().strip() if tag_name != 'input' else ''
                    el_type = el.get_attribute('type') or ''
                    el_id = el.get_attribute('id') or ''
                    el_placeholder = el.get_attribute('placeholder') or ''
                    el_name = el.get_attribute('name') or ''
                    
                    # Xác định selector tối ưu
                    selector = ''
                    if el_id:
                        selector = f"#{el_id}"
                    elif el_name:
                        selector = f"{tag_name}[name='{el_name}']"
                    elif el_placeholder:
                        selector = f"{tag_name}[placeholder='{el_placeholder}']"
                    elif text:
                        selector = f"{tag_name}:has-text('{text[:20]}')"
                    else:
                        selector = tag_name
                        
                    extracted_elements.append({
                        'tag': tag_name,
                        'type': el_type,
                        'text': text[:40],
                        'placeholder': el_placeholder,
                        'selector': selector
                    })
                except Exception:
                    continue
        finally:
            browser.close()

    # Phân tích bằng Gemini AI
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env")
        
    genai.configure(api_key=api_key)
    
    prompt = f"""
Bạn là Chuyên gia QA Automation. Hãy phân tích danh sách các phần tử HTML sau từ website: {url}
Các phần tử:
{json.dumps(extracted_elements, ensure_ascii=False, indent=2)}

Nhiệm vụ: Tạo ra danh sách các test case thực tế (Click button, Nhập input, Kiểm tra form) theo định dạng JSON array chuẩn:
[
  {{
    "name": "Tên kịch bản test ngắn gọn tiếng Việt",
    "selector": "CSS selector từ danh sách",
    "action": "click" hoặc "fill",
    "value": "giá trị nếu action là fill, còn click thì để rỗng",
    "expected": "Kết quả kỳ vọng",
    "severity": "CRITICAL" hoặc "HIGH" hoặc "MEDIUM" hoặc "LOW"
  }}
]
Chỉ trả về DUY NHẤT mã JSON array, không kèm bất kỳ giải thích nào khác.
"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    try:
        response = model.generate_content(prompt)
    except Exception:
        # Fallback model
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
    raw_text = response.text
    match = re.search(r'\[.*\]', raw_text, re.DOTALL)
    if match:
        test_cases_json = json.loads(match.group(0))
        return test_cases_json
    else:
        raise ValueError("AI không trả về định dạng JSON hợp lệ.")


def execute_test_cases(url, test_cases):
    """
    Thực thi danh sách test case trên trang bằng Playwright Python
    """
    results = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            page.goto(url, timeout=30000, wait_until='domcontentloaded')
            page.wait_for_timeout(1000)
            
            for tc in test_cases:
                start_time = time.time()
                selector = tc.get('selector', '')
                action = tc.get('action', 'click')
                val = tc.get('value', '')
                
                try:
                    page.wait_for_selector(selector, timeout=5000)
                    if action == 'fill':
                        page.fill(selector, str(val))
                    elif action == 'click':
                        page.click(selector)
                    
                    page.wait_for_timeout(500)
                    duration = round(time.time() - start_time, 2)
                    results.append({
                        **tc,
                        'status': 'PASSED',
                        'duration': duration,
                        'error': None
                    })
                except Exception as ex:
                    duration = round(time.time() - start_time, 2)
                    results.append({
                        **tc,
                        'status': 'FAILED',
                        'duration': duration,
                        'error': str(ex)[:150]
                    })
        finally:
            browser.close()
            
    return results
