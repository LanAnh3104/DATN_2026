import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { Brain, Play, CheckCircle2, XCircle, Settings, ChevronRight, Activity, Terminal, Sparkles, Zap, LogOut, Code, Cpu, Globe, User, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA ---
const MOCK_CASES = [
  { id: 1, title: 'End-to-End Checkout Flow', priority: 'Critical', complex: 'High', steps: 'navigate(/cart) → input(card) → assert(success)' },
  { id: 2, title: 'OAuth2 Authentication Suite', priority: 'Standard', complex: 'Medium', steps: 'click(login) → intercept(token) → assert(200)' },
  { id: 3, title: 'Real-time WebSocket Sync', priority: 'Standard', complex: 'High', steps: 'connect(ws) → send(ping) → await(pong)' }
];

const MOCK_LOGS = [
  { id: 1, text: 'Worker 1: Success', time: 'auth.spec.js • 2.4s', success: true },
  { id: 2, text: 'Worker 3: Timeout', time: 'payment.spec.js • 30.0s', success: false },
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);

const Hex = ({ color, size, strokeWidth, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={`absolute ${className}`}>
    <g stroke={color} strokeWidth={strokeWidth} fill="none" style={{ filter: `drop-shadow(0 0 12px ${color})` }}>
      <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />
      <polygon points="50,15 80,32.3 80,67.7 50,85 20,67.7 20,32.3" />
      <polygon points="50,25 71.3,37.3 71.3,62.7 50,75 28.7,62.7 28.7,37.3" />
      <polygon points="50,35 62.6,42.3 62.6,57.7 50,65 37.4,57.7 37.4,42.3" />
    </g>
  </svg>
);

const Header = ({ user, showLoginDropdown, setShowLoginDropdown, onLogin, onLogout, lang, setLang }) => {
  const activeClass = "text-white drop-shadow-sm";
  const inactiveClass = "text-slate-400 hover:text-blue-400 transition-colors";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass-panel !bg-slate-900/60 !border-slate-700 rounded-2xl px-6 py-3 flex justify-between items-center shadow-2xl relative">
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-fuchsia-500/40 group-hover:scale-110 transition-all duration-300">
            <Brain size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">
            Nexus<span className="text-blue-400">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-12 text-base font-bold">
          <NavLink to="/" className={({ isActive }) => isActive ? activeClass : inactiveClass}>{lang === 'VI' ? 'Tổng quan' : 'Dashboard'}</NavLink>
          <NavLink to="/suites" className={({ isActive }) => isActive ? activeClass : inactiveClass}>{lang === 'VI' ? 'Dự án' : 'Projects'}</NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? activeClass : inactiveClass}>{lang === 'VI' ? 'Lịch sử' : 'History'}</NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? activeClass : inactiveClass}>{lang === 'VI' ? 'Thống kê' : 'Analytics'}</NavLink>
          {user?.dbRole === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? activeClass : inactiveClass}>{lang === 'VI' ? 'Quản trị' : 'Admin Panel'}</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLang(lang === 'VI' ? 'EN' : 'VI')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
            title="Chuyển đổi ngôn ngữ"
          >
            <Globe size={14} className="text-blue-400" />
            <span>{lang}</span>
          </motion.button>

          <Link to="/settings">
            <motion.button whileHover={{ rotate: 90 }} className="text-slate-400 hover:text-white transition-colors">
              <Settings size={20} />
            </motion.button>
          </Link>

          {user ? (
            <div className="group relative">
              <motion.div whileHover={{ scale: 1.1 }} className="h-10 w-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-blue-500 p-[2px] shadow-md cursor-pointer">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white">
                  <img src={user.photoURL || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt="User" referrerPolicy="no-referrer" />
                </div>
              </motion.div>
              <div className="absolute right-0 mt-3 w-56 py-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                <div className="px-5 py-3 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-xl">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.displayName || "Tester"}</p>
                  <p className="text-xs text-slate-500 truncate mb-2">{user.email || "tester@gmail.com"}</p>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-200">
                    <User size={12} />
                    {user.dbRole === 'admin' ? (lang === 'VI' ? 'Quản trị viên' : 'Administrator') : (lang === 'VI' ? 'Kỹ sư QA (User)' : 'QA Engineer')}
                  </div>
                </div>
                <button onClick={onLogout} className="w-full text-left px-5 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors">
                  <LogOut size={16} />
                  {lang === 'VI' ? 'Đăng xuất khỏi hệ thống' : 'Logout'}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <User size={16} /> {lang === 'VI' ? 'Đăng nhập' : 'Login'}
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const Hero = ({ onAction, lang }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!url) {
      alert("Vui lòng nhập URL hợp lệ!");
      return;
    }
    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      setIsAnalyzing(false);

      if (data.success) {
        onAction(data);
      } else {
        alert("Lỗi từ server: " + data.error);
      }
    } catch (err) {
      setIsAnalyzing(false);
      alert("Không thể kết nối đến Backend: " + err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      className="text-center max-w-4xl mx-auto mb-24 pt-36 relative"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-blue-100 text-blue-600 text-sm font-bold mb-8 shadow-sm shadow-blue-100"
      >
        <Sparkles size={16} className="text-fuchsia-500" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-fuchsia-500">NexusAI Test Engine v2.0</span>
      </motion.div>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight text-white leading-tight">
        {lang === 'VI' ? 'Tự động hóa' : 'Automation'} <br />
        <span className="inline-block mt-2 py-2 relative">
          <span className="text-gradient drop-shadow-sm">{lang === 'VI' ? 'Kiểm Thử Web' : 'Web Testing'}</span>
          <motion.span
            animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 md:-top-2 left-full ml-2 md:ml-4 inline-flex items-center justify-center px-4 py-1 rounded-full bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] border-2 border-white/30 text-xl md:text-3xl lg:text-4xl font-black tracking-normal"
          >
            AI
          </motion.span>
        </span>
      </h1>

      <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
        {lang === 'VI' ? 'Trí tuệ nhân tạo sẽ tự động phân tích cấu trúc, dò tìm lỗi và xây dựng kịch bản kiểm thử cho website của bạn trong nháy mắt.' : 'Artificial intelligence will automatically analyze the structure, find bugs, and build test scripts for your website in the blink of an eye.'}
      </p>

      <div className="relative group mx-auto max-w-2xl">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-fuchsia-500 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
        <div className="relative flex flex-col md:flex-row gap-3 p-3 bg-white/90 backdrop-blur-xl rounded-3xl border border-white shadow-2xl">
          <div className="flex-1 flex items-center px-5">
            <Terminal size={24} className="text-blue-400 mr-4" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-production-url.com"
              className="w-full bg-transparent py-4 outline-none text-xl text-slate-700 placeholder-slate-400 font-mono font-medium"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-glow bg-slate-800 text-white px-8 py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <Loader2 size={20} className="animate-spin text-white" /> : <Zap size={20} className="fill-current text-yellow-400" />}
            <span>{isAnalyzing ? (lang === 'VI' ? 'Đang phân tích...' : 'Analyzing...') : (lang === 'VI' ? 'Phân Tích Bằng AI' : 'Analyze with AI')}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const TestCaseCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isCritical = item.priority === 'Critical';

  // Hiển thị dạng 01, 02 thay vì ID dài ngoằng (1791517701246)
  const displayId = index ? String(index).padStart(2, '0') : String(item.id).padStart(2, '0');

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer border-2"
    >
      <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-bl from-blue-200/50 to-fuchsia-200/50 blur-[40px] rounded-full transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black border-2 transition-all duration-300 flex-shrink-0
              ${isHovered ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30 -rotate-3 scale-110' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}>
              {displayId}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">{item.title}</h4>
              <p className="text-sm text-slate-600 mt-1 font-semibold">Độ phức tạp: <span className="text-slate-800 font-bold">{item.complex}</span></p>
            </div>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border 
            ${isCritical ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
            {item.priority}
          </span>
        </div>
        <div className="pl-20 flex items-start gap-3 text-sm font-mono text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
          <motion.div animate={{ x: isHovered ? [0, 5, 0] : 0 }} transition={{ duration: 1, repeat: Infinity }} className="mt-0.5">
            <Play size={14} className="text-blue-500 fill-current" />
          </motion.div>
          <div className="flex-1 leading-relaxed">
            {item.steps}
          </div>
        </div>

        {/* Nút chạy test */}
        <div className="pl-20 mt-4 flex justify-end h-10">
          <button
            onClick={(e) => { e.stopPropagation(); if (item.onRun) item.onRun(item); }}
            className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform duration-300 ${isHovered ? 'translate-y-0 opacity-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105' : 'translate-y-4 opacity-0 pointer-events-none'}`}
          >
            <Play size={16} className="fill-current" /> Chạy Test
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ExecutionWidget = ({ onAction, lang, onRunAll }) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (onRunAll) {
      setIsRunning(true);
      await onRunAll();
      setIsRunning(false);
    } else {
      setIsRunning(true);
      setTimeout(() => {
        setIsRunning(false);
        onAction();
      }, 2000);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 sticky top-32">
      <motion.div
        variants={itemVariants}
        className="glass-panel rounded-[2rem] p-1.5 relative overflow-hidden bg-white shadow-xl"
      >
        <div className="bg-slate-800 rounded-[1.7rem] p-8 relative z-10 text-white">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Play size={20} className="text-fuchsia-400 fill-current" />
            </div>
            {lang === 'VI' ? 'Bảng Điều Khiển' : 'Control Panel'}
          </h3>
          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-4 text-sm">
              <span className="text-slate-400 font-medium">{lang === 'VI' ? 'Môi trường' : 'Environment'}</span>
              <span className="font-mono text-blue-400 font-bold bg-blue-400/10 px-2 py-1 rounded">Production</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-4 text-sm">
              <span className="text-slate-400 font-medium">{lang === 'VI' ? 'Tài nguyên' : 'Resources'}</span>
              <span className="font-mono text-white font-bold bg-white/10 px-2 py-1 rounded">8 Workers</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRun}
            disabled={isRunning}
            className="btn-glow w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 text-white py-5 rounded-xl font-black text-lg tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(79,70,229,0.4)] disabled:opacity-80"
          >
            {isRunning ? (
              <Loader2 size={24} className="animate-spin text-white" />
            ) : (
              <>
                <span>RUN ALL TESTS</span>
                <ChevronRight size={24} />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="glass-panel rounded-3xl p-8 border-2 border-white/60"
      >
        <h3 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
          <Activity size={18} className="text-blue-500" /> {lang === 'VI' ? 'Hoạt động gần đây' : 'Recent Activity'}
        </h3>
        <div className="space-y-5">
          {MOCK_LOGS.map((log, idx) => (
            <React.Fragment key={log.id}>
              <motion.div whileHover={{ x: 5 }} className="flex gap-4 items-start cursor-default">
                <div className={`mt-0.5 p-1.5 rounded-full ${log.success ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  {log.success ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-rose-600" />}
                </div>
                <div>
                  <p className={`text-[15px] font-bold ${log.success ? 'text-slate-800' : 'text-rose-600'}`}>{log.text}</p>
                  <p className="text-xs font-mono text-slate-400 mt-1.5 font-medium">{log.time}</p>
                </div>
              </motion.div>
              {idx === 0 && <div className="h-px w-full bg-slate-100"></div>}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

const Footer = ({ lang }) => (
  <footer className="border-t border-slate-800/50 bg-slate-900/40 backdrop-blur-xl relative z-10 pt-16 pb-8 mt-20">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
              <Brain size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">
              Nexus<span className="text-blue-400">AI</span>
            </span>
          </div>
          <p className="text-slate-400 text-base max-w-sm leading-relaxed mb-6">
            {lang === 'VI'
              ? 'Nền tảng kiểm thử tự động hóa bằng Trí tuệ nhân tạo. Tối ưu hóa quy trình, phát hiện lỗi nhanh chóng và xây dựng sản phẩm hoàn hảo.'
              : 'AI-powered automated testing platform. Optimize workflows, detect bugs instantly, and build flawless products.'}
          </p>
          <div className="flex items-center gap-5 text-slate-400 mt-2">
            <a href="https://github.com/LanAnh3104/DATN_2026" target="_blank" rel="noreferrer" className="hover:text-blue-400 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] transition-all cursor-pointer bg-slate-800/50 p-2.5 rounded-full border border-slate-700/50">
              <Code size={18} />
            </a>
            <a href="#" className="hover:text-rose-400 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(251,113,133,0.8)] transition-all cursor-pointer bg-slate-800/50 p-2.5 rounded-full border border-slate-700/50">
              <Play size={18} />
            </a>
            <a href="#" className="hover:text-fuchsia-400 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(232,121,249,0.8)] transition-all cursor-pointer bg-slate-800/50 p-2.5 rounded-full border border-slate-700/50">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white text-lg font-bold mb-4">{lang === 'VI' ? 'Sản Phẩm' : 'Products'}</h4>
          <ul className="space-y-3 text-base text-slate-400">
            <li><Link to="/features" className="hover:text-blue-400 transition-colors">{lang === 'VI' ? 'Tính năng' : 'Features'}</Link></li>
            <li><Link to="/pricing" className="hover:text-blue-400 transition-colors">{lang === 'VI' ? 'Bảng giá' : 'Pricing'}</Link></li>
            <li><Link to="/cases" className="hover:text-blue-400 transition-colors">Case Studies</Link></li>
            <li><Link to="/docs" className="hover:text-blue-400 transition-colors">{lang === 'VI' ? 'Tài liệu API' : 'API Docs'}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-lg font-bold mb-4">{lang === 'VI' ? 'Công Ty' : 'Company'}</h4>
          <ul className="space-y-3 text-base text-slate-400">
            <li><Link to="/about" className="hover:text-blue-400 transition-colors">{lang === 'VI' ? 'Về chúng tôi' : 'About us'}</Link></li>
            <li><Link to="/careers" className="hover:text-blue-400 transition-colors">{lang === 'VI' ? 'Tuyển dụng' : 'Careers'}</Link></li>
            <li><Link to="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">{lang === 'VI' ? 'Liên hệ' : 'Contact'}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} NexusAI Test Engine. {lang === 'VI' ? 'Đồ án tốt nghiệp.' : 'Graduation Project.'}
        </p>
        <div className="flex gap-6 text-sm text-slate-500">
          <Link to="/privacy" className="hover:text-white transition-colors">{lang === 'VI' ? 'Chính sách bảo mật' : 'Privacy Policy'}</Link>
          <Link to="/terms" className="hover:text-white transition-colors">{lang === 'VI' ? 'Điều khoản dịch vụ' : 'Terms of Service'}</Link>
        </div>
      </div>
    </div>
  </footer>
);

// --- PAGES ---
const Dashboard = ({ handleProtectedAction, testCases, lang, onRunTest, onRunAll }) => (
  <main className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
    <Hero onAction={(data) => handleProtectedAction(data)} lang={lang} />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Activity className="text-blue-600" size={24} />
            </div>
            {lang === 'VI' ? 'Kịch bản Đề Xuất' : 'Suggested Test Cases'}
          </h2>
          <span className="text-sm font-mono font-bold bg-white shadow-sm border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full">
            {testCases.length} CASES READY
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {testCases.map((item, index) => (
            <TestCaseCard key={item.id} item={{ ...item, onRun: onRunTest }} index={index + 1} />
          ))}
        </motion.div>
      </div>

      <div className="lg:col-span-4">
        <ExecutionWidget onAction={handleProtectedAction} lang={lang} onRunAll={onRunAll} />
      </div>
    </div>
  </main>
);

const TestSuites = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');

  useEffect(() => {
    if (user?.uid) {
      fetch(`http://localhost:5000/api/projects/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setProjects(data.projects);
        });
    }
  }, [user]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjectName || !newProjectUrl) return;
    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName, targetUrl: newProjectUrl, owner: user.uid, description: 'Test Project' })
      });
      const data = await res.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
        setNewProjectName('');
        setNewProjectUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa dự án này? (Sẽ xóa luôn toàn bộ Test Case bên trong)")) {
      try {
        await fetch(`http://localhost:5000/api/projects/${id}`, { method: 'DELETE' });
        setProjects(projects.filter(p => p._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 pb-24 pt-32 relative z-10 min-h-screen">
      <div className="glass-panel p-10 rounded-3xl bg-slate-900/60 border border-slate-700">
        <h1 className="text-4xl font-black text-white mb-6 flex items-center gap-3">
          <Terminal className="text-blue-500" /> Quản lý Dự Án Kiểm Thử
        </h1>
        
        {user ? (
          <div className="space-y-8">
            <form onSubmit={handleAddProject} className="flex gap-4 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <input type="text" placeholder="Tên dự án (VD: Shopee Clone)" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 text-white focus:outline-none focus:border-blue-500" />
              <input type="url" placeholder="URL trang web..." value={newProjectUrl} onChange={e => setNewProjectUrl(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 text-white focus:outline-none focus:border-blue-500" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Tạo Dự Án Mới</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => (
                <div key={p._id} className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 transition-colors relative group">
                  <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{p.targetUrl}</p>
                  <button onClick={() => handleDelete(p._id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <XCircle size={20} />
                  </button>
                  <div className="mt-4 flex gap-2">
                     <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Chưa chạy test</span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <div className="col-span-full text-center py-10 text-slate-500">Chưa có dự án nào. Hãy tạo một dự án mới.</div>}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl text-slate-400 font-bold mb-4">Vui lòng đăng nhập để xem danh sách dự án.</h2>
          </div>
        )}
      </div>
    </main>
  );
};

const History = () => (
  <main className="max-w-7xl mx-auto px-6 pb-24 pt-32 relative z-10 min-h-screen">
    <div className="glass-panel p-10 rounded-3xl bg-slate-900/60 border border-slate-700">
      <h1 className="text-4xl font-black text-white mb-6">Lịch sử Chạy Test</h1>
      <p className="text-slate-400">Xem lại báo cáo của những lần thực thi trước đây.</p>
      <div className="mt-8 border-2 border-dashed border-slate-600 rounded-xl h-64 flex items-center justify-center text-slate-500">
        Tính năng đang được phát triển...
      </div>
    </div>
  </main>
);

const AdminPanel = () => (
  <main className="max-w-7xl mx-auto px-6 pb-24 pt-32 relative z-10 min-h-screen">
    <div className="glass-panel p-10 rounded-3xl bg-slate-900/60 border border-slate-700">
      <h1 className="text-4xl font-black text-white mb-6 text-fuchsia-400">Bảng Điều Khiển Quản Trị Viên</h1>
      <p className="text-slate-400">Khu vực dành riêng cho Admin quản lý toàn bộ hệ thống.</p>
      <div className="mt-8 border-2 border-dashed border-slate-600 rounded-xl h-64 flex items-center justify-center text-slate-500">
        Tính năng đang được phát triển...
      </div>
    </div>
  </main>
);

const Analytics = () => (
  <main className="max-w-7xl mx-auto px-6 pb-24 pt-32 relative z-10 min-h-screen">
    <div className="glass-panel p-10 rounded-3xl bg-slate-900/60 border border-slate-700">
      <h1 className="text-4xl font-black text-white mb-6">Thống kê & Báo cáo</h1>
      <p className="text-slate-400">Xem biểu đồ tỷ lệ thành công, hiệu suất test và báo cáo lỗi chi tiết.</p>
      {/* Placeholder content */}
      <div className="mt-8 border-2 border-dashed border-slate-600 rounded-xl h-64 flex items-center justify-center text-slate-500">
        Tính năng đang được phát triển...
      </div>
    </div>
  </main>
);

const SettingsPage = () => (
  <main className="max-w-7xl mx-auto px-6 pb-24 pt-32 relative z-10 min-h-screen">
    <div className="glass-panel p-10 rounded-3xl bg-slate-900/60 border border-slate-700">
      <h1 className="text-4xl font-black text-white mb-6">Cài đặt hệ thống</h1>
      <p className="text-slate-400">Tùy chỉnh môi trường, tài khoản và các khóa API.</p>
      {/* Placeholder content */}
      <div className="mt-8 border-2 border-dashed border-slate-600 rounded-xl h-64 flex items-center justify-center text-slate-500">
        Tính năng đang được phát triển...
      </div>
    </div>
  </main>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [testCases, setTestCases] = useState(MOCK_CASES); // Lưu trữ state của Test Cases
  const [targetUrl, setTargetUrl] = useState('https://google.com'); // Lưu URL đang test
  const [execResult, setExecResult] = useState(null); // Lưu kết quả trả về từ backend
  const [lang, setLang] = useState('VI');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const res = await fetch('http://localhost:5000/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL
            })
          });
          const data = await res.json();
          if (data.success) {
            setUser({ ...currentUser, dbRole: data.user.role });
          } else {
            setUser(currentUser);
          }
        } catch (err) {
          console.error("Lỗi đồng bộ User DB:", err);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleProtectedAction = (data) => {
    if (!user) {
      setShowLoginDropdown(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (data && data.testCases) {
        setTestCases(data.testCases);
        if (data.urlAnalyzed) setTargetUrl(data.urlAnalyzed);
        alert(`AI đã phân tích xong URL: ${data.urlAnalyzed}\nSinh ra thành công ${data.testCases.length} Test Cases!`);
      } else {
        alert("Hành động chạy test đã được kích hoạt thành công!");
      }
    }
  };

  const handleRunTest = async (testCase) => {
    if (!user) {
      setShowLoginDropdown(true);
      return;
    }
    try {
      alert(`Đang khởi chạy Test Case: ${testCase.title}...\n(Backend đang bật trình duyệt, vui lòng đợi vài giây!)`);
      const res = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, testCase })
      });
      const data = await res.json();
      if (data.success) {
        setExecResult(data);
      } else {
        alert("Lỗi chạy test: " + data.error);
      }
    } catch (err) {
      alert("Lỗi kết nối Backend: " + err.message);
    }
  };

  const handleRunAllTests = async () => {
    if (!user) {
      setShowLoginDropdown(true);
      return;
    }
    if (!testCases || testCases.length === 0) {
      alert("Chưa có Test Case nào để chạy. Vui lòng phân tích AI trước!");
      return;
    }
    
    alert(`Bắt đầu chạy tuần tự ${testCases.length} kịch bản...\nVui lòng xem bảng console hoặc chờ kết quả tổng hợp.`);
    
    let passed = 0;
    let failed = 0;
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`Đang chạy test ${i+1}/${testCases.length}: ${testCase.title}`);
      try {
        const res = await fetch('http://localhost:5000/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl, testCase })
        });
        const data = await res.json();
        if (data.success) {
          passed++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
      }
    }
    
    alert(`Đã chạy xong toàn bộ ${testCases.length} Test Cases!\n\nKết quả:\n✅ Thành công: ${passed}\n❌ Thất bại: ${failed}`);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginDropdown(false);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đăng nhập thất bại. Vui lòng kiểm tra lại cấu hình Firebase.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-600 via-slate-800 to-slate-900">
        {/* Animated Background Hexagons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] right-[calc(50%+400px)]">
            <Hex color="#10b981" size={700} strokeWidth={0.5} className="opacity-40" />
          </motion.div>
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} className="absolute bottom-[5%] right-[calc(50%+500px)]">
            <Hex color="#3b82f6" size={500} strokeWidth={0.5} className="opacity-30" />
          </motion.div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 200, repeat: Infinity, ease: "linear" }} className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2">
            <Hex color="#6366f1" size={900} strokeWidth={0.3} className="opacity-[0.15]" />
          </motion.div>
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 160, repeat: Infinity, ease: "linear" }} className="absolute top-[30%] left-[calc(50%+400px)]">
            <Hex color="#d946ef" size={550} strokeWidth={0.6} className="opacity-40" />
          </motion.div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 190, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[10%] left-[calc(50%+300px)]">
            <Hex color="#10b981" size={800} strokeWidth={0.5} className="opacity-30" />
          </motion.div>
        </div>

        {/* Light gradient overlay to smooth out colors */}
        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none z-0 backdrop-blur-[2px]"></div>

        {/* Animated Background Blobs */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        {/* Header */}
        <Header
          user={user}
          showLoginDropdown={showLoginDropdown}
          setShowLoginDropdown={setShowLoginDropdown}
          onLogin={handleLogin}
          onLogout={handleLogout}
          lang={lang}
          setLang={setLang}
        />

        {/* Global Login Modal */}
        <AnimatePresence>
          {showLoginDropdown && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                onClick={() => setShowLoginDropdown(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-[2rem] p-8 md:p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* Glow effects */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-fuchsia-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                <button onClick={() => setShowLoginDropdown(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-2 rounded-full backdrop-blur-sm z-20">
                  <XCircle size={20} />
                </button>

                <div className="text-center mb-10 relative z-10">
                  <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-blue-600 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-6 border border-white/20">
                    <Brain size={44} />
                  </div>
                  <h3 className="font-black text-white text-3xl tracking-tight mb-3">{lang === 'VI' ? 'Chào mừng trở lại!' : 'Welcome back!'}</h3>
                  <p className="text-slate-400 font-medium text-sm px-4">{lang === 'VI' ? 'Đăng nhập để trải nghiệm hệ thống kiểm thử tự động hóa bằng AI.' : 'Sign in to experience the AI-powered automated testing system.'}</p>
                </div>

                <button
                  onClick={handleLogin}
                  className="group relative w-full bg-slate-800/80 border border-slate-700 hover:border-blue-500 hover:bg-slate-700 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-lg overflow-hidden active:scale-[0.98] z-10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <GoogleIcon />
                  <span className="relative z-10 text-[15px]">{lang === 'VI' ? 'Tiếp tục với Google' : 'Continue with Google'}</span>
                </button>

                <p className="mt-8 text-[11px] text-center text-slate-500 relative z-10 leading-relaxed">
                  {lang === 'VI' ? 'Bằng cách đăng nhập, bạn đồng ý với' : 'By signing in, you agree to our'} <br />
                  <a href="#" className="text-slate-300 hover:text-blue-400 hover:underline">{lang === 'VI' ? 'Điều khoản dịch vụ' : 'Terms of Service'}</a> & <a href="#" className="text-slate-300 hover:text-blue-400 hover:underline">{lang === 'VI' ? 'Chính sách bảo mật' : 'Privacy Policy'}</a>
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Routes Setup */}
        <Routes>
          <Route path="/" element={<Dashboard handleProtectedAction={handleProtectedAction} testCases={testCases} lang={lang} onRunTest={handleRunTest} onRunAll={handleRunAllTests} />} />
          <Route path="/suites" element={<TestSuites user={user} />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={user?.dbRole === 'admin' ? <AdminPanel /> : <div className="text-center pt-32 text-white">403 - Forbidden</div>} />
        </Routes>

        <Footer lang={lang} />
      </div>

      {/* Modal hiển thị kết quả Test (Screenshot) */}
      <AnimatePresence>
        {execResult && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              onClick={() => setExecResult(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col"
            >
              <button onClick={() => setExecResult(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full z-20">
                <XCircle size={20} />
              </button>
              <h3 className="font-black text-white text-2xl mb-2">Kết quả Test: {execResult.message}</h3>
              <div className="text-emerald-400 text-sm mb-4 font-mono">
                {execResult.logs?.map((log, i) => <div key={i}>&gt; {log}</div>)}
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950 flex items-center justify-center">
                <img src={execResult.screenshot} alt="Test Result Screenshot" className="max-h-[60vh] object-contain shadow-lg" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Router>
  );
}
