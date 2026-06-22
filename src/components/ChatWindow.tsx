// 该组件只负责渲染对话列表。我们在此处引入 react-markdown 插件，
// 它会自动把大模型返回的 文本 转义为 HTML 的 <strong> 标签渲染。

import ReactMarkdown from 'react-markdown';
import type { Message } from '../hooks/useChat';

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  // 过滤掉不展示的 system 预设
  const displayMessages = messages.filter(m => m.role !== 'system');

  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl w-full mx-auto">
      {displayMessages.map((msg, index) => (
        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm ${
            msg.role === 'user' 
              ? 'bg-cyan-600 text-white rounded-tr-none' 
              : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
          }`}>
            <div className="font-bold text-xs mb-1 opacity-60">
              {msg.role === 'user' ? '👤 你' : '🤖 DeepSeek'}
            </div>
            {/* 🎯 引入 Markdown 渲染引擎，自动优雅解析加盛、列表等格式 */}
            <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}