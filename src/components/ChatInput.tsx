// 该组件只负责捕获用户的输入动作，并通过回调函数通知上层。

import { useState, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const submit = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit();
    }
  };

  return (
    <footer className="p-4 border-t border-slate-700 bg-slate-800">
      <div className="max-w-3xl mx-auto flex gap-2">
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "AI 正在全力生成/打印中..." : "问点什么吧... (按下回车发送)"}
          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors shadow-md disabled:opacity-50"
        >
          发送
        </button>
      </div>
    </footer>
  );
}