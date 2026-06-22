// 📁 src/App.tsx (精简后的装配主入口)
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useChat } from './hooks/useChat';

export default function App() {
  // 引入逻辑 Hook 的状态解耦
  const { messages, loading, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-100">
      <header className="py-4 border-b border-slate-700 text-center bg-slate-800 shadow-md">
        <h1 className="text-xl font-bold text-cyan-400">DeepSeek RAG AI 助手</h1>
        <p className="text-xs text-slate-400 mt-1">工程化解耦 | 纯前端打字机 + Markdown 增强版</p>
      </header>

      {/* 消息历史渲染区 */}
      <ChatWindow messages={messages} />

      {/* 用户交互控制区 */}
      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  );
}