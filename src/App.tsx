import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginModal from './components/LoginModal';

export default function App() {
  return (
    <ChatProvider>
      <div className="flex h-screen w-screen overflow-hidden antialiased select-none">
        <Sidebar />
        <ChatArea />
        <LoginModal />
      </div>
    </ChatProvider>
  );
}
