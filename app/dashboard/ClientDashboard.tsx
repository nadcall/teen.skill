
import React, { useEffect, useState } from 'react';
import { createTaskAction, getMyTasksAction, completePaymentAction, checkTaskSafetyAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { XenditPaymentModal } from '@/components/XenditPaymentModal';
import { ChatWindow } from '@/components/ChatWindow';
import { Plus, List, CheckCircle, Wallet, ShieldAlert, MessageCircle, Sparkles, FolderOpen, ExternalLink, Clock } from 'lucide-react';

interface ClientDashboardProps {
  user: any;
}

// Bento Grid Card Component
const BentoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'analyzing' | 'saving'>('idle');
  const [newTask, setNewTask] = useState({ title: '', description: '', budget: '' });
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Interaction State
  const [paymentTask, setPaymentTask] = useState<any | null>(null);
  const [chatTask, setChatTask] = useState<any | null>(null);
  const [reviewTask, setReviewTask] = useState<any | null>(null); // For reviewing submission

  const fetchTasks = async () => {
    const myTasks = await getMyTasksAction(user.id, 'client');
    setTasks(myTasks);
  };

  useEffect(() => { fetchTasks(); }, [user.id]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStage('analyzing');
    setAiError(null);

    try {
      const safetyCheck = await checkTaskSafetyAction(newTask.title, newTask.description);
      if (!safetyCheck.safe) {
        setAiError(safetyCheck.reason || "Konten tidak aman.");
        setLoadingStage('idle');
        return;
      }
      setLoadingStage('saving');
      await createTaskAction(newTask.title, newTask.description, Number(newTask.budget));
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', budget: '' });
      fetchTasks();
    } catch (error) {
      setAiError("Error sistem.");
    } finally {
      setLoadingStage('idle');
    }
  };

  const handlePaymentSuccess = async () => {
    if (paymentTask) {
      await completePaymentAction(paymentTask.id);
      fetchTasks();
      setPaymentTask(null);
      setReviewTask(null); // Close review modal if open
    }
  };

  // Derived Stats
  const activeTasksCount = tasks.filter(t => t.status === 'open' || t.status === 'taken').length;
  const reviewCount = tasks.filter(t => t.status === 'submitted').length;
  const totalSpent = tasks.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.budget, 0);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pt-24 pb-12 animate-fade-in-up">
      
      {/* HEADER & WELCOME */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4 px-2">
         <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard Klien</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola proyek dan rekrut talenta muda.</p>
         </div>
         <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20 px-6 py-4 rounded-2xl transform hover:scale-105 transition-transform">
           <Plus className="w-5 h-5" /> Posting Tugas Baru
         </Button>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* COL 1: STATS & ACTIONS (Left Sidebar style) */}
        <div className="md:col-span-1 space-y-6">
           <BentoCard className="bg-gradient-to-br from-purple-500 to-indigo-600 border-none text-white">
              <p className="text-purple-100 font-medium mb-1">Total Pengeluaran</p>
              <h2 className="text-3xl font-extrabold">{formatRupiah(totalSpent)}</h2>
              <div className="mt-4 flex gap-2">
                 <div className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-sm">
                    {tasks.filter(t => t.status === 'completed').length} Proyek Selesai
                 </div>
              </div>
           </BentoCard>

           <BentoCard>
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-orange-500" /> Menunggu Review
              </h3>
              {reviewCount === 0 ? (
                 <p className="text-sm text-slate-400">Tidak ada tugas yang perlu direview.</p>
              ) : (
                 <div className="space-y-3">
                    {tasks.filter(t => t.status === 'submitted').map(t => (
                       <div key={t.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/50 cursor-pointer hover:bg-orange-100 transition" onClick={() => setReviewTask(t)}>
                          <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{t.title}</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Klik untuk review & bayar</p>
                       </div>
                    ))}
                 </div>
              )}
           </BentoCard>
        </div>

        {/* COL 2: MAIN TASK FEED (Wide) */}
        <div className="md:col-span-3">
           <div className="grid gap-4">
              {tasks.length === 0 ? (
                 <div className="bg-white/60 dark:bg-slate-800/60 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
                    <List className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg text-slate-500">Belum ada tugas.</p>
                 </div>
              ) : (
                 tasks.map(task => (
                    <div key={task.id} className="group bg-white/70 dark:bg-slate-800/70 p-6 rounded-3xl border border-white/50 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden">
                       
                       {/* Status Stripe */}
                       <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          task.status === 'open' ? 'bg-green-500' : 
                          task.status === 'taken' ? 'bg-blue-500' :
                          task.status === 'submitted' ? 'bg-orange-500' : 'bg-slate-300'
                       }`} />

                       <div className="flex-1 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                task.status === 'open' ? 'bg-green-100 text-green-700' :
                                task.status === 'taken' ? 'bg-blue-100 text-blue-700' :
                                task.status === 'submitted' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                             }`}>
                                {task.status}
                             </span>
                             <span className="text-xs text-slate-400">ID: {task.id.slice(0,6)}</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{task.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{task.description}</p>
                       </div>

                       <div className="flex flex-col items-end gap-3 min-w-[150px]">
                          <span className="text-2xl font-black text-slate-800 dark:text-white">{formatRupiah(task.budget)}</span>
                          
                          <div className="flex gap-2 w-full justify-end">
                             {/* Chat Button */}
                             {(task.status !== 'open') && (
                                <Button variant="secondary" onClick={() => setChatTask(task)} className="h-10 w-10 p-0 rounded-xl flex items-center justify-center">
                                   <MessageCircle className="w-5 h-5 text-slate-600" />
                                </Button>
                             )}

                             {/* Action Button based on Status */}
                             {task.status === 'submitted' && (
                                <Button onClick={() => setReviewTask(task)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-10 px-4 rounded-xl shadow-lg shadow-orange-500/20">
                                   Review
                                </Button>
                             )}
                             
                             {task.status === 'completed' && (
                                <div className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-xl">
                                   <CheckCircle className="w-4 h-4" /> Lunas
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setAiError(null); }} title="Posting Tugas">
        <form onSubmit={handlePostTask} className="space-y-4">
          <Input label="Judul" placeholder="Desain Logo..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
          <textarea 
             className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-32 focus:ring-2 focus:ring-sky-500 outline-none"
             placeholder="Deskripsi detail..."
             value={newTask.description}
             onChange={e => setNewTask({...newTask, description: e.target.value})}
             required
          />
          <Input label="Budget (Rp)" type="number" value={newTask.budget} onChange={e => setNewTask({...newTask, budget: e.target.value})} required min="10000" />
          
          {aiError && <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg">{aiError}</div>}
          
          <div className="flex justify-end gap-2 pt-2">
             <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
             <Button type="submit" isLoading={loadingStage !== 'idle'} className="bg-slate-900 text-white">
                {loadingStage === 'analyzing' ? 'Checking AI...' : 'Posting'}
             </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Review Submission Modal */}
      <Modal isOpen={!!reviewTask} onClose={() => setReviewTask(null)} title="Review Hasil Kerja">
         {reviewTask && (
            <div className="space-y-6">
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 uppercase">Lampiran Freelancer</p>
                  <a href={reviewTask.submissionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline mt-1 font-medium break-all">
                     <ExternalLink className="w-4 h-4" /> {reviewTask.submissionUrl}
                  </a>
                  {reviewTask.submissionNote && (
                     <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase">Catatan</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 italic">"{reviewTask.submissionNote}"</p>
                     </div>
                  )}
               </div>

               <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => { setChatTask(reviewTask); setReviewTask(null); }} className="flex-1">
                     <MessageCircle className="w-4 h-4 mr-2" /> Revisi / Chat
                  </Button>
                  <Button onClick={() => setPaymentTask(reviewTask)} className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20">
                     <CheckCircle className="w-4 h-4 mr-2" /> Terima & Bayar
                  </Button>
               </div>
            </div>
         )}
      </Modal>

      {/* 3. Payment & Chat */}
      {paymentTask && (
        <XenditPaymentModal 
          isOpen={!!paymentTask} onClose={() => setPaymentTask(null)}
          amount={paymentTask.budget} taskTitle={paymentTask.title}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {chatTask && (
        <ChatWindow
          taskId={chatTask.id} taskTitle={chatTask.title}
          currentUserId={user.id} onClose={() => setChatTask(null)}
        />
      )}
    </div>
  );
};
