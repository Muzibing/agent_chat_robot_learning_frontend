import ReactMarkdown from 'react-markdown';
import type { Message } from '../context/ChatContext';

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export default function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 px-2 py-3 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
      style={{ animationDelay: index < 3 ? `${index * 60}ms` : '0ms' }}
    >
      {/* 头像 */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-slate-700 to-slate-600'
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }`}
      >
        {isUser ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        )}
      </div>

      {/* 气泡 */}
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
          isUser
            ? 'bg-blue-50 text-slate-800 rounded-tr-sm border border-blue-100'
            : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100 shadow-sm'
        }`}
      >
        <div className="prose-custom text-[15px]">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
