
import React, { useEffect, useState, useRef } from 'react';
import { Button } from './Button';
import { Send, MessageSquare, X } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const msgs = await getMessagesAction(taskId);
    setMessages(msgs);
  };

  useEffect(() => {
    fetchMessages();
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
    setNewMessage(''); 

    try {
      await sendMessageAction(taskId, tempMsg);
      fetchMessages();
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/40 dark:border-slate-700 animate-fade-in-up">
        
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-100 dark:border-slate-700 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
               <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">Diskusi Tugas</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{taskTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 transition">
             <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0B1120]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
               <p>Belum ada percakapan.</p>
               <p className="text-xs mt-1">Sapa rekan kerjamu!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              const isSystem = msg.content.startsWith('[SYSTEM]');
              
              if(isSystem) {
                  return (
                      <div key={msg.id} className="flex justify-center my-4">
                          <div className="bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-[10px] px-3 py-1 rounded-full text-center whitespace-pre-wrap">
                              {msg.content.replace('[SYSTEM]', '').trim()}
                          </div>
                      </div>
                  )
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] relative px-5 py-3 text-sm shadow-sm ${
                    isMe 
                      ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700'
                  }`}>
                    {!isMe && <p className="text-[10px] font-bold mb-1 opacity-50 uppercase tracking-wide">{msg.senderName}</p>}
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={`text-[9px] mt-1.5 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
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
        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-3 items-center">
          <input
            type="text"
            className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-sm text-gray-800 dark:text-white placeholder-gray-400 transition-all"
            placeholder="Tulis pesan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
             type="submit" 
             disabled={!newMessage.trim()}
             className="w-11 h-11 flex items-center justify-center rounded-2xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
