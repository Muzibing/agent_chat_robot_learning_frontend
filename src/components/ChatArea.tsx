import { useState } from 'react';
import { useChatCore } from '../context/ChatContext';
import MessageBubble from './MessageBubble';

export default function ChatArea() {
  const { sessions, activeSessionId, loading } = useChatCore();
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const displayMessages = activeSession
    ? activeSession.messages.filter(m => m.role !== 'system')
    : [];

  // 流式输出中：最后一条消息已是 assistant 气泡（打字机逐字更新），
  // 此时不需要再显示重复的 LoadingBubble
  const lastMsg = displayMessages[displayMessages.length - 1];
  const isStreaming = loading && lastMsg?.role === 'assistant';

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 relative bg-tech-grid">
      {!activeSessionId || !activeSession ? (
        /* 无活跃会话时的占位 */
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <p className="text-sm">点击左侧会话或创建新对话</p>
          </div>
        </div>
      ) : (
        <>
          {/* 消息列表 */}
          <main className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-[768px] mx-auto space-y-1">
              {displayMessages.length === 0 ? (
                <WelcomePrompt />
              ) : (
                displayMessages.map((msg, index) => (
                  <MessageBubble key={index} message={msg} index={index} />
                ))
              )}
              {/* 仅在等待首个回复（还没有 assistant 气泡）时显示 LoadingBubble */}
              {loading && !isStreaming && <LoadingBubble />}
              {/* 底部留白，防止输入框遮挡 */}
              <div className="h-4" />
            </div>
          </main>

          {/* 底部输入框 */}
          <ChatInputBar />
        </>
      )}
    </div>
  );
}

/* ===== 内联子组件 ===== */

function WelcomePrompt() {
  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-8 animate-fade-in">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
      <h2 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent mb-2">
        你好，有什么可以帮你的？
      </h2>
      <p className="text-sm text-slate-400 max-w-md text-center">
        我是你的专属 AI 智能助理，支持知识问答、创意生成与代码协作
      </p>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex gap-3 px-2 py-4 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

/* ===== 输入栏 ===== */
function ChatInputBar() {
  const { loading, sendMessage } = useChatCore();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <footer className="px-4 pb-4 pt-2">
      <div className="max-w-[768px] mx-auto">
        <div className={`
          relative flex items-end gap-2 bg-white border border-slate-200
          rounded-2xl px-4 py-3 shadow-md transition-all duration-200
          hover:shadow-lg focus-within:border-blue-400 focus-within:shadow-[0_0_0_4px_rgba(66,133,244,0.1)]
        `}>
          <textarea
            value={input}
            disabled={loading}
            onChange={(e) => {
              setInput(e.target.value);
              // 自动调整高度
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行"
            rows={1}
            className="flex-1 bg-transparent border-none resize-none text-[15px] leading-6 text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-40 max-h-[200px] py-0.5"
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`
              shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
              transition-all duration-200
              ${input.trim() && !loading
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/25 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
            title="发送消息"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-2">
          AI 生成内容可能存在偏差，请核实重要信息
        </p>
      </div>
    </footer>
  );
}
