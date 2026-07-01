import { useState } from 'react';
import { useChatCore } from '../context/ChatContext';

export default function LoginModal() {
  const { user, loginLoading, login } = useChatCore();
  const [username, setUsername] = useState('');

  if (user) return null;

  const handleSubmit = () => {
    if (username.trim() && !loginLoading) login(username.trim());
  };

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-fade-in-up">
        {/* Logo */}
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">欢迎使用 ChatRobot</h2>
          <p className="text-xs text-slate-500">请输入用户名以开启智能对话</p>
        </div>

        {/* 输入 */}
        <div className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="输入用户名"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-center"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!username.trim() || loginLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 text-white disabled:text-slate-400 font-medium py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
          >
            {loginLoading ? '连接中...' : '开始使用'}
          </button>
        </div>
      </div>
    </div>
  );
}
