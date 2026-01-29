
import React, { useEffect, useState, useRef } from 'react';
import { Button } from './Button';
import { Send, MessageSquare } from 'lucide-react';
import { sendMessageAction, getMessagesAction } from '@/app/actions';

interface ChatWindowProps {
  taskId: string;
  taskTitle: string;
  currentUserId: string;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ taskId, taskTitle, currentUserId, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const msgs = await getMessagesAction(taskId);
    setMessages(msgs);
  };

  useEffect(() => {
    fetchMessages();
    // Simple polling every 3 seconds for "real-time" feel without WebSocket server
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const tempMsg = newMessage;
    setNewMessage(''); // Optimistic clear

    try {
      await sendMessageAction(taskId, tempMsg);
      fetchMessages();
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 dark:border-slate-700 animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-sky-500 dark:bg-slate-800 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">Diskusi Tugas</h3>
              <p className="text-xs opacity-80 truncate max-w-[200px]">{taskTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">✕</button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">Belum ada pesan. Mulai diskusi!</div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe 
                      ? 'bg-sky-500 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-slate-700'
                  }`}>
                    {!isMe && <p className="text-[10px] font-bold mb-1 opacity-70">{msg.senderName}</p>}
                    <p>{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-60 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-gray-800 dark:text-white placeholder-gray-400"
            placeholder="Tulis pesan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white shadow-none">
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
