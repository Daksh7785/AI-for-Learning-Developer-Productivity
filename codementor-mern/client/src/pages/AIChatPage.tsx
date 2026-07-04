import { useEffect, useState, useRef } from 'react';
import { Brain, Send, Plus, Trash2, MessageSquare, RefreshCw, ChevronLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { aiService } from '../services/aiService';
import { repositoryService } from '../services/repositoryService';
import { useNotification } from '../contexts/NotificationContext';
import type { Chat, Message, Repository } from '../types';

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <Brain className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm shadow-lg shadow-blue-500/20'
            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-300">
          U
        </div>
      )}
    </div>
  );
}

export default function AIChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { error: notifyError } = useNotification();

  // Load initial data
  useEffect(() => {
    const init = async () => {
      try {
        const [chatData, repoData] = await Promise.allSettled([
          aiService.getChats(),
          repositoryService.getAll(),
        ]);
        if (chatData.status === 'fulfilled') setChats(chatData.value);
        if (repoData.status === 'fulfilled') setRepositories(repoData.value.filter((r) => r.status === 'ready'));
      } finally {
        setLoadingChats(false);
      }
    };
    init();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const openChat = async (chat: Chat) => {
    setActiveChat(chat);
    setLoadingMessages(true);
    try {
      const { messages: msgs } = await aiService.getChat(chat.id);
      setMessages(msgs);
    } catch {
      notifyError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
    setShowSidebar(false);
  };

  const startNewChat = async () => {
    try {
      const title = selectedRepoId
        ? `Chat about ${repositories.find((r) => r.id === selectedRepoId)?.name || 'Repository'}`
        : 'New Chat';
      const chat = await aiService.createChat(title, selectedRepoId || undefined);
      setChats((prev) => [chat, ...prev]);
      setActiveChat(chat);
      setMessages([]);
      setShowSidebar(false);
    } catch {
      notifyError('Failed to create chat');
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      await aiService.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChat?.id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch {
      notifyError('Failed to delete chat');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !activeChat) return;
    const userContent = input.trim();
    setInput('');
    setSending(true);

    // Optimistic UI
    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      chatId: activeChat.id,
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const newMessages = await aiService.sendMessage(activeChat.id, userContent);
      // Replace temp message with real ones
      setMessages((prev) => [
        ...prev.filter((m) => !m.id.startsWith('temp-')),
        ...newMessages,
      ]);
    } catch {
      notifyError('Failed to send message', 'Check your API configuration.');
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout title="AI Chat">
      <div className="h-[calc(100vh-8rem)] flex gap-4 -m-4 md:-m-6 overflow-hidden">
        {/* Chat sidebar */}
        <div className={`flex-shrink-0 w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col
          ${showSidebar ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 border-b border-slate-800">
            {repositories.length > 0 && (
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              >
                <option value="">No repository context</option>
                {repositories.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={startNewChat}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-sm font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingChats ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />)}
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No chats yet</div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => openChat(chat)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition group ${
                    activeChat?.id === chat.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-slate-500" />
                  <span className="flex-1 text-sm truncate">{chat.title}</span>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
              <p className="text-slate-400 text-sm max-w-sm mb-6">
                Ask about your codebase, get code explanations, request reviews, or explore architecture.
              </p>
              <button
                onClick={startNewChat}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Start New Chat
              </button>
              <button onClick={() => setShowSidebar(true)} className="md:hidden mt-4 text-sm text-slate-400 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> View chats
              </button>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
                <button onClick={() => setShowSidebar(true)} className="md:hidden text-slate-400 hover:text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{activeChat.title}</p>
                  <p className="text-xs text-slate-500">AI Mentor • Claude 3.5 Sonnet</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className="h-12 w-48 bg-slate-800 rounded-2xl animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    Send a message to start the conversation
                  </div>
                ) : (
                  messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
                )}

                {sending && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="pt-4 border-t border-slate-800 mt-4">
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your codebase... (Enter to send, Shift+Enter for newline)"
                    rows={2}
                    disabled={sending}
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl transition disabled:opacity-40 flex-shrink-0 shadow-lg shadow-blue-500/25"
                  >
                    {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
