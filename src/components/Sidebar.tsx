import { useState } from 'react';
import { useChatCore } from '../context/ChatContext';

export default function Sidebar() {
  const {
    sessions,
    activeSessionId,
    user,
    createNewChat,
    deleteChat,
    renameChat,
    selectChat,
    logout,
  } = useChatCore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveRename = (id: string) => {
    renameChat(id, editTitle || '未命名对话');
    setEditingId(null);
  };

  // 折叠态
  if (collapsed) {
    return (
      <aside className="w-0 sm:w-14 bg-[#f0f4f9] border-r border-slate-200 flex flex-col items-center py-3 gap-2 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="w-10 h-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors text-slate-500"
          title="展开侧栏"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button
          onClick={createNewChat}
          className="w-10 h-10 rounded-xl bg-white hover:bg-blue-50 flex items-center justify-center transition-colors shadow-sm text-slate-600 hover:text-blue-600"
          title="新建对话"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-[#f0f4f9] border-r border-slate-200 flex flex-col h-full shrink-0 text-slate-700">
      {/* 顶部操作栏 */}
      <div className="p-3 flex items-center justify-between">
        <button
          onClick={() => setCollapsed(true)}
          className="w-9 h-9 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors text-slate-400"
          title="折叠侧栏"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          onClick={createNewChat}
          className="flex items-center gap-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-all shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新对话
        </button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        <div className="text-[11px] font-semibold text-slate-400 px-3 pt-1 pb-2 uppercase tracking-wider">
          最近
        </div>
        {sessions.length === 0 && (
          <div className="text-xs text-slate-400 text-center py-8">
            暂无对话记录
          </div>
        )}
        {sessions.map((s) => {
          const isActive = s.id === activeSessionId;
          return (
            <div
              key={s.id}
              onClick={() => !editingId && selectChat(s.id)}
              className={`
                group flex items-center justify-between rounded-xl px-3 py-2.5
                text-sm cursor-pointer transition-all duration-150
                ${isActive
                  ? 'bg-white text-slate-800 font-medium shadow-sm'
                  : 'hover:bg-white/60 text-slate-600'
                }
              `}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {editingId === s.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    autoFocus
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveRename(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(s.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="bg-white border border-blue-400 rounded-lg px-2 py-0.5 text-xs text-slate-800 w-full focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="truncate"
                    onDoubleClick={() => startRename(s.id, s.title)}
                    title={s.title + '（双击重命名）'}
                  >
                    {s.title}
                  </span>
                )}
              </div>

              {editingId !== s.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs p-1 rounded hover:bg-red-50"
                  title="删除对话"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 用户信息 */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-semibold text-white text-xs shadow-sm shrink-0">
              {user?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="text-sm font-medium text-slate-700 truncate" title={user || ''}>
              {user}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="退出登录"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
