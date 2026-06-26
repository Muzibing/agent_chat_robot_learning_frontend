// 这里使用 React 自定义 Hook 将记忆状态管理、Fetch 请求、打字机步进器完全从 UI 视图中剥离出来。

import { useState } from 'react';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful assistant' }
  ]);
  const [loading, setLoading] = useState(false);

  // 前端打字机效果模拟器
  const runTypewriterEffect = (fullText: string) => {
    let currentIdx = 0;
    let currentText = "";

    const timer = setInterval(() => {
      if (currentIdx < fullText.length) {
        currentText += fullText.charAt(currentIdx);
        currentIdx++;
        
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'assistant', content: currentText };
          return newMsgs;
        });
      } else {
        clearInterval(timer);
        setLoading(false);
      }
    }, 15); // 🚀 15ms 一字，配合 Markdown 渲染体感更佳
  };

  const sendMessage = async (inputText: string) => {
    if (!inputText.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: inputText };
    // 必须用最新的上下文投递后端
    const updatedHistory = [...messages, userMsg];
    
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '🤖 正在思考...' }]);
    setLoading(true);

    try {
      const BACKEND_URL = "http://localhost:8000"; 
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: updatedHistory }),
      });

      if (!response.ok) throw new Error(`服务器异常: ${response.status}`);
      
      const data = await response.json();
      runTypewriterEffect(data.reply || "未收到有效回复");

    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'assistant', content: `❌ 连调失败: ${error}` };
        return newMsgs;
      });
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
}