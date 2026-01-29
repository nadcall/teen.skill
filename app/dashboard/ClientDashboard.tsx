
import React, { useEffect, useState } from 'react';
import { createTaskAction, getMyTasksAction, completePaymentAction, checkTaskSafetyAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { XenditPaymentModal } from '@/components/XenditPaymentModal';
import { ChatWindow } from '@/components/ChatWindow';
import { Plus, List, CheckCircle, Wallet, ShieldAlert, MessageCircle, Sparkles } from 'lucide-react';

interface ClientDashboardProps {
  user: any;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Loading Stages: 'idle' | 'analyzing' | 'saving'
  const [loadingStage, setLoadingStage] = useState<'idle' | 'analyzing' | 'saving'>('idle');
  
  const [newTask, setNewTask] = useState({ title: '', description: '', budget: '' });
  const [aiError, setAiError] = useState<string | null>(null);

  const [paymentTask, setPaymentTask] = useState<any | null>(null);
  const [chatTask, setChatTask] = useState<any | null>(null);

  const fetchTasks = async () => {
    const myTasks = await getMyTasksAction(user.id, 'client');
    setTasks(myTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [user.id]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStage('analyzing');
    setAiError(null);

    try {
      // Step 1: Check Safety (Max 5 Seconds)
      const safetyCheck = await checkTaskSafetyAction(newTask.title, newTask.description);
      
      if (!safetyCheck.safe) {
        setAiError(safetyCheck.reason || "Konten tugas terdeteksi tidak aman.");
        setLoadingStage('idle');
        return;
      }

      // Step 2: Save to DB
      setLoadingStage('saving');
      await createTaskAction(newTask.title, newTask.description, Number(newTask.budget));
      
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', budget: '' });
      fetchTasks();
    } catch (error) {
      console.error(error);
      setAiError("Terjadi kesalahan sistem.");
    } finally {
      setLoadingStage('idle');
    }
  };

  const handlePaymentSuccess = async () => {
    if (paymentTask) {
      await completePaymentAction(paymentTask.id);
      fetchTasks();
      setPaymentTask(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Dasbor Klien</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20">
          <Plus className="w-5 h-5" /> Buat Tugas Baru
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 dark:border-slate-700">
            <List className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Belum ada tugas yang diposting.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md">
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-800 dark:text-white">{task.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">{task.description}</p>
                <div className="flex gap-3 mt-4 text-xs font-bold tracking-wide items-center">
                  <span className={`px-3 py-1 rounded-full border ${
                    task.status === 'open' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                    task.status === 'taken' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' : 
                    task.status === 'completed' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
                    'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600'
                  }`}>
                    {task.status.toUpperCase()}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    Diposting: {new Date(task.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-left sm:text-right w-full sm:w-auto">
                <span className="block text-3xl font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                  {formatRupiah(task.budget)}
                </span>
                
                <div className="flex gap-2 mt-2">
                  {/* Chat Button */}
                  {(task.status === 'taken' || task.status === 'submitted') && (
                    <Button variant="secondary" onClick={() => setChatTask(task)} className="h-10 px-3">
                      <MessageCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </Button>
                  )}

                  {/* Payment Button */}
                  {(task.status === 'taken' || task.status === 'submitted') && (
                    <Button 
                      onClick={() => setPaymentTask(task)}
                      className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-sm py-2 h-10"
                    >
                      <Wallet className="w-4 h-4" /> Bayar
                    </Button>
                  )}
                </div>

                {task.status === 'completed' && (
                   <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-sm">
                     <CheckCircle className="w-4 h-4" /> Lunas
                   </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setAiError(null); }} title="Buat Tugas Baru">
        <form onSubmit={handlePostTask} className="space-y-5">
          <Input 
            label="Judul Tugas" 
            placeholder="misal: Desain Logo untuk UMKM" 
            value={newTask.title} 
            onChange={e => setNewTask({...newTask, title: e.target.value})} 
            required
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi</label>
            <textarea 
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none h-32 transition-all"
              placeholder="Jelaskan detail pekerjaan..."
              value={newTask.description}
              onChange={e => setNewTask({...newTask, description: e.target.value})}
              required
            />
          </div>
          <Input 
            label="Anggaran (Rupiah)" 
            type="number" 
            placeholder="Contoh: 50000" 
            value={newTask.budget} 
            onChange={e => setNewTask({...newTask, budget: e.target.value})} 
            required
            min="10000"
          />

          {aiError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3 items-start animate-fade-in-up">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-300">Tugas Ditolak oleh AI</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{aiError}</p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={loadingStage !== 'idle'} className="bg-sky-500 text-white min-w-[140px]">
              {loadingStage === 'analyzing' ? (
                 <>
                   <Sparkles className="w-4 h-4 animate-pulse" /> Menganalisa...
                 </>
              ) : loadingStage === 'saving' ? 'Menyimpan...' : 'Posting Tugas'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      {paymentTask && (
        <XenditPaymentModal 
          isOpen={!!paymentTask}
          onClose={() => setPaymentTask(null)}
          amount={paymentTask.budget}
          taskTitle={paymentTask.title}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Chat Modal */}
      {chatTask && (
        <ChatWindow
          taskId={chatTask.id}
          taskTitle={chatTask.title}
          currentUserId={user.id}
          onClose={() => setChatTask(null)}
        />
      )}
    </div>
  );
};
