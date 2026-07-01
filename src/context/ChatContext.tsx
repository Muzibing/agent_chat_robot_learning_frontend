import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ─── 后端地址 ───
const BACKEND_URL = import.meta.env.DEV
  ? 'http://localhost:8000'
  : 'https://your-backend.example.com';

// ─── 类型 ───

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatContextType {
  user: string | null;
  userId: number | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
  loading: boolean;
  loginLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  createNewChat: () => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  renameChat: (id: string, newTitle: string) => Promise<void>;
  selectChat: (id: string) => void;
  sendMessage: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// ─── Provider ───

export function ChatProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loadedSessionIds, setLoadedSessionIds] = useState<Set<string>>(new Set());

  // ── 登录 ──
  const login = async (username: string) => {
    setLoginLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error(`登录失败: ${res.status}`);

      const data = await res.json();
      setUser(data.username);
      setUserId(data.user_id);

      // 将服务端会话转为前端 ChatSession（初始不加载消息）
      const restoredSessions: ChatSession[] = (data.sessions || []).map(
        (s: { id: string; title: string }) => ({
          id: s.id,
          title: s.title,
          messages: [{ role: 'system' as const, content: 'You are a helpful assistant.' }],
        })
      );

      // 如果没有会话（理论上不会，后端会自动创建），则在本地补一个
      if (restoredSessions.length === 0) {
        restoredSessions.push({
          id: '',
          title: '新对话',
          messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
        });
      }

      setSessions(restoredSessions);
      const firstId = restoredSessions[0].id;
      setActiveSessionId(firstId);

      // 如果有有效 session id，预加载首条会话的消息
      if (firstId) {
        setLoadedSessionIds(new Set([firstId]));
        loadSessionMessagesIntoState(firstId);
      }
    } catch (e) {
      console.error('登录失败:', e);
      // 降级：走纯本地模式
      setUser(username);
      setUserId(0);
      const fallbackId = Date.now().toString();
      setSessions([
        {
          id: fallbackId,
          title: '新对话',
          messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
        },
      ]);
      setActiveSessionId(fallbackId);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── 登出 ──
  const logout = useCallback(() => {
    setUser(null);
    setUserId(null);
    setSessions([]);
    setActiveSessionId(null);
    setLoadedSessionIds(new Set());
  }, []);

  // ── 从后端加载指定会话的消息 ──
  const loadSessionMessagesIntoState = async (sessionId: string) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs: Message[] = data.messages || [];

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [
                  { role: 'system' as const, content: 'You are a helpful assistant.' },
                  ...msgs,
                ],
              }
            : s
        )
      );
      setLoadedSessionIds((prev) => new Set(prev).add(sessionId));
    } catch (e) {
      console.error('加载会话消息失败:', e);
    }
  };

  // ── 选中会话（懒加载消息） ──
  const selectChat = useCallback(
    (id: string) => {
      setActiveSessionId(id);
      if (!loadedSessionIds.has(id)) {
        setLoadedSessionIds((prev) => new Set(prev).add(id));
        loadSessionMessagesIntoState(id);
      }
    },
    [loadedSessionIds]
  );

  // ── 新建会话 ──
  const createNewChat = async () => {
    if (userId === null) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, title: '新对话' }),
      });
      if (!res.ok) throw new Error(`创建失败: ${res.status}`);
      const data = await res.json();

      const newSession: ChatSession = {
        id: data.id,
        title: data.title,
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(data.id);
      setLoadedSessionIds((prev) => new Set(prev).add(data.id));
    } catch (e) {
      console.error('创建会话失败:', e);
      // 降级：本地创建
      const fallbackId = Date.now().toString();
      const newSession: ChatSession = {
        id: fallbackId,
        title: '新对话',
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(fallbackId);
    }
  };

  // ── 删除会话 ──
  const deleteChat = async (id: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/sessions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('删除会话失败:', e);
    }

    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0]?.id || null);
      }
      return updated;
    });
    setLoadedSessionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // ── 重命名会话 ──
  const renameChat = async (id: string, newTitle: string) => {
    const title = newTitle || '未命名对话';

    try {
      await fetch(`${BACKEND_URL}/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
    } catch (e) {
      console.error('重命名失败:', e);
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  // ── 打字机效果 ──
  const runTypewriter = (sessionId: string, fullText: string) => {
    let idx = 0;
    let cur = '';
    const timer = setInterval(() => {
      if (idx < fullText.length) {
        cur += fullText.charAt(idx);
        idx++;
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages.slice(0, -1),
                    { role: 'assistant' as const, content: cur },
                  ],
                }
              : s
          )
        );
      } else {
        clearInterval(timer);
        setLoading(false);
      }
    }, 15);
  };

  // ── 发送消息 ──
  const sendMessage = async (inputText: string) => {
    if (!inputText.trim() || loading || !activeSessionId) return;
    setLoading(true);

    const userMsg: Message = { role: 'user', content: inputText };
    const targetSession = sessions.find((s) => s.id === activeSessionId);
    if (!targetSession) return;

    const updatedMessages = [...targetSession.messages, userMsg];

    // 自动标题：首条用户消息截断为标题
    const isFirstQuestion =
      targetSession.messages.filter((m) => m.role !== 'system').length === 0;
    const nextTitle = isFirstQuestion
      ? inputText.length > 12
        ? inputText.substring(0, 12) + '...'
        : inputText
      : targetSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: nextTitle,
              messages: [
                ...updatedMessages,
                { role: 'assistant' as const, content: '...' },
              ],
            }
          : s
      )
    );

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          history: targetSession.messages,   // 不含刚加的 user msg，由后端拼装
          user_id: userId,
          session_id: activeSessionId,
        }),
      });

      const data = await response.json();
      runTypewriter(activeSessionId, data.reply || '（未收到有效回复）');
    } catch (e) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [
                  ...updatedMessages,
                  {
                    role: 'assistant' as const,
                    content: `❌ 连接后端失败，请确认服务器状态。\n> ${e}`,
                  },
                ],
              }
            : s
        )
      );
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        user,
        userId,
        sessions,
        activeSessionId,
        loading,
        loginLoading,
        login,
        logout,
        createNewChat,
        deleteChat,
        renameChat,
        selectChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// ── Hook ──

export function useChatCore() {
  const context = useContext(ChatContext);
  if (!context)
    throw new Error('useChatCore must be used within a ChatProvider');
  return context;
}
